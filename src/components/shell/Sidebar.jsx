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
  FileSpreadsheet,
  Scale,
  BellRing,
  Lightbulb,
  ShieldCheck,
  Inbox,
  ShieldAlert,
  BrainCircuit,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/AuthContext';
import { useI18n } from '@/i18n/I18nProvider';
import { NAV_BY_ROLE } from '@/lib/workspaceNav';
import { useWorkspace } from '@/lib/workspaceRole';
import useStudentProfile from '@/hooks/useStudentProfile';
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
  FileSpreadsheet,
  Scale,
  BellRing,
  Lightbulb,
  ShieldCheck,
  Inbox,
  ShieldAlert,
  BrainCircuit,
};

const initials = (name) =>
  (name || '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

const itemClass = (isActive, collapsed, rtl) =>
  cn(
    'group flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[15px] leading-6 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30',
    rtl ? 'text-right' : 'text-left',
    collapsed && 'lg:justify-center lg:px-0',
    isActive
      ? 'bg-royal font-medium text-white shadow-[0_8px_18px_-10px_rgba(91,77,235,0.9)]'
      : 'text-white/60 hover:bg-white/[0.06] hover:text-white'
  );

function NavItem({ item, collapsed, rtl }) {
  const Icon = ICONS[item.icon] || LayoutDashboard;
  const { logout } = useAuth();
  const { t } = useI18n();
  const label = t(item.label);

  if (item.action === 'logout') {
    return (
      <button
        type="button"
        onClick={() => logout()}
        title={collapsed ? label : undefined}
        className={itemClass(false, collapsed, rtl)}
      >
        <Icon className="h-[15px] w-[15px] shrink-0 text-white/45 group-hover:text-white" strokeWidth={1.9} />
        <span className={cn('min-w-0 flex-1 truncate', collapsed && 'lg:hidden')}>{label}</span>
      </button>
    );
  }

  return (
    <NavLink
      to={item.to}
      title={collapsed ? label : undefined}
      className={({ isActive }) => itemClass(isActive, collapsed, rtl)}
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
          <span className={cn('min-w-0 flex-1 truncate', collapsed && 'lg:hidden')}>{label}</span>
          {item.soon && (
            <span
              className={cn(
                'shrink-0 rounded border border-white/10 px-1.5 py-px text-[12px] font-medium uppercase tracking-[0.04em] text-white/35',
                collapsed && 'lg:hidden'
              )}
            >
              {t('common.comingSoon')}
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
        'px-3 pb-1.5 pt-4 text-[13px] font-semibold uppercase tracking-[0.1em] text-white/32',
        collapsed && 'lg:hidden'
      )}
    >
      {children}
    </p>
  );
}

export default function Sidebar({ collapsed, mobileOpen, onClose, onToggleCollapse }) {
  const { workspace, displayName, user, preview } = useWorkspace();
  const { t, isRTL } = useI18n();
  // Administration entries are only rendered for administrator accounts; the
  // server verifies the role again on every administrative action.
  const isAdmin = user?.role === 'admin';
  const groups = (NAV_BY_ROLE[workspace.role] || NAV_BY_ROLE.student)
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (item.adminOnly && !isAdmin) return false;
        if (item.roles && !item.roles.includes(user?.role)) return false;
        return true;
      }),
    }))
    .filter((group) => group.items.length);
  const isStudent = workspace.role === 'student';
  const studentProfile = useStudentProfile(isStudent);
  const secondary = isStudent ? studentProfile?.program || t('workspace.student.title') : t(workspace.title);
  const CollapseIcon = isRTL ? ChevronsRight : ChevronsLeft;
  const ExpandIcon = isRTL ? ChevronsLeft : ChevronsRight;

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
        dir={isRTL ? 'rtl' : 'ltr'}
        className={cn(
          'fixed inset-y-0 z-50 flex w-[272px] flex-col bg-[#101828] text-white/70 transition-transform duration-200 ease-out lg:translate-x-0 lg:transition-[width]',
          isRTL ? 'right-0' : 'left-0',
          collapsed ? 'lg:w-[76px]' : 'lg:w-[252px]',
          mobileOpen ? 'translate-x-0' : isRTL ? 'translate-x-full' : '-translate-x-full'
        )}
      >
        <div className={cn('flex h-16 items-center gap-2.5 px-4', collapsed && 'lg:justify-center lg:px-0')}>
          <BrandMark className="h-8 w-8 shrink-0" />
          <div className={cn('min-w-0 flex-1', collapsed && 'lg:hidden')}>
            <p className="truncate text-[15px] font-semibold tracking-[-0.01em] text-white">{t('common.appName')}</p>
            <p className="truncate text-[12px] uppercase tracking-[0.14em] text-white/45">{t('common.appSuite')}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 lg:hidden"
            aria-label={t('shell.closeNavigation')}
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
          <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-white/35">
            {preview ? t('workspace.deanView') : t(workspace.portalLabel)}
          </p>
          <p className="mt-0.5 truncate text-[14px] font-medium text-white/85">
            {preview ? t('workspace.inspecting') : secondary}
          </p>
          {preview && (
            <Link to="/dean/dashboard" className="mt-1 inline-block text-[13px] font-medium text-[#A9A0FF] hover:text-white">
              {t('workspace.backToCommand')}
            </Link>
          )}
        </div>

        <nav className="no-scrollbar flex-1 overflow-y-auto px-2 pb-2">
          {groups.map((group) => (
            <div key={group.label || 'main'}>
              <GroupLabel collapsed={collapsed}>{group.label ? t(group.label) : ''}</GroupLabel>
              {collapsed && group.label && <div className="mx-auto mb-1 hidden h-px w-6 bg-white/10 lg:block" />}
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavItem key={item.to || item.label} item={item} collapsed={collapsed} rtl={isRTL} />
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
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-royal/25 text-[12.5px] font-semibold text-white">
              {initials(displayName)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[14px] font-medium text-white">{displayName}</span>
              <span className="block truncate text-[13px] text-white/45">{user?.email || t(workspace.title)}</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={onToggleCollapse}
            className={cn(
              'hidden w-full items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] text-white/40 transition-colors hover:bg-white/[0.05] hover:text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 lg:flex',
              collapsed && 'justify-center px-0'
            )}
            aria-label={collapsed ? t('shell.expandNavigation') : t('shell.collapseNavigation')}
          >
            {collapsed ? (
              <ExpandIcon className="h-4 w-4" />
            ) : (
              <>
                <CollapseIcon className="h-4 w-4" />
                <span>{t('shell.collapse')}</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}