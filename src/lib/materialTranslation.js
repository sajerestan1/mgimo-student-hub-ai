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
  READER_LANGUAGES.find((language) => language.code === code)?.label || '';

export const isReaderLanguage = (code) =>
  READER_LANGUAGES.some((language) => language.code === code);

// The initial target follows the student's own saved choice, then the interface
// language, then any language that is not the material's. A target is never the
// same as the source, and the interface language is only a default - it says
// nothing about what language the material itself is written in.
export const resolveInitialTarget = ({ preferred, interfaceLanguage, source }) => {
  const sourceCode = String(source || '').toLowerCase();
  const usable = (value) => {
    const base = String(value || '').toLowerCase().split('-')[0];
    return isReaderLanguage(base) && base !== sourceCode ? base : '';
  };
  return (
    usable(preferred) ||
    usable(interfaceLanguage) ||
    READER_LANGUAGES.map((language) => language.code).find((code) => code !== sourceCode) ||
    'ru'
  );
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

// Reads the material's detected source language and what is already cached. It
// creates nothing and starts no translation.
export const inspectMaterial = async (resourceId) =>
  unwrap(
    await base44.functions.invoke('materialTranslation', {
      action: 'inspect',
      resource_id: resourceId,
    })
  );

export const openTranslation = async (resourceId, target, sourceOverride) =>
  unwrap(
    await base44.functions.invoke('materialTranslation', {
      action: 'open',
      resource_id: resourceId,
      target_language: target,
      source_language: sourceOverride || undefined,
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

// The student's explicit choice is remembered as their reader default.
export const saveTargetPreference = async (target) => {
  await base44.functions
    .invoke('materialTranslation', { action: 'preference', target_language: target })
    .catch(() => null);
};