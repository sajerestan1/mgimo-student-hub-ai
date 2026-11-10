// Registering a new language is one entry here plus one dictionary file:
// no component needs to change.
export const LANGUAGES = [
  { code: 'en', nativeName: 'English', englishName: 'English', dir: 'ltr' },
  { code: 'ru', nativeName: 'Русский', englishName: 'Russian', dir: 'ltr' },
  { code: 'fr', nativeName: 'Français', englishName: 'French', dir: 'ltr' },
  { code: 'zh-CN', nativeName: '简体中文', englishName: 'Chinese (Simplified)', dir: 'ltr' },
  { code: 'ar', nativeName: 'العربية', englishName: 'Arabic', dir: 'rtl' },
];

export const DEFAULT_LANGUAGE = 'en';

// Device-level value: used for screens shown before an account is known
// (welcome, sign-in) and for the very first render.
export const DEVICE_KEY = 'ai-language';

// Account-scoped cache, so one account's choice never leaks into another
// account signing in on the same browser.
export const accountKey = (userId) => `ai-language:${userId}`;

export const isSupported = (code) => LANGUAGES.some((item) => item.code === code);

export const languageMeta = (code) =>
  LANGUAGES.find((item) => item.code === code) || LANGUAGES[0];