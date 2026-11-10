import AccessDenied from '@/pages/AccessDenied';
import { useWorkspace } from '@/lib/workspaceRole';

const LABELS = { student: 'Student', professor: 'Professor', dean: 'Administration' };

/**
 * Second-line authorisation for a workspace page. The WorkspaceGuard above the
 * shell already refuses a wrong-workspace request on the standalone page; this
 * keeps the same rule at the page itself.
 */
export default function RoleRoute({ role, children }) {
  const { canView } = useWorkspace();

  if (!canView(role)) return <AccessDenied requested={LABELS[role] || 'requested'} />;
  return children;
}