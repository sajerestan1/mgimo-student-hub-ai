import { Link } from 'react-router-dom';
import { LogOut, ShieldCheck, UserRound, Building2, Mail } from 'lucide-react';
import PageTitle from '@/components/shell/PageTitle';
import Surface from '@/components/shell/Surface';
import { useAuth } from '@/lib/AuthContext';
import { useWorkspace, WORKSPACES } from '@/lib/workspaceRole';

export default function Profile() {
  const { logout } = useAuth();
  const { user, role, displayName, workspace } = useWorkspace();

  return (
    <div className="mx-auto max-w-4xl">
      <PageTitle
        eyebrow="Account"
        title="Profile"
        description="Your account, assigned role and the workspace that role unlocks."
        actions={
          <button
            type="button"
            onClick={() => logout()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E1E7F2] bg-white px-3 py-2 text-[11.5px] font-medium text-ink hover:bg-[#F6F8FC]"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        }
      />

      <div className="grid gap-2.5 lg:grid-cols-[1.2fr_1fr]">
        <Surface title="Identity">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-[15px] font-semibold text-brand">
              {displayName.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold tracking-tight text-ink">{displayName}</p>
              <p className="truncate text-[11.5px] text-mutedink">{user?.email || 'No email on this account'}</p>
            </div>
          </div>

          <dl className="mt-4 space-y-2 text-[12px]">
            <div className="flex items-center justify-between border-b border-[#F3F5FA] pb-2">
              <dt className="flex items-center gap-1.5 text-mutedink"><UserRound className="h-3.5 w-3.5" /> Assigned role</dt>
              <dd className="font-medium text-ink">{workspace.label}</dd>
            </div>
            <div className="flex items-center justify-between border-b border-[#F3F5FA] pb-2">
              <dt className="flex items-center gap-1.5 text-mutedink"><Building2 className="h-3.5 w-3.5" /> Workspace</dt>
              <dd className="font-medium text-ink">{workspace.title}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="flex items-center gap-1.5 text-mutedink"><Mail className="h-3.5 w-3.5" /> Sign-in method</dt>
              <dd className="font-medium text-ink">Email & password</dd>
            </div>
          </dl>

          <p className="mt-4 flex items-start gap-2 rounded-lg bg-[#F6F8FC] px-2.5 py-2 text-[10.5px] leading-relaxed text-mutedink">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Roles are assigned by the university administration. They cannot be changed from the interface, so no account
            can grant itself administrative access.
          </p>
        </Surface>

        <Surface title="Workspaces in this prototype" subtitle="Fictional demonstration data">
          <ul className="space-y-2">
            {Object.values(WORKSPACES).map((item) => (
              <li
                key={item.role}
                className={`rounded-xl border px-3 py-2 ${
                  item.role === role ? 'border-brand/30 bg-[#F7F9FF]' : 'border-[#EDF0F6]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-[12px] font-medium text-ink">{item.title}</p>
                  {item.role === role && (
                    <span className="rounded-full bg-brand/10 px-1.5 py-0.5 text-[9.5px] font-medium text-brand">Yours</span>
                  )}
                </div>
                <Link
                  to={item.home}
                  className="mt-1 inline-flex items-center text-[10.5px] font-medium text-brand hover:underline"
                >
                  Open {item.label.toLowerCase()} workspace
                </Link>
              </li>
            ))}
          </ul>
        </Surface>
      </div>
    </div>
  );
}