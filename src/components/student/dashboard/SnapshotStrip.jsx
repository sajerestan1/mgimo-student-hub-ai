import { Link } from 'react-router-dom';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';

const UNAVAILABLE = 'Not yet recorded';

/**
 * Four compact figures from the student's own record. A metric with no
 * recorded data says so rather than showing a placeholder number.
 */
export default function SnapshotStrip({ summary }) {
  const items = [
    {
      label: 'Semester average',
      value: summary.average === null ? '—' : summary.average.toFixed(1),
      hint: summary.average === null ? UNAVAILABLE : `${summary.averageLetter} · credit-weighted`,
      to: P.student.grades,
    },
    {
      label: 'Attendance',
      value: summary.attendanceRate === null ? '—' : `${summary.attendanceRate}%`,
      hint: summary.attendanceRate === null ? UNAVAILABLE : 'of registered sessions',
      to: P.student.attendance,
    },
    {
      label: 'Pending work',
      value: String(summary.pending + summary.overdue),
      hint:
        summary.pending + summary.overdue === 0
          ? 'Nothing open'
          : `${summary.overdue} overdue · ${summary.pending} to do`,
      to: P.student.assignments,
    },
    {
      label: 'Active courses',
      value: String(summary.courseCount),
      hint: summary.courseCount ? `${summary.credits} credits` : 'No enrolment yet',
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