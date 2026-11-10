import { Check, ChevronDown, Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useI18n } from './I18nProvider';

/**
 * The one compact language control in the application navigation. It shows the
 * current language and switches it in place: the session, workspace and page
 * all stay exactly where they are.
 */
export default function LanguageMenu() {
  const { language, languages, setLanguage, t } = useI18n();
  const current = languages.find((item) => item.code === language) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="group flex items-center gap-2 rounded-full border border-line bg-white py-1 pe-2.5 ps-1 text-[14px] font-medium text-ink transition-colors hover:border-brand/40 hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 data-[state=open]:border-brand/50 data-[state=open]:bg-brand-soft"
          aria-label={`${t('common.language')}: ${current.nativeName}`}
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
            <Globe className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="hidden max-w-[110px] truncate sm:inline" lang={current.code}>
            {current.nativeName}
          </span>
          <span className="text-[13px] font-semibold uppercase text-brand sm:hidden" aria-hidden="true">
            {current.code.slice(0, 2)}
          </span>
          <ChevronDown
            className="h-3.5 w-3.5 shrink-0 text-ink/45 transition-transform group-data-[state=open]:rotate-180"
            aria-hidden="true"
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={6}
        className="w-64 max-w-[calc(100vw-1.5rem)] rounded-xl border-line p-1.5 shadow-xl"
      >
        <DropdownMenuLabel className="px-2 pb-1 pt-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-mutedink">
          {t('common.language')}
        </DropdownMenuLabel>
        {languages.map((item) => {
          const active = item.code === language;
          return (
            <DropdownMenuItem
              key={item.code}
              onSelect={() => setLanguage(item.code)}
              aria-current={active ? 'true' : undefined}
              className={cn(
                'mb-0.5 flex cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-2 focus:bg-canvas',
                active && 'bg-brand-soft focus:bg-brand-soft',
              )}
            >
              <span className="min-w-0">
                <span
                  className={cn(
                    'block truncate text-[14px]',
                    active ? 'font-semibold text-ink' : 'font-medium text-ink/85',
                  )}
                  lang={item.code}
                >
                  {item.nativeName}
                </span>
                <span className="block truncate text-[12.5px] text-mutedink">{item.englishName}</span>
              </span>
              <span
                className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
                  active ? 'bg-brand text-white' : 'opacity-0',
                )}
              >
                <Check className="h-3 w-3" aria-hidden="true" />
              </span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}