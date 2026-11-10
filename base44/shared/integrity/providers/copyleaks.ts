import { secrets } from 'base44:runtime';
import { ProviderError } from './catalog.ts';

/**
 * Copyleaks adapter.
 *
 * Endpoints follow the published Copyleaks API documentation:
 *  - login:        POST https://id.copyleaks.com/v3/account/login/api
 *  - similarity:   PUT  https://api.copyleaks.com/v3/scans/submit/file/{scanId}
 *  - AI detection: POST https://api.copyleaks.com/v2/writer-detector/{scanId}/check
 *
 * Similarity is asynchronous: the provider reports completion to the webhook
 * URL supplied at submission. AI detection is synchronous and returns its
 * classification in the response.
 *
 * Nothing here fabricates a result. Every failure raises a ProviderError with a
 * code the caller reports verbatim.
 */

const IDENTITY_URL = 'https://id.copyleaks.com/v3/account/login/api';
const API_URL = 'https://api.copyleaks.com';
const AI_MIN_CHARACTERS = 255;
const AI_MAX_CHARACTERS = 150000;

export const PROVIDER_ID = 'copyleaks';

function readSecret(name) {
  try {
    const value = secrets.get(name);
    return typeof value === 'string' ? value.trim() : '';
  } catch {
    return '';
  }
}

export function isConfigured() {
  return Boolean(readSecret('COPYLEAKS_EMAIL') && readSecret('COPYLEAKS_API_KEY'));
}

function isSandbox() {
  return readSecret('COPYLEAKS_SANDBOX').toLowerCase() === 'true';
}

function toBase64(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (let index = 0; index < bytes.length; index += 1) binary += String.fromCharCode(bytes[index]);
  return btoa(binary);
}

function fileName(title) {
  const safe = String(title || 'submission')
    .replace(/[^a-z0-9\-_ ]/gi, '')
    .trim()
    .slice(0, 60)
    .replace(/\s+/g, '-')
    .toLowerCase();
  return `${safe || 'submission'}.txt`;
}

function mapHttpFailure(res, what) {
  if (res.status === 401 || res.status === 403) {
    return new ProviderError('unauthorized', `Copyleaks rejected the API credentials (HTTP ${res.status}) while ${what}.`);
  }
  if (res.status === 429) {
    return new ProviderError('rate_limited', `Copyleaks rate limit reached while ${what} (HTTP 429). Try again later.`);
  }
  if (res.status === 402) {
    return new ProviderError('quota', `The Copyleaks account has no credits available for ${what} (HTTP 402).`);
  }
  if (res.status === 400 || res.status === 422) {
    return new ProviderError('invalid_request', `Copyleaks rejected the submission while ${what} (HTTP ${res.status}).`);
  }
  return new ProviderError('provider_error', `Copyleaks returned HTTP ${res.status} while ${what}.`);
}

async function login() {
  const email = readSecret('COPYLEAKS_EMAIL');
  const key = readSecret('COPYLEAKS_API_KEY');
  if (!email || !key) {
    throw new ProviderError('not_configured', 'Copyleaks credentials are not configured for this app.');
  }
  let res;
  try {
    res = await fetch(IDENTITY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ email, key }),
      signal: AbortSignal.timeout(15000),
    });
  } catch (error) {
    throw new ProviderError('unreachable', `Copyleaks could not be reached: ${error.message}`);
  }
  if (!res.ok) throw mapHttpFailure(res, 'signing in');
  const data = await res.json().catch(() => null);
  if (!data || !data.access_token) {
    throw new ProviderError('provider_error', 'Copyleaks sign-in returned no access token.');
  }
  return data.access_token;
}

