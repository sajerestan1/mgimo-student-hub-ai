import { Check, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from './I18nProvider';

/**
 * The full language control on the settings screen: native names, the current
 * choice marked, and an immediate switch with no reload.
 */
export default function LanguageSelector() {
  const { language, languages, setLanguage, t } = useI18n();

  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {languages.map((item) => {
        const active = item.code === language;
        return (
          <li key={item.code}>
            <button
              type="button"
              onClick={() => setLanguage(item.code)}
              aria-pressed={active}
              className={cn(
                'group flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-start transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30',
                active
                  ? 'border-brand/40 bg-brand-soft'
                  : 'border-line bg-white hover:border-brand/30 hover:bg-canvas',
              )}
            >
              <span className="flex min-w-0 items-center gap-2.5">
                <span
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors',
                    active ? 'bg-white text-brand' : 'bg-canvas text-ink/45 group-hover:text-brand',
                  )}
                >
                  <Globe className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span
                    className={cn(
                      'block truncate text-[15px]',
                      active ? 'font-semibold text-ink' : 'font-medium text-ink',
                    )}
                    lang={item.code}
                  >
                    {item.nativeName}
                  </span>
                  <span className="block truncate text-[13px] text-mutedink">{item.englishName}</span>
                </span>
              </span>
              <span
                className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
                  active ? 'bg-brand text-white' : 'border border-line text-transparent',
                )}
              >
                <Check className="h-3 w-3" aria-hidden="true" />
              </span>
            </button>
          </li>
        );
      })}
      <li className="sm:col-span-2">
        <p className="text-[13px] leading-relaxed text-mutedink">{t('settings.languageRestore')}</p>
      </li>
    </ul>
  );
}