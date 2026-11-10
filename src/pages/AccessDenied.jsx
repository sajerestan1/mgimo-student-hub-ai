import { Link } from 'react-router-dom';
import { ShieldAlert, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useWorkspace } from '@/lib/workspaceRole';
import { ROLE_LABELS } from '@/lib/roles';
import { useI18n } from '@/i18n/I18nProvider';

const WORKSPACE_KEYS = {
  student: 'welcome.student',
  professor: 'welcome.professor',
  dean: 'welcome.administration',
  administration: 'welcome.administration',
};

/**
 * The refusal page. It is a whole screen of its own: it never renders inside a
 * workspace shell, so no sidebar, workspace header, navigation or workspace data
 * is present while a request is denied. Only the signed-in name and role from
 * the authenticated account are shown.
 */
export default function AccessDenied({ requested = 'student', adminOnly = false, detail }) {
  const { logout } = useAuth();
  const { user, role, workspace } = useWorkspace();
  const { t } = useI18n();

  const account = user?.full_name || user?.email || '—';
  const roleKey = String(user?.role || role || '').toLowerCase();
  const accountRole = ROLE_LABELS[roleKey] ? t(`roles.${roleKey}`) : t(`roles.${role}`);

  return (
    <div className="flex min-h-dvh flex-col bg-canvas px-5 py-8 sm:px-8 sm:py-12">
      <header className="text-center">
        <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-navy">{t('common.appSuite')}</p>
        <p className="mt-1 text-[15px] font-medium text-mutedink">{t('common.appName')}</p>
      </header>

      <main className="flex flex-1 items-center justify-center py-8 sm:py-10">
        <div className="soft-shadow w-full max-w-[460px] rounded-2xl border border-line bg-white px-6 py-8 text-center sm:px-9 sm:py-10">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FBECEC]">
            <ShieldAlert className="h-6 w-6 text-critical" strokeWidth={1.7} aria-hidden="true" />
          </span>

          <h1 className="mt-5 text-[24px] font-bold leading-tight tracking-[-0.02em] text-ink">{t('access.title')}</h1>

          <p className="mt-3 text-[15px] leading-[1.6] text-mutedink">
            {t('access.body', {
              workspace: t(WORKSPACE_KEYS[String(requested).toLowerCase()] || 'welcome.student'),
            })}
          </p>

          {(detail || adminOnly) && (
            <p className="mt-2 text-[13px] leading-[1.6] text-mutedink">
              {adminOnly ? t('access.adminOnly') : detail}
            </p>
          )}

          <dl className="mt-6 space-y-2.5 rounded-xl border border-line bg-canvas px-4 py-3.5 text-start">
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-[13px] uppercase tracking-[0.1em] text-mutedink">{t('access.signedInAs')}</dt>
              <dd className="truncate text-[15px] font-semibold text-ink">{account}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-[13px] uppercase tracking-[0.1em] text-mutedink">{t('access.role')}</dt>
              <dd className="text-[15px] font-semibold text-ink">{accountRole}</dd>
            </div>
          </dl>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link to={workspace.home} className="btn-primary w-full sm:w-auto">
              {t('access.goToWorkspace')}
            </Link>
            <button type="button" onClick={() => logout(true)} className="btn-quiet w-full sm:w-auto">
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" /> {t('access.signOut')}
            </button>
          </div>
        </div>
      </main>

      <footer className="text-center">
        <p className="mx-auto max-w-[460px] text-[13px] leading-[1.6] text-mutedink">{t('access.footer')}</p>
      </footer>
    </div>
  );
}