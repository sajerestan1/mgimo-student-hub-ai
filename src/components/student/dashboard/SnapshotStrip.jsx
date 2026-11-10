import { Link } from 'react-router-dom';
import { ArrowUpRight, BookOpen, CalendarCheck, ClipboardList, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';
import { useI18n } from '@/i18n/I18nProvider';

const TONES = {
  brand: 'bg-[#EFF6FF] text-[#2563EB]',
  positive: 'bg-[#ECFDF5] text-[#059669]',
  warning: 'bg-[#FFFBEB] text-[#D97706]',
  neutral: 'bg-[#F1F5F9] text-[#64748B]',
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
      tone: summary.overdue > 0 ? 'warning' : 'brand',
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
      tone: 'neutral',
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map(({ key, label, value, hint, to, icon: Icon, tone }) => (
        <Link
          key={key}
          to={to}
          className="card-surface group flex min-w-0 flex-col p-4 transition-colors hover:border-[#CBD8EC]"
        >
          <div className="flex items-center gap-2">
            <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', TONES[tone])}>
              <Icon className="h-4 w-4" strokeWidth={1.9} />
            </span>
            <p className="min-w-0 flex-1 truncate text-[length:var(--type-meta)] font-medium text-[#64748B]">{label}</p>
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-white transition-colors group-hover:bg-[#1D4ED8]">
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.2} />
            </span>
          </div>
          <p className="mt-2.5 text-[24px] font-semibold leading-none tracking-[-0.02em] tabular-nums text-ink">
            {value}
          </p>
          <p className="mt-1.5 truncate text-[length:var(--type-meta)] text-[#64748B]">{hint}</p>
        </Link>
      ))}
    </section>
  );
}