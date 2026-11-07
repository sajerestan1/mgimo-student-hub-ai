import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Surface from '@/components/shell/Surface';
import { PERFORMANCE_TREND } from '@/lib/demoUniversity';

export default function ProgressionPanel() {
  return (
    <Surface
      title="Progression & completion"
      subtitle="Share of enrolled credits completed on time"
      action={<span className="chip bg-[#E9F5EF] text-[#1D7A50]">87% · +2 pts</span>}
      bodyClassName="px-3 pb-3 pt-1"
      footer={
        <p className="text-[11px] leading-relaxed text-mutedink">
          Cohort progression across five terms. Figures are computed from the demonstration dataset.
        </p>
      }
    >
      <ResponsiveContainer width="100%" height={186}>
        <AreaChart data={PERFORMANCE_TREND} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="progressionFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4F75FF" stopOpacity={0.22} />
              <stop offset="100%" stopColor="#4F75FF" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#EEF1F6" />
          <XAxis dataKey="period" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#667085' }} dy={6} />
          <YAxis
            domain={[70, 100]}
            width={38}
            ticks={[70, 80, 90, 100]}
            unit="%"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: '#667085' }}
          />
          <Tooltip
            cursor={{ stroke: '#C9D2E3' }}
            contentStyle={{ borderRadius: 10, border: '1px solid #E6E9F2', fontSize: 12 }}
            formatter={(value) => [`${value}%`, 'Completed on time']}
          />
          <Area
            type="monotone"
            dataKey="completion"
            stroke="#4F75FF"
            strokeWidth={2.4}
            fill="url(#progressionFill)"
            activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Surface>
  );
}