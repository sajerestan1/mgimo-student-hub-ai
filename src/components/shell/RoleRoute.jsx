import { useWorkspace } from '@/lib/workspaceRole';
import AccessDenied from './AccessDenied';

const LABELS = { student: 'Student', professor: 'Professor', dean: 'Administration' };

/**
 * Route-level authorisation. The target workspace is compared with the role on
 * the authenticated account: authorised requests render, everything else is
 * refused explicitly instead of being redirected into another workspace.
 */
export default function RoleRoute({ role, children }) {
  const { canView } = useWorkspace();

  if (!canView(role)) return <AccessDenied requested={LABELS[role] || 'requested'} />;
  return children;
}