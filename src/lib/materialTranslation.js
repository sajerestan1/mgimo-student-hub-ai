import { base44 } from '@/api/base44Client';

export const READER_LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'ru', label: 'Russian', native: 'Русский' },
  { code: 'fr', label: 'French', native: 'Français' },
  { code: 'zh', label: 'Chinese', native: '中文' },
  { code: 'ar', label: 'Arabic', native: 'العربية' },
];

export const dirFor = (code) => (code === 'ar' ? 'rtl' : 'ltr');

export const languageLabel = (code) =>
  READER_LANGUAGES.find((language) => language.code === code)?.label || 'English';

// The interface language is only a default: the reader keeps its own selection.
export const defaultTarget = (language) => {
  const base = String(language || 'en').split('-')[0];
  return READER_LANGUAGES.some((entry) => entry.code === base) ? base : 'en';
};

const unwrap = (response) => {
  const data = response?.data || {};
  if (data.error) {
    const error = new Error(data.error);
    error.reason = data.reason;
    throw error;
  }
  return data;
};

// Which materials the reader can actually process. Reported honestly in the
// professor workspace instead of promising translation for every upload.
export const supportsTranslation = (resource) => {
  if (!resource) return false;
  if (String(resource.content || '').trim()) return true;
  const name = String(resource.file_name || resource.file_url || '').toLowerCase();
  return /\.(txt|md|markdown|pdf|png|jpe?g|webp)$/.test(name);
};

export const openTranslation = async (resourceId, target) =>
  unwrap(
    await base44.functions.invoke('materialTranslation', {
      action: 'open',
      resource_id: resourceId,
      target_language: target,
    })
  );

export const translateNextChunk = async (translationId, force = false) =>
  unwrap(
    await base44.functions.invoke('materialTranslation', {
      action: 'translate',
      translation_id: translationId,
      force,
    })
  );