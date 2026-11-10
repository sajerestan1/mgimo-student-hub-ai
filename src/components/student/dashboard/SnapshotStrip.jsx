import { Link } from 'react-router-dom';
import { ArrowUpRight, BookOpen, CalendarCheck, ClipboardList, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';
import { useI18n } from '@/i18n/I18nProvider';

const TONES = {
  brand: 'bg-brand-soft text-brand',
  positive: 'bg-[#E9F5EF] text-[#1D7A50]',
  warning: 'bg-[#FCF3E4] text-[#8E6018]',
  royal: 'bg-royal/10 text-royal',
};

/**
 * Four compact figures from the student's own record. A metric with no
 * recorded data says so rather than showing a placeholder number.
 */
export default function SnapshotStrip({ summary }) {
  const { t } = useI18n();
  const unavailable = t('student.dashboard.hints.notRecorded');

  const items = [
    {
      key: 'average',
      label: t('student.dashboard.metrics.semesterAverage'),
      value: summary.average === null ? '—' : summary.average.toFixed(1),
      hint:
        summary.average === null
          ? unavailable
          : t('student.dashboard.hints.weighted', { letter: summary.averageLetter }),
      to: P.student.grades,
      icon: GraduationCap,
      tone: 'brand',
    },
    {
      key: 'attendance',
      label: t('student.dashboard.metrics.attendance'),
      value: summary.attendanceRate === null ? '—' : `${summary.attendanceRate}%`,
      hint: summary.attendanceRate === null ? unavailable : t('student.dashboard.hints.ofSessions'),
      to: P.student.attendance,
      icon: CalendarCheck,
      tone: 'positive',
    },
    {
      key: 'work',
      label: t('student.dashboard.metrics.pendingWork'),
      value: String(summary.pending + summary.overdue),
      hint:
        summary.pending + summary.overdue === 0
          ? t('student.dashboard.hints.nothingOpen')
          : t('student.dashboard.hints.overdueTodo', { overdue: summary.overdue, pending: summary.pending }),
      to: P.student.assignments,
      icon: ClipboardList,
      tone: summary.overdue > 0 ? 'warning' : 'royal',
    },
    {
      key: 'courses',
      label: t('student.dashboard.metrics.activeCourses'),
      value: String(summary.courseCount),
      hint: summary.courseCount
        ? t('student.dashboard.hints.credits', { count: summary.credits })
        : t('student.dashboard.hints.noEnrolment'),
      to: P.student.courses,
      icon: BookOpen,
      tone: 'royal',
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map(({ key, label, value, hint, to, icon: Icon, tone }) => (
        <Link
          key={key}
          to={to}
          className="card-surface group flex items-start gap-3 p-4 transition-shadow hover:shadow-[0_10px_30px_-22px_rgba(16,27,51,0.5)]"
        >
          <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', TONES[tone])}>
            <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium text-mutedink">{label}</p>
            <p className="mt-1 text-[26px] font-semibold leading-none tracking-[-0.02em] tabular-nums text-ink">
              {value}
            </p>
            <p className="mt-1.5 truncate text-[12.5px] text-mutedink">{hint}</p>
          </div>
          <span className="ms-auto flex h-8 w-8 shrink-0 items-center justify-center self-center rounded-full bg-brand text-white transition-colors group-hover:bg-brand-deep">
            <ArrowUpRight className="h-4 w-4" strokeWidth={2.1} />
          </span>
        </Link>
      ))}
    </section>
  );
}