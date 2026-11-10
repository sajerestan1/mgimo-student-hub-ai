import { Check, Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[14px] font-medium text-ink/70 transition-colors hover:bg-canvas hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25"
          aria-label={`${t('common.language')}: ${current.nativeName}`}
        >
          <Globe className="h-[17px] w-[17px]" aria-hidden="true" />
          <span className="hidden max-w-[92px] truncate sm:inline">{current.nativeName}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="pb-1">{t('common.language')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {languages.map((item) => (
          <DropdownMenuItem
            key={item.code}
            onSelect={() => setLanguage(item.code)}
            className="justify-between gap-2"
          >
            <span className="truncate">{item.nativeName}</span>
            <Check
              className={cn('h-4 w-4 shrink-0', item.code === language ? 'text-brand' : 'opacity-0')}
              aria-hidden="true"
            />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}