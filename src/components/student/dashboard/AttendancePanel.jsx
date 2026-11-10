import { Link } from 'react-router-dom';
import { ArrowRight, CalendarCheck } from 'lucide-react';
import Surface from '@/components/shell/Surface';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';
import { useI18n } from '@/i18n/I18nProvider';
import PanelTitle from './PanelTitle';
import AttendanceChart, { ATTENDANCE_COLORS } from './AttendanceChart';

const KEYS = ['present', 'late', 'excused', 'absent'];

/**
 * Attendance panel. Every figure is summed from the register rows recorded
 * against this student, the same records the Attendance page reports.
 */
export default function AttendancePanel({ context }) {
  const { t } = useI18n();
  const rows = context.attendance?.byCourse || [];
  const rate = context.attendance?.overall ?? null;

  const totals = rows.reduce(
    (acc, row) => ({
      present: acc.present + (row.present || 0),
      late: acc.late + (row.late || 0),
      excused: acc.excused + (row.excused || 0),
      absent: acc.absent + (row.absent || 0),
      total: acc.total + (row.total || 0),
    }),
    { present: 0, late: 0, excused: 0, absent: 0, total: 0 }
  );

  const withSessions = rows.filter((row) => row.total > 0 && row.rate !== null).slice(0, 4);

  return (
    <Surface
      className="h-full"
      title={<PanelTitle icon={CalendarCheck} tone="positive">{t('student.dashboard.metrics.attendance')}</PanelTitle>}
      subtitle={
        totals.total
          ? t('student.dashboard.attendanceBreakdown.recorded', { count: totals.total })
          : t('student.dashboard.hints.notRecorded')
      }
      action={
        <Link
          to={P.student.attendance}
          className="inline-flex shrink-0 items-center gap-1 text-[13px] font-medium text-[#2563EB] transition-colors hover:text-[#1D4ED8]"
        >
          {t('student.dashboard.viewAll')}
          <ArrowRight className="dir-icon h-3.5 w-3.5" />
        </Link>
      }
      bodyClassName="px-4 pb-3 pt-1"
    >
      {totals.total > 0 ? (
        <>
          <div className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[190px_1fr]">
            <AttendanceChart totals={totals} rate={rate} />
            <ul className="space-y-1.5">
              {KEYS.map((key) => (
                <li key={key} className="flex items-center justify-between gap-2 text-[13px]">
                  <span className="flex items-center gap-2 text-mutedink">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: ATTENDANCE_COLORS[key] }}
                    />
                    {t(`student.dashboard.attendanceBreakdown.${key}`)}
                  </span>
                  <span className="font-semibold tabular-nums text-ink">{totals[key]}</span>
                </li>
              ))}
            </ul>
          </div>

          {withSessions.length > 0 && (
            <ul className="mt-2 divide-y divide-line border-t border-line pt-1">
              {withSessions.map((row) => (
                <li key={row.code} className="flex items-center justify-between gap-3 py-2">
                  <span className="min-w-0 truncate text-[13px] font-medium text-ink">{row.code}</span>
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-16 overflow-hidden rounded-full bg-[#E7EAF2]">
                      <span
                        className="block h-full rounded-full bg-[#059669]"
                        style={{ width: `${Math.min(100, Math.max(0, row.rate))}%` }}
                      />
                    </span>
                    <span className="w-9 text-end text-[12.5px] font-semibold tabular-nums text-ink">{row.rate}%</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <p className="py-8 text-center text-[14px] leading-relaxed text-mutedink">
          {t('student.dashboard.hints.notRecorded')}
        </p>
      )}
    </Surface>
  );
}