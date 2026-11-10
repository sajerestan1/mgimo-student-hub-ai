import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import {
  DEFAULT_LANGUAGE,
  DEVICE_KEY,
  LANGUAGES,
  accountKey,
  isSupported,
  languageMeta,
} from './config';
import { translate } from './translate';

export const I18nContext = createContext(null);

const safeGet = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const safeSet = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage unavailable: the session still switches language */
  }
};

const deviceLanguage = () => {
  const stored = safeGet(DEVICE_KEY);
  return isSupported(stored) ? stored : DEFAULT_LANGUAGE;
};

/**
 * Language for the whole interface. The choice is applied instantly to the live
 * session — no reload, no sign-out — and is remembered in two places: the
 * account's own preference (so it follows the person to another device) and a
 * per-account key on this device (so the first paint is right). A different
 * account signing in on the same browser never inherits the previous choice.
 */
export function I18nProvider({ children }) {
  const { user } = useAuth();
  const [language, setLanguageState] = useState(deviceLanguage);
  const userId = user?.id || null;

  useEffect(() => {
    if (!userId) {
      setLanguageState(deviceLanguage());
      return;
    }
    if (isSupported(user?.language)) {
      setLanguageState(user.language);
      return;
    }
    const cached = safeGet(accountKey(userId));
    setLanguageState(isSupported(cached) ? cached : DEFAULT_LANGUAGE);
  }, [userId, user?.language]);

  useEffect(() => {
    const meta = languageMeta(language);
    const root = document.documentElement;
    root.setAttribute('lang', language);
    root.setAttribute('dir', meta.dir);
    root.setAttribute('data-language', language);
  }, [language]);

  const setLanguage = useCallback(
    (code) => {
      if (!isSupported(code)) return;
      setLanguageState(code);
      safeSet(DEVICE_KEY, code);
      if (!userId) return;
      safeSet(accountKey(userId), code);
      // Preference only — no credential or academic record is involved.
      base44.auth.updateMe({ language: code }).catch(() => {});
    },
    [userId]
  );

  const t = useCallback((key, vars) => translate(language, key, vars), [language]);

  const formatDate = useCallback(
    (value, options) => {
      const date = value instanceof Date ? value : new Date(value);
      if (Number.isNaN(date.getTime())) return '—';
      return new Intl.DateTimeFormat(
        language,
        options || { day: 'numeric', month: 'short', year: 'numeric' }
      ).format(date);
    },
    [language]
  );

  const formatTime = useCallback(
    (value, options) => {
      const date = value instanceof Date ? value : new Date(value);
      if (Number.isNaN(date.getTime())) return '—';
      return new Intl.DateTimeFormat(language, options || { hour: '2-digit', minute: '2-digit' }).format(date);
    },
    [language]
  );

  const formatNumber = useCallback(
    (value, options) => new Intl.NumberFormat(language, options).format(Number(value) || 0),
    [language]
  );

  const meta = languageMeta(language);

  const value = useMemo(
    () => ({
      language,
      dir: meta.dir,
      isRTL: meta.dir === 'rtl',
      languages: LANGUAGES,
      setLanguage,
      t,
      formatDate,
      formatTime,
      formatNumber,
    }),
    [language, meta.dir, setLanguage, t, formatDate, formatTime, formatNumber]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used within an I18nProvider');
  return context;
};