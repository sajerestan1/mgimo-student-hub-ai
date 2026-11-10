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
import { useI18n } from '@/i18n/I18nProvider';

// A zero-course result is never reported as a generic empty page: each cause
// has its own message so the reader knows whether to enrol, ask the office, or
// report a failure. Each reason maps to a translation key pair.
const EMPTY_REASON_KEY = {
  no_user: 'noUser',
  no_profile: 'noProfile',
  no_enrollments: 'noEnrollments',
  no_published_courses: 'noPublished',
  error: 'error',
};

export default function CoursesPage() {
  const { user } = useAuth();
  const { t, language } = useI18n();
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
    return <div className="card-surface p-6 text-[12.5px] text-mutedink">{t('student.courses.loading')}</div>;
  }

  const credits = data.courses.reduce((total, course) => total + (course.credits || 0), 0);
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = data.assignments.filter((assignment) => assignment.due_date >= today);
  const reasonKey = EMPTY_REASON_KEY[data.reason];

  return (
    <div>
      <PageTitle
        eyebrow={t('student.courses.eyebrow')}
        title={t('student.courses.title')}
        description={t('student.courses.description')}
        meta={[
          t('student.courses.metaCourses', { count: data.courses.length }),
          t('student.courses.metaCredits', { count: credits }),
          t('student.courses.metaModules', { count: data.modules.length }),
          t('student.courses.semester'),
        ]}
        actions={
          <Link to={P.student.timetable} className="btn-quiet">
            {t('student.courses.openTimetable')}
          </Link>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        {[
          [t('student.courses.stats.resources'), data.resources.length, t('student.courses.stats.resourcesNote')],
          [t('student.courses.stats.assessed'), data.assignments.length, t('student.courses.stats.assessedNote')],
          [t('student.courses.stats.upcoming'), upcoming.length, t('student.courses.stats.upcomingNote')],
        ].map(([label, value, note]) => (
          <div key={label} className="card-surface px-4 py-3">
            <p className="text-[10.5px] text-mutedink">{label}</p>
            <p className="mt-1 text-[19px] font-semibold leading-none tabular-nums text-ink">{value}</p>
            <p className="mt-1 text-[10.5px] text-mutedink">{note}</p>
          </div>
        ))}
      </div>

      {!data.courses.length && (
        <Surface
          title={
            reasonKey
              ? t(`student.courses.empty.${reasonKey}Title`)
              : t('student.courses.empty.title')
          }
        >
          <p className="text-[12px] leading-relaxed text-mutedink">
            {reasonKey ? t(`student.courses.empty.${reasonKey}Body`) : t('student.courses.empty.body')}
          </p>
          {data.reason === 'error' && (
            <p className="mt-2 break-words text-[11px] text-mutedink">
              {String(data.error?.message || data.error || t('student.courses.empty.unknown'))}
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
                  <p className="mt-1 text-[11.5px] text-mutedink">
                    {professor?.full_name || t('student.courses.card.instructor')}
                  </p>
                </div>
                <span className="shrink-0 rounded-lg bg-brand/10 px-2 py-1 text-[10.5px] font-semibold text-brand">
                  {t('student.courses.card.credits', { count: course.credits })}
                </span>
              </div>

              <p className="mt-3 line-clamp-3 text-[11.5px] leading-relaxed text-mutedink">{course.description}</p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                <StatusChip tone="neutral">
                  <Layers className="h-3 w-3" /> {t('student.courses.card.modules', { count: moduleCount })}
                </StatusChip>
                <StatusChip tone="neutral">
                  <BookOpen className="h-3 w-3" /> {t('student.courses.card.resources', { count: resourceCount })}
                </StatusChip>
                {nextDue && (
                  <StatusChip tone="warning">
                    <CalendarClock className="h-3 w-3" />{' '}
                    {t('student.courses.card.due', { date: shortDate(nextDue.due_date, undefined, language) })}
                  </StatusChip>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                <p className="text-[11px] text-mutedink">{course.semester}</p>
                <Link to={`${P.student.courses}/${course.id}`} className="link-quiet">
                  {t('student.courses.card.open')} <ArrowRight className="dir-icon h-3 w-3" />
                </Link>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}