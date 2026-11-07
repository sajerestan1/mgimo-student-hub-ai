import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Radar, TrendingUp, CalendarCheck, GraduationCap } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import Panel from '@/components/admin/Panel';
import DataTable from '@/components/admin/DataTable';
import KpiCard from '@/components/admin/KpiCard';
import FilterSelect from '@/components/admin/FilterSelect';
import { RiskBadge } from '@/components/admin/StatusPill';
import { BarBlock, LineBlock, DonutBlock, ChartLegend } from '@/components/charts/Charts';
import { useAdminData } from '@/lib/AdminDataContext';
import { formatGpa, formatPercent } from '@/lib/exportCsv';

const mean = (values) => (values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null);
const pct = (part, total) => (total ? (part / total) * 100 : null);

function monthLabel(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('en-GB', { month: 'short' });
}

export default function Intelligence() {
  const { analytics, students, departments, courses, academicRecords, attendanceRecords, professors, loading } = useAdminData();
  const navigate = useNavigate();
  const [faculty, setFaculty] = useState('all');
  const [department, setDepartment] = useState('all');
  const [year, setYear] = useState('all');
  const [course, setCourse] = useState('all');

  const scopedAttendance = useMemo(
    () =>
      attendanceRecords.filter(
        (record) =>
          (faculty === 'all' || record.faculty_id === faculty) &&
          (department === 'all' || record.department_id === department) &&
          (course === 'all' || record.course_id === course)
      ),
    [attendanceRecords, faculty, department, course]
  );

  const scopedRecords = useMemo(
    () =>
      academicRecords.filter(
        (record) =>
          (faculty === 'all' || record.faculty_id === faculty) &&
          (department === 'all' || record.department_id === department) &&
          (course === 'all' || record.course_id === course)
      ),
    [academicRecords, faculty, department, course]
  );

  const scopedInsights = useMemo(
    () =>
      analytics.studentInsights.filter(
        (insight) =>
          (faculty === 'all' || insight.student.faculty_id === faculty) &&
          (department === 'all' || insight.student.department_id === department) &&
          (year === 'all' || String(insight.student.year) === year)
      ),
    [analytics.studentInsights, faculty, department, year]
  );

  const currentRecords = scopedRecords.filter((record) => record.term === analytics.currentTermLabel);
  const attendanceRate = pct(
    scopedAttendance.filter((record) => record.status === 'present' || record.status === 'late').length,
    scopedAttendance.length
  );
  const avgGpa = mean(currentRecords.map((record) => Number(record.grade)));
  const passRate = pct(currentRecords.filter((record) => Number(record.grade) >= 3).length, currentRecords.length);

  const riskCounts = useMemo(() => {
    const counts = { high: 0, medium: 0, low: 0, none: 0 };
    scopedInsights.forEach((insight) => {
      counts[insight.level] += 1;
    });
    return counts;
  }, [scopedInsights]);

  const attendanceTrend = useMemo(() => {
    const buckets = {};
    scopedAttendance.forEach((record) => {
      const label = monthLabel(record.session_date);
      if (!label) return;
      buckets[label] = buckets[label] || { label, total: 0, attended: 0 };
      buckets[label].total += 1;
      if (record.status === 'present' || record.status === 'late') buckets[label].attended += 1;
    });
    return ['Sep', 'Oct', 'Nov', 'Dec']
      .filter((label) => buckets[label])
      .map((label) => ({ label, value: Number(((buckets[label].attended / buckets[label].total) * 100).toFixed(1)) }));
  }, [scopedAttendance]);

  const performanceTrend = useMemo(() => {
    const buckets = {};
    scopedRecords.forEach((record) => {
      const label = monthLabel(record.recorded_date);
      if (!label) return;
      buckets[label] = buckets[label] || { label, values: [] };
      buckets[label].values.push(Number(record.grade));
    });
    return Object.values(buckets)
      .sort((a, b) => new Date(`2026 ${a.label} 01`) - new Date(`2026 ${b.label} 01`))
      .map((bucket) => ({ label: bucket.label, value: Number(mean(bucket.values).toFixed(2)) }));
  }, [scopedRecords]);

  const facultyComparison = useMemo(
    () =>
      analytics.facultyRows
        .filter((row) => faculty === 'all' || row.id === faculty)
        .map((row) => ({
          id: row.id,
          label: row.code,
          name: row.name,
          students: row.studentCount,
          attendance: row.attendanceRate,
          gpa: row.avgGpa,
          pass: row.passRate,
          risk: row.riskCount,
        }))
        .sort((a, b) => (b.gpa || 0) - (a.gpa || 0)),
    [analytics.facultyRows, faculty]
  );

  const departmentComparison = useMemo(
    () =>
      analytics.departmentRows
        .filter((row) => (faculty === 'all' || row.facultyId === faculty) && (department === 'all' || row.id === department))
        .sort((a, b) => (b.avgGpa || 0) - (a.avgGpa || 0))
        .slice(0, 10),
    [analytics.departmentRows, faculty, department]
  );

  const workload = useMemo(() => {
    const scoped = analytics.professorRows.filter(
      (professor) => (faculty === 'all' || professor.faculty_id === faculty) && (department === 'all' || professor.department_id === department)
    );
    return {
      staff: scoped.length,
      avgLoad: scoped.length ? scoped.reduce((sum, professor) => sum + professor.totalHours, 0) / scoped.length : 0,
      unassigned: analytics.coursesWithoutProfessor.filter((item) => faculty === 'all' || item.faculty_id === faculty).length,
    };
  }, [analytics.professorRows, analytics.coursesWithoutProfessor, faculty, department]);

  const flagged = scopedInsights
    .filter((insight) => insight.level !== 'none')
    .sort((a, b) => (a.level === 'high' ? -1 : 1))
    .slice(0, 15);

  if (loading) return <div className="h-64 animate-pulse rounded-2xl bg-white" />;

  return (
    <div>
      <PageHeader
        eyebrow="University Intelligence Engine"
        title="Academic risk and institutional analytics"
        description="Filterable decision-support analytics computed from stored academic, attendance and staffing records."
      />

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
        <FilterSelect
          label="Faculty"
          value={faculty}
          onChange={(value) => {
            setFaculty(value);
            setDepartment('all');
          }}
          options={[{ value: 'all', label: 'All faculties' }, ...analytics.facultyRows.map((row) => ({ value: row.id, label: row.code }))]}
        />
        <FilterSelect
          label="Department"
          value={department}
          onChange={setDepartment}
          options={[
            { value: 'all', label: 'All departments' },
            ...departments
              .filter((item) => faculty === 'all' || item.faculty_id === faculty)
              .map((item) => ({ value: item.id, label: item.name })),
          ]}
        />
        <FilterSelect
          label="Study year"
          value={year}
          onChange={setYear}
          options={[{ value: 'all', label: 'All years' }, ...[1, 2, 3, 4].map((value) => ({ value: String(value), label: `Year ${value}` }))]}
        />
        <FilterSelect
          label="Course"
          value={course}
          onChange={setCourse}
          options={[
            { value: 'all', label: 'All courses' },
            ...[...new Map(courses.map((item) => [item.code, item])).values()].map((item) => ({ value: item.id, label: item.code })),
          ]}
        />
        <div className="flex items-end">
          <span className="rounded-lg bg-white px-2.5 py-2 text-[10.5px] text-mutedink">{students.length} students in dataset</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Attendance rate" value={formatPercent(attendanceRate)} caption={`${scopedAttendance.length} sessions in scope`} icon={CalendarCheck} />
        <KpiCard label="Average GPA" value={`${formatGpa(avgGpa)} / 5`} caption="current semester" icon={TrendingUp} accent="gold" />
        <KpiCard label="Pass rate" value={formatPercent(passRate)} caption="grades 3 and above" icon={TrendingUp} accent="green" />
        <KpiCard
          label="Flagged students"
          value={riskCounts.high + riskCounts.medium}
          caption="high or medium risk indicators"
          icon={Radar}
          accent={riskCounts.high ? 'red' : 'navy'}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel title="Risk distribution" subtitle="Decision support, human review required" bodyClassName="p-3">
          <DonutBlock
            data={[
              { label: 'High', value: riskCounts.high },
              { label: 'Medium', value: riskCounts.medium },
              { label: 'Low', value: riskCounts.low },
              { label: 'No current risk', value: riskCounts.none },
            ]}
            height={160}
            colors={['#B05C5A', '#D8B66A', '#4C79A8', '#DCE4EF']}
            centerValue={riskCounts.high + riskCounts.medium}
            centerLabel="flagged"
          />
          <ChartLegend
            data={[
              { label: 'High', value: riskCounts.high },
              { label: 'Medium', value: riskCounts.medium },
              { label: 'Low', value: riskCounts.low },
              { label: 'No current risk', value: riskCounts.none },
            ]}
            colors={['#B05C5A', '#D8B66A', '#4C79A8', '#DCE4EF']}
          />
        </Panel>
        <Panel title="Attendance trend" subtitle="Monthly attendance rate in scope" bodyClassName="p-3">
          {attendanceTrend.length > 0 ? <LineBlock data={attendanceTrend} height={200} /> : <p className="py-14 text-center text-[11.5px] text-mutedink">No sessions recorded.</p>}
        </Panel>
        <Panel title="Academic performance trend" subtitle="Average grade by assessment month" bodyClassName="p-3">
          {performanceTrend.length > 0 ? (
            <BarBlock data={performanceTrend} height={200} color="#183B63" />
          ) : (
            <p className="py-14 text-center text-[11.5px] text-mutedink">No graded records in scope.</p>
          )}
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Faculty comparison" subtitle="Ranked by average performance" bodyClassName="p-0">
          <DataTable
            dense
            onRowClick={() => navigate('/faculties')}
            columns={[
              { key: 'code', label: 'Faculty', render: (row) => <span className="font-medium">{row.label}</span> },
              { key: 'students', label: 'Students', align: 'right' },
              { key: 'attendance', label: 'Attendance', align: 'right', render: (row) => formatPercent(row.attendance) },
              { key: 'pass', label: 'Pass rate', align: 'right', render: (row) => formatPercent(row.pass) },
              { key: 'gpa', label: 'Avg GPA', align: 'right', render: (row) => formatGpa(row.gpa) },
              { key: 'risk', label: 'Flagged', align: 'right' },
            ]}
            rows={facultyComparison}
          />
        </Panel>

        <Panel title="Department comparison" subtitle="Top ten departments by average performance" bodyClassName="p-0">
          <DataTable
            dense
            columns={[
              { key: 'name', label: 'Department', render: (row) => <span className="font-medium">{row.name}</span> },
              { key: 'students', label: 'Students', align: 'right' },
              { key: 'attendance', label: 'Attendance', align: 'right', render: (row) => formatPercent(row.attendanceRate) },
              { key: 'gpa', label: 'Avg GPA', align: 'right', render: (row) => formatGpa(row.avgGpa) },
              { key: 'risk', label: 'Flagged', align: 'right' },
            ]}
            rows={departmentComparison}
          />
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel title="Teaching workload" subtitle="Staffing indicators in scope" bodyClassName="p-4">
          <div className="space-y-2 text-[11.5px]">
            <div className="flex items-center justify-between rounded-lg bg-[#F7FAFD] px-2.5 py-2">
              <span className="inline-flex items-center gap-1.5 text-mutedink">
                <GraduationCap className="h-3.5 w-3.5 text-navy" /> Academic staff
              </span>
              <span className="font-semibold text-ink">{workload.staff}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-[#F7FAFD] px-2.5 py-2">
              <span className="text-mutedink">Average teaching load</span>
              <span className="font-semibold text-ink">{workload.avgLoad.toFixed(1)} h</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-[#F7FAFD] px-2.5 py-2">
              <span className="text-mutedink">Courses without professor</span>
              <span className="font-semibold text-ink">{workload.unassigned}</span>
            </div>
            <p className="pt-1 text-[10px] leading-relaxed text-mutedink">
              Load = recorded weekly contact hours plus assigned course credits. No performance evaluation is inferred.
            </p>
          </div>
        </Panel>

        <Panel title="Students requiring review" subtitle="Every entry links to its evidence" className="lg:col-span-2" bodyClassName="p-0">
          <DataTable
            dense
            onRowClick={(row) => navigate(`/students/${row.student.id}`)}
            emptyLabel="No students flagged in this scope."
            columns={[
              { key: 'name', label: 'Student', render: (row) => <span className="font-medium">{row.student.full_name}</span> },
              { key: 'faculty', label: 'Faculty', render: (row) => <span className="text-[11px]">{row.facultyName}</span> },
              { key: 'gpa', label: 'GPA', align: 'right', render: (row) => formatGpa(row.gpa) },
              { key: 'att', label: 'Attendance', align: 'right', render: (row) => formatPercent(row.attendanceRate) },
              { key: 'evidence', label: 'Primary evidence', render: (row) => <span className="text-[10.5px] text-mutedink">{row.evidence[0] || '—'}</span> },
              { key: 'risk', label: 'Risk', align: 'right', render: (row) => <RiskBadge level={row.level} /> },
            ]}
            rows={flagged}
          />
        </Panel>
      </div>

      <p className="mt-4 text-[10.5px] leading-relaxed text-mutedink">
        Thresholds in force: GPA below {analytics.thresholds.gpaHigh.toFixed(1)} (high) / {analytics.thresholds.gpaMedium.toFixed(1)} (review),
        absence above {analytics.thresholds.absenceMedium}% (review) / {analytics.thresholds.absenceHigh}% (high), GPA decline of{' '}
        {analytics.thresholds.gpaDecline.toFixed(1)} between semesters. Thresholds are configurable in Administration & Settings.
      </p>
    </div>
  );
}