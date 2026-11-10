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

const TICK = { fontSize: 11, fill: '#6B7280' };
const TOOLTIP = { borderRadius: 12, border: '1px solid #E7EAF2', fontSize: 12, color: '#172033' };

const barColor = (score) => (score >= 70 ? '#4F75FF' : score >= 50 ? '#E6A23C' : '#D64545');

/** Recorded course results on a 0–100 scale, with the credit-weighted average marked. */
export default function PerformanceChart({ courses, average }) {
  const data = courses.map((course) => ({
    code: course.code,
    title: course.title,
    score: course.weighted,
  }));

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 12, right: 6, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEF1F6" />
          <XAxis dataKey="code" tick={TICK} axisLine={false} tickLine={false} interval={0} />
          <YAxis domain={[0, 100]} tick={TICK} axisLine={false} tickLine={false} width={40} />
          <Tooltip
            cursor={{ fill: '#F6F8FC' }}
            contentStyle={TOOLTIP}
            formatter={(value) => [`${value}/100`, '']}
            labelFormatter={(code, payload) => payload?.[0]?.payload?.title || code}
          />
          {average !== null && average !== undefined && (
            <ReferenceLine y={average} stroke="#16A085" strokeDasharray="4 4" />
          )}
          <Bar dataKey="score" radius={[6, 6, 0, 0]} maxBarSize={38}>
            {data.map((row) => (
              <Cell key={row.code} fill={barColor(row.score)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}