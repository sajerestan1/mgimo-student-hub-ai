import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const AXIS = { tick: { fontSize: 11, fill: '#667085' }, axisLine: false, tickLine: false };
const GRID = { stroke: '#EEF1F6', vertical: false };
const TOOLTIP = {
  cursor: { fill: '#F6F8FC' },
  contentStyle: {
    borderRadius: 8,
    border: '1px solid #E6E9F2',
    fontSize: 11.5,
    boxShadow: '0 14px 30px -22px rgba(16,27,51,0.45)',
    padding: '8px 10px',
  },
};

const TONE_FILL = { positive: '#16A085', warning: '#E6A23C', critical: '#D64545', brand: '#4F75FF' };

export function FacultyComparisonChart({ rows, height = 240 }) {
  const data = rows.map((row) => ({
    name: row.code || row.name,
    grade: row.avgGrade,
    attendance: row.attendanceRate,
  }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }} barGap={4}>
        <CartesianGrid {...GRID} />
        <XAxis dataKey="name" {...AXIS} />
        <YAxis domain={[0, 100]} {...AXIS} />
        <Tooltip {...TOOLTIP} />
        <Bar dataKey="grade" name="Average grade" fill="#4F75FF" radius={[4, 4, 0, 0]} maxBarSize={26} />
        <Bar dataKey="attendance" name="Attendance" fill="#7666F5" radius={[4, 4, 0, 0]} maxBarSize={26} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TermTrendChart({ rows, height = 230 }) {
  const data = rows.map((row) => ({ name: row.label, grade: row.avgGrade }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
        <CartesianGrid {...GRID} />
        <XAxis dataKey="name" {...AXIS} />
        <YAxis domain={[50, 100]} {...AXIS} />
        <Tooltip {...TOOLTIP} />
        <Line type="monotone" dataKey="grade" name="Average grade" stroke="#4F75FF" strokeWidth={2} dot={{ r: 2.5 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function GradeDistributionChart({ rows, height = 230 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={rows} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid {...GRID} />
        <XAxis dataKey="label" {...AXIS} />
        <YAxis {...AXIS} />
        <Tooltip {...TOOLTIP} />
        <Bar dataKey="count" name="Assessments" radius={[4, 4, 0, 0]} maxBarSize={44}>
          {rows.map((row) => (
            <Cell key={row.label} fill={TONE_FILL[row.tone] || TONE_FILL.brand} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function WeeklyAttendanceChart({ rows, height = 230 }) {
  const data = rows.map((row) => ({
    name: new Date(row.week).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
    rate: row.rate,
  }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
        <CartesianGrid {...GRID} />
        <XAxis dataKey="name" {...AXIS} />
        <YAxis domain={[0, 100]} {...AXIS} />
        <Tooltip {...TOOLTIP} />
        <Line type="monotone" dataKey="rate" name="Attendance" stroke="#16A085" strokeWidth={2} dot={{ r: 2.5 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function RiskFacultyChart({ rows, height = 240 }) {
  const data = rows.map((row) => ({ name: row.code, high: row.high, watch: row.medium }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid {...GRID} />
        <XAxis dataKey="name" {...AXIS} />
        <YAxis {...AXIS} />
        <Tooltip {...TOOLTIP} />
        <Bar dataKey="high" name="High risk" stackId="risk" fill="#D64545" maxBarSize={30} />
        <Bar dataKey="watch" name="Watch list" stackId="risk" fill="#E6A23C" radius={[4, 4, 0, 0]} maxBarSize={30} />
      </BarChart>
    </ResponsiveContainer>
  );
}