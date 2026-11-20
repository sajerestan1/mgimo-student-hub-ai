import { useEffect, useState } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import AccountStateScreen from './AccountStateScreen';
import { useAuth } from '@/lib/AuthContext';
import { useI18n } from '@/i18n/I18nProvider';
import { normalizeRole } from '@/lib/workspaceRole';
import { activateStudentAccount } from '@/lib/studentActivation';
import { useAccountSession } from '@/lib/useAccountSession';
import { missingProfileFields } from '@/lib/accounts';

export default function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const { user } = useAuth();
  const { t } = useI18n();
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
        title={t('accountState.unverifiedTitle')}
        body={t('accountState.unverifiedBody')}
        onRetry={session.refresh}
      />
    );
  }

  if (!session.data.provisioned) {
    return (
      <AccountStateScreen
        title={t('accountState.notProvisionedTitle')}
        body={t('accountState.notProvisionedBody')}
      />
    );
  }

  if (session.data.blocked) {
    return (
      <AccountStateScreen
        title={
          session.data.status === 'suspended'
            ? t('accountState.suspendedTitle')
            : t('accountState.deactivatedTitle')
        }
        body={
          session.data.status === 'suspended'
            ? t('accountState.suspendedBody')
            : t('accountState.deactivatedBody')
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

  if (import.meta.env.VITE_DEMO_MODE !== 'true' && outstanding.length && pathname !== '/complete-profile') {
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
          // Padding follows the writing direction, so the sidebar's mirror side
          // is respected in a right-to-left language without a second rule.
          'flex min-h-dvh flex-col transition-[padding] duration-200 ease-out',
          collapsed ? 'lg:ps-[70px]' : 'lg:ps-[244px]'
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
            {t('shell.footer')}
          </p>
        </footer>
      </div>
    </div>
  );
}