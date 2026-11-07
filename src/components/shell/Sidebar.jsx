import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  GraduationCap,
  BookOpen,
  MonitorPlay,
  CalendarCheck,
  Megaphone,
  FileText,
  Sparkles,
  Users,
  Building2,
  Presentation,
  BarChart3,
  Bell,
  UserRound,
  Settings,
  LifeBuoy,
  Network,
  X,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { NAV_BY_ROLE, ACCOUNT_NAV } from '@/lib/workspaceNav';
import { useWorkspace } from '@/lib/workspaceRole';
import BrandMark from './BrandMark';

const ICONS = {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  GraduationCap,
  BookOpen,
  MonitorPlay,
  CalendarCheck,
  Megaphone,
  FileText,
  Sparkles,
  Users,
  Building2,
  Presentation,
  BarChart3,
  Bell,
  UserRound,
  Settings,
  LifeBuoy,
  Network,
};

function NavItem({ item, collapsed }) {
  const Icon = ICONS[item.icon] || LayoutDashboard;
  return (
    <NavLink
      to={item.to}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[12.5px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
          collapsed && 'lg:justify-center lg:px-0',
          isActive ? 'bg-white/10 font-medium text-white' : 'text-white/60 hover:bg-white/[0.06] hover:text-white'
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && <span className="absolute left-0 top-1/2 h-4 w-[2.5px] -translate-y-1/2 rounded-full bg-brand" />}
          <Icon className="h-4 w-4 shrink-0" strokeWidth={1.9} />
          <span className={cn('truncate', collapsed && 'lg:hidden')}>{item.label}</span>
          {item.soon && (
            <span className={cn('ml-auto rounded-full border border-white/15 px-1.5 py-px text-[9px] text-white/40', collapsed && 'lg:hidden')}>
              Soon
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

export default function Sidebar({ collapsed, mobileOpen, onClose, onToggleCollapse }) {
  const { role, workspace, displayName } = useWorkspace();
  const groups = NAV_BY_ROLE[role] || [];

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        className={cn(
          'fixed inset-0 z-40 bg-navy/50 backdrop-blur-[2px] transition-opacity duration-200 lg:hidden',
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      />
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[264px] flex-col bg-navy text-white/70 transition-transform duration-200 ease-out lg:translate-x-0 lg:transition-[width]',
          collapsed ? 'lg:w-[76px]' : 'lg:w-[248px]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className={cn('flex h-14 items-center gap-2.5 px-3.5 sm:h-16', collapsed && 'lg:justify-center lg:px-0')}>
          <BrandMark className="h-8 w-8 shrink-0" />
          <div className={cn('min-w-0 flex-1', collapsed && 'lg:hidden')}>
            <p className="truncate text-[12.5px] font-semibold tracking-tight text-white">Academic Intelligence</p>
            <p className="truncate text-[10px] text-white/40">Academic Intelligence University</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-white/50 hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="no-scrollbar flex-1 overflow-y-auto px-2 pb-2">
          {groups.map((group) => (
            <div key={group.label} className="pt-2">
              <p
                className={cn(
                  'px-2.5 pb-1 text-[9.5px] font-medium uppercase tracking-[0.1em] text-white/30',
                  collapsed && 'lg:hidden'
                )}
              >
                {group.label}
              </p>
              {collapsed && <div className="mx-auto mb-1 hidden h-px w-6 bg-white/10 lg:block" />}
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavItem key={item.to + item.label} item={item} collapsed={collapsed} />
                ))}
              </div>
            </div>
          ))}

          <div className="pt-2">
            <p
              className={cn(
                'px-2.5 pb-1 text-[9.5px] font-medium uppercase tracking-[0.1em] text-white/30',
                collapsed && 'lg:hidden'
              )}
            >
              Account
            </p>
            {collapsed && <div className="mx-auto mb-1 hidden h-px w-6 bg-white/10 lg:block" />}
            <div className="space-y-0.5">
              {ACCOUNT_NAV.map((item) => (
                <NavItem key={item.to} item={item} collapsed={collapsed} />
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 p-2">
          <div className={cn('mb-1.5 rounded-lg bg-white/[0.05] px-2.5 py-2', collapsed && 'lg:hidden')}>
            <p className="truncate text-[11.5px] font-medium text-white">{displayName}</p>
            <p className="text-[10px] text-white/45">{workspace.label} workspace</p>
          </div>
          <button
            type="button"
            onClick={onToggleCollapse}
            className={cn(
              'hidden w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[11px] text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white lg:flex',
              collapsed && 'justify-center px-0'
            )}
          >
            {collapsed ? (
              <ChevronsRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronsLeft className="h-4 w-4" />
                <span>Collapse menu</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}