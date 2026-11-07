import { Navigate } from 'react-router-dom';
import { useWorkspace } from '@/lib/workspaceRole';

/**
 * Route-level authorisation. A user whose role does not own the route is sent
 * to their own dashboard instead of seeing another workspace's data.
 */
export default function RoleRoute({ role, children }) {
  const { role: currentRole, workspace } = useWorkspace();

  if (currentRole !== role) return <Navigate to={workspace.home} replace />;
  return children;
}