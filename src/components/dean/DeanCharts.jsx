import {
  Area,
  AreaChart,
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
import { ATTENDANCE_TREND, FACULTY_PERFORMANCE, PERFORMANCE_TREND, STUDENT_DISTRIBUTION, ASSIGNMENT_COMPLETION } from '@/lib/demoUniversity';

const AXIS = { tick: { fontSize: 10, fill: '#66748C' }, stroke: '#E6EAF2' };
const TOOLTIP = {
  contentStyle: {
    borderRadius: 10,
    border: '1px solid #E6EAF2',
    fontSize: 11,
    boxShadow: '0 12px 30px -20px rgba(20,33,61,0.4)',
    padding: '8px 10px',
  },
  labelStyle: { fontSize: 11, color: '#14213D', fontWeight: 600 },
  itemStyle: { fontSize: 11 },
};
const FACULTY_COLORS = ['#4F75FF', '#7666F5', '#14213D'];

export function PerformanceTrendChart() {
  return (
    <ResponsiveContainer width="100%" height={190}>
      <AreaChart data={PERFORMANCE_TREND} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="gpaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4F75FF" stopOpacity={0.24} />
            <stop offset="100%" stopColor="#4F75FF" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="#EEF1F7" />
        <XAxis dataKey="period" {...AXIS} tickLine={false} />
        <YAxis domain={[3.6, 4.2]} {...AXIS} tickLine={false} axisLine={false} />
        <Tooltip {...TOOLTIP} />
        <Area type="monotone" dataKey="gpa" name="Average GPA" stroke="#4F75FF" strokeWidth={2} fill="url(#gpaFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function FacultyPerformanceChart() {
  return (
    <ResponsiveContainer width="100%" height={190}>
      <BarChart data={FACULTY_PERFORMANCE} margin={{ top: 6, right: 6, left: -18, bottom: 0 }} barGap={4}>
        <CartesianGrid vertical={false} stroke="#EEF1F7" />
        <XAxis dataKey="name" {...AXIS} tickLine={false} />
        <YAxis domain={[0, 5]} {...AXIS} tickLine={false} axisLine={false} />
        <Tooltip {...TOOLTIP} />
        <Bar dataKey="gpa" name="Average GPA" radius={[5, 5, 0, 0]} maxBarSize={38}>
          {FACULTY_PERFORMANCE.map((entry, index) => (
            <Cell key={entry.name} fill={FACULTY_COLORS[index % FACULTY_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function AttendanceTrendChart() {
  return (
    <ResponsiveContainer width="100%" height={190}>
      <LineChart data={ATTENDANCE_TREND} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#EEF1F7" />
        <XAxis dataKey="week" {...AXIS} tickLine={false} />
        <YAxis domain={[80, 100]} unit="%" {...AXIS} tickLine={false} axisLine={false} />
        <Tooltip {...TOOLTIP} />
        <Line type="monotone" dataKey="eco" name="Economics" stroke="#4F75FF" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="ir" name="International Relations" stroke="#7666F5" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="mgt" name="Management & Technology" stroke="#14213D" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function StudentDistributionChart() {
  return (
    <ResponsiveContainer width="100%" height={190}>
      <BarChart data={STUDENT_DISTRIBUTION} margin={{ top: 6, right: 6, left: -22, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#EEF1F7" />
        <XAxis dataKey="year" {...AXIS} tickLine={false} />
        <YAxis {...AXIS} tickLine={false} axisLine={false} />
        <Tooltip {...TOOLTIP} />
        <Bar dataKey="students" name="Students" fill="#4F75FF" radius={[5, 5, 0, 0]} maxBarSize={46} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CompletionChart() {
  return (
    <ResponsiveContainer width="100%" height={190}>
      <BarChart data={ASSIGNMENT_COMPLETION} margin={{ top: 6, right: 6, left: -22, bottom: 0 }} layout="vertical">
        <CartesianGrid horizontal={false} stroke="#EEF1F7" />
        <XAxis type="number" domain={[0, 100]} unit="%" {...AXIS} tickLine={false} axisLine={false} />
        <YAxis type="category" dataKey="faculty" width={128} {...AXIS} tickLine={false} axisLine={false} />
        <Tooltip {...TOOLTIP} />
        <Bar dataKey="submitted" name="Submitted" stackId="a" fill="#4F75FF" radius={[0, 0, 0, 0]} maxBarSize={20} />
        <Bar dataKey="pending" name="Outstanding" stackId="a" fill="#DCE3F5" radius={[0, 5, 5, 0]} maxBarSize={20} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function StudentGpaChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={160}>
      <AreaChart data={data} margin={{ top: 6, right: 6, left: -22, bottom: 0 }}>
        <defs>
          <linearGradient id="studentGpa" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7666F5" stopOpacity={0.22} />
            <stop offset="100%" stopColor="#7666F5" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="#EEF1F7" />
        <XAxis dataKey="semester" {...AXIS} tickLine={false} />
        <YAxis domain={[3.8, 4.6]} {...AXIS} tickLine={false} axisLine={false} />
        <Tooltip {...TOOLTIP} />
        <Area type="monotone" dataKey="gpa" name="GPA" stroke="#7666F5" strokeWidth={2} fill="url(#studentGpa)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function StudentAttendanceChart({ value }) {
  const data = [
    { name: 'Attended', value },
    { name: 'Missed', value: 100 - value },
  ];
  return (
    <ResponsiveContainer width="100%" height={110}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <XAxis type="number" domain={[0, 100]} hide />
        <YAxis type="category" dataKey="name" hide />
        <Tooltip {...TOOLTIP} />
        <Bar dataKey="value" stackId="a" radius={[0, 0, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={entry.name} fill={index === 0 ? '#4F75FF' : '#E9EDF6'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}