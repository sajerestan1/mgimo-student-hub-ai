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
    <header className="sticky top-0 z-30 border-b border-[#E6EAF2] bg-white/90 backdrop-blur">
      <div className="flex h-14 items-center gap-2 px-3 sm:h-16 sm:gap-3 sm:px-6">
        <button
          type="button"
          onClick={onOpenMobile}
          className="rounded-lg p-2 text-ink/70 hover:bg-[#F1F4FA] lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-[18px] w-[18px]" />
        </button>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[13.5px] font-semibold tracking-tight text-ink">{title}</p>
          <p className="hidden truncate text-[10.5px] text-mutedink sm:block">
            {workspace.label} workspace · {displayName}
          </p>
        </div>

        <div className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-mutedink" />
          <input
            placeholder="Search university…"
            onFocus={() => {
              clearTimeout(blurTimer.current);
              setSearchOpen(true);
            }}
            onBlur={() => {
              blurTimer.current = setTimeout(() => setSearchOpen(false), 120);
            }}
            className="h-9 w-56 rounded-lg border border-[#E6EAF2] bg-[#F6F8FC] pl-8 pr-2 text-[12px] text-ink placeholder:text-mutedink/80 focus:border-brand/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/10 lg:w-72"
          />
          {searchOpen && (
            <div className="absolute right-0 top-11 w-80 rounded-xl border border-[#E6EAF2] bg-white p-3 shadow-[0_18px_40px_-24px_rgba(20,33,61,0.45)]">
              <p className="text-[11px] font-medium text-ink">Global search</p>
              <p className="mt-1 text-[11px] leading-relaxed text-mutedink">
                Searching courses, students, assignments, documents and announcements arrives in Stage 2. This field is a
                designed placeholder and returns no results yet.
              </p>
            </div>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="relative rounded-lg p-2 text-ink/70 transition-colors hover:bg-[#F1F4FA]"
              aria-label="Notifications"
            >
              <Bell className="h-[18px] w-[18px]" />
              {unread && <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-critical ring-2 ring-white" />}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="flex items-center justify-between px-2 py-1.5">
              <DropdownMenuLabel className="p-0 text-[12px]">Notifications</DropdownMenuLabel>
              <button
                type="button"
                onClick={() => setUnread(false)}
                className="text-[10.5px] font-medium text-brand hover:underline"
              >
                Mark all read
              </button>
            </div>
            <DropdownMenuSeparator />
            {NOTIFICATIONS.map((item) => (
              <DropdownMenuItem
                key={item.id}
                onSelect={() => navigate('/notifications')}
                className="flex items-start gap-2.5 py-2"
              >
                <span className={cn('mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full', toneDot[item.tone] || 'bg-brand')} />
                <span className="min-w-0">
                  <span className="block truncate text-[11.5px] font-medium text-ink">{item.title}</span>
                  <span className="block truncate text-[10.5px] text-mutedink">{item.time}</span>
                </span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => navigate('/notifications')} className="justify-center text-[11px] font-medium text-brand">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-1.5 transition-colors hover:bg-[#F1F4FA]"
              aria-label="Account menu"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand/10 text-[10.5px] font-semibold text-brand">
                {initials(displayName)}
              </span>
              <span className="hidden text-left sm:block">
                <span className="block max-w-[140px] truncate text-[11.5px] font-medium leading-tight text-ink">{displayName}</span>
                <span className="block text-[10px] leading-tight text-mutedink">{workspace.label}</span>
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <span className="block text-[12px] text-ink">{displayName}</span>
              <span className="block text-[10.5px] font-normal text-mutedink">{workspace.title}</span>
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