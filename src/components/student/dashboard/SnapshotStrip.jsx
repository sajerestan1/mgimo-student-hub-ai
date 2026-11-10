import { Link } from 'react-router-dom';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';
import { useI18n } from '@/i18n/I18nProvider';

/**
 * Four compact figures from the student's own record. A metric with no
 * recorded data says so rather than showing a placeholder number.
 */
export default function SnapshotStrip({ summary }) {
  const { t } = useI18n();
  const unavailable = t('student.dashboard.hints.notRecorded');

  const items = [
    {
      label: t('student.dashboard.metrics.semesterAverage'),
      value: summary.average === null ? '—' : summary.average.toFixed(1),
      hint:
        summary.average === null
          ? unavailable
          : t('student.dashboard.hints.weighted', { letter: summary.averageLetter }),
      to: P.student.grades,
    },
    {
      label: t('student.dashboard.metrics.attendance'),
      value: summary.attendanceRate === null ? '—' : `${summary.attendanceRate}%`,
      hint: summary.attendanceRate === null ? unavailable : t('student.dashboard.hints.ofSessions'),
      to: P.student.attendance,
    },
    {
      label: t('student.dashboard.metrics.pendingWork'),
      value: String(summary.pending + summary.overdue),
      hint:
        summary.pending + summary.overdue === 0
          ? t('student.dashboard.hints.nothingOpen')
          : t('student.dashboard.hints.overdueTodo', { overdue: summary.overdue, pending: summary.pending }),
      to: P.student.assignments,
    },
    {
      label: t('student.dashboard.metrics.activeCourses'),
      value: String(summary.courseCount),
      hint: summary.courseCount
        ? t('student.dashboard.hints.credits', { count: summary.credits })
        : t('student.dashboard.hints.noEnrolment'),
      to: P.student.courses,
    },
  ];

  return (
    <section className="card-surface mb-4 overflow-hidden">
      <div className="grid grid-cols-2 gap-px bg-line lg:grid-cols-4">
        {items.map((item) => (
          <Link key={item.label} to={item.to} className="bg-white px-4 py-4 transition-colors hover:bg-canvas">
            <p className="text-[13px] font-medium text-mutedink">{item.label}</p>
            <p className="mt-1.5 text-[26px] font-semibold leading-none tracking-[-0.02em] tabular-nums text-ink sm:text-[28px]">
              {item.value}
            </p>
            <p className="mt-1.5 text-[13px] text-mutedink">{item.hint}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}