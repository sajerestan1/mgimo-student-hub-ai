import { useEffect, useState } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import AccountStateScreen from './AccountStateScreen';
import { useAuth } from '@/lib/AuthContext';
import { normalizeRole } from '@/lib/workspaceRole';
import { activateStudentAccount } from '@/lib/studentActivation';
import { useAccountSession } from '@/lib/useAccountSession';
import { missingProfileFields } from '@/lib/accounts';

export default function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const { user } = useAuth();
  const session = useAccountSession();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const ready = session.data && !session.data.blocked && session.data.provisioned;

  // A student account owns its portal from the first visit.
  useEffect(() => {
    if (ready && normalizeRole(user) === 'student') activateStudentAccount(user);
  }, [user?.id, ready]);

  if (session.loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-canvas">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-line border-t-brand" />
      </div>
    );
  }

  if (session.error) {
    return (
      <AccountStateScreen
        tone="warning"
        title="We could not verify your access"
        body="The institutional account service did not answer, so protected content stays closed. Try again, or sign out and return later."
        onRetry={session.refresh}
      />
    );
  }

  if (!session.data.provisioned) {
    return (
      <AccountStateScreen
        title="Access not provisioned"
        body="This sign-in is not linked to an institutional account. Academic Intelligence issues accounts through the university administration only, so this session cannot reach any student, teaching or administrative data."
      />
    );
  }

  if (session.data.blocked) {
    return (
      <AccountStateScreen
        title={session.data.status === 'suspended' ? 'Account suspended' : 'Account deactivated'}
        body={
          session.data.status === 'suspended'
            ? 'This account is suspended. Your academic record is safe and unchanged. Contact the university administration to have access restored.'
            : 'This account is deactivated. Your academic record is kept, but the sign-in no longer opens the platform. Contact the university administration if this was not expected.'
        }
      />
    );
  }

  const profile = {
    role: session.data.role,
    ...session.data.profile,
    contact_email: session.data.profile?.contact_email || user?.email,
  };
  const outstanding = missingProfileFields(profile).filter((item) => item.owner === 'self');

  if (outstanding.length && pathname !== '/complete-profile') {
    return <Navigate to="/complete-profile" replace />;
  }

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
            <Outlet context={{ session: session.data, refreshSession: session.refresh }} />
          </div>
        </main>
        <footer className="border-t border-line px-4 py-3 sm:px-6 lg:px-8">
          <p className="mx-auto max-w-[1320px] text-[10.5px] leading-relaxed text-mutedink">
            Academic Intelligence by Digital Dean. Digital Dean is a fictional institution; all people, records and
            metrics shown are synthetic demonstration data.
          </p>
        </footer>
      </div>
    </div>
  );
}