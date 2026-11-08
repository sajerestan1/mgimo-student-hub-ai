import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, CalendarClock, Layers } from 'lucide-react';
import PageTitle from '@/components/shell/PageTitle';
import Surface from '@/components/shell/Surface';
import StatusChip from '@/components/shell/StatusChip';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { loadStudentCourses, shortDate } from '@/lib/studentCourses';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';

// A zero-course result is never reported as a generic empty page: each cause
// has its own message so the reader knows whether to enrol, ask the office, or
// report a failure.
const EMPTY_STATES = {
  no_user: ['Session not resolved', 'Your account could not be resolved. Reload the page or sign in again.'],
  no_profile: ['No student profile linked', 'This account has no student record. The student office links accounts to academic profiles.'],
  no_enrollments: ['No enrolments recorded', 'Your student record has no course enrolments yet. Contact the student office to be enrolled in this semester.'],
  no_published_courses: ['Courses not published yet', 'Your enrolled courses are still unpublished, so their workspaces are closed.'],
  error: ['Courses could not be loaded', 'The course query failed. The technical reason is written to the browser console.'],
};

export default function CoursesPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const context = await loadStudentCourses(user?.id);
        const courses = (context.courses || []).filter((course) => course.status === 'published');
        const ids = courses.map((course) => course.id);

        if (!ids.length) {
          if (active) {
            setData({
              student: context.student,
              courses: [],
              modules: [],
              resources: [],
              assignments: [],
              professors: [],
              reason: context.reason || 'no_enrollments',
              error: context.error,
            });
          }
          return;
        }

        const [modules, resources, assignments, professors] = await Promise.all([
          base44.entities.CourseModule.filter({ course_id: { $in: ids } }, { limit: 400 }),
          base44.entities.LearningResource.filter({ course_id: { $in: ids }, visible_to_students: true }, { limit: 600 }),
          base44.entities.Assignment.filter({ course_id: { $in: ids } }, { sort: 'due_date', limit: 200 }),
          base44.entities.Professor.list('-created_date', 100),
        ]);

        if (!active) return;
        setData({
          student: context.student,
          courses,
          modules: modules.items || [],
          resources: resources.items || [],
          assignments: assignments.items || [],
          professors: professors || [],
          reason: 'ok',
        });
      } catch (error) {
        console.error('[student courses] course query failed', error);
        if (active) {
          setData({
            student: null,
            courses: [],
            modules: [],
            resources: [],
            assignments: [],
            professors: [],
            reason: 'error',
            error,
          });
        }
      }
    })();
    return () => { active = false; };
  }, [user?.id]);

  if (!data) {
    return <div className="card-surface p-6 text-[12.5px] text-mutedink">Loading your courses…</div>;
  }

  const credits = data.courses.reduce((total, course) => total + (course.credits || 0), 0);
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = data.assignments.filter((assignment) => assignment.due_date >= today);

  return (
    <div>
      <PageTitle
        eyebrow="Student workspace"
        title="My courses"
        description="Every course you are enrolled in, with its modules, learning resources and assessment structure. Open a course to read, submit work, take quizzes and follow your gradebook."
        meta={[`${data.courses.length} courses`, `${credits} credits`, `${data.modules.length} modules`, 'Fall Semester 2026']}
        actions={
          <Link to={P.student.timetable} className="btn-quiet">
            Open timetable
          </Link>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        {[
          ['Published resources', data.resources.length, 'across all modules'],
          ['Assessed items', data.assignments.length, 'assignments and presentations'],
          ['Upcoming deadlines', upcoming.length, 'still open'],
        ].map(([label, value, note]) => (
          <div key={label} className="card-surface px-4 py-3">
            <p className="text-[10.5px] text-mutedink">{label}</p>
            <p className="mt-1 text-[19px] font-semibold leading-none tabular-nums text-ink">{value}</p>
            <p className="mt-1 text-[10.5px] text-mutedink">{note}</p>
          </div>
        ))}
      </div>

      {!data.courses.length && (
        <Surface title={EMPTY_STATES[data.reason]?.[0] || 'No courses yet'}>
          <p className="text-[12px] leading-relaxed text-mutedink">
            {EMPTY_STATES[data.reason]?.[1] || 'You are not enrolled in a published course. Contact the student office if this looks wrong.'}
          </p>
          {data.reason === 'error' && (
            <p className="mt-2 break-words text-[11px] text-mutedink">
              {String(data.error?.message || data.error || 'Unknown error')}
            </p>
          )}
        </Surface>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {data.courses.map((course) => {
          const moduleCount = data.modules.filter((module) => module.course_id === course.id).length;
          const resourceCount = data.resources.filter((resource) => resource.course_id === course.id).length;
          const professor = data.professors.find((item) => item.id === course.professor_id);
          const nextDue = data.assignments
            .filter((assignment) => assignment.course_id === course.id && assignment.due_date >= today)
            .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))[0];

          return (
            <section key={course.id} className="card-surface flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-mutedink">
                    {course.code} · {course.level || 'intermediate'}
                  </p>
                  <h2 className="mt-1 text-[20px] font-semibold leading-tight tracking-[-0.01em] text-ink">{course.title}</h2>
                  <p className="mt-1 text-[11.5px] text-mutedink">{professor?.full_name || 'Course instructor'}</p>
                </div>
                <span className="shrink-0 rounded-lg bg-brand/10 px-2 py-1 text-[10.5px] font-semibold text-brand">
                  {course.credits} cr
                </span>
              </div>

              <p className="mt-3 line-clamp-3 text-[11.5px] leading-relaxed text-mutedink">{course.description}</p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                <StatusChip tone="neutral">
                  <Layers className="h-3 w-3" /> {moduleCount} modules
                </StatusChip>
                <StatusChip tone="neutral">
                  <BookOpen className="h-3 w-3" /> {resourceCount} resources
                </StatusChip>
                {nextDue && (
                  <StatusChip tone="warning">
                    <CalendarClock className="h-3 w-3" /> due {shortDate(nextDue.due_date)}
                  </StatusChip>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                <p className="text-[11px] text-mutedink">{course.semester}</p>
                <Link to={`${P.student.courses}/${course.id}`} className="link-quiet">
                  Open course <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}