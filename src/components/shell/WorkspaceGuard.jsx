import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useWorkspace } from '@/lib/workspaceRole';

export default function WorkspaceGuard({ allow, children }) {
  const { canView, workspace } = useWorkspace();

  if (canView(allow)) return children;

  return (
    <div className="mx-auto max-w-xl">
      <div className="card-surface p-6 text-center">
        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-critical/10 text-critical">
          <ShieldAlert className="h-5 w-5" />
        </span>
        <h1 className="mt-3 text-[17px] font-semibold text-ink">This workspace is outside your role</h1>
        <p className="mx-auto mt-1.5 max-w-md text-[12.5px] leading-relaxed text-mutedink">
          Your account is assigned the {workspace.label.toLowerCase()} role, so administrative and teaching surfaces stay
          hidden. Role assignment is managed by the university, not chosen in the interface.
        </p>
        <Link
          to={workspace.home}
          className="mt-4 inline-flex items-center rounded-lg bg-navy px-3.5 py-2 text-[12px] font-medium text-white hover:bg-navy-mid"
        >
          Go to my workspace
        </Link>
      </div>
    </div>
  );
}