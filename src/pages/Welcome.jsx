import { GraduationCap, Presentation, Landmark } from 'lucide-react';
import BrandPanel from '@/components/welcome/BrandPanel';
import RoleCard from '@/components/welcome/RoleCard';
import { useAuth } from '@/lib/AuthContext';

// Each card is a request to enter one workspace. It grants nothing: a signed-in
// request is checked against the role on the authenticated account, and the
// sign-in flow decides the role on the server for a new session.
const WORKSPACES = [
  { key: 'student', label: 'Student', icon: GraduationCap, tone: 'blue' },
  { key: 'professor', label: 'Professor', icon: Presentation, tone: 'red' },
  { key: 'administration', label: 'Administration', icon: Landmark, tone: 'navy' },
];

export default function Welcome() {
  const { user } = useAuth();
  const destination = (key) => (user ? `/workspace/${key}` : `/login?workspace=${key}`);

  return (
    <main className="flex min-h-dvh flex-col items-center bg-welcome-canvas px-4 py-10 sm:px-6 sm:py-16">
      <div className="w-full max-w-[760px]">
        <BrandPanel />

        <div className="mt-10 text-center sm:mt-12">
          <h2 className="text-[28px] font-bold leading-tight tracking-[-0.02em] text-welcome-navy sm:text-[34px]">
            Welcome
          </h2>
          <p className="mt-2 text-[15px] text-welcome-slate">Select your workspace</p>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-4 sm:mt-9 sm:gap-5">
          <RoleCard
            label={WORKSPACES[0].label}
            icon={WORKSPACES[0].icon}
            tone={WORKSPACES[0].tone}
            to={destination(WORKSPACES[0].key)}
          />
          <RoleCard
            label={WORKSPACES[1].label}
            icon={WORKSPACES[1].icon}
            tone={WORKSPACES[1].tone}
            to={destination(WORKSPACES[1].key)}
          />
          <RoleCard
            label={WORKSPACES[2].label}
            icon={WORKSPACES[2].icon}
            tone={WORKSPACES[2].tone}
            to={destination(WORKSPACES[2].key)}
            className="col-span-2"
          />
        </div>

        <p className="mt-10 text-center text-[13px] text-welcome-slate">Secure academic access</p>
      </div>
    </main>
  );
}