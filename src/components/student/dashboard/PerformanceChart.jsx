import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const TICK_FILL = '#64748B';
const TOOLTIP = { borderRadius: 12, border: '1px solid #E7EAF2', fontSize: 12, color: '#172033' };

const barColor = (score) => (score >= 70 ? '#2563EB' : score >= 50 ? '#D97706' : '#DC2626');

/** Recorded course results on a 0–100 scale, with the credit-weighted average marked. */
export default function PerformanceChart({ courses, average }) {
  // Narrow screens carry fewer axis labels so codes never overlap or clip.
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 640px)');
    const sync = () => setCompact(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  const data = courses.map((course) => ({
    code: course.code,
    title: course.title,
    score: course.weighted,
  }));

  const tick = { fontSize: compact ? 10 : 11, fill: TICK_FILL };

  return (
    <div className="h-[176px] w-full sm:h-[204px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 4, bottom: 0, left: -22 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEF1F6" />
          <XAxis
            dataKey="code"
            tick={tick}
            tickMargin={4}
            axisLine={false}
            tickLine={false}
            interval={compact ? 1 : 0}
          />
          <YAxis domain={[0, 100]} tick={tick} axisLine={false} tickLine={false} width={38} />
          <Tooltip
            cursor={{ fill: '#F6F8FC' }}
            contentStyle={TOOLTIP}
            formatter={(value) => [`${value}/100`, '']}
            labelFormatter={(code, payload) => payload?.[0]?.payload?.title || code}
          />
          {average !== null && average !== undefined && (
            <ReferenceLine y={average} stroke="#059669" strokeDasharray="4 4" />
          )}
          <Bar dataKey="score" radius={[6, 6, 0, 0]} maxBarSize={34}>
            {data.map((row) => (
              <Cell key={row.code} fill={barColor(row.score)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}