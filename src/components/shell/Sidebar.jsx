import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  GraduationCap,
  BookOpen,
  BookMarked,
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
  ClipboardCheck,
  FolderOpen,
  MessagesSquare,
  TrendingUp,
  Radar,
  LogOut,
  PenLine,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/AuthContext';
import { NAV_BY_ROLE } from '@/lib/workspaceNav';
import { useWorkspace } from '@/lib/workspaceRole';
import { STUDENT } from '@/lib/studentWorkspace';
import BrandMark from './BrandMark';

const ICONS = {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  GraduationCap,
  BookOpen,
  BookMarked,
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
  ClipboardCheck,
  FolderOpen,
  MessagesSquare,
  TrendingUp,
  Radar,
  LogOut,
  PenLine,
};

const initials = (name) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

const itemClass = (isActive, collapsed) =>
  cn(
    'group flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[12.5px] leading-5 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30',
    collapsed && 'lg:justify-center lg:px-0',
    isActive
      ? 'bg-royal font-medium text-white shadow-[0_8px_18px_-10px_rgba(91,77,235,0.9)]'
      : 'text-white/60 hover:bg-white/[0.06] hover:text-white'
  );

function NavItem({ item, collapsed }) {
  const Icon = ICONS[item.icon] || LayoutDashboard;
  const { logout } = useAuth();

  if (item.action === 'logout') {
    return (
      <button
        type="button"
        onClick={() => logout()}
        title={collapsed ? item.label : undefined}
        className={itemClass(false, collapsed)}
      >
        <Icon className="h-[15px] w-[15px] shrink-0 text-white/45 group-hover:text-white" strokeWidth={1.9} />
        <span className={cn('truncate', collapsed && 'lg:hidden')}>{item.label}</span>
      </button>
    );
  }

  return (
    <NavLink
      to={item.to}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) => itemClass(isActive, collapsed)}
    >
      {({ isActive }) => (
        <>
          <Icon
            className={cn(
              'h-[15px] w-[15px] shrink-0 transition-colors',
              isActive ? 'text-white' : 'text-white/45 group-hover:text-white'
            )}
            strokeWidth={1.9}
          />
          <span className={cn('truncate', collapsed && 'lg:hidden')}>{item.label}</span>
          {item.soon && (
            <span
              className={cn(
                'ml-auto rounded border border-white/10 px-1 py-px text-[9.5px] font-medium uppercase tracking-[0.04em] text-white/35',
                collapsed && 'lg:hidden'
              )}
            >
              Soon
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

function GroupLabel({ children, collapsed }) {
  if (!children) return null;
  return (
    <p
      className={cn(
        'px-3 pb-1.5 pt-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/32',
        collapsed && 'lg:hidden'
      )}
    >
      {children}
    </p>
  );
}

export default function Sidebar({ collapsed, mobileOpen, onClose, onToggleCollapse }) {
  const { workspace, displayName, user, preview } = useWorkspace();
  const groups = NAV_BY_ROLE[workspace.role] || NAV_BY_ROLE.student;
  const isStudent = workspace.role === 'student';
  const secondary = isStudent ? STUDENT.programme : workspace.title;

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        className={cn(
          'fixed inset-0 z-40 bg-[#0B1428]/60 backdrop-blur-[2px] transition-opacity duration-200 lg:hidden',
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      />
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col bg-[#101828] text-white/70 transition-transform duration-200 ease-out lg:translate-x-0 lg:transition-[width]',
          collapsed ? 'lg:w-[76px]' : 'lg:w-[252px]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className={cn('flex h-16 items-center gap-2.5 px-4', collapsed && 'lg:justify-center lg:px-0')}>
          <BrandMark className="h-8 w-8 shrink-0" />
          <div className={cn('min-w-0 flex-1', collapsed && 'lg:hidden')}>
            <p className="truncate text-[13px] font-semibold tracking-[-0.01em] text-white">Academic Intelligence</p>
            <p className="truncate text-[10.5px] text-white/45">{workspace.title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 lg:hidden"
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div
          className={cn(
            'mx-3 mb-2 hidden rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 py-2 lg:block',
            collapsed && 'lg:hidden'
          )}
        >
          <p className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-white/35">
            {preview ? 'Dean view' : 'Student portal'}
          </p>
          <p className="mt-0.5 truncate text-[11.5px] font-medium text-white/85">
            {preview ? 'Inspecting the student workspace' : secondary}
          </p>
          {preview && (
            <Link to="/dean/dashboard" className="mt-1 inline-block text-[10.5px] font-medium text-[#A9A0FF] hover:text-white">
              Back to command center
            </Link>
          )}
        </div>

        <nav className="no-scrollbar flex-1 overflow-y-auto px-2 pb-2">
          {groups.map((group) => (
            <div key={group.label || 'main'}>
              <GroupLabel collapsed={collapsed}>{group.label}</GroupLabel>
              {collapsed && group.label && <div className="mx-auto mb-1 hidden h-px w-6 bg-white/10 lg:block" />}
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavItem key={item.to || item.label} item={item} collapsed={collapsed} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/[0.07] p-2">
          <Link
            to={isStudent ? '/student/profile' : '/profile'}
            className={cn(
              'flex items-center gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-white/[0.06]',
              collapsed && 'lg:hidden'
            )}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-royal/25 text-[10.5px] font-semibold text-white">
              {initials(displayName)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[11.5px] font-medium text-white">{displayName}</span>
              <span className="block truncate text-[10px] text-white/45">{user?.email || workspace.title}</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={onToggleCollapse}
            className={cn(
              'hidden w-full items-center gap-2 rounded-lg px-2 py-1.5 text-[11px] text-white/40 transition-colors hover:bg-white/[0.05] hover:text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 lg:flex',
              collapsed && 'justify-center px-0'
            )}
            aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
          >
            {collapsed ? (
              <ChevronsRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronsLeft className="h-4 w-4" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}