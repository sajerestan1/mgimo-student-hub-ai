import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ASSIGNMENT_COMPLETION,
  ATTENDANCE_TREND,
  FACULTY_PERFORMANCE,
  PERFORMANCE_TREND,
  STUDENT_DISTRIBUTION,
} from '@/lib/demoUniversity';

const AXIS = {
  tick: { fontSize: 11, fill: '#667085' },
  axisLine: false,
  tickLine: false,
};

const GRID = { stroke: '#EEF1F6', vertical: false };

const TOOLTIP = {
  cursor: { stroke: '#D6DCE8', strokeWidth: 1 },
  contentStyle: {
    borderRadius: 8,
    border: '1px solid #E6E9F2',
    fontSize: 11.5,
    boxShadow: '0 14px 30px -22px rgba(16,27,51,0.45)',
    padding: '8px 10px',
  },
  labelStyle: { fontSize: 11, color: '#101B33', fontWeight: 600, marginBottom: 2 },
  itemStyle: { fontSize: 11.5, padding: 0 },
};

const FACULTY_COLORS = ['#4F75FF', '#7666F5', '#101B33'];
const VALUE_LABEL = { fontSize: 11, fill: '#667085', fontWeight: 600 };

export function PerformanceTrendChart() {
  return (
    <ResponsiveContainer width="100%" height={216}>
      <AreaChart data={PERFORMANCE_TREND} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="gpaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4F75FF" stopOpacity={0.18} />
            <stop offset="100%" stopColor="#4F75FF" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid {...GRID} />
        <XAxis dataKey="period" {...AXIS} dy={6} />
        <YAxis domain={[3.7, 4.2]} ticks={[3.7, 3.8, 3.9, 4, 4.1, 4.2]} {...AXIS} width={44} />
        <Tooltip {...TOOLTIP} />
        <Area
          type="monotone"
          dataKey="gpa"
          name="Average GPA"
          stroke="#4F75FF"
          strokeWidth={2}
          fill="url(#gpaFill)"
          dot={false}
          activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function FacultyPerformanceChart() {
  return (
    <ResponsiveContainer width="100%" height={216}>
      <BarChart data={FACULTY_PERFORMANCE} layout="vertical" margin={{ top: 4, right: 40, left: 0, bottom: 4 }}>
        <CartesianGrid horizontal={false} stroke="#EEF1F6" />
        <XAxis type="number" domain={[0, 5]} hide />
        <YAxis
          type="category"
          dataKey="name"
          width={52}
          tick={{ fontSize: 11, fill: '#101B33', fontWeight: 600 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip {...TOOLTIP} cursor={{ fill: '#FAFBFD' }} />
        <Bar dataKey="gpa" name="Average GPA" barSize={16} radius={[0, 6, 6, 0]}>
          {FACULTY_PERFORMANCE.map((entry, index) => (
            <Cell key={entry.name} fill={FACULTY_COLORS[index % FACULTY_COLORS.length]} />
          ))}
          <LabelList dataKey="gpa" position="right" formatter={(value) => Number(value).toFixed(2)} style={VALUE_LABEL} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function AttendanceTrendChart() {
  return (
    <ResponsiveContainer width="100%" height={216}>
      <LineChart data={ATTENDANCE_TREND} margin={{ top: 8, right: 10, left: -18, bottom: 0 }}>
        <CartesianGrid {...GRID} />
        <XAxis dataKey="week" {...AXIS} dy={6} />
        <YAxis domain={[80, 100]} unit="%" ticks={[80, 85, 90, 95, 100]} {...AXIS} width={44} />
        <Tooltip {...TOOLTIP} />
        <Line type="monotone" dataKey="eco" name="Economics" stroke="#4F75FF" strokeWidth={2} dot={false} activeDot={{ r: 3.5 }} />
        <Line type="monotone" dataKey="ir" name="International Relations" stroke="#7666F5" strokeWidth={2} dot={false} activeDot={{ r: 3.5 }} />
        <Line type="monotone" dataKey="mgt" name="Management & Technology" stroke="#101B33" strokeWidth={2} dot={false} activeDot={{ r: 3.5 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function StudentDistributionChart() {
  return (
    <ResponsiveContainer width="100%" height={216}>
      <BarChart data={STUDENT_DISTRIBUTION} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
        <CartesianGrid {...GRID} />
        <XAxis dataKey="year" {...AXIS} dy={6} />
        <YAxis {...AXIS} width={44} />
        <Tooltip {...TOOLTIP} cursor={{ fill: '#FAFBFD' }} />
        <Bar dataKey="students" name="Students" fill="#4F75FF" radius={[4, 4, 0, 0]} maxBarSize={44} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CompletionChart() {
  const rows = ASSIGNMENT_COMPLETION.map((row) => ({
    ...row,
    code: row.faculty === 'Economics' ? 'ECO' : row.faculty === 'International Relations' ? 'IR' : 'MGT',
  }));

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 12, left: 0, bottom: 4 }}>
        <CartesianGrid horizontal={false} stroke="#EEF1F6" />
        <XAxis type="number" domain={[0, 100]} unit="%" {...AXIS} />
        <YAxis
          type="category"
          dataKey="code"
          width={40}
          tick={{ fontSize: 11, fill: '#101B33', fontWeight: 600 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip {...TOOLTIP} cursor={{ fill: '#FAFBFD' }} />
        <Bar dataKey="submitted" name="Submitted" stackId="a" fill="#4F75FF" barSize={16} />
        <Bar dataKey="pending" name="Outstanding" stackId="a" fill="#E2E8F5" radius={[0, 6, 6, 0]} barSize={16} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function StudentGpaChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={132}>
      <AreaChart data={data} margin={{ top: 6, right: 4, left: -26, bottom: 0 }}>
        <defs>
          <linearGradient id="studentGpa" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4F75FF" stopOpacity={0.16} />
            <stop offset="100%" stopColor="#4F75FF" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid {...GRID} />
        <XAxis dataKey="semester" {...AXIS} tick={{ fontSize: 10.5, fill: '#667085' }} dy={4} />
        <YAxis domain={[4, 4.6]} ticks={[4, 4.2, 4.4, 4.6]} {...AXIS} width={38} tick={{ fontSize: 10.5, fill: '#667085' }} />
        <Tooltip {...TOOLTIP} />
        <Area
          type="monotone"
          dataKey="gpa"
          name="GPA"
          stroke="#4F75FF"
          strokeWidth={2}
          fill="url(#studentGpa)"
          dot={false}
          activeDot={{ r: 3.5 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}