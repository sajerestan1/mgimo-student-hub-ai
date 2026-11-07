import { Link } from 'react-router-dom';
import Surface from '@/components/shell/Surface';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';
import { recentGrades, courseById, letterFor, formatDate } from '@/lib/studentWorkspace';

const scoreTone = (score) => (score >= 85 ? 'text-positive' : score >= 70 ? 'text-ink' : 'text-warning');

export default function RecentGradesCard() {
  return (
    <Surface
      title="Recent grades"
      subtitle="Latest assessed work"
      action={
        <Link to={P.student.grades} className="link-quiet">
          All grades
        </Link>
      }
      bodyClassName="px-5 pb-5 pt-1"
    >
      <ul className="divide-y divide-line">
        {recentGrades.map((grade) => {
          const course = courseById(grade.courseId);
          return (
            <li key={grade.id} className="flex items-start justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate text-[12.5px] font-medium text-ink">{grade.title}</p>
                <p className="mt-0.5 truncate text-[11px] text-mutedink">
                  {course?.code} · {grade.type} · {formatDate(grade.date)}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className={`text-[14px] font-semibold tabular-nums ${scoreTone(grade.score)}`}>
                  {grade.score}
                  <span className="text-[10.5px] font-medium text-mutedink">/100</span>
                </p>
                <p className="text-[10.5px] font-medium text-mutedink">{letterFor(grade.score)}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </Surface>
  );
}