import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useWorkspace } from '@/lib/workspaceRole';

export default function WorkspaceGuard({ allow, children }) {
  const { canView, workspace } = useWorkspace();

  if (canView(allow)) return children;

  return (
    <div className="mx-auto max-w-md py-8">
      <div className="card-surface px-6 py-8 text-center">
        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#FBECEC] text-critical">
          <ShieldAlert className="h-5 w-5" />
        </span>
        <h1 className="mt-4 text-[17px] font-semibold tracking-[-0.01em] text-ink">This workspace is outside your role</h1>
        <p className="mx-auto mt-2 max-w-sm text-[12.5px] leading-relaxed text-mutedink">
          Your account is assigned the {workspace.label.toLowerCase()} role, so administrative and teaching surfaces stay
          hidden. Role assignment is managed by the university, not chosen in the interface.
        </p>
        <Link to={workspace.home} className="btn-primary mt-5">
          Go to my workspace
        </Link>
      </div>
    </div>
  );
}