/** Submits text for a similarity scan. Completion arrives by webhook. */
export async function submitSimilarity({ text, title, scanId, webhookUrl }) {
  const token = await login();
  const sandbox = isSandbox();
  const body = {
    base64: toBase64(text),
    filename: fileName(title),
    properties: {
      sandbox,
      scanning: { internet: true },
      ...(webhookUrl ? { webhooks: { status: webhookUrl } } : {}),
    },
  };

  let res;
  try {
    res = await fetch(`${API_URL}/v3/scans/submit/file/${encodeURIComponent(scanId)}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000),
    });
  } catch (error) {
    throw new ProviderError('unreachable', `Copyleaks could not be reached: ${error.message}`);
  }
  if (!res.ok) throw mapHttpFailure(res, 'submitting the similarity scan');

  return {
    scanId,
    sandbox,
    submittedAt: new Date().toISOString(),
    webhookConfigured: Boolean(webhookUrl),
  };
}

function classifyAi(share) {
  if (typeof share !== 'number') return 'unknown';
  if (share >= 0.66) return 'ai';
  if (share <= 0.34) return 'human';
  return 'mixed';
}

/** Synchronous AI-text detection. */
export async function detectAi({ text, scanId }) {
  const trimmed = String(text || '').slice(0, AI_MAX_CHARACTERS);
  if (trimmed.length < AI_MIN_CHARACTERS) {
    throw new ProviderError(
      'too_short',
      `Copyleaks AI detection needs at least ${AI_MIN_CHARACTERS} characters; this submission has ${trimmed.length}.`,
    );
  }
  const token = await login();
  const sandbox = isSandbox();

  let res;
  try {
    res = await fetch(`${API_URL}/v2/writer-detector/${encodeURIComponent(scanId)}/check`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ text: trimmed, sandbox }),
      signal: AbortSignal.timeout(90000),
    });
  } catch (error) {
    throw new ProviderError('unreachable', `Copyleaks could not be reached: ${error.message}`);
  }
  if (!res.ok) throw mapHttpFailure(res, 'running AI detection');
  const data = await res.json().catch(() => null);
  if (!data || typeof data !== 'object') {
    throw new ProviderError('provider_error', 'Copyleaks AI detection returned an unreadable response.');
  }

  const summary = data.summary && typeof data.summary === 'object' ? data.summary : {};
  const share = typeof summary.ai === 'number' ? summary.ai : null;
  const results = Array.isArray(data.results) ? data.results : [];

  return {
    provider: PROVIDER_ID,
    providerLabel: 'Copyleaks',
    sandbox,
    model: typeof data.modelVersion === 'string' ? data.modelVersion : '',
    classification: classifyAi(share),
    aiShare: share,
    humanShare: typeof summary.human === 'number' ? summary.human : null,
    sections: results.slice(0, 400).map((row, index) => ({
      index,
      classification: row && row.classification === 2 ? 'ai' : row && row.classification === 1 ? 'human' : 'unknown',
      probability: row && typeof row.probability === 'number' ? row.probability : null,
    })),
    charactersChecked: trimmed.length,
  };
}

const SOURCE_KEYS = ['internet', 'database', 'repositories', 'batch', 'custom'];

/**
 * Normalises the payload Copyleaks posts to the status webhook. Anything the
 * payload does not contain stays null rather than being estimated.
 */
export function normalizeWebhook(payload) {
  const body = payload && typeof payload === 'object' ? payload : {};
  const document = body.scannedDocument && typeof body.scannedDocument === 'object' ? body.scannedDocument : {};
  const results = body.results && typeof body.results === 'object' ? body.results : {};
  const score = results.score && typeof results.score === 'object' ? results.score : {};

  const sources = [];
  SOURCE_KEYS.forEach((key) => {
    const rows = Array.isArray(results[key]) ? results[key] : [];
    rows.slice(0, 60).forEach((row) => {
      if (!row || typeof row !== 'object') return;
      sources.push({
        type: key,
        title: typeof row.title === 'string' ? row.title : '',
        url: typeof row.url === 'string' ? row.url : '',
        result_id: typeof row.id === 'string' ? row.id : '',
        matched_words: typeof row.matchedWords === 'number' ? row.matchedWords : null,
        paraphrased_words: typeof row.paraphraseWords === 'number' ? row.paraphraseWords : null,
        introduction: typeof row.introduction === 'string' ? row.introduction.slice(0, 400) : '',
      });
    });
  });

  return {
    scanId: typeof document.scanId === 'string' ? document.scanId : '',
    aggregatedScore: typeof score.aggregatedScore === 'number' ? score.aggregatedScore : null,
    identicalWords: typeof score.identicalWords === 'number' ? score.identicalWords : null,
    similarWords: typeof score.similarWords === 'number' ? score.similarWords : null,
    paraphrasedWords: typeof score.paraphrasedWords === 'number' ? score.paraphrasedWords : null,
    totalWords: typeof document.totalWords === 'number' ? document.totalWords : null,
    credits: typeof document.credits === 'number' ? document.credits : null,
    sources,
  };
}

export function webhookUrlFor(origin, secret) {
  if (!origin || !secret) return '';
  return `${origin.replace(/\/$/, '')}/functions/academicIntegrity?action=webhook&token=${encodeURIComponent(
    secret,
  )}&status={STATUS}`;
}