import { Link } from 'react-router-dom';
import { Bell, UserRound } from 'lucide-react';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';
import { firstName, greeting } from '@/lib/studentPortal';
import AiAssistantButton from '@/components/shell/AiAssistantButton';
import { useI18n } from '@/i18n/I18nProvider';

export default function WelcomeHeader({ profile }) {
  const { t } = useI18n();

  return (
    <header className="mb-4 flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
      <div className="min-w-0">
        <h1 className="text-[length:var(--type-title)] font-bold leading-[1.12] tracking-[-0.025em] text-ink">
          {greeting(t)}, {firstName(profile, t)}
        </h1>
        <p className="mt-1 text-[15px] text-mutedink">
          {profile?.program || t('student.dashboard.workspace')}
          {profile?.group_name ? ` · ${profile.group_name}` : ''}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <AiAssistantButton to={P.student.ai} />
        <Link to={P.student.notifications} className="icon-btn" aria-label={t('student.dashboard.notifications')}>
          <Bell className="h-4 w-4" />
        </Link>
        <Link to={P.student.profile} className="icon-btn" aria-label={t('student.dashboard.profile')}>
          <UserRound className="h-4 w-4" />
        </Link>
      </div>
    </header>
  );
}