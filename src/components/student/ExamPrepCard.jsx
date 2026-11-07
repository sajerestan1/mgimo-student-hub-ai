import { Link } from 'react-router-dom';
import Surface from '@/components/shell/Surface';
import ProgressBar from '@/components/shell/ProgressBar';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';
import { upcomingAssessments, courseById, formatDate, daysUntil } from '@/lib/studentWorkspace';

const prepTone = (value) => (value >= 60 ? 'positive' : value >= 35 ? 'brand' : 'warning');

export default function ExamPrepCard() {
  return (
    <Surface
      title="Upcoming examinations"
      subtitle="Dates, format and preparation status"
      action={
        <Link to={P.student.quizzes} className="link-quiet">
          Quizzes &amp; exams
        </Link>
      }
      bodyClassName="px-5 pb-5 pt-1"
    >
      <ul className="divide-y divide-line">
        {upcomingAssessments.map((assessment) => {
          const course = courseById(assessment.courseId);
          const days = daysUntil(assessment.date);
          return (
            <li key={assessment.id} className="py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[12.5px] font-medium text-ink">{assessment.title}</p>
                  <p className="mt-0.5 truncate text-[11px] text-mutedink">
                    {course.code} · {formatDate(assessment.date)} · {assessment.start} · {assessment.room}
                  </p>
                </div>
                <span className="shrink-0 text-[10.5px] font-medium text-mutedink">
                  {days === 0 ? 'Today' : `in ${days} d`}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <ProgressBar value={assessment.preparation} tone={prepTone(assessment.preparation)} className="h-1" />
                <span className="shrink-0 text-[10px] tabular-nums text-mutedink">{assessment.preparation}% ready</span>
              </div>
            </li>
          );
        })}
      </ul>
    </Surface>
  );
}