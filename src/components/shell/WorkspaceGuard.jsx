import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useWorkspace, WORKSPACES } from '@/lib/workspaceRole';
import AccessDenied from '@/pages/AccessDenied';
import PageNotFound from '@/lib/PageNotFound';

// Workspace keys a visitor can ask for. The request is only a destination.
const REQUESTED = {
  student: 'student',
  professor: 'professor',
  dean: 'dean',
  administration: 'dean',
  admin: 'dean',
};

const PREFIXES = [
  ['/student', 'student'],
  ['/professor', 'professor'],
  ['/dean', 'dean'],
];

/**
 * Authorisation for the whole workspace area. It sits above the workspace shell,
 * so a denied request renders the standalone refusal page before any sidebar,
 * header or workspace page is mounted, and nothing protected is ever loaded.
 * The role compared here comes from the authenticated account.
 */
export default function WorkspaceGuard() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const { canView } = useWorkspace();

  const path = pathname.replace(/\/+$/, '') || '/';
  const entryKey = path.startsWith('/workspace/') ? path.slice('/workspace/'.length) : null;
  const isEntry = entryKey !== null || path === '/administration' || path === '/admin';
  const requested = entryKey !== null ? REQUESTED[entryKey.toLowerCase()] : REQUESTED[path.slice(1)];

  // Administration screens keep their own administrator-only rule.
  if (path.startsWith('/admin/')) {
    if (user?.role !== 'admin') {
      return <AccessDenied requested="dean" adminOnly />;
    }
    return <Outlet />;
  }

  // An explicit workspace request: compare it with the account's real role.
  if (isEntry) {
    // An arbitrary workspace value is not a route in this app.
    if (!requested) return <PageNotFound />;
    if (!canView(requested)) return <AccessDenied requested={requested} />;
    return <Navigate to={WORKSPACES[requested].home} replace />;
  }

  // A workspace route reached directly, e.g. /professor/dashboard.
  const prefix = PREFIXES.find(([p]) => path === p || path.startsWith(`${p}/`))?.[1];
  if (prefix && !canView(prefix)) return <AccessDenied requested={prefix} />;

  return <Outlet />;
}