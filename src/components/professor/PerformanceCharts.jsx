import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const AXIS = { tick: { fontSize: 10.5, fill: '#667085' }, axisLine: false, tickLine: false };
const GRID = { stroke: '#EEF1F6', vertical: false };
const TOOLTIP = {
  cursor: { fill: '#FAFBFD' },
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
const VALUE_LABEL = { fontSize: 10.5, fill: '#667085', fontWeight: 600 };

const BANDS = [
  { band: 'Below 60', min: -1, max: 59.9, fill: '#D64545' },
  { band: '60–69', min: 60, max: 69.9, fill: '#E6A23C' },
  { band: '70–79', min: 70, max: 79.9, fill: '#4F75FF' },
  { band: '80–89', min: 80, max: 89.9, fill: '#7666F5' },
  { band: '90–100', min: 90, max: 101, fill: '#16A085' },
];

export function GradeDistributionChart({ rows }) {
  const data = BANDS.map((band) => ({
    band: band.band,
    fill: band.fill,
    students: rows.filter(
      (row) => typeof row.avg === 'number' && row.avg >= band.min && row.avg <= band.max
    ).length,
  }));
  const marked = data.reduce((sum, item) => sum + item.students, 0);

  if (!marked) return <p className="py-8 text-center text-[11.5px] text-mutedink">No marks recorded yet for this scope.</p>;

  return (
    <ResponsiveContainer width="100%" height={210}>
      <BarChart data={data} margin={{ top: 14, right: 8, left: -24, bottom: 0 }}>
        <CartesianGrid {...GRID} />
        <XAxis dataKey="band" {...AXIS} dy={6} />
        <YAxis allowDecimals={false} {...AXIS} width={44} />
        <Tooltip {...TOOLTIP} formatter={(value) => [`${value} students`, 'Count']} />
        <Bar dataKey="students" name="Students" radius={[4, 4, 0, 0]} maxBarSize={54}>
          {data.map((item) => (
            <Cell key={item.band} fill={item.fill} />
          ))}
          <LabelList dataKey="students" position="top" style={VALUE_LABEL} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CourseProgressChart({ rows }) {
  const map = new Map();
  rows.forEach((row) => {
    if (!map.has(row.course)) map.set(row.course, { code: row.course, marks: [], attendance: [], completion: [] });
    const entry = map.get(row.course);
    if (typeof row.avg === 'number') entry.marks.push(row.avg);
    entry.attendance.push(row.attendance);
    entry.completion.push(row.completion);
  });

  const average = (list) => (list.length ? Math.round(list.reduce((sum, n) => sum + n, 0) / list.length) : 0);
  const data = [...map.values()].map((entry) => ({
    code: entry.code,
    average: average(entry.marks),
    completion: average(entry.completion),
    attendance: average(entry.attendance),
  }));

  if (!data.length) return <p className="py-8 text-center text-[11.5px] text-mutedink">No enrolments in this scope.</p>;

  return (
    <ResponsiveContainer width="100%" height={Math.max(190, data.length * 34 + 56)}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 30, left: 0, bottom: 20 }}>
        <CartesianGrid horizontal={false} stroke="#EEF1F6" />
        <XAxis type="number" domain={[0, 100]} unit="%" {...AXIS} />
        <YAxis
          type="category"
          dataKey="code"
          width={54}
          tick={{ fontSize: 10.5, fill: '#101B33', fontWeight: 600 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip {...TOOLTIP} />
        <Legend wrapperStyle={{ fontSize: 10.5, paddingTop: 6 }} iconSize={7} iconType="circle" />
        <Bar dataKey="average" name="Average mark" fill="#4F75FF" barSize={9} radius={[0, 4, 4, 0]} />
        <Bar dataKey="completion" name="Submitted work" fill="#7666F5" barSize={9} radius={[0, 4, 4, 0]} />
        <Bar dataKey="attendance" name="Attendance" fill="#16A085" barSize={9} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}