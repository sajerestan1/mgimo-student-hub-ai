import { Navigate } from 'react-router-dom';
import { useWorkspace } from '@/lib/workspaceRole';

export default function RoleDashboard() {
  const { workspace } = useWorkspace();
  return <Navigate to={workspace.home} replace />;
}