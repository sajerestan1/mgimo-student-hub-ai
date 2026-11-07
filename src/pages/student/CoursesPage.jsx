import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import PageTitle from '@/components/shell/PageTitle';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';
import {
  COURSES,
  STUDENT,
  courseAverage,
  courseAttendance,
  courseSessions,
  letterFor,
  weekdayName,
} from '@/lib/studentWorkspace';
import CourseMaterialsPanel from '@/components/student/CourseMaterialsPanel';

export default function CoursesPage() {
  const credits = COURSES.reduce((total, course) => total + course.credits, 0);

  return (
    <div>
      <PageTitle
        eyebrow="Student workspace"
        title="My courses"
        description="Every course you are enrolled in this semester, with the lecturer, your current average and attendance."
        meta={[STUDENT.semester, `${credits} credits`, `${COURSES.length} courses`, 'Week 10 of 16']}
        actions={
          <Link to={P.student.timetable} className="btn-quiet">
            Open timetable
          </Link>
        }
      />

      <CourseMaterialsPanel />

      <div className="grid gap-4 md:grid-cols-2">
        {COURSES.map((course) => {
          const average = courseAverage(course.id);
          const attendance = courseAttendance(course.id);
          const next = courseSessions(course.id)[0];
          return (
            <section key={course.id} className="card-surface flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-mutedink">
                    {course.code} · {course.type}
                  </p>
                  <h2 className="mt-1 text-[15px] font-semibold leading-tight tracking-[-0.01em] text-ink">
                    {course.title}
                  </h2>
                  <p className="mt-1 text-[11.5px] text-mutedink">{course.lecturer}</p>
                </div>
                <span className="shrink-0 rounded-lg bg-royal/10 px-2 py-1 text-[10.5px] font-semibold text-royal">
                  {course.credits} cr
                </span>
              </div>

              <p className="mt-3 text-[11.5px] leading-relaxed text-mutedink">{course.summary}</p>

              <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-3">
                <div>
                  <dt className="text-[10.5px] text-mutedink">Current average</dt>
                  <dd className="mt-0.5 text-[15px] font-semibold tabular-nums text-ink">
                    {average.toFixed(1)}
                    <span className="ml-1 text-[10.5px] font-medium text-mutedink">{letterFor(average)}</span>
                  </dd>
                </div>
                <div>
                  <dt className="text-[10.5px] text-mutedink">Attendance</dt>
                  <dd
                    className={`mt-0.5 text-[15px] font-semibold tabular-nums ${
                      attendance >= 85 ? 'text-positive' : 'text-warning'
                    }`}
                  >
                    {attendance}%
                  </dd>
                </div>
              </dl>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
                <p className="text-[11px] text-mutedink">
                  {next
                    ? `Next: ${weekdayName(next.weekday)} ${next.start} · ${next.room}`
                    : 'No sessions scheduled'}
                </p>
                <Link to={P.student.grades} className="link-quiet">
                  Course record <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}