import { Link } from 'react-router-dom';
import Surface from '@/components/shell/Surface';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';
import { letterFor } from '@/lib/lms';

const scoreTone = (score) => (score >= 85 ? 'text-positive' : score >= 70 ? 'text-ink' : 'text-warning');
const dateLabel = (value) =>
  value ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—';

// The student's most recently marked work, from Submission and QuizAttempt records.
export default function RecentGradesCard({ grades }) {
  return (
    <Surface
      title="Recent grades"
      subtitle="Latest marked work"
      action={
        <Link to={P.student.grades} className="link-quiet">
          All grades
        </Link>
      }
      bodyClassName="px-5 pb-5 pt-1"
    >
      {grades.length === 0 ? (
        <p className="py-6 text-[11.5px] text-mutedink">Nothing has been marked yet.</p>
      ) : (
        <ul className="divide-y divide-line">
          {grades.map((grade) => (
            <li key={`${grade.kind}-${grade.id}`} className="flex items-start justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate text-[12.5px] font-medium text-ink">{grade.title}</p>
                <p className="mt-0.5 truncate text-[11px] text-mutedink">
                  {grade.courseCode} · {grade.categoryLabel} · {dateLabel(grade.gradedAt)}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className={`text-[14px] font-semibold tabular-nums ${scoreTone(grade.percent)}`}>
                  {grade.percent}
                  <span className="text-[10.5px] font-medium text-mutedink">%</span>
                </p>
                <p className="text-[10.5px] font-medium text-mutedink">{letterFor(grade.percent)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Surface>
  );
}