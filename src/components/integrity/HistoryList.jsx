import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import StatusChip from '@/components/shell/StatusChip';
import { formatAnalysisStamp } from '@/lib/integrity/report';

const AI_TONES = { completed: 'positive', failed: 'critical', skipped: 'neutral' };

export default function HistoryList({ items, onOpen, busy, activeId, error }) {
  if (error) return <p className="text-[13.5px] text-critical">{error}</p>;

  if (!items || !items.length) {
    return (
      <p className="text-[13.5px] leading-[1.6] text-mutedink">
        No analyses yet. Each submission you analyse is stored here for your account only, and becomes part of the
        comparison set for the submissions you analyse next.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-line">
      {items.map((item) => (
        <li key={item.id}>
          <button
            type="button"
            onClick={() => onOpen(item.id)}
            disabled={busy}
            className={cn(
              'flex w-full items-start gap-3 py-2.5 text-start transition-colors hover:bg-canvas disabled:opacity-60',
              item.id === activeId && 'bg-canvas',
            )}
          >
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[14px] font-medium text-ink">{item.title}</span>
              <span className="mt-0.5 block truncate text-[12.5px] text-mutedink">
                {[
                  item.student_reference,
                  `${Number(item.word_count || 0).toLocaleString()} words`,
                  `${Number(item.similarity_percent || 0).toFixed(1)}% similarity`,
                  formatAnalysisStamp(item.analyzed_at),
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-2">
              <StatusChip tone={AI_TONES[item.ai_status] || 'neutral'}>
                {item.ai_status === 'completed' ? 'Screened' : item.ai_status === 'failed' ? 'Screening failed' : 'Similarity only'}
              </StatusChip>
              <ChevronRight className="dir-icon h-4 w-4 text-mutedink" strokeWidth={1.9} />
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}