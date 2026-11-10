import { Bot, Globe, Layers } from 'lucide-react';
import StatusChip from '@/components/shell/StatusChip';

function Card({ icon: Icon, title, description, status }) {
  return (
    <div className="rounded-xl border border-line bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[14px] font-semibold text-ink">
            <Icon className="h-4 w-4 text-brand" strokeWidth={1.9} />
            {title}
          </p>
          <p className="mt-1 text-[12.5px] leading-[1.55] text-mutedink">{description}</p>
        </div>
      </div>
      <div className="mt-2.5">{status}</div>
    </div>
  );
}

/**
 * The three measurements this workspace reports. Each card states whether the
 * underlying engine is actually available, so nothing looks available that is not.
 */
export default function AnalysisCards({ engines }) {
  const list = Array.isArray(engines) ? engines : [];
  const external = list.find((row) => row.id === 'plagiarism');
  const detector = list.find((row) => row.id === 'ai_detection');

  return (
    <div className="mb-4 grid gap-3 md:grid-cols-3">
      <Card
        icon={Globe}
        title="A · External similarity"
        description="Internet, publisher and repository search performed by a licensed provider, with its own score and sources."
        status={
          external?.configured ? (
            <StatusChip tone="positive">Available · {external.selectedProvider.label}</StatusChip>
          ) : (
            <StatusChip tone="warning">Unavailable — awaiting credentials</StatusChip>
          )
        }
      />
      <Card
        icon={Layers}
        title="B · Internal similarity"
        description="Supplementary comparison against submissions already analysed in this workspace. Never an internet search."
        status={<StatusChip tone="brand">Always on</StatusChip>}
      />
      <Card
        icon={Bot}
        title="C · AI-writing detection"
        description="A dedicated AI-text detector returning its own classification and probability, with false-positive limits stated."
        status={
          detector?.configured ? (
            <StatusChip tone="positive">Available · {detector.selectedProvider.label}</StatusChip>
          ) : (
            <StatusChip tone="warning">Unavailable — awaiting credentials</StatusChip>
          )
        }
      />
    </div>
  );
}