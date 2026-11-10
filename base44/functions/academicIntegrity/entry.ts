import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { secrets } from 'base44:runtime';
import {
  MAX_CHARS,
  MAX_CORPUS_CHARS,
  MAX_CORPUS_DOCUMENTS,
  MIN_WORDS,
  analyseSimilarity,
  countWords,
  documentPassages,
} from '../../shared/integrity/analysis.ts';
import { detectAi, providerStatus, submitSimilarity, webhookFields } from '../../shared/integrity/providers/index.ts';

const asList = (value) => (Array.isArray(value) ? value : []);
const asText = (value, limit) => String(value === undefined || value === null ? '' : value).slice(0, limit);

function readSecret(name) {
  try {
    const value = secrets.get(name);
    return typeof value === 'string' ? value.trim() : '';
  } catch {
    return '';
  }
}

function safeEqual(left, right) {
  const a = String(left);
  const b = String(right);
  if (!a || a.length !== b.length) return false;
  let diff = 0;
  for (let index = 0; index < a.length; index += 1) diff |= a.charCodeAt(index) ^ b.charCodeAt(index);
  return diff === 0;
}

/**
 * Provider completion webhook. Copyleaks posts here when an asynchronous
 * similarity scan finishes; the shared secret in the query string is the only
 * authentication, so it is checked before anything else happens and the update
 * runs with the service role because the caller is the provider, not a user.
 */
async function handleWebhook(req, url) {
  try {
    const expected = readSecret('INTEGRITY_WEBHOOK_SECRET');
    if (!expected) {
      return Response.json({ error: 'Webhook secret is not configured for this app.' }, { status: 503 });
    }
    if (!safeEqual(url.searchParams.get('token') || '', expected)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json().catch(() => null);
    if (!payload || typeof payload !== 'object') {
      return Response.json({ error: 'Unreadable webhook payload.' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);
    const fields = webhookFields(payload, url.searchParams.get('status'));
    const scanId = fields.scanId || asText(payload.scanId, 120);
    if (!scanId) return Response.json({ error: 'No scan identifier in the payload.' }, { status: 400 });

    const { items } = await base44.asServiceRole.entities.IntegrityAnalysis.filter(
      { external_scan_id: scanId },
      { limit: 1 },
    );
    const record = items && items[0];
    if (!record) return Response.json({ error: 'No analysis matches that scan.' }, { status: 404 });

    const { scanId: _ignored, ...update } = fields;
    await base44.asServiceRole.entities.IntegrityAnalysis.update(record.id, update);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

/**
 * Academic Integrity: internal similarity, external provider similarity and
 * dedicated AI-writing detection. This function reads no academic record and
 * writes nothing outside the IntegrityAnalysis entity of the calling account.
 */
export default async function (req) {
  try {
    const url = new URL(req.url);
    const body = await req.json().catch(() => ({}));
    const action = String(body.action || url.searchParams.get('action') || 'analyze');

    if (action === 'webhook') return await handleWebhook(req, url);

    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Which detection engines actually exist right now, and what each is
    // waiting for. No secret value is ever returned.
    if (action === 'providers') {
      return Response.json(providerStatus());
    }

    if (action === 'plagiarism' || action === 'aiDetect') {
      const recordId = asText(body.recordId, 80);
      if (!recordId) return Response.json({ error: 'recordId is required' }, { status: 400 });

      const record = await base44.entities.IntegrityAnalysis.get(recordId).catch((e) =>
        e.status === 404 ? null : Promise.reject(e),
      );
      if (!record) return Response.json({ error: 'Analysis not found.' }, { status: 404 });
      if (record.user_id && record.user_id !== user.id) {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }
      if (!record.text) return Response.json({ error: 'That analysis has no stored text.' }, { status: 400 });

      const fields =
        action === 'plagiarism'
          ? (
              await submitSimilarity({
                text: record.text,
                title: record.title,
                recordId,
                origin: req.headers.get('X-Base44-App-Url') || url.origin,
              })
            ).fields
          : (await detectAi({ text: record.text })).fields;

      await base44.entities.IntegrityAnalysis.update(recordId, fields);
      return Response.json({ fields });
    }

    // Rebuilds the highlightable document for a stored record.
    if (action === 'reopen') {
      const text = asText(body.text, MAX_CHARS);
      if (!text) return Response.json({ error: 'text is required' }, { status: 400 });
      const matchSummary = asList(body.match_summary).slice(0, 60);
      return Response.json({ passages: documentPassages({ text, match_summary: matchSummary }) });
    }

    if (action !== 'analyze') {
      return Response.json({ error: 'Unknown action' }, { status: 400 });
    }

    const title = asText(body.title, 180).trim();
    const studentReference = asText(body.student_reference, 180).trim();
    const text = asText(body.text, MAX_CHARS).replace(/\r\n?/g, '\n').trim();

    if (!title) return Response.json({ error: 'A submission title is required.' }, { status: 400 });
    if (!text) return Response.json({ error: 'Paste the submission text to analyse.' }, { status: 400 });
    const words = countWords(text);
    if (words < MIN_WORDS) {
      return Response.json(
        { error: `At least ${MIN_WORDS} words are needed for a meaningful comparison.` },
        { status: 400 },
      );
    }

    // The comparison set: submissions this account has already analysed, read
    // through the caller's own access rules so nothing else can appear.
    const corpus = [];
    let corpusChars = 0;
    let corpusWords = 0;
    asList(body.corpus)
      .slice(0, MAX_CORPUS_DOCUMENTS)
      .forEach((row) => {
        const value = asText(row && row.text, MAX_CHARS);
        if (!value || corpusChars + value.length > MAX_CORPUS_CHARS) return;
        corpusChars += value.length;
        corpusWords += Number(row.word_count || 0) || countWords(value);
        corpus.push({
          title: asText(row && row.title, 180),
          student_reference: asText(row && row.student_reference, 180),
          analyzed_at: asText(row && row.analyzed_at, 40),
          text: value,
        });
      });

    const similarity = analyseSimilarity(text, corpus);

    const matchSummary = [];
    similarity.passages
      .filter((passage) => passage.flagged)
      .forEach((passage) => {
        passage.sources.forEach((source) => {
          matchSummary.push({
            index: passage.index,
            source_type: source.type,
            source_title: source.title,
            source_reference: source.reference,
            overlap_percent: source.overlap,
            excerpt: source.excerpt,
          });
        });
      });

    const record = {
      title,
      student_reference: studentReference,
      word_count: words,
      text,
      similarity_percent: similarity.overall_percent,
      matched_passage_count: similarity.matched_passages,
      repeated_passage_count: similarity.repeated_passages,
      corpus_documents: corpus.length,
      corpus_words: corpusWords,
      match_summary: matchSummary.slice(0, 60),
      ai_status: 'skipped',
      ai_human_review: false,
      analyzed_at: new Date().toISOString(),
    };

    return Response.json({ record, passages: similarity.passages });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}