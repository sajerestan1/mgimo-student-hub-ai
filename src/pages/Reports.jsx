import { useMemo, useState } from 'react';
import { Download, FileText } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import Panel from '@/components/admin/Panel';
import DataTable from '@/components/admin/DataTable';
import SimpleModal from '@/components/admin/SimpleModal';
import { BarBlock, LineBlock, DonutBlock, ChartLegend } from '@/components/charts/Charts';
import { useAdminData } from '@/lib/AdminDataContext';
import { downloadCsv, formatGpa, formatPercent } from '@/lib/exportCsv';

const mean = (values) => (values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null);
const pct = (part, total) => (total ? (part / total) * 100 : null);

const REPORTS = [
  { key: 'enrolment', title: 'Student enrolment report', description: 'Enrolment and status by faculty.' },
  { key: 'performance', title: 'Academic performance report', description: 'GPA, pass rates and course outcomes.' },
  { key: 'attendance', title: 'Attendance report', description: 'Attendance rate, trends and alerts.' },
  { key: 'workload', title: 'Professor workload report', description: 'Teaching assignments and contact hours.' },
  { key: 'exams', title: 'Examination performance report', description: 'Examination results and pass rates.' },
  { key: 'requests', title: 'Administrative requests report', description: 'Workflow status and processing load.' },
  { key: 'risk', title: 'Academic risk report', description: 'Risk distribution and students requiring review.' },
  { key: 'semester', title: 'Semester comparison report', description: 'Current semester against the previous one.' },
  { key: 'briefing', title: 'Weekly attendance briefing', description: 'Attendance in the last seven days.' },
];

