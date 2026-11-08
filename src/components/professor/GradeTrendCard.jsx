import { useMemo, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Surface from '@/components/shell/Surface';
import StatusChip from '@/components/shell/StatusChip';

const AXIS = { tick: { fontSize: 10.5, fill: '#667085' }, axisLine: false, tickLine: false };
const TOOLTIP = {
  contentStyle: {
    borderRadius: 8,
    border: '1px solid #E6E9F2',
    fontSize: 11,
    boxShadow: '0 14px 30px -22px rgba(16,27,51,0.45)',
    padding: '7px 9px',
  },
  labelStyle: { fontSize: 11, color: '#101B33', fontWeight: 600, marginBottom: 2 },
  itemStyle: { fontSize: 11, padding: 0 },
};

export default function GradeTrendCard({ points, change }) {
  const [course, setCourse] = useState('all');

  const courses = useMemo(() => [...new Set(points.map((point) => point.course).filter(Boolean))], [points]);
  const scoped = course === 'all' ? points : points.filter((point) => point.course === course);
  const latest = scoped[scoped.length - 1] || null;

  return (
    <Surface
      title="Grade trends over time"
      subtitle="Class average on every graded assessment, in date order — the passing line is 60%"
      action={
        <div className="flex items-center gap-2">
          {change !== null && course === 'all' && (
            <StatusChip tone={change >= 0 ? 'positive' : 'critical'}>
              {change >= 0 ? '+' : ''}
              {change} pts vs previous
            </StatusChip>
          )}
          {courses.length > 1 && (
            <select
              value={course}
              onChange={(event) => setCourse(event.target.value)}
              className="rounded-lg border border-line bg-white px-2 py-1 text-[11px] text-ink"
            >
              <option value="all">All courses</option>
              {courses.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
          )}
        </div>
      }
      footer={
        latest ? (
          <p className="text-[10.5px] text-mutedink">
            Latest: <span className="font-medium text-ink">{latest.label}</span> · {latest.avg}% average across{' '}
            {latest.count} graded {latest.kind === 'Quiz' ? 'attempts' : 'submissions'}
          </p>
        ) : null
      }
    >
      {scoped.length < 2 ? (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-line bg-canvas/60 px-4 py-5">
          <div>
            <p className="text-[20px] font-semibold leading-none text-ink">{latest ? `${latest.avg}%` : '—'}</p>
            <p className="mt-1 text-[10.5px] text-mutedink">
              {latest ? `${latest.label} · ${latest.count} graded` : 'No graded work yet'}
            </p>
          </div>
          <p className="max-w-[240px] text-[10.5px] leading-relaxed text-mutedink">
            A trend line appears once a second assessment in this scope has been graded.
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={218}>
          <LineChart data={scoped} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid stroke="#EEF1F6" vertical={false} />
            <XAxis dataKey="short" {...AXIS} dy={6} />
            <YAxis domain={[0, 100]} width={42} {...AXIS} />
            <Tooltip
              {...TOOLTIP}
              labelFormatter={(label, payload) => payload?.[0]?.payload?.label ?? label}
              formatter={(value, name, props) => [`${value}% · ${props.payload.count} graded`, 'Class average']}
            />
            <ReferenceLine y={60} stroke="#D64545" strokeDasharray="4 4" strokeOpacity={0.6} />
            <Line
              type="monotone"
              dataKey="avg"
              stroke="#4F75FF"
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 2, fill: '#FFFFFF' }}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Surface>
  );
}