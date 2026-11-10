import { base44 } from '@/api/base44Client';

export const MIN_WORDS = 60;
export const MAX_CHARS = 90000;

const CORPUS_LIMIT = 40;

async function currentUser() {
  const me = await base44.auth.me();
  return me || {};
}

/**
 * Runs the analysis on the server, then stores the report in the isolated
 * IntegrityAnalysis entity under the signed-in account, so the record is
 * private to that account by the entity's own access rules.
 */
export async function runAnalysis(draft) {
  const me = await currentUser();
  if (!me.id) throw new Error('Your session has expired. Sign in again to analyse a submission.');

  const corpusPage = await base44.entities.IntegrityAnalysis.filter(
    { user_id: me.id },
    { sort: '-created_date', limit: CORPUS_LIMIT },
  );
  const corpus = (corpusPage.items || [])
    .filter((row) => row.text)
    .map((row) => ({
      title: row.title,
      student_reference: row.student_reference,
      analyzed_at: row.analyzed_at,
      word_count: row.word_count,
      text: row.text,
    }));

  const { data } = await base44.functions.invoke('academicIntegrity', {
    action: 'analyze',
    title: draft.title,
    student_reference: draft.student_reference,
    text: draft.text,
    ai_screening: draft.ai_screening === true,
    ai_consent: draft.ai_consent === true,
    corpus,
  });
  if (!data || data.error) {
    throw new Error((data && data.error) || 'The analysis could not be completed.');
  }

  const record = await base44.entities.IntegrityAnalysis.create({
    user_id: me.id,
    ...data.record,
  });

  return { record, passages: data.passages };
}

export async function loadAnalysis(id) {
  const me = await currentUser();
  const record = await base44.entities.IntegrityAnalysis.get(id);
  if (!record || (record.user_id && me.id && record.user_id !== me.id)) {
    throw new Error('That analysis was not found in your workspace.');
  }
  const { data } = await base44.functions.invoke('academicIntegrity', {
    action: 'reopen',
    text: record.text,
    match_summary: record.match_summary,
  });
  return { record, passages: (data && data.passages) || [] };
}

export async function loadHistory() {
  const me = await currentUser();
  if (!me.id) return { items: [] };
  const page = await base44.entities.IntegrityAnalysis.filter(
    { user_id: me.id },
    { sort: '-created_date', limit: 20 },
  );
  const items = (page.items || []).map((row) => ({
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
  }));
  return { items };
}

export function countWords(value) {
  const text = String(value || '').trim();
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}