function buildReport(key, analytics, data) {
  const { kpis, facultyRows, gradeDistribution, attendanceTrend, studentInsights, professorRows, requestsByStatus, examStats, thresholds } = analytics;
  const current = data.academicRecords.filter((record) => record.term === analytics.currentTermLabel);
  const previous = data.academicRecords.filter((record) => record.term === '2025/2026 · Spring');
  const limitations = 'Calculated from demonstration records in this application. Missing assessment or attendance entries reduce coverage.';

  switch (key) {
    case 'enrolment':
      return {
        stats: [
          ['Active students', kpis.totalStudents],
          ['All student records', kpis.totalStudentsAll],
          ['Academic leave', data.students.filter((student) => student.enrollment_status === 'academic_leave').length],
          ['Graduated', data.students.filter((student) => student.enrollment_status === 'graduated').length],
        ],
        chart: { type: 'bar', title: 'Students by faculty', data: facultyRows.map((row) => ({ label: row.code, value: row.studentCount })) },
        table: {
          title: 'Faculty enrolment',
          columns: ['Faculty', 'Students', 'Staff', 'Departments'],
          rows: facultyRows.map((row) => [row.name, String(row.studentCount), String(row.staffCount), String(row.departmentCount)]),
        },
        findings: [
          `${kpis.totalStudents} active students across ${kpis.facultyCount} faculties.`,
          `Largest faculty: ${[...facultyRows].sort((a, b) => b.studentCount - a.studentCount)[0]?.name || '—'}.`,
        ],
        concerns: data.students.filter((student) => student.enrollment_status === 'withdrawn').length
          ? ['Some students are recorded as withdrawn.']
          : [],
        actions: ['Confirm enrolment status accuracy before the semester reporting deadline.'],
        limitations,
      };
    case 'performance': {
      const courseRows = data.courses
        .map((course) => {
          const rows = current.filter((record) => record.course_id === course.id);
          return { course, graded: rows.length, pass: pct(rows.filter((record) => Number(record.grade) >= 3).length, rows.length) };
        })
        .filter((row) => row.graded > 0)
        .sort((a, b) => (a.pass || 0) - (b.pass || 0))
        .slice(0, 8);
      return {
        stats: [
          ['Average GPA', `${formatGpa(kpis.avgGpa)} / 5`],
          ['Pass rate', formatPercent(kpis.passRate)],
          ['Examination pass rate', formatPercent(examStats.passRate)],
          ['Graded assessments', current.length],
        ],
        chart: { type: 'bar', title: 'Average grade by faculty', data: facultyRows.map((row) => ({ label: row.code, value: Number((row.avgGpa || 0).toFixed(2)) })) },
        table: {
          title: 'Courses with lowest pass rates',
          columns: ['Course', 'Graded', 'Pass rate'],
          rows: courseRows.map((row) => [row.course.title, String(row.graded), formatPercent(row.pass)]),
        },
        findings: [
          `Institutional average grade is ${formatGpa(kpis.avgGpa)} with a pass rate of ${formatPercent(kpis.passRate)}.`,
          `Lowest performing course: ${courseRows[0]?.course.title || '—'}.`,
        ],
        concerns: courseRows.filter((row) => (row.pass || 0) < 70).map((row) => `${row.course.code} pass rate is ${formatPercent(row.pass)}.`),
        actions: ['Review assessment practices in courses below the 70% pass-rate marker.'],
        limitations,
      };
    }
    case 'attendance':
      return {
        stats: [
          ['Semester attendance', formatPercent(kpis.attendanceRate)],
          ['This week', formatPercent(kpis.attendanceWeek)],
          ['Today', formatPercent(kpis.attendanceToday)],
          ['Below threshold', studentInsights.filter((insight) => (insight.attendanceRate || 100) < thresholds.attendance).length],
        ],
        chart: { type: 'line', title: 'Attendance rate by week', data: attendanceTrend },
        table: {
          title: 'Faculties by attendance',
          columns: ['Faculty', 'Attendance', 'Students'],
          rows: [...facultyRows].sort((a, b) => (a.attendanceRate || 0) - (b.attendanceRate || 0)).map((row) => [row.name, formatPercent(row.attendanceRate), String(row.studentCount)]),
        },
        findings: [
          `Institutional attendance is ${formatPercent(kpis.attendanceRate)} against a ${thresholds.attendance}% threshold.`,
          `Lowest attendance faculty: ${[...facultyRows].sort((a, b) => (a.attendanceRate || 0) - (b.attendanceRate || 0))[0]?.name || '—'}.`,
        ],
        concerns: ['Students below the attendance threshold require review with their academic advisor.'],
        actions: ['Request attendance registers from faculties below the institutional average.'],
        limitations,
      };
    case 'workload':
      return {
        stats: [
          ['Academic staff', kpis.totalStaff],
          ['Average teaching load', `${(professorRows.reduce((sum, professor) => sum + professor.totalHours, 0) / (professorRows.length || 1)).toFixed(1)} h`],
          ['Courses without professor', analytics.coursesWithoutProfessor.length],
          ['Course offerings', data.courses.length],
        ],
        chart: { type: 'bar', title: 'Staff per faculty', data: facultyRows.map((row) => ({ label: row.code, value: row.staffCount })) },
        table: {
          title: 'Teaching workload (top 10)',
          columns: ['Staff member', 'Department', 'Courses', 'Load (h)'],
          rows: [...professorRows].sort((a, b) => b.totalHours - a.totalHours).slice(0, 10).map((professor) => [professor.full_name, professor.departmentName, String(professor.courseCount), String(professor.totalHours)]),
        },
        findings: [`${professorRows.length} academic staff with ${data.courses.length} course offerings.`],
        concerns: analytics.coursesWithoutProfessor.length ? [`${analytics.coursesWithoutProfessor.length} course offerings have no assigned professor.`] : [],
        actions: ['Resolve unassigned course offerings before the examination period.'],
        limitations,
      };
    case 'exams':
      return {
        stats: [
          ['Examination records', examStats.count],
          ['Examination pass rate', formatPercent(examStats.passRate)],
          ['Failed assessments', current.filter((record) => Number(record.grade) < 3).length],
          ['Average grade', formatGpa(mean(current.map((record) => Number(record.grade))))],
        ],
        chart: { type: 'pie', title: 'Grade distribution', data: gradeDistribution },
        table: {
          title: 'Examination outcomes by faculty',
          columns: ['Faculty', 'Pass rate', 'Avg GPA'],
          rows: facultyRows.map((row) => [row.name, formatPercent(row.passRate), formatGpa(row.avgGpa)]),
        },
        findings: [`${examStats.count} examination records with a pass rate of ${formatPercent(examStats.passRate)}.`],
        concerns: ['Failed assessments require human review of the individual circumstances.'],
        actions: ['Confirm that all examination results are recorded before the session closes.'],
        limitations,
      };
    case 'requests':
      return {
        stats: [
          ['Total requests', data.requests.length],
          ['Awaiting decision', kpis.pendingRequests],
          ['Awaiting information', data.requests.filter((request) => request.status === 'awaiting_information').length],
          ['Completed', data.requests.filter((request) => request.status === 'completed').length],
        ],
        chart: { type: 'pie', title: 'Requests by status', data: requestsByStatus },
        table: {
          title: 'Open requests',
          columns: ['Category', 'Student', 'Status', 'Due'],
          rows: analytics.pendingRequests.slice(0, 10).map((request) => [request.category, request.student_name, request.status.replace(/_/g, ' '), request.due_date || '—']),
        },
        findings: [`${kpis.pendingRequests} requests await an administrative decision.`],
        concerns: analytics.pendingRequests.filter((request) => request.due_date && request.due_date < new Date().toISOString().slice(0, 10)).length
          ? ['Some requests are past their processing deadline.']
          : [],
        actions: ['Assign unassigned requests and record decisions with an explanation.'],
        limitations,
      };
    case 'risk':
      return {
        stats: [
          ['High risk', analytics.riskCounts.high],
          ['Medium risk', analytics.riskCounts.medium],
          ['Low indicators', analytics.riskCounts.low],
          ['No current indicator', analytics.riskCounts.none],
        ],
        chart: { type: 'bar', title: 'Flagged students by faculty', data: analytics.riskByFaculty },
        table: {
          title: 'Students requiring review',
          columns: ['Student', 'Faculty', 'GPA', 'Risk'],
          rows: studentInsights
            .filter((insight) => insight.level !== 'none')
            .slice(0, 12)
            .map((insight) => [insight.student.full_name, insight.facultyName, formatGpa(insight.gpa), insight.level]),
        },
        findings: [`${analytics.riskCounts.high + analytics.riskCounts.medium} students carry high or medium indicators.`],
        concerns: ['Risk classifications are decision-support indicators and require human review.'],
        actions: ['Schedule academic reviews for high-risk students with their advisors.'],
        limitations: 'Risk indicators reflect stored grades and attendance only; personal circumstances are not modelled.',
      };
    case 'semester':
      return {
        stats: [
          ['Current semester GPA', formatGpa(mean(current.map((record) => Number(record.grade))))],
          ['Previous semester GPA', formatGpa(mean(previous.map((record) => Number(record.grade))))],
          ['Current assessments', current.length],
          ['Previous assessments', previous.length],
        ],
        chart: {
          type: 'bar',
          title: 'Average grade by faculty (current vs previous)',
          data: facultyRows.flatMap((row) => {
            const currentRows = current.filter((record) => record.faculty_id === row.id);
            const previousRows = previous.filter((record) => record.faculty_id === row.id);
            if (!currentRows.length || !previousRows.length) return [];
            return [
              { label: `${row.code} now`, value: Number(mean(currentRows.map((record) => Number(record.grade))).toFixed(2)) },
              { label: `${row.code} prev`, value: Number(mean(previousRows.map((record) => Number(record.grade))).toFixed(2)) },
            ];
          }),
        },
        table: {
          title: 'Faculty semester comparison',
          columns: ['Faculty', 'Current GPA', 'Previous GPA'],
          rows: facultyRows.map((row) => [
            row.name,
            formatGpa(mean(current.filter((record) => record.faculty_id === row.id).map((record) => Number(record.grade)))),
            formatGpa(mean(previous.filter((record) => record.faculty_id === row.id).map((record) => Number(record.grade)))),
          ]),
        },
        findings: ['Comparison uses only records with a recorded term.'],
        concerns: [],
        actions: ['Discuss faculties with a declining semester average at the next academic board.'],
        limitations,
      };
    default:
      return {
        stats: [
          ['Last seven days', formatPercent(kpis.attendanceWeek)],
          ['Semester average', formatPercent(kpis.attendanceRate)],
          ['Sessions recorded', data.attendanceRecords.length],
          ['Students below threshold', studentInsights.filter((insight) => (insight.attendanceRate || 100) < thresholds.attendance).length],
        ],
        chart: { type: 'line', title: 'Attendance rate by week', data: attendanceTrend },
        table: {
          title: 'Attendance by faculty',
          columns: ['Faculty', 'Attendance', 'Students'],
          rows: facultyRows.map((row) => [row.name, formatPercent(row.attendanceRate), String(row.studentCount)]),
        },
        findings: [`Weekly attendance stands at ${formatPercent(kpis.attendanceWeek)}.`],
        concerns: [],
        actions: ['Circulate the weekly attendance summary to faculty administrators.'],
        limitations,
      };
  }
}

export default function Reports() {
  const context = useAdminData();
  const { analytics, loading } = context;
  const [openKey, setOpenKey] = useState(null);

  const report = useMemo(() => (openKey ? buildReport(openKey, analytics, context) : null), [openKey, analytics, context]);

  if (loading) return <div className="h-64 animate-pulse rounded-2xl bg-white" />;

  const exportReport = () => {
    if (!report) return;
    downloadCsv(
      `mgimo-${openKey}-report.csv`,
      [
        { label: 'Metric', value: (row) => row.label },
        { label: 'Value', value: (row) => row.value },
      ],
      report.stats.map(([label, value]) => ({ label, value }))
    );
  };

  return (
    <div>
      <PageHeader
        eyebrow="Reports & Analytics"
        title="Administrative reporting centre"
        description="Prepared reports computed from stored records, with export for further analysis."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {REPORTS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setOpenKey(item.key)}
            className="card-surface flex items-start gap-3 p-4 text-left transition-shadow hover:shadow-[0_2px_4px_rgba(16,45,80,0.05),0_18px_38px_-28px_rgba(16,45,80,0.42)]"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EEF3FA] text-navy">
              <FileText className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block font-heading text-[14.5px] leading-tight text-ink">{item.title}</span>
              <span className="mt-0.5 block text-[11px] leading-relaxed text-mutedink">{item.description}</span>
            </span>
          </button>
        ))}
      </div>

      <SimpleModal
        open={Boolean(report)}
        onClose={() => setOpenKey(null)}
        title={REPORTS.find((item) => item.key === openKey)?.title}
        subtitle={`Reporting period: ${analytics.currentTermLabel} · generated ${new Date().toLocaleDateString('en-GB')}`}
        width="max-w-3xl"
        footer={
          <button
            type="button"
            onClick={exportReport}
            className="inline-flex items-center gap-1.5 rounded-lg bg-navy px-3.5 py-2 text-[11.5px] font-medium text-white"
          >
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
        }
      >
        {report && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {report.stats.map(([label, value]) => (
                <div key={label} className="rounded-lg bg-[#F7FAFD] px-2.5 py-2">
                  <p className="text-[9px] uppercase tracking-[0.1em] text-mutedink">{label}</p>
                  <p className="mt-0.5 text-[13px] font-semibold text-ink">{value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-[#E9EFF7] p-3">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-mutedink">{report.chart.title}</p>
              {report.chart.type === 'bar' && <BarBlock data={report.chart.data} height={190} />}
              {report.chart.type === 'line' && <LineBlock data={report.chart.data} height={190} />}
              {report.chart.type === 'pie' && (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="sm:w-[50%]">
                    <DonutBlock data={report.chart.data} height={160} />
                  </div>
                  <div className="flex-1">
                    <ChartLegend data={report.chart.data} />
                  </div>
                </div>
              )}
            </div>

            <div className="overflow-hidden rounded-xl border border-[#E9EFF7]">
              <p className="border-b border-[#E9EFF7] bg-[#F7FAFD] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-mutedink">
                {report.table.title}
              </p>
              <DataTable
                dense
                columns={report.table.columns.map((column, index) => ({
                  key: String(index),
                  label: column,
                  align: index === 0 ? 'left' : 'right',
                }))}
                rows={report.table.rows.map((row, index) => ({ id: index, ...Object.fromEntries(row.map((cell, cellIndex) => [String(cellIndex), cell])) }))}
              />
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <p className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-mutedink">Findings</p>
                <ul className="mt-1 space-y-1">
                  {report.findings.map((finding) => (
                    <li key={finding} className="text-[11px] leading-relaxed text-ink">· {finding}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-mutedink">Concerns and follow-up</p>
                <ul className="mt-1 space-y-1">
                  {[...report.concerns, ...report.actions].map((item) => (
                    <li key={item} className="text-[11px] leading-relaxed text-ink">· {item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="rounded-lg bg-[#FCF3DF]/60 px-2.5 py-1.5 text-[10.5px] leading-relaxed text-[#8A6C26]">
              Data limitations: {report.limitations}
            </p>
          </div>
        )}
      </SimpleModal>
    </div>
  );
}