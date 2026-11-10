import { Navigate, useParams } from 'react-router-dom';
import { useWorkspace, WORKSPACES } from '@/lib/workspaceRole';
import AccessDenied from '@/components/shell/AccessDenied';

// A requested workspace is only a destination. The account's authenticated role
// decides whether it opens; a refusal is shown explicitly, never redirected away.
const REQUESTED = {
  student: 'student',
  professor: 'professor',
  dean: 'dean',
  administration: 'dean',
  admin: 'dean',
};

const LABELS = {
  student: 'Student',
  professor: 'Professor',
  dean: 'Administration',
};

export default function WorkspaceAccess({ workspaceKey }) {
  const { key } = useParams();
  const { canView } = useWorkspace();

  const requested = REQUESTED[String(workspaceKey || key || '').toLowerCase()];

  if (!requested) {
    return <AccessDenied requested="requested" detail="That workspace does not exist." />;
  }

  if (!canView(requested)) {
    return <AccessDenied requested={LABELS[requested]} />;
  }

  return <Navigate to={WORKSPACES[requested].home} replace />;
}