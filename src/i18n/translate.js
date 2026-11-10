import en from './dictionaries/en';
import { dictionaries } from './dictionaries';

const warned = new Set();
const missing = new Set();

function lookup(dictionary, key) {
  return key
    .split('.')
    .reduce((node, part) => (node && typeof node === 'object' ? node[part] : undefined), dictionary);
}

/**
 * Resolves a key against the selected dictionary, falling back to English and
 * then to the key itself. In development a missing translation is reported once
 * per key, which is how new interface text is caught before release.
 */
export function translate(language, key, vars) {
  const selected = dictionaries[language] || {};
  let value = lookup(selected, key);

  if (value === undefined || value === '') {
    const fallback = lookup(en, key);
    if (fallback === undefined) {
      if (import.meta.env?.DEV && !warned.has(key)) {
        warned.add(key);
        console.warn(`[i18n] Unknown translation key: ${key}`);
      }
      return key;
    }
    if (language !== 'en') {
      const marker = `${language}:${key}`;
      missing.add(marker);
      if (import.meta.env?.DEV && !warned.has(marker)) {
        warned.add(marker);
        console.warn(`[i18n] ${language} falls back to English for: ${key}`);
      }
    }
    value = fallback;
  }

  if (typeof value !== 'string') return key;
  if (!vars) return value;

  return value.replace(/\{(\w+)\}/g, (match, name) =>
    vars[name] === undefined || vars[name] === null ? match : String(vars[name])
  );
}

/** Missing keys collected in this session, for the development report. */
export function getMissingTranslations() {
  return [...missing];
}