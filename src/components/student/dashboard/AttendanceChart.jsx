import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { useI18n } from '@/i18n/I18nProvider';

export const ATTENDANCE_COLORS = {
  present: '#059669',
  late: '#D97706',
  excused: '#2563EB',
  absent: '#DC2626',
};

/** Donut of the recorded register rows, with the overall rate in the middle. */
export default function AttendanceChart({ totals, rate }) {
  const { t } = useI18n();

  const data = ['present', 'late', 'excused', 'absent']
    .map((key) => ({ key, value: totals[key] || 0 }))
    .filter((slice) => slice.value > 0);

  if (!data.length) return null;

  return (
    <div className="relative mx-auto h-[168px] w-full max-w-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="key" innerRadius="64%" outerRadius="94%" paddingAngle={2} stroke="none">
            {data.map((slice) => (
              <Cell key={slice.key} fill={ATTENDANCE_COLORS[slice.key]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[24px] font-semibold leading-none tabular-nums text-ink">
          {rate === null || rate === undefined ? '—' : `${rate}%`}
        </span>
        <span className="mt-1 text-[length:var(--type-meta)] text-[#64748B]">{t('student.dashboard.metrics.attendance')}</span>
      </div>
    </div>
  );
}