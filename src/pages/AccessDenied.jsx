import { Link } from 'react-router-dom';
import { ShieldAlert, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useWorkspace } from '@/lib/workspaceRole';
import { ROLE_LABELS } from '@/lib/roles';

/**
 * The refusal page. It is a whole screen of its own: it never renders inside a
 * workspace shell, so no sidebar, workspace header, navigation or workspace data
 * is present while a request is denied. Only the signed-in name and role from
 * the authenticated account are shown.
 */
export default function AccessDenied({ requested = 'requested', detail }) {
  const { logout } = useAuth();
  const { user, role, workspace } = useWorkspace();

  const account = user?.full_name || user?.email || 'This account';
  const accountRole = ROLE_LABELS[String(user?.role || '').toLowerCase()] || ROLE_LABELS[role] || role;

  return (
    <div className="flex min-h-dvh flex-col bg-canvas px-5 py-8 sm:px-8 sm:py-12">
      <header className="text-center">
        <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-navy">Digital Dean</p>
        <p className="mt-1 text-[15px] font-medium text-mutedink">Academic Intelligence</p>
      </header>

      <main className="flex flex-1 items-center justify-center py-8 sm:py-10">
        <div className="soft-shadow w-full max-w-[460px] rounded-2xl border border-line bg-white px-6 py-8 text-center sm:px-9 sm:py-10">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FBECEC]">
            <ShieldAlert className="h-6 w-6 text-critical" strokeWidth={1.7} aria-hidden="true" />
          </span>

          <h1 className="mt-5 text-[24px] font-bold leading-tight tracking-[-0.02em] text-ink">Access Denied</h1>

          <p className="mt-3 text-[15px] leading-[1.6] text-mutedink">
            Your account does not have permission to access the {requested} workspace.
          </p>

          {detail && <p className="mt-2 text-[13px] leading-[1.6] text-mutedink">{detail}</p>}

          <dl className="mt-6 space-y-2.5 rounded-xl border border-line bg-canvas px-4 py-3.5 text-left">
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-[13px] uppercase tracking-[0.1em] text-mutedink">Signed in as</dt>
              <dd className="truncate text-[15px] font-semibold text-ink">{account}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-[13px] uppercase tracking-[0.1em] text-mutedink">Role</dt>
              <dd className="text-[15px] font-semibold text-ink">{accountRole}</dd>
            </div>
          </dl>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link to={workspace.home} className="btn-primary w-full sm:w-auto">
              Go to My Workspace
            </Link>
            <button type="button" onClick={() => logout(true)} className="btn-quiet w-full sm:w-auto">
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" /> Sign Out
            </button>
          </div>
        </div>
      </main>

      <footer className="text-center">
        <p className="mx-auto max-w-[460px] text-[13px] leading-[1.6] text-mutedink">
          Workspace access is determined by your authenticated account role.
        </p>
      </footer>
    </div>
  );
}