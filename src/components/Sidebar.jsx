import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  GraduationCap,
  CalendarCheck,
  TrendingUp,
  FileText,
  CalendarDays,
  Megaphone,
  Radar,
  Sparkles,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react';
import BrandMark from '@/components/BrandMark';
import { cn } from '@/lib/utils';
import { NAV_ITEMS, roleLabel } from '@/lib/roles';

const ICONS = {
  LayoutDashboard,
  Building2,
  Users,
  GraduationCap,
  CalendarCheck,
  TrendingUp,
  FileText,
  CalendarDays,
  Megaphone,
  Radar,
  Sparkles,
  BarChart3,
  Settings,
};

export default function Sidebar({ role = 'dean', user, pendingRequests = 0, onSignOut }) {
  const initials = (user?.full_name || 'Dean')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('');

  const items = NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <aside className="flex h-full w-full flex-col bg-gradient-to-b from-[#102D50] via-[#0F2A4B] to-[#0B2140] text-white">
      <div className="flex items-center gap-3 px-5 pb-5 pt-6">
        <BrandMark className="h-10 w-10 shrink-0" />
        <div className="min-w-0">
          <p className="font-heading text-[15px] leading-tight text-white">Digital Dean</p>
          <p className="mt-0.5 text-[9px] uppercase tracking-[0.22em] text-gold">Academic Intelligence</p>
        </div>
      </div>

      <div className="mx-4 mb-4 rounded-xl border border-gold/25 bg-gold/10 px-3 py-2">
        <p className="text-[9px] uppercase tracking-[0.2em] text-gold/90">Role</p>
        <p className="mt-0.5 text-[12.5px] font-medium text-white">{roleLabel(role)}</p>
      </div>

      <nav className="no-scrollbar flex-1 space-y-[3px] overflow-y-auto px-2.5 pb-4">
        {items.map(({ to, label, icon, end, badge }) => {
          const Icon = ICONS[icon] || LayoutDashboard;
          return (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'group relative flex items-center gap-2.5 rounded-lg px-3 py-[9px] text-[12.5px] font-medium transition-all duration-150',
                  isActive
                    ? 'bg-white/[0.11] text-white shadow-[inset_0_0_0_1px_rgba(216,182,106,0.28)]'
                    : 'text-white/55 hover:bg-white/[0.06] hover:text-white/90'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      'absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r bg-gold transition-opacity',
                      isActive ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <Icon
                    className={cn('h-4 w-4 shrink-0', isActive ? 'text-gold' : 'text-white/40 group-hover:text-white/75')}
                    strokeWidth={1.8}
                  />
                  <span className="flex-1 truncate">{label}</span>
                  {badge === 'requests' && pendingRequests > 0 && (
                    <span className="rounded bg-gold px-1.5 py-0.5 text-[10px] font-semibold text-[#102D50]">
                      {pendingRequests}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-2 px-3.5 pb-4">
        <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.05] p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/20 text-[11px] font-semibold text-gold-light ring-1 ring-gold/30">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12.5px] font-medium text-white/95">{user?.full_name || 'Dean’s Office'}</p>
            <p className="truncate text-[10.5px] text-white/40">{user?.email || ''}</p>
          </div>
          <button
            type="button"
            onClick={onSignOut}
            title="Sign out"
            className="rounded-md p-1.5 text-white/35 transition-colors hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.8} />
          </button>
        </div>
      </div>

      <p className="px-5 pb-4 text-[9px] leading-relaxed text-white/25">
        Demonstration environment. Digital Dean is a fictional institution.
      </p>
    </aside>
  );
}