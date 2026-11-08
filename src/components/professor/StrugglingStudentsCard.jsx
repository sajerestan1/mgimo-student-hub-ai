import { Link } from 'react-router-dom';
import { ArrowDownRight } from 'lucide-react';
import Surface from '@/components/shell/Surface';
import StatusChip from '@/components/shell/StatusChip';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';

export default function StrugglingStudentsCard({ rows }) {
  return (
    <Surface
      title="Early warning"
      subtitle="Students whose recent marks are falling or sit below the 60% line"
      action={<StatusChip tone={rows.length ? 'critical' : 'positive'}>{rows.length} flagged</StatusChip>}
      bodyClassName="px-0 pb-0 pt-1"
      footer={
        <Link to={P.professor.students} className="link-quiet">
          Open student performance →
        </Link>
      }
    >
      <ul className="divide-y divide-line">
        {rows.slice(0, 6).map((row) => (
          <li key={row.key} className="flex items-center justify-between gap-3 px-5 py-2.5">
            <div className="min-w-0">
              <p className="truncate text-[12px] font-medium text-ink">{row.name}</p>
              <p className="truncate text-[10.5px] text-mutedink">
                {row.course || 'No course'} · {row.group || 'No group'} · {row.graded} graded
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              {row.delta !== null && (
                <span
                  className={`inline-flex items-center gap-0.5 text-[11px] font-semibold tabular-nums ${
                    row.delta < 0 ? 'text-critical' : 'text-positive'
                  }`}
                >
                  <ArrowDownRight className={`h-3 w-3 ${row.delta >= 0 ? 'rotate-180' : ''}`} />
                  {row.delta > 0 ? '+' : ''}
                  {row.delta}
                </span>
              )}
              <StatusChip tone={row.severity === 'critical' ? 'critical' : 'warning'}>{row.latest}%</StatusChip>
            </div>
          </li>
        ))}
        {!rows.length && (
          <li className="px-5 py-6 text-[11.5px] text-mutedink">
            No students are trending down or below the passing line right now.
          </li>
        )}
      </ul>
    </Surface>
  );
}