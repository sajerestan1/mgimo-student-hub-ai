import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Search, LogOut, UserRound, Settings, LifeBuoy } from 'lucide-react';
import NotificationBell from './NotificationBell';
import LanguageMenu from '@/i18n/LanguageMenu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/lib/AuthContext';
import { useI18n } from '@/i18n/I18nProvider';
import { useWorkspace } from '@/lib/workspaceRole';
import { NAV_BY_ROLE } from '@/lib/workspaceNav';
import useStudentProfile from '@/hooks/useStudentProfile';

const initials = (name) =>
  (name || '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

export default function TopBar({ onOpenMobile }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { displayName, workspace } = useWorkspace();
  const { t, isRTL } = useI18n();
  const [searchOpen, setSearchOpen] = useState(false);
  const blurTimer = useRef(null);

  useEffect(() => () => clearTimeout(blurTimer.current), []);

  // The header title comes from the signed-in role's own navigation, so it can
  // never display another workspace's module name.
  const activeItem = (NAV_BY_ROLE[workspace.role] || [])
    .flatMap((group) => group.items)
    .find((item) => item.to === pathname);
  const title = activeItem?.label ? t(activeItem.label) : t(workspace.title);
  const isStudent = workspace.role === 'student';
  const studentProfile = useStudentProfile(isStudent);
  const studentYear = studentProfile
    ? [
        studentProfile.year ? t('shell.year', { year: studentProfile.year }) : '',
        studentProfile.group_name ? t('shell.group', { group: studentProfile.group_name }) : '',
      ]
        .filter(Boolean)
        .join(' · ')
    : '';
  const context =
    (isStudent
      ? [
          studentProfile?.program,
          studentProfile?.group_name ? t('shell.group', { group: studentProfile.group_name }) : '',
        ]
          .filter(Boolean)
          .join(' · ')
      : '') || t(workspace.title);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
      <div className="flex h-14 items-center gap-2.5 px-3 sm:h-16 sm:gap-3 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onOpenMobile}
          className="icon-btn lg:hidden"
          aria-label={t('shell.openNavigation')}
        >
          <Menu className="h-[18px] w-[18px]" />
        </button>

        <div className="min-w-0 flex-1">
          <p className="hidden truncate text-[13px] font-medium uppercase tracking-[0.08em] text-mutedink sm:block">
            {context}
          </p>
          <p className="truncate text-[16px] font-semibold leading-tight tracking-[-0.01em] text-ink sm:mt-0.5">{title}</p>
        </div>

        <div className="relative hidden md:block">
          <Search
            className={`pointer-events-none absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-mutedink/80 ${
              isRTL ? 'right-2.5' : 'left-2.5'
            }`}
          />
          <input
            placeholder={isStudent ? t('shell.searchStudent') : t('shell.searchUniversity')}
            onFocus={() => {
              clearTimeout(blurTimer.current);
              setSearchOpen(true);
            }}
            onBlur={() => {
              blurTimer.current = setTimeout(() => setSearchOpen(false), 120);
            }}
            className={`h-9 w-52 rounded-lg border border-line bg-canvas/60 text-[15px] text-ink placeholder:text-mutedink/80 transition-colors focus:border-brand/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/10 lg:w-72 ${
              isRTL ? 'pl-2.5 pr-8' : 'pl-8 pr-2.5'
            }`}
          />
          {searchOpen && (
            <div
              className={`fade-up absolute top-11 w-80 rounded-xl border border-line bg-white p-3.5 shadow-[0_24px_48px_-28px_rgba(16,27,51,0.45)] ${
                isRTL ? 'left-0' : 'right-0'
              }`}
            >
              <p className="text-[14px] font-medium text-ink">{t('shell.globalSearch')}</p>
              <p className="mt-1 text-[13.5px] leading-[1.6] text-mutedink">
                {isStudent ? t('shell.globalSearchStudentBody') : t('shell.globalSearchStaffBody')}
              </p>
            </div>
          )}
        </div>

        <span className="hidden h-6 w-px bg-line md:block" />

        <LanguageMenu />

        <button
          type="button"
          onClick={() => navigate('/help')}
          className="icon-btn hidden sm:inline-flex"
          aria-label={t('shell.helpSupport')}
        >
          <LifeBuoy className="h-[18px] w-[18px]" />
        </button>

        <NotificationBell />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-1.5 transition-colors hover:bg-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25"
              aria-label={t('shell.accountMenu')}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EDF1FE] text-[12.5px] font-semibold text-[#3B5AE0]">
                {initials(displayName)}
              </span>
              <span className="hidden text-start sm:block">
                <span className="block max-w-[148px] truncate text-[14px] font-medium leading-tight text-ink">
                  {displayName}
                </span>
                <span className="block truncate text-[13px] leading-tight text-mutedink">
                  {isStudent ? studentYear || t(workspace.label) : t(workspace.label)}
                </span>
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="pb-1.5">
              <span className="block truncate text-[14px] text-ink">{displayName}</span>
              <span className="mt-0.5 block text-[13px] font-normal text-mutedink">{t(workspace.title)}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => navigate(isStudent ? '/student/profile' : '/profile')}>
              <UserRound className="me-2 h-3.5 w-3.5" /> {t('shell.profile')}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => navigate('/settings')}>
              <Settings className="me-2 h-3.5 w-3.5" /> {t('shell.settings')}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => navigate('/help')}>
              <LifeBuoy className="me-2 h-3.5 w-3.5" /> {t('shell.helpSupport')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => logout()}>
              <LogOut className="me-2 h-3.5 w-3.5" /> {t('shell.signOut')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}