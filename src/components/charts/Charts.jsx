import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const AXIS_TICK = { fontSize: 10, fill: '#687C96' };
const TOOLTIP_STYLE = {
  borderRadius: 10,
  border: '1px solid #E1E8F2',
  fontSize: 11,
  color: '#142B46',
  boxShadow: '0 8px 20px -12px rgba(16,45,80,0.35)',
};

const PALETTE = ['#102D50', '#D8B66A', '#4C79A8', '#8FA97B', '#B05C5A', '#7C8FA8'];

export function BarBlock({ data, height = 220, color = '#102D50', unit = '', horizontal = false, onSelect }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout={horizontal ? 'vertical' : 'horizontal'}
        margin={{ top: 6, right: 8, bottom: 0, left: horizontal ? 8 : -14 }}
        onClick={(state) => {
          const label = state?.activeLabel;
          if (label && onSelect) onSelect(label);
        }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF2F8" />
        {horizontal ? (
          <>
            <XAxis type="number" tick={AXIS_TICK} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="label" tick={AXIS_TICK} axisLine={false} tickLine={false} width={64} />
          </>
        ) : (
          <>
            <XAxis dataKey="label" tick={AXIS_TICK} axisLine={false} tickLine={false} interval={0} />
            <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} width={40} unit={unit} />
          </>
        )}
        <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ fontSize: 10, color: '#687C96' }} cursor={{ fill: '#F5F8FC' }} />
        <Bar dataKey="value" fill={color} radius={horizontal ? [0, 5, 5, 0] : [5, 5, 0, 0]} maxBarSize={horizontal ? 16 : 34} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function LineBlock({ data, height = 220, color = '#102D50', unit = '' }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 10, bottom: 0, left: -14 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF2F8" />
        <XAxis dataKey="label" tick={AXIS_TICK} axisLine={false} tickLine={false} />
        <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} width={40} unit={unit} domain={[60, 100]} />
        <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ fontSize: 10, color: '#687C96' }} />
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2.2} dot={{ r: 2.6, fill: color }} activeDot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function DonutBlock({ data, height = 200, colors = PALETTE, centerLabel, centerValue, onSelect }) {
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            innerRadius="62%"
            outerRadius="92%"
            paddingAngle={2}
            stroke="none"
            onClick={(entry) => entry?.payload?.label && onSelect && onSelect(entry.payload.label)}
          >
            {data.map((entry, index) => (
              <Cell key={entry.label || index} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ fontSize: 10, color: '#687C96' }} />
        </PieChart>
      </ResponsiveContainer>
      {(centerValue !== undefined || centerLabel) && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-heading text-[22px] leading-none text-ink">{centerValue}</span>
          {centerLabel && <span className="mt-1 text-[9.5px] uppercase tracking-[0.12em] text-mutedink">{centerLabel}</span>}
        </div>
      )}
    </div>
  );
}

export function ChartLegend({ data, colors = PALETTE, suffix = '' }) {
  return (
    <ul className="mt-3 space-y-1.5">
      {data.map((entry, index) => (
        <li key={entry.label || index} className="flex items-center gap-2 text-[11.5px]">
          <span className="h-2 w-2 shrink-0 rounded-sm" style={{ backgroundColor: colors[index % colors.length] }} />
          <span className="flex-1 truncate text-mutedink">{entry.label}</span>
          <span className="font-semibold text-ink">
            {entry.value}
            {suffix}
          </span>
        </li>
      ))}
    </ul>
  );
}