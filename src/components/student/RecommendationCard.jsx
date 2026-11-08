import { BookOpen, Check, ExternalLink, Play } from 'lucide-react';
import StatusChip from '@/components/shell/StatusChip';

const KIND = {
  material: { label: 'Course material', tone: 'brand' },
  remedial_task: { label: 'Remedial task', tone: 'warning' },
  practice: { label: 'Practice', tone: 'neutral' },
  support: { label: 'Support', tone: 'positive' },
};

const PRIORITY = { high: 'critical', medium: 'warning', low: 'neutral' };
const STATUS_COPY = { suggested: 'Not started', in_progress: 'In progress', done: 'Completed' };

export default function RecommendationCard({ item, hasFile, onStatus, onOpenMaterial, busy }) {
  const kind = KIND[item.kind] || KIND.remedial_task;
  const done = item.status === 'done';

  return (
    <article className={`border-b border-line px-5 py-4 last:border-b-0 ${done ? 'opacity-60' : ''}`}>
      <div className="flex flex-wrap items-center gap-1.5">
        <StatusChip tone={kind.tone}>{kind.label}</StatusChip>
        <StatusChip tone={PRIORITY[item.priority] || 'neutral'}>{item.priority} priority</StatusChip>
        <span className="text-[10.5px] font-medium uppercase tracking-[0.06em] text-mutedink">
          {item.course_code}
        </span>
      </div>

      <h3 className={`mt-2 text-[12.5px] font-semibold leading-snug text-ink ${done ? 'line-through' : ''}`}>
        {item.title}
      </h3>
      <p className="mt-1 text-[11.5px] leading-relaxed text-mutedink">{item.why}</p>

      <div className="mt-2.5 rounded-lg border border-line bg-canvas/70 px-3 py-2">
        <p className="text-[9.5px] font-semibold uppercase tracking-[0.1em] text-mutedink">Do next</p>
        <p className="mt-0.5 text-[11.5px] leading-relaxed text-ink/85">{item.action}</p>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          {item.material_title && (
            <span className="inline-flex max-w-full items-center gap-1 rounded-md border border-line bg-white px-2 py-0.5 text-[10.5px] text-mutedink">
              <BookOpen className="h-3 w-3 shrink-0" />
              <span className="truncate">{item.material_title}</span>
            </span>
          )}
          {hasFile && (
            <button type="button" onClick={() => onOpenMaterial(item)} className="btn-quiet btn-sm">
              <ExternalLink className="h-3.5 w-3.5" /> Open file
            </button>
          )}
          <span className="text-[10.5px] text-mutedink">{STATUS_COPY[item.status] || 'Not started'}</span>
        </div>

        <div className="flex items-center gap-1.5">
          {item.status === 'suggested' && (
            <button
              type="button"
              onClick={() => onStatus(item, 'in_progress')}
              disabled={busy}
              className="btn-quiet btn-sm disabled:opacity-50"
            >
              <Play className="h-3.5 w-3.5" /> Start
            </button>
          )}
          {!done && (
            <button
              type="button"
              onClick={() => onStatus(item, 'done')}
              disabled={busy}
              className="btn-primary btn-sm disabled:opacity-50"
            >
              <Check className="h-3.5 w-3.5" /> Mark done
            </button>
          )}
        </div>
      </div>
    </article>
  );
}