import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import Panel from '@/components/admin/Panel';
import DataTable from '@/components/admin/DataTable';
import KpiCard from '@/components/admin/KpiCard';
import { RiskBadge, StatusByValue } from '@/components/admin/StatusPill';
import { BarBlock } from '@/components/charts/Charts';
import { useAdminData } from '@/lib/AdminDataContext';
import { downloadCsv, formatDate, formatGpa, formatPercent } from '@/lib/exportCsv';

const TABS = [
  ['overview', 'Overview'],
  ['records', 'Academic Records'],
  ['attendance', 'Attendance'],
  ['courses', 'Courses'],
  ['performance', 'Performance'],
  ['history', 'Administrative History'],
];

export default function StudentDetail() {
  const { id } = useParams();
  const { analytics, courses, academicRecords, attendanceRecords, requests, requestEvents, professors, loading, createStudentNote } =
    useAdminData();
  const [tab, setTab] = useState('overview');

  const insight = analytics.studentInsights.find((item) => item.student.id === id);

  const records = useMemo(
    () =>
      academicRecords
        .filter((record) => record.student_id === id)
        .sort((a, b) => (a.recorded_date < b.recorded_date ? 1 : -1)),
    [academicRecords, id]
  );
  const attendance = useMemo(
    () =>
      attendanceRecords
        .filter((record) => record.student_id === id)
        .sort((a, b) => (a.session_date < b.session_date ? 1 : -1)),
    [attendanceRecords, id]
  );
  const studentRequests = useMemo(() => requests.filter((request) => request.student_id === id), [requests, id]);
  const courseById = useMemo(() => Object.fromEntries(courses.map((course) => [course.id, course])), [courses]);
  const professorById = useMemo(() => Object.fromEntries(professors.map((prof) => [prof.id, prof])), [professors]);
  const history = useMemo(
    () =>
      requestEvents
        .filter((event) => studentRequests.some((request) => request.id === event.request_id))
        .sort((a, b) => (a.event_date < b.event_date ? 1 : -1)),
    [requestEvents, studentRequests]
  );

  if (loading) {
    return <div className="h-64 animate-pulse rounded-2xl bg-white" />;
  }

  if (!insight) {
    return (
      <div className="card-surface p-6 text-center">
        <p className="font-heading text-[17px] text-ink">Student record not found</p>
        <p className="mt-1 text-[12px] text-mutedink">
          The record may be outside your authorised scope, or it may no longer exist.
        </p>
        <Link to="/students" className="mt-3 inline-block rounded-lg bg-navy px-3.5 py-2 text-[12px] font-medium text-white">
          Back to student directory
        </Link>
      </div>
    );
  }

  const { student } = insight;
  const enrolledCourses = [...new Set(records.map((record) => record.course_id))]
    .map((courseId) => courseById[courseId])
    .filter(Boolean);

  const exportRecord = () => {
    downloadCsv(
      `${student.student_id || 'student'}-academic-record.csv`,
      [
        { label: 'Course', value: (row) => courseById[row.course_id]?.title || '—' },
        { label: 'Code', value: (row) => courseById[row.course_id]?.code || '—' },
        { label: 'Term', value: (row) => row.term },
        { label: 'Assessment', value: (row) => row.assessment_type },
        { label: 'Grade', value: (row) => row.grade },
        { label: 'Recorded', value: (row) => row.recorded_date },
      ],
      records
    );
  };

  return (
    <div>
      <Link to="/students" className="mb-3 inline-flex items-center gap-1.5 text-[11.5px] font-medium text-mutedink hover:text-navy">
        <ArrowLeft className="h-3.5 w-3.5" /> Student directory
      </Link>

      <PageHeader
        eyebrow={student.student_id}
        title={student.full_name}
        description={`${student.program} · ${insight.facultyName} · Year ${student.year} · Group ${student.group_name}`}
        actions={
          <>
            <RiskBadge level={insight.level} />
            <StatusByValue value={student.enrollment_status} />
            <button
              type="button"
              onClick={exportRecord}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#E1E8F2] bg-white px-3 py-2 text-[11.5px] font-medium text-ink hover:bg-[#F7FAFD]"
            >
              <Download className="h-3.5 w-3.5" /> Export record
            </button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Current GPA" value={`${formatGpa(insight.gpa)} / 5.00`} caption={`previous ${formatGpa(insight.previousGpa)}`} />
        <KpiCard label="Attendance" value={formatPercent(insight.attendanceRate)} caption={`${insight.absences} absences of ${insight.sessions}`} accent="green" />
        <KpiCard label="Failed assessments" value={insight.failed} caption="current semester" accent={insight.failed > 0 ? 'red' : 'navy'} />
        <KpiCard
          label="Intervention"
          value={student.intervention_status === 'none' ? 'Not required' : student.intervention_status === 'monitoring' ? 'Monitoring' : 'Active'}
          caption="human decision status"
          accent="gold"
        />
      </div>

      <div className="no-scrollbar mt-4 flex gap-1 overflow-x-auto border-b border-[#E4EAF3]">
        {TABS.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`whitespace-nowrap border-b-2 px-3 py-2 text-[12px] font-medium transition-colors ${
              tab === key ? 'border-gold text-navy' : 'border-transparent text-mutedink hover:text-ink'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-4">
        {tab === 'overview' && (
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel title="Student profile" bodyClassName="p-4">
              <dl className="grid grid-cols-2 gap-3 text-[11.5px]">
                {[
                  ['Student ID', student.student_id],
                  ['Faculty', insight.facultyName],
                  ['Department', insight.departmentName],
                  ['Programme', student.program],
                  ['Study year', `Year ${student.year}`],
                  ['Group', student.group_name],
                  ['Email', student.email],
                  ['Enrolment', student.enrollment_status.replace(/_/g, ' ')],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-[9.5px] uppercase tracking-[0.12em] text-mutedink">{label}</dt>
                    <dd className="mt-0.5 font-medium capitalize text-ink">{value || '—'}</dd>
                  </div>
                ))}
              </dl>
            </Panel>

            <Panel
              title="Risk indicators and evidence"
              subtitle="Decision support only — requires human review"
              bodyClassName="p-4"
            >
              {insight.evidence.length === 0 ? (
                <p className="text-[12px] text-mutedink">No risk indicators were detected from the stored records.</p>
              ) : (
                <ul className="space-y-1.5">
                  {insight.evidence.map((item) => (
                    <li key={item} className="flex gap-2 text-[11.5px] leading-relaxed text-ink">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gold" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-3 border-t border-[#EEF2F8] pt-3">
                <label className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-mutedink">
                  Intervention status
                </label>
                <select
                  value={student.intervention_status}
                  onChange={(event) => createStudentNote(student, event.target.value)}
                  className="mt-1 h-8 w-full rounded-lg border border-[#E1E8F2] px-2.5 text-[11.5px]"
                >
                  <option value="none">No intervention required</option>
                  <option value="monitoring">Monitoring</option>
                  <option value="active">Active intervention</option>
                </select>
                <p className="mt-1.5 text-[10px] text-mutedink">Changes are recorded in the administrative audit log.</p>
              </div>
            </Panel>
          </div>
        )}

        {tab === 'records' && (
          <Panel title="Academic records" subtitle={`${records.length} assessment records on file`} bodyClassName="p-0">
            <DataTable
              columns={[
                { key: 'course', label: 'Course', render: (row) => courseById[row.course_id]?.title || '—' },
                { key: 'code', label: 'Code', render: (row) => courseById[row.course_id]?.code || '—' },
                { key: 'type', label: 'Assessment', render: (row) => row.assessment_type },
                { key: 'term', label: 'Term', render: (row) => row.term },
                {
                  key: 'grade',
                  label: 'Grade',
                  align: 'right',
                  render: (row) => (
                    <span className={`font-semibold ${Number(row.grade) < 3 ? 'text-[#A33A38]' : 'text-ink'}`}>{row.grade}</span>
                  ),
                },
                { key: 'date', label: 'Recorded', align: 'right', render: (row) => formatDate(row.recorded_date) },
              ]}
              rows={records}
            />
          </Panel>
        )}

        {tab === 'attendance' && (
          <Panel title="Attendance history" subtitle={`${attendance.length} recorded sessions`} bodyClassName="p-0">
            <DataTable
              columns={[
                { key: 'date', label: 'Session', render: (row) => formatDate(row.session_date) },
                { key: 'course', label: 'Course', render: (row) => courseById[row.course_id]?.title || '—' },
                { key: 'recorder', label: 'Recorded by', render: (row) => row.recorded_by || '—' },
                { key: 'status', label: 'Status', align: 'right', render: (row) => <StatusByValue value={row.status} /> },
              ]}
              rows={attendance}
            />
          </Panel>
        )}

        {tab === 'courses' && (
          <Panel title="Enrolled courses" subtitle="Current semester registrations" bodyClassName="p-0">
            <DataTable
              columns={[
                { key: 'code', label: 'Code', render: (row) => row.code },
                { key: 'title', label: 'Course', render: (row) => row.title },
                { key: 'credits', label: 'Credits', align: 'center', render: (row) => row.credits },
                {
                  key: 'professor',
                  label: 'Professor',
                  render: (row) => professorById[row.professor_id]?.full_name || 'Unassigned',
                },
                {
                  key: 'dept',
                  label: 'Department',
                  render: (row) => analytics.departmentById[row.department_id]?.name || '—',
                },
              ]}
              rows={enrolledCourses}
            />
          </Panel>
        )}

        {tab === 'performance' && (
          <Panel title="Performance by course" subtitle="Grade achieved in the current semester" bodyClassName="p-4">
            {records.filter((record) => record.term === analytics.currentTermLabel).length > 0 ? (
              <BarBlock
                height={230}
                data={records
                  .filter((record) => record.term === analytics.currentTermLabel)
                  .map((record) => ({
                    label: courseById[record.course_id]?.code || '—',
                    value: Number(record.grade),
                  }))}
              />
            ) : (
              <p className="py-10 text-center text-[12px] text-mutedink">No current-semester results recorded.</p>
            )}
          </Panel>
        )}

        {tab === 'history' && (
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel title="Administrative requests" bodyClassName="p-0">
              <DataTable
                emptyLabel="No administrative requests on file."
                onRowClick={() => {}}
                columns={[
                  { key: 'category', label: 'Category' },
                  { key: 'date', label: 'Submitted', render: (row) => formatDate(row.submitted_date) },
                  { key: 'status', label: 'Status', align: 'right', render: (row) => <StatusByValue value={row.status} /> },
                ]}
                rows={studentRequests}
              />
            </Panel>
            <Panel title="Status history" bodyClassName="p-4">
              {history.length === 0 && <p className="text-[12px] text-mutedink">No status events recorded.</p>}
              <ol className="space-y-3">
                {history.map((event) => (
                  <li key={event.id} className="border-l-2 border-[#E4EAF3] pl-3">
                    <p className="text-[11.5px] font-medium text-ink">
                      {event.type === 'comment' ? 'Comment' : `Status: ${(event.status || '').replace(/_/g, ' ')}`}
                    </p>
                    <p className="text-[10.5px] text-mutedink">
                      {formatDate(event.event_date)} · {event.actor_name} ({event.actor_role})
                    </p>
                    {event.note && <p className="mt-0.5 text-[11px] text-ink">{event.note}</p>}
                  </li>
                ))}
              </ol>
            </Panel>
          </div>
        )}
      </div>
    </div>
  );
}