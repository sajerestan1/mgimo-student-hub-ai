import { secrets } from 'base44:runtime';
import { ProviderError } from './catalog.ts';

/**
 * GPTZero adapter — synchronous AI-text detection.
 *
 * Endpoint per the published documentation:
 *   POST https://api.gptzero.me/v2/predict/text   (header: x-api-key)
 *
 * The response is reported as returned: predicted class, class probabilities
 * and a sentence breakdown. Missing fields stay null; nothing is inferred.
 */

const ENDPOINT = 'https://api.gptzero.me/v2/predict/text';
const MAX_CHARACTERS = 150000;

export const PROVIDER_ID = 'gptzero';

function readSecret(name) {
  try {
    const value = secrets.get(name);
    return typeof value === 'string' ? value.trim() : '';
  } catch {
    return '';
  }
}

export function isConfigured() {
  return Boolean(readSecret('GPTZERO_API_KEY'));
}

function pickProbability(value) {
  return typeof value === 'number' && value >= 0 && value <= 1 ? value : null;
}

export async function detectAi({ text }) {
  const apiKey = readSecret('GPTZERO_API_KEY');
  if (!apiKey) {
    throw new ProviderError('not_configured', 'GPTZero credentials are not configured for this app.');
  }
  const document = String(text || '').slice(0, MAX_CHARACTERS);

  let res;
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ document }),
      signal: AbortSignal.timeout(90000),
    });
  } catch (error) {
    throw new ProviderError('unreachable', `GPTZero could not be reached: ${error.message}`);
  }

  if (res.status === 401) {
    throw new ProviderError('unauthorized', 'GPTZero rejected the API key (HTTP 401).');
  }
  if (res.status === 403) {
    throw new ProviderError('unauthorized', 'GPTZero refused this API key or plan (HTTP 403).');
  }
  if (res.status === 429) {
    throw new ProviderError('rate_limited', 'GPTZero rate limit reached (HTTP 429). Try again later.');
  }
  if (res.status === 400) {
    throw new ProviderError('invalid_request', 'GPTZero rejected the request (HTTP 400) — most often the plan’s character limit was exceeded.');
  }
  if (!res.ok) {
    throw new ProviderError('provider_error', `GPTZero returned HTTP ${res.status}.`);
  }

  const data = await res.json().catch(() => null);
  const doc = data && Array.isArray(data.documents) ? data.documents[0] : null;
  if (!doc || typeof doc !== 'object') {
    throw new ProviderError('provider_error', 'GPTZero returned an unreadable response.');
  }

  const probabilities = doc.class_probabilities && typeof doc.class_probabilities === 'object' ? doc.class_probabilities : {};
  const sentences = Array.isArray(doc.sentences) ? doc.sentences : Array.isArray(doc.paragraphs) ? doc.paragraphs : [];

  return {
    provider: PROVIDER_ID,
    providerLabel: 'GPTZero',
    sandbox: false,
    model: typeof data.version === 'string' ? data.version : '',
    classification: ['human', 'ai', 'mixed'].includes(doc.predicted_class) ? doc.predicted_class : 'unknown',
    aiShare: pickProbability(probabilities.ai),
    humanShare: pickProbability(probabilities.human),
    mixedShare: pickProbability(probabilities.mixed),
    confidenceCategory: typeof doc.confidence_category === 'string' ? doc.confidence_category : '',
    message: typeof doc.result_message === 'string' ? doc.result_message : '',
    sections: sentences.slice(0, 400).map((row, index) => ({
      index,
      text: typeof row.sentence === 'string' ? row.sentence.slice(0, 600) : '',
      classification:
        typeof row.generated_prob === 'number' || typeof row.completely_generated_prob === 'number'
          ? 'scored'
          : 'unknown',
      probability: pickProbability(row.generated_prob) ?? pickProbability(row.completely_generated_prob),
    })),
    charactersChecked: document.length,
  };
}