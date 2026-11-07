import { useMemo, useState } from 'react';
import { CalendarCheck, TrendingDown, UserX, Percent } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import Panel from '@/components/admin/Panel';
import DataTable from '@/components/admin/DataTable';
import KpiCard from '@/components/admin/KpiCard';
import FilterSelect from '@/components/admin/FilterSelect';
import { StatusByValue } from '@/components/admin/StatusPill';
import { LineBlock } from '@/components/charts/Charts';
import { useAdminData } from '@/lib/AdminDataContext';
import { formatDate, formatPercent } from '@/lib/exportCsv';

const STATUSES = [
  { value: 'present', label: 'Present' },
  { value: 'absent', label: 'Absent' },
  { value: 'late', label: 'Late' },
  { value: 'excused', label: 'Excused' },
];

export default function Attendance() {
  const { analytics, attendanceRecords, courses, updateAttendance, loading } = useAdminData();
  const [faculty, setFaculty] = useState('all');
  const [course, setCourse] = useState('all');
  const [status, setStatus] = useState('all');
  const [query, setQuery] = useState('');
  const [visible, setVisible] = useState(60);

  const courseById = useMemo(() => Object.fromEntries(courses.map((item) => [item.id, item])), [courses]);

  const filtered = useMemo(
    () =>
      attendanceRecords
        .filter((record) => {
          const student = analytics.studentById[record.student_id];
          const q = query.trim().toLowerCase();
          if (faculty !== 'all' && record.faculty_id !== faculty) return false;
          if (course !== 'all' && record.course_id !== course) return false;
          if (status !== 'all' && record.status !== status) return false;
          if (q && !(student?.full_name || '').toLowerCase().includes(q)) return false;
          return true;
        })
        .sort((a, b) => (a.session_date < b.session_date ? 1 : -1)),
    [attendanceRecords, analytics.studentById, faculty, course, status, query]
  );

  const alerts = useMemo(
    () =>
      analytics.studentInsights
        .filter((insight) => insight.attendanceRate !== null && insight.attendanceRate < analytics.thresholds.attendance)
        .sort((a, b) => a.attendanceRate - b.attendanceRate)
        .slice(0, 10),
    [analytics.studentInsights, analytics.thresholds.attendance]
  );

  if (loading) return <div className="h-64 animate-pulse rounded-2xl bg-white" />;

  const { kpis, attendanceTrend, thresholds } = analytics;

  return (
    <div>
      <PageHeader
        eyebrow="Attendance Management"
        title="Attendance register"
        description={`Institutional attendance analytics with a ${thresholds.attendance}% review threshold. Corrections are recorded in the audit log.`}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Attendance today" value={formatPercent(kpis.attendanceToday)} caption="sessions recorded today" icon={CalendarCheck} accent="navy" />
        <KpiCard label="This week" value={formatPercent(kpis.attendanceWeek)} caption="last seven days" icon={CalendarCheck} accent="green" />
        <KpiCard label="Semester average" value={formatPercent(kpis.attendanceRate)} caption="all recorded sessions" icon={Percent} accent="gold" />
        <KpiCard
          label="Below threshold"
          value={alerts.length}
          caption={`students under ${thresholds.attendance}%`}
          icon={TrendingDown}
          accent={alerts.length ? 'red' : 'navy'}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel title="Attendance trend" subtitle="Institutional rate by week" className="lg:col-span-2" bodyClassName="p-3">
          {attendanceTrend.length > 0 ? (
            <LineBlock data={attendanceTrend} height={220} />
          ) : (
            <p className="py-16 text-center text-[12px] text-mutedink">No attendance sessions recorded yet.</p>
          )}
        </Panel>

        <Panel title="Absence alerts" subtitle="Students approaching the attendance threshold" bodyClassName="p-3">
          <ul className="space-y-1.5">
            {alerts.map((insight) => (
              <li key={insight.student.id} className="flex items-center justify-between gap-2 rounded-lg border border-[#EEF2F8] px-2.5 py-1.5">
                <span className="min-w-0">
                  <span className="block truncate text-[11.5px] font-medium text-ink">{insight.student.full_name}</span>
                  <span className="block truncate text-[10px] text-mutedink">{insight.facultyName}</span>
                </span>
                <span className="shrink-0 text-[11.5px] font-semibold text-[#A33A38]">{formatPercent(insight.attendanceRate)}</span>
              </li>
            ))}
            {alerts.length === 0 && (
              <li className="py-6 text-center text-[11.5px] text-mutedink">
                <UserX className="mx-auto mb-1.5 h-4 w-4 text-mutedink" />
                No students below the attendance threshold.
              </li>
            )}
          </ul>
        </Panel>
      </div>

      <Panel className="mt-4" title="Attendance records" subtitle={`${filtered.length} records in scope`} bodyClassName="p-0">
        <div className="grid gap-2.5 border-b border-[#EEF2F8] p-4 sm:grid-cols-2 lg:grid-cols-4">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search student"
            className="h-8 rounded-lg border border-[#E1E8F2] px-2.5 text-[11.5px] focus:border-navy/40 focus:outline-none"
          />
          <FilterSelect
            label="Faculty"
            value={faculty}
            onChange={setFaculty}
            options={[{ value: 'all', label: 'All faculties' }, ...analytics.facultyRows.map((row) => ({ value: row.id, label: row.code }))]}
          />
          <FilterSelect
            label="Course"
            value={course}
            onChange={setCourse}
            options={[
              { value: 'all', label: 'All courses' },
              ...courses
                .filter((item) => faculty === 'all' || item.faculty_id === faculty)
                .map((item) => ({ value: item.id, label: `${item.code} — ${item.title}` })),
            ]}
          />
          <FilterSelect
            label="Status"
            value={status}
            onChange={setStatus}
            options={[{ value: 'all', label: 'All statuses' }, ...STATUSES]}
          />
        </div>

        <DataTable
          dense
          emptyLabel="No attendance records match these filters."
          columns={[
            { key: 'date', label: 'Session', render: (row) => formatDate(row.session_date) },
            {
              key: 'student',
              label: 'Student',
              render: (row) => analytics.studentById[row.student_id]?.full_name || '—',
            },
            { key: 'course', label: 'Course', render: (row) => courseById[row.course_id]?.code || '—' },
            { key: 'faculty', label: 'Faculty', render: (row) => analytics.facultyById[row.faculty_id]?.code || '—' },
            { key: 'recorded', label: 'Recorded by', render: (row) => <span className="text-[10.5px] text-mutedink">{row.recorded_by || '—'}</span> },
            { key: 'status', label: 'Status', render: (row) => <StatusByValue value={row.status} /> },
            {
              key: 'correct',
              label: 'Correction',
              align: 'right',
              render: (row) => (
                <select
                  value={row.status}
                  onClick={(event) => event.stopPropagation()}
                  onChange={(event) => updateAttendance(row, event.target.value)}
                  className="h-7 rounded-md border border-[#E1E8F2] bg-white px-1.5 text-[10.5px] text-ink"
                >
                  {STATUSES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ),
            },
          ]}
          rows={filtered.slice(0, visible)}
        />
        {filtered.length > visible && (
          <div className="border-t border-[#EEF2F8] p-3 text-center">
            <button
              type="button"
              onClick={() => setVisible((value) => value + 60)}
              className="rounded-lg border border-[#E1E8F2] px-3 py-1.5 text-[11.5px] font-medium text-ink hover:bg-[#F7FAFD]"
            >
              Load more records
            </button>
          </div>
        )}
      </Panel>
    </div>
  );
}