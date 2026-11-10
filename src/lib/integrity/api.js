import { base44 } from '@/api/base44Client';

export const MIN_WORDS = 60;
export const MAX_CHARS = 90000;

async function call(payload) {
  const { data } = await base44.functions.invoke('academicIntegrity', payload);
  if (!data || data.error) {
    throw new Error((data && data.error) || 'The analysis could not be completed.');
  }
  return data;
}

export const runAnalysis = (draft) => call({ action: 'analyze', ...draft });
export const loadAnalysis = (id) => call({ action: 'get', id });
export const loadHistory = () => call({ action: 'list' });

export function countWords(value) {
  const text = String(value || '').trim();
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}