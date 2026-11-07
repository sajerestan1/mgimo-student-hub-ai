import { useLocation, Link } from 'react-router-dom';
import { ArrowLeft, Check, Layers } from 'lucide-react';
import { ROADMAP } from '@/lib/roadmap';
import PageTitle from '@/components/shell/PageTitle';
import Surface from '@/components/shell/Surface';
import StatusChip from '@/components/shell/StatusChip';
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
    <div className="mx-auto max-w-4xl">
      <PageTitle
        eyebrow="Stage 2 · In design"
        title={section.title}
        description={section.summary}
        actions={
          <Link to={workspace.home} className="btn-quiet">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to my workspace
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
        <Surface>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EDF1FE] text-[#3B5AE0]">
              <Layers className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[13.5px] font-semibold text-ink">What this section will provide</p>
              <p className="mt-0.5 text-[11.5px] text-mutedink">Planned capability, not yet implemented</p>
            </div>
          </div>
          <ul className="mt-4 space-y-2.5">
            {section.bullets.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-[12.5px] leading-relaxed text-ink/80">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-positive" strokeWidth={2.2} />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-4 rounded-lg bg-canvas px-3 py-2.5 text-[11.5px] leading-relaxed text-mutedink">
            Nothing on this page pretends to be functional. Every other module in the navigation opens this description
            until the corresponding stage ships.
          </p>
        </Surface>

        <Surface title="Development status">
          <ul className="space-y-2">
            {[
              ['Navigation', 'Live', 'positive'],
              ['Application shell', 'Live', 'positive'],
              ['Data model', 'Prepared', 'warning'],
              [`${section.title} module`, 'Stage 2', 'neutral'],
            ].map(([label, value, tone]) => (
              <li key={label} className="flex items-center justify-between gap-3 border-b border-line pb-2 text-[12px] last:border-0 last:pb-0">
                <span className="text-mutedink">{label}</span>
                <StatusChip tone={tone}>{value}</StatusChip>
              </li>
            ))}
          </ul>
        </Surface>
      </div>
    </div>
  );
}