import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useAuth } from '@/lib/AuthContext';
import { normalizeRole } from '@/lib/workspaceRole';
import { activateStudentAccount } from '@/lib/studentActivation';

export default function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // A student account owns its portal from the first visit.
  useEffect(() => {
    if (normalizeRole(user) === 'student') activateStudentAccount(user);
  }, [user?.id]);

  return (
    <div className="min-h-dvh bg-canvas">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onToggleCollapse={() => setCollapsed((value) => !value)}
      />
      <div
        className={cn(
          'flex min-h-dvh flex-col transition-[padding] duration-200 ease-out',
          collapsed ? 'lg:pl-[70px]' : 'lg:pl-[244px]'
        )}
      >
        <TopBar onOpenMobile={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7">
          <div className="mx-auto w-full max-w-[1320px]">
            <Outlet />
          </div>
        </main>
        <footer className="border-t border-line px-4 py-3 sm:px-6 lg:px-8">
          <p className="mx-auto max-w-[1320px] text-[10.5px] leading-relaxed text-mutedink">
            Independent academic technology prototype developed for the MGIMO AI Challenge 2026. Not an official MGIMO
            service. All people, records and metrics shown are fictional.
          </p>
        </footer>
      </div>
    </div>
  );
}