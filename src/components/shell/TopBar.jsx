import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Menu, Search, LogOut, UserRound, Settings, LifeBuoy } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/lib/AuthContext';
import { useWorkspace } from '@/lib/workspaceRole';
import { PAGE_TITLES } from '@/lib/workspaceNav';
import { NOTIFICATIONS } from '@/lib/demoUniversity';

const initials = (name) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

const toneDot = {
  critical: 'bg-critical',
  warning: 'bg-warning',
  info: 'bg-brand',
};

export default function TopBar({ onOpenMobile }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { displayName, workspace } = useWorkspace();
  const [searchOpen, setSearchOpen] = useState(false);
  const [unread, setUnread] = useState(true);
  const blurTimer = useRef(null);

  useEffect(() => () => clearTimeout(blurTimer.current), []);

  const title = PAGE_TITLES[pathname] || 'Academic Intelligence';

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
      <div className="flex h-14 items-center gap-2.5 px-3 sm:h-16 sm:gap-3 sm:px-6 lg:px-8">
        <button type="button" onClick={onOpenMobile} className="icon-btn lg:hidden" aria-label="Open navigation">
          <Menu className="h-[18px] w-[18px]" />
        </button>

        <div className="min-w-0 flex-1">
          <p className="hidden text-[10.5px] font-medium uppercase tracking-[0.1em] text-mutedink sm:block">
            {workspace.label}
          </p>
          <p className="truncate text-[13.5px] font-semibold leading-tight tracking-[-0.01em] text-ink sm:mt-0.5">{title}</p>
        </div>

        <div className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-mutedink/80" />
          <input
            placeholder="Search university…"
            onFocus={() => {
              clearTimeout(blurTimer.current);
              setSearchOpen(true);
            }}
            onBlur={() => {
              blurTimer.current = setTimeout(() => setSearchOpen(false), 120);
            }}
            className="h-9 w-52 rounded-lg border border-line bg-canvas/60 pl-8 pr-2.5 text-[12px] text-ink placeholder:text-mutedink/80 transition-colors focus:border-brand/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/10 lg:w-72"
          />
          {searchOpen && (
            <div className="fade-up absolute right-0 top-11 w-80 rounded-xl border border-line bg-white p-3.5 shadow-[0_24px_48px_-28px_rgba(16,27,51,0.45)]">
              <p className="text-[12px] font-medium text-ink">Global search</p>
              <p className="mt-1 text-[11.5px] leading-relaxed text-mutedink">
                Searching courses, students, assignments and documents arrives in Stage 2. This field is a designed
                placeholder and returns no results yet.
              </p>
            </div>
          )}
        </div>

        <span className="hidden h-6 w-px bg-line md:block" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="icon-btn relative" aria-label="Notifications">
              <Bell className="h-[18px] w-[18px]" />
              {unread && (
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-critical ring-2 ring-white" />
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="flex items-center justify-between px-2 py-1.5">
              <DropdownMenuLabel className="p-0 text-[12px] text-ink">Notifications</DropdownMenuLabel>
              <button
                type="button"
                onClick={() => setUnread(false)}
                className="text-[11px] font-medium text-brand hover:text-brand-deep"
              >
                Mark all read
              </button>
            </div>
            <DropdownMenuSeparator />
            {NOTIFICATIONS.map((item) => (
              <DropdownMenuItem key={item.id} onSelect={() => navigate('/notifications')} className="items-start gap-2.5 py-2">
                <span className={cn('mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full', toneDot[item.tone] || 'bg-brand')} />
                <span className="min-w-0">
                  <span className="block truncate text-[11.5px] font-medium text-ink">{item.title}</span>
                  <span className="mt-0.5 block truncate text-[10.5px] text-mutedink">{item.time}</span>
                </span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => navigate('/notifications')}
              className="justify-center text-[11.5px] font-medium text-brand"
            >
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-1.5 transition-colors hover:bg-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25"
              aria-label="Account menu"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EDF1FE] text-[10.5px] font-semibold text-[#3B5AE0]">
                {initials(displayName)}
              </span>
              <span className="hidden text-left sm:block">
                <span className="block max-w-[148px] truncate text-[11.5px] font-medium leading-tight text-ink">
                  {displayName}
                </span>
                <span className="block text-[10px] leading-tight text-mutedink">{workspace.label}</span>
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="pb-1.5">
              <span className="block truncate text-[12px] text-ink">{displayName}</span>
              <span className="mt-0.5 block text-[10.5px] font-normal text-mutedink">{workspace.title}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => navigate('/profile')}>
              <UserRound className="mr-2 h-3.5 w-3.5" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => navigate('/settings')}>
              <Settings className="mr-2 h-3.5 w-3.5" /> Settings
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => navigate('/help')}>
              <LifeBuoy className="mr-2 h-3.5 w-3.5" /> Help & support
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => logout()}>
              <LogOut className="mr-2 h-3.5 w-3.5" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}