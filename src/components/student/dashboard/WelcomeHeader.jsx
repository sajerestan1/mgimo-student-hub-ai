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
    <header>
      <p className="text-[length:var(--type-meta)] font-semibold uppercase tracking-[0.1em] text-[#64748B]">{today}</p>

      <div className="mt-1.5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-[length:var(--type-title)] font-bold leading-[1.12] tracking-[-0.03em] text-ink">
            {greeting(t)}, {firstName(profile, t)}
          </h1>
          <p className="mt-1.5 truncate text-[length:var(--type-secondary)] leading-[1.5] text-[#64748B]">
            {profile?.program || t('student.dashboard.workspace')}
            {profile?.group_name ? ` · ${profile.group_name}` : ''}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden w-52 lg:block xl:w-64">
            <DashboardSearch context={context} />
          </div>
          <AiAssistantButton
            to={P.student.ai}
            className="bg-none bg-[#2563EB] shadow-[0_8px_18px_-10px_rgba(37,99,235,0.85)] hover:bg-[#1D4ED8] hover:brightness-100"
          />
          <Link
            to={P.student.notifications}
            className="icon-btn h-10 w-10 shrink-0 border border-line bg-white text-[#2563EB] hover:bg-[#EFF6FF]"
            aria-label={t('student.dashboard.notifications')}
          >
            <Bell className="h-[17px] w-[17px]" strokeWidth={1.9} />
          </Link>
          <Link
            to={P.student.profile}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#14213D] text-[length:var(--type-meta)] font-semibold text-white transition-colors hover:bg-[#1B2C4F]"
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