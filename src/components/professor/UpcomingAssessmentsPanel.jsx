import { Link } from 'react-router-dom';
import Surface from '@/components/shell/Surface';
import StatusChip from '@/components/shell/StatusChip';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';
import { dateLabel } from '@/lib/professorData';

export default function UpcomingAssessmentsPanel({ rows }) {
  return (
    <Surface
      title="Upcoming assessments"
      subtitle="Published work with a deadline ahead"
      action={
        <Link to={P.professor.assignments} className="link-quiet">
          All assignments
        </Link>
      }
      bodyClassName="px-0 pb-0 pt-1"
    >
      {rows.length === 0 && <p className="px-5 py-6 text-[11.5px] text-mutedink">No published assessments are due in the coming weeks.</p>}
      <ul className="divide-y divide-line">
        {rows.map((row) => (
          <li key={row.id} className="px-5 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-[12px] font-medium text-ink">{row.title}</p>
                <p className="mt-0.5 text-[10.5px] text-mutedink">
                  {row.course_code} · {row.assessment_type.replace('_', ' ')} · due {dateLabel(row.due_date)} · {row.enrolled} enrolled
                </p>
              </div>
              <StatusChip tone={row.graded > 0 ? 'brand' : 'warning'}>
                {row.graded > 0 ? `${row.graded}/${row.submitted} graded` : 'No submissions'}
              </StatusChip>
            </div>
          </li>
        ))}
      </ul>
    </Surface>
  );
}