import { useState } from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';
import PageTitle from '@/components/shell/PageTitle';
import KpiStrip from '@/components/shell/KpiStrip';
import Surface from '@/components/shell/Surface';
import DataTable from '@/components/dean/DataTable';
import LoadPanel from '@/components/dean/LoadPanel';
import { downloadCsv } from '@/lib/exportCsv';
import { nf, num, pct, useDeanData } from '@/lib/deanApi';

const REPORTS = [
  {
    key: 'faculties',
    label: 'Faculty summary',
    description: 'Population, teaching strength and academic health per school.',
    columns: [
      { key: 'code', label: 'Code' },
      { key: 'name', label: 'Faculty' },
      { key: 'dean_name', label: 'Dean' },
      { key: 'departments', label: 'Departments', align: 'right' },
      { key: 'students', label: 'Students', align: 'right' },
      { key: 'professors', label: 'Staff', align: 'right' },
      { key: 'courses', label: 'Courses', align: 'right' },
      { key: 'avgGrade', label: 'Avg grade', align: 'right', render: (row) => nf(row.avgGrade) },
      { key: 'attendanceRate', label: 'Attendance', align: 'right', render: (row) => pct(row.attendanceRate) },
      { key: 'atRisk', label: 'At risk', align: 'right' },
    ],
  },
  {
    key: 'programmes',
    label: 'Programme summary',
    description: 'Cohort size, year coverage and outcome per degree programme.',
    columns: [
      { key: 'name', label: 'Programme' },
      { key: 'faculty_names', label: 'Faculties' },
      { key: 'students', label: 'Students', align: 'right' },
      { key: 'groups', label: 'Groups', align: 'right' },
      { key: 'avgGrade', label: 'Avg grade', align: 'right', render: (row) => nf(row.avgGrade) },
      { key: 'attendanceRate', label: 'Attendance', align: 'right', render: (row) => pct(row.attendanceRate) },
      { key: 'atRisk', label: 'At risk', align: 'right' },
      { key: 'monitoring', label: 'Monitored', align: 'right' },
    ],
  },
  {
    key: 'departments',
    label: 'Department summary',
    description: 'Departmental heads, staffing and student outcome.',
    columns: [
      { key: 'code', label: 'Code' },
      { key: 'name', label: 'Department' },
      { key: 'faculty', label: 'Faculty' },
      { key: 'head_name', label: 'Head of department' },
      { key: 'students', label: 'Students', align: 'right' },
      { key: 'professors', label: 'Staff', align: 'right' },
      { key: 'courses', label: 'Courses', align: 'right' },
      { key: 'avgGrade', label: 'Avg grade', align: 'right', render: (row) => nf(row.avgGrade) },
      { key: 'attendanceRate', label: 'Attendance', align: 'right', render: (row) => pct(row.attendanceRate) },
      { key: 'atRisk', label: 'At risk', align: 'right' },
    ],
  },
  {
    key: 'courses',
    label: 'Course outcomes',
    description: 'Enrolment, average and pass rate for every course in scope.',
    columns: [
      { key: 'code', label: 'Code' },
      { key: 'title', label: 'Course' },
      { key: 'faculty_code', label: 'Faculty' },
      { key: 'professor', label: 'Instructor' },
      { key: 'level', label: 'Level' },
      { key: 'status', label: 'Status' },
      { key: 'enrolled', label: 'Enrolled', align: 'right' },
      { key: 'graded', label: 'Marks', align: 'right' },
      { key: 'avgGrade', label: 'Avg grade', align: 'right', render: (row) => nf(row.avgGrade) },
      { key: 'attendanceRate', label: 'Attendance', align: 'right', render: (row) => pct(row.attendanceRate) },
      { key: 'passRate', label: 'Pass rate', align: 'right', render: (row) => pct(row.passRate) },
    ],
  },
  {
    key: 'risk',
    label: 'At-risk students',
    description: 'Students with an active risk signal and the reason behind it.',
    columns: [
      { key: 'full_name', label: 'Student' },
      { key: 'student_id', label: 'Student ID' },
      { key: 'group_name', label: 'Group' },
      { key: 'programme', label: 'Programme' },
      { key: 'faculty', label: 'Faculty' },
      { key: 'avgGrade', label: 'Avg grade', align: 'right', render: (row) => nf(row.avgGrade) },
      { key: 'attendanceRate', label: 'Attendance', align: 'right', render: (row) => pct(row.attendanceRate) },
      { key: 'riskLevel', label: 'Severity' },
      {
        key: 'labels',
        label: 'Signals',
        render: (row) => <span className="text-mutedink">{row.labels.join('; ')}</span>,
        value: (row) => row.labels.join('; '),
      },
    ],
  },
  {
    key: 'attendance',
    label: 'Attendance by faculty',
    description: 'Attendance rate and population per faculty.',
    columns: [
      { key: 'code', label: 'Code' },
      { key: 'name', label: 'Faculty' },
      { key: 'students', label: 'Students', align: 'right' },
      { key: 'rate', label: 'Attendance', align: 'right', render: (row) => pct(row.rate) },
    ],
  },
];

export default function ReportsPage() {
  const { data, loading, error } = useDeanData('reports');
  const [selected, setSelected] = useState('faculties');
  const report = REPORTS.find((item) => item.key === selected) || REPORTS[0];
  const rows = data?.datasets?.[report.key] || [];
  const preview = rows.slice(0, 12);

  const exportReport = () => {
    const columns = report.columns.map((column) => ({
      label: column.label,
      value: column.value || ((row) => row[column.key]),
    }));
    downloadCsv(`academic-intelligence-${report.key}-${new Date().toISOString().slice(0, 10)}.csv`, columns, rows);
  };

  return (
    <div>
      <PageTitle
        eyebrow="Intelligence"
        title="Reports & insights"
        description="Assemble an institutional report, review the figures on screen and export it. Every dataset is recomputed from the records in scope at the moment it is requested."
        meta={[
          data?.scope ? `Scope: ${data.scope}` : 'Institutional scope',
          data ? `Generated ${new Date(data.generatedAt).toLocaleString('en-GB')}` : 'Not generated yet',
          data?.gradeNote,
        ]}
        actions={
          <button type="button" onClick={exportReport} className="btn-primary" disabled={!rows.length}>
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
        }
      />

      <LoadPanel loading={loading} error={error} hasData={Boolean(data)}>
        {data && (
          <>
            <KpiStrip
              columns={4}
              items={[
                { label: 'Datasets available', value: REPORTS.length, hint: 'Ready to export' },
                { label: 'Rows in this report', value: num(rows.length), hint: report.label },
                { label: 'Pass mark', value: data.passMark, hint: 'Applies to course outcome reports' },
                { label: 'Attendance floor', value: pct(data.attendanceFloor, 0), hint: 'Institutional requirement' },
              ]}
            />

            <Surface className="mt-4" bodyClassName="p-4" title="Choose a report" subtitle={report.description}>
              <div className="flex flex-wrap gap-2">
                {REPORTS.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setSelected(item.key)}
                    className={
                      item.key === selected
                        ? 'rounded-lg bg-navy px-3 py-1.5 text-[13px] font-medium text-white'
                        : 'rounded-lg border border-line bg-white px-3 py-1.5 text-[13px] font-medium text-ink transition-colors hover:border-[#D6DCE8] hover:bg-canvas'
                    }
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </Surface>

            <Surface
              className="mt-4"
              bodyClassName="p-0"
              title={report.label}
              subtitle={`${num(rows.length)} rows · previewing ${preview.length}`}
              action={
                <button type="button" onClick={exportReport} className="btn-quiet btn-sm" disabled={!rows.length}>
                  <Download className="h-3.5 w-3.5" /> CSV
                </button>
              }
            >
              <DataTable columns={report.columns} rows={preview} minWidth={960} empty="No rows for this report in scope." />
            </Surface>

            <div className="mt-3 flex items-start gap-2 px-1">
              <FileSpreadsheet className="mt-0.5 h-3.5 w-3.5 shrink-0 text-mutedink" />
              <p className="text-[11.5px] leading-relaxed text-mutedink">
                The export contains all {num(rows.length)} rows, not just the preview. Personal data in this export
                stays inside the institution: it carries the academic record only, with no contact details beyond the
                institutional identifier.
              </p>
            </div>
          </>
        )}
      </LoadPanel>
    </div>
  );
}