import { useLocation, Link } from 'react-router-dom';
import { Check, Layers, ArrowLeft } from 'lucide-react';
import { ROADMAP } from '@/lib/roadmap';
import PageTitle from '@/components/shell/PageTitle';
import { useWorkspace } from '@/lib/workspaceRole';

export default function ComingSoon() {
  const { pathname } = useLocation();
  const { workspace } = useWorkspace();
  const section = ROADMAP[pathname] || {
    title: 'This section',
    summary: 'This area is part of the platform architecture and is scheduled for the next development stage.',
    bullets: ['Interface and navigation are already in place', 'Data model and permissions are being prepared'],
  };

  return (
    <div>
      <PageTitle
        eyebrow="Stage 2 · In design"
        title={section.title}
        description={section.summary}
        actions={
          <Link
            to={workspace.home}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E6EAF2] bg-white px-3 py-2 text-[11.5px] font-medium text-ink hover:bg-[#F6F8FC]"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to my workspace
          </Link>
        }
      />

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="card-surface p-5 lg:col-span-2">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <Layers className="h-4 w-4" />
            </span>
            <p className="text-[13px] font-semibold text-ink">What this section will provide</p>
          </div>
          <ul className="mt-3 space-y-2">
            {section.bullets.map((item) => (
              <li key={item} className="flex items-start gap-2 text-[12.5px] leading-relaxed text-ink/80">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-positive" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="card-surface p-5">
          <p className="text-[13px] font-semibold text-ink">Development status</p>
          <p className="mt-1.5 text-[12px] leading-relaxed text-mutedink">
            Stage 1 delivers the application shell, role-aware navigation and the three workspace dashboards. This section
            is deliberately not implemented, so nothing here pretends to be functional.
          </p>
          <div className="mt-3 space-y-1.5 text-[11.5px]">
            <div className="flex items-center justify-between rounded-lg bg-[#F6F8FC] px-2.5 py-1.5">
              <span className="text-mutedink">Navigation</span>
              <span className="font-medium text-positive">Live</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-[#F6F8FC] px-2.5 py-1.5">
              <span className="text-mutedink">Data model</span>
              <span className="font-medium text-warning">Prepared</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-[#F6F8FC] px-2.5 py-1.5">
              <span className="text-mutedink">{section.title} module</span>
              <span className="font-medium text-mutedink">Stage 2</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}