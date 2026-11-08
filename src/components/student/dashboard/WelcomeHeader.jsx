import { Link } from 'react-router-dom';
import { Bell, UserRound } from 'lucide-react';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';
import { firstName, greeting } from '@/lib/studentPortal';

export default function WelcomeHeader({ profile }) {
  return (
    <header className="mb-4 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-[length:var(--type-title)] font-bold leading-[1.12] tracking-[-0.025em] text-ink">
          {greeting()}, {firstName(profile)}
        </h1>
        <p className="mt-1 text-[15px] text-mutedink">
          {profile?.program || 'Student workspace'}
          {profile?.group_name ? ` · ${profile.group_name}` : ''}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Link to={P.student.notifications} className="icon-btn" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </Link>
        <Link to={P.student.profile} className="icon-btn" aria-label="Profile">
          <UserRound className="h-4 w-4" />
        </Link>
      </div>
    </header>
  );
}