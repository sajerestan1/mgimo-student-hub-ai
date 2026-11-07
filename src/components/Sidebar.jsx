import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  GraduationCap,
  FileText,
  Bell,
  Sparkles,
  User,
  LogOut,
} from 'lucide-react';
import BrandMark from '@/components/BrandMark';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/schedule', label: 'Schedule', icon: CalendarDays },
  { to: '/performance', label: 'Performance', icon: GraduationCap },
  { to: '/applications', label: 'Applications', icon: FileText },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/assistant', label: 'AI Assistant', icon: Sparkles },
  { to: '/profile', label: 'My Profile', icon: User },
];

export default function Sidebar({
  studentName = 'Alexandra Volkova',
  program = 'International Relations',
  unreadCount = 0,
  onSignOut,
}) {
  const initials = studentName
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('');

  return (
    <aside className="flex h-full w-full flex-col bg-gradient-to-b from-[#10294A] via-[#123255] to-[#0B2140] text-white">
      <div className="flex items-center gap-3 px-6 pb-6 pt-6">
        <BrandMark className="h-11 w-11 shrink-0" />
        <div className="min-w-0">
          <p className="font-heading text-[16px] leading-tight text-white">Student Hub</p>
          <p className="mt-0.5 text-[9.5px] uppercase tracking-[0.24em] text-gold">AI Academic Office</p>
        </div>
      </div>

      <p className="px-6 pb-2.5 text-[9.5px] font-medium uppercase tracking-[0.24em] text-white/30">
        Navigation
      </p>

      <nav className="no-scrollbar flex-1 space-y-1 overflow-y-auto px-3">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13.5px] font-medium transition-all duration-200',
                isActive
                  ? 'bg-white/[0.09] text-white shadow-[inset_0_0_0_1px_rgba(200,164,93,0.22)]'
                  : 'text-white/55 hover:bg-white/[0.05] hover:text-white/90'
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    'absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r bg-gold transition-opacity duration-200',
                    isActive ? 'opacity-100' : 'opacity-0'
                  )}
                />
                <Icon
                  className={cn(
                    'h-[17px] w-[17px] shrink-0 transition-colors',
                    isActive ? 'text-gold' : 'text-white/40 group-hover:text-white/70'
                  )}
                  strokeWidth={1.8}
                />
                <span className="flex-1 truncate">{label}</span>
                {to === '/notifications' && unreadCount > 0 && (
                  <span className="rounded-full bg-gold px-1.5 py-0.5 text-[10px] font-semibold text-[#10294A]">
                    {unreadCount}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-4 px-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/15 text-[11px] font-semibold text-gold-light ring-1 ring-gold/25">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-white/95">{studentName}</p>
              <p className="truncate text-[11px] text-white/40">{program}</p>
            </div>
            <button
              type="button"
              onClick={onSignOut}
              title="Sign out"
              className="rounded-lg p-1.5 text-white/35 transition-colors hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </div>

      <p className="px-6 py-5 text-[9.5px] leading-relaxed text-white/25">
        Independent AI Challenge Prototype.<br />Not an official MGIMO University service.
      </p>
    </aside>
  );
}