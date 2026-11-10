import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';
import { firstName, greeting } from '@/lib/studentPortal';
import AiAssistantButton from '@/components/shell/AiAssistantButton';
import DashboardSearch from './DashboardSearch';
import { useI18n } from '@/i18n/I18nProvider';

const initialsOf = (name) =>
  (name || '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

export default function WelcomeHeader({ profile, context }) {
  const { t, language } = useI18n();
  const today = new Date().toLocaleDateString(language, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <header className="mb-4">
      <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-mutedink">{today}</p>

      <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-[length:var(--type-title)] font-bold leading-[1.1] tracking-[-0.03em] text-ink">
            {greeting(t)}, {firstName(profile, t)}
          </h1>
          <p className="mt-1.5 text-[15px] text-mutedink">
            {profile?.program || t('student.dashboard.workspace')}
            {profile?.group_name ? ` · ${profile.group_name}` : ''}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden w-56 lg:block xl:w-72">
            <DashboardSearch context={context} />
          </div>
          <AiAssistantButton to={P.student.ai} />
          <Link
            to={P.student.notifications}
            className="icon-btn border border-line bg-white"
            aria-label={t('student.dashboard.notifications')}
          >
            <Bell className="h-[17px] w-[17px]" strokeWidth={1.9} />
          </Link>
          <Link
            to={P.student.profile}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-[12.5px] font-semibold text-white transition-colors hover:bg-navy-mid"
            aria-label={t('student.dashboard.profile')}
          >
            {initialsOf(profile?.full_name) || '·'}
          </Link>
        </div>
      </div>

      <div className="mt-3 lg:hidden">
        <DashboardSearch context={context} />
      </div>
    </header>
  );
}