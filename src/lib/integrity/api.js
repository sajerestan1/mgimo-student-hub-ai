import { base44 } from '@/api/base44Client';

export const MIN_WORDS = 60;
export const MAX_CHARS = 90000;

const CORPUS_LIMIT = 40;

async function currentUser() {
  const me = await base44.auth.me();
  return me || {};
}

async function invoke(payload) {
  const { data } = await base44.functions.invoke('academicIntegrity', payload);
  if (!data || data.error) {
    throw new Error((data && data.error) || 'The analysis could not be completed.');
  }
  return data;
}

/**
 * Which detection engines genuinely exist right now. The server decides this
 * from its own secrets; the browser only receives the outcome.
 */
export async function loadEngineStatus() {
  const { data } = await base44.functions.invoke('academicIntegrity', { action: 'providers' });
  return data || null;
}

async function runEngine(action, recordId) {
  try {
    const data = await invoke({ action, recordId });
    return data.fields || {};
  } catch (error) {
    return action === 'plagiarism'
      ? { external_status: 'failed', external_error: error.message, external_checked_at: new Date().toISOString() }
      : { detector_status: 'failed', detector_error: error.message, detector_checked_at: new Date().toISOString() };
  }
}

/**
 * Runs the internal check, stores the report under the signed-in account, then
 * asks each selected provider engine for its own result.
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

  const analysis = await invoke({
    action: 'analyze',
    title: draft.title,
    student_reference: draft.student_reference,
    text: draft.text,
    corpus,
  });

  let record = await base44.entities.IntegrityAnalysis.create({
    user_id: me.id,
    ...analysis.record,
    external_status: draft.external_similarity ? 'pending' : 'skipped',
    detector_status: draft.ai_detection ? 'pending' : 'skipped',
  });

  if (draft.external_similarity) {
    record = { ...record, ...(await runEngine('plagiarism', record.id)) };
  }
  if (draft.ai_detection) {
    record = { ...record, ...(await runEngine('aiDetect', record.id)) };
  }

  return { record, passages: analysis.passages };
}

/** Re-reads a stored record (used while a provider scan is still processing). */
export async function refreshAnalysis(id) {
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

export async function loadAnalysis(id) {
  return refreshAnalysis(id);
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
    external_status: row.external_status || 'skipped',
    external_similarity_percent: row.external_similarity_percent,
    external_provider_label: row.external_provider_label || '',
    detector_status: row.detector_status || 'skipped',
    detector_class: row.detector_class || '',
    detector_provider_label: row.detector_provider_label || '',
    analyzed_at: row.analyzed_at || row.created_date || '',
  }));
  return { items };
}

export function countWords(value) {
  const text = String(value || '').trim();
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}