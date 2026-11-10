import { Check } from 'lucide-react';
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
                'flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-start transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30',
                active ? 'border-brand/40 bg-[#F7F9FF]' : 'border-line bg-white hover:bg-canvas'
              )}
            >
              <span className="min-w-0">
                <span className="block truncate text-[15px] font-medium text-ink" lang={item.code}>
                  {item.nativeName}
                </span>
                <span className="block truncate text-[13px] text-mutedink">{item.englishName}</span>
              </span>
              {active && <Check className="h-4 w-4 shrink-0 text-brand" aria-hidden="true" />}
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