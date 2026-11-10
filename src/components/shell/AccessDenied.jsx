import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useWorkspace } from '@/lib/workspaceRole';
import { ROLE_LABELS } from '@/lib/roles';

/**
 * An explicit refusal. The account's role comes from the authenticated record,
 * so the requested workspace is compared with the real role and refused here
 * rather than silently redirecting the visitor somewhere else.
 */
export default function AccessDenied({ requested = 'requested', detail }) {
  const { logout } = useAuth();
  const { user, role, workspace } = useWorkspace();
  const account = user?.full_name || user?.email || 'This account';
  const accountRole = ROLE_LABELS[String(user?.role || '').toLowerCase()] || ROLE_LABELS[role] || role;

  return (
    <div className="mx-auto flex w-full max-w-[560px] flex-col items-center px-1 py-8 text-center sm:py-14">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FBECEC] text-critical">
        <ShieldAlert className="h-6 w-6" strokeWidth={1.8} aria-hidden="true" />
      </span>

      <h1 className="mt-5 text-[26px] font-bold leading-tight tracking-[-0.02em] text-ink">Access denied</h1>

      <p className="mt-3 text-[16px] leading-[1.6] text-ink">
        Access denied. Your account does not have permission to access the {requested} workspace.
      </p>

      {detail && <p className="mt-2 text-[14px] leading-[1.6] text-mutedink">{detail}</p>}

      <div className="card-surface mt-6 w-full px-4 py-3 text-left">
        <p className="text-[13px] uppercase tracking-[0.12em] text-mutedink">Signed in as</p>
        <p className="mt-1 truncate text-[15px] font-semibold text-ink">{account}</p>
        <p className="mt-0.5 text-[13px] text-mutedink">
          Role on this account: {accountRole}
        </p>
      </div>

      <div className="mt-6 flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
        <Link to={workspace.home} className="btn-primary w-full sm:w-auto">
          Go to my workspace
        </Link>
        <button type="button" onClick={() => logout(true)} className="btn-quiet w-full sm:w-auto">
          Sign out
        </button>
      </div>

      <p className="mt-5 text-[13px] leading-[1.6] text-mutedink">
        Workspace access follows the role on your account record. If you need access to another workspace, ask the
        university administration to review your role.
      </p>
    </div>
  );
}