import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import {
  AI_TEXT_LIMIT,
  MAX_CHARS,
  MAX_CORPUS_CHARS,
  MAX_CORPUS_DOCUMENTS,
  MIN_WORDS,
  SCREENING_SCHEMA,
  analyseSimilarity,
  buildScreeningPrompt,
  countWords,
  documentPassages,
} from '../../shared/integrity/analysis.ts';

// The screening step is the platform's own LLM integration. It is named exactly
// like this in the interface and in the stored record, so a reviewer can see
// which service the text was sent to.
const AI_PROVIDER = 'Base44 Core integration — InvokeLLM';
const AI_MODEL = 'platform automatic model selection';

const summarise = (row) => ({
  id: row.id,
  title: row.title,
  student_reference: row.student_reference || '',
  word_count: row.word_count || 0,
  similarity_percent: row.similarity_percent || 0,
  matched_passage_count: row.matched_passage_count || 0,
  repeated_passage_count: row.repeated_passage_count || 0,
  ai_status: row.ai_status || 'skipped',
  ai_indicator_level: row.ai_indicator_level || '',
  analyzed_at: row.analyzed_at || row.created_date || '',
});

const asList = (value) => (Array.isArray(value) ? value : []);
const asText = (value, limit) => String(value === undefined || value === null ? '' : value).slice(0, limit);

// Academic Integrity: internal similarity plus an optional LLM screening pass.
// Every comparison is made against text this account can already read, and the
// caller's identity comes from the session, never from the request body.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const action = String(body.action || 'analyze');

    if (action === 'list') {
      const page = await base44.entities.IntegrityAnalysis.filter(
        { user_id: user.id },
        { sort: '-created_date', limit: 20 },
      );
      return Response.json({ items: asList(page.items).map(summarise) });
    }

    if (action === 'get') {
      const id = String(body.id || '');
      if (!id) return Response.json({ error: 'id is required' }, { status: 400 });
      const record = await base44.entities.IntegrityAnalysis.get(id).catch((e) =>
        e.status === 404 ? null : Promise.reject(e),
      );
      if (!record || record.user_id !== user.id) {
        return Response.json({ error: 'Analysis not found' }, { status: 404 });
      }
      return Response.json({ record, passages: documentPassages(record) });
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

    // Corpus: only submissions this same account has already analysed. Nothing
    // else is readable, so nothing else can be compared against.
    const page = await base44.entities.IntegrityAnalysis.filter(
      { user_id: user.id },
      { sort: '-created_date', limit: MAX_CORPUS_DOCUMENTS },
    );
    const corpus = [];
    let corpusChars = 0;
    let corpusWords = 0;
    asList(page.items).forEach((row) => {
      const value = String(row.text || '');
      if (!value || corpusChars + value.length > MAX_CORPUS_CHARS) return;
      corpusChars += value.length;
      corpusWords += row.word_count || countWords(value);
      corpus.push({
        id: row.id,
        title: row.title,
        student_reference: row.student_reference,
        analyzed_at: row.analyzed_at,
        text: value,
      });
    });

    const similarity = analyseSimilarity(text, corpus);

    // The text leaves the platform only when the caller ticked the screening box
    // and the consent box in the interface.
    const wantsScreening = body.ai_screening === true && body.ai_consent === true;
    let ai = { status: 'skipped' };

    if (wantsScreening) {
      const excerpt = text.slice(0, AI_TEXT_LIMIT);
      const truncated = excerpt.length < text.length;
      try {
        const raw = await base44.integrations.Core.InvokeLLM({
          prompt: buildScreeningPrompt(excerpt),
          response_json_schema: SCREENING_SCHEMA,
        });
        if (!raw || typeof raw !== 'object') {
          ai = {
            status: 'failed',
            truncated,
            note: 'The screening service returned no structured result. The similarity analysis is unaffected.',
          };
        } else {
          ai = {
            status: 'completed',
            indicator_level: ['low', 'moderate', 'elevated'].includes(raw.indicator_level)
              ? raw.indicator_level
              : 'low',
            summary: asText(raw.summary, 1200),
            observations: asList(raw.observations)
              .slice(0, 6)
              .map((row) => ({
                signal: asText(row && row.signal, 120),
                detail: asText(row && row.detail, 600),
                quote: asText(row && row.quote, 300),
              }))
              .filter((row) => row.signal || row.detail),
            flagged: asList(raw.flagged_passages)
              .slice(0, 6)
              .map((row) => ({
                excerpt: asText(row && row.excerpt, 300),
                reason: asText(row && row.reason, 400),
              }))
              .filter((row) => row.excerpt || row.reason),
            human_review: raw.human_review_recommended === true,
            truncated,
          };
        }
      } catch (error) {
        ai = {
          status: 'failed',
          truncated,
          note: 'The screening service did not respond. The similarity analysis below is unaffected.',
        };
      }
    }

    const flagged = similarity.passages.filter((passage) => passage.flagged);
    const matchSummary = [];
    flagged.forEach((passage) => {
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

    const record = await base44.entities.IntegrityAnalysis.create({
      user_id: user.id,
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
      ai_status: ai.status,
      ai_indicator_level: ai.indicator_level,
      ai_summary: ai.summary,
      ai_observations: ai.observations,
      ai_flagged: ai.flagged,
      ai_human_review: ai.human_review === true,
      ai_provider: wantsScreening ? AI_PROVIDER : '',
      ai_model: wantsScreening ? AI_MODEL : '',
      ai_truncated: ai.truncated === true,
      ai_note: ai.note || '',
      analyzed_at: new Date().toISOString(),
    });

    return Response.json({ record, passages: similarity.passages });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}