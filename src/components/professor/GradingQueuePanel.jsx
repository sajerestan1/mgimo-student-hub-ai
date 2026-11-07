import { Link } from 'react-router-dom';
import Surface from '@/components/shell/Surface';
import StatusChip from '@/components/shell/StatusChip';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';
import { dateLabel } from '@/lib/professorData';

// One row per assignment that still has submissions without a grade.
export default function GradingQueuePanel({ queue }) {
  return (
    <Surface
      title="Grading queue"
      subtitle={queue.reduce((sum, row) => sum + row.pending, 0) + ' submissions awaiting a grade'}
      action={
        <Link to={P.professor.grading} className="link-quiet">
          Open grading
        </Link>
      }
      bodyClassName="px-0 pb-0 pt-1"
    >
      {queue.length === 0 && (
        <p className="px-5 py-6 text-[11.5px] text-mutedink">Every submission has been graded. Nothing is waiting.</p>
      )}
      <ul className="divide-y divide-line">
        {queue.map((row) => (
          <li key={row.assignment.id} className="row-hover px-5 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-[12.5px] font-semibold text-ink">{row.assignment.title}</p>
                <p className="mt-0.5 text-[11px] text-mutedink">
                  {row.assignment.course_code} · {row.pending} to grade · latest {dateLabel(row.latest)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <StatusChip tone={row.pending > 5 ? 'warning' : 'brand'}>{row.pending} pending</StatusChip>
                <Link to={`${P.professor.grading}?assignment=${row.assignment.id}`} className="btn-quiet btn-sm">
                  Review
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Surface>
  );
}