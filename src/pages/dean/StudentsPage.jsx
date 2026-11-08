import { useState } from 'react';
import PageTitle from '@/components/shell/PageTitle';
import KpiStrip from '@/components/shell/KpiStrip';
import Surface from '@/components/shell/Surface';
import StatusChip from '@/components/shell/StatusChip';
import DataTable from '@/components/dean/DataTable';
import DeanToolbar from '@/components/dean/DeanToolbar';
import LoadPanel from '@/components/dean/LoadPanel';
import StudentDetail from '@/components/dean/StudentDetail';
import {
  RISK_LABELS,
  RISK_TONES,
  STATUS_LABELS,
  gradeTone,
  nf,
  num,
  pct,
  readFilter,
  useDeanData,
  useDebouncedValue,
} from '@/lib/deanApi';

const COLUMNS = [
  {
    key: 'full_name',
    label: 'Student',
    render: (row) => (
      <div>
        <p className="font-medium text-ink">{row.full_name}</p>
        <p className="mt-0.5 text-[12.5px] text-mutedink">
          {row.student_id} · {row.group_name}
        </p>
      </div>
    ),
  },
  { key: 'programme', label: 'Programme' },
  { key: 'faculty_code', label: 'Faculty' },
  { key: 'year', label: 'Year', align: 'right', render: (row) => row.year || '—' },
  {
    key: 'avgGrade',
    label: 'Avg grade',
    align: 'right',
    render: (row) => <StatusChip tone={gradeTone(row.avgGrade)}>{nf(row.avgGrade)}</StatusChip>,
  },
  { key: 'attendanceRate', label: 'Attendance', align: 'right', render: (row) => pct(row.attendanceRate) },
  {
    key: 'riskLevel',
    label: 'Standing',
    align: 'right',
    render: (row) => <StatusChip tone={RISK_TONES[row.riskLevel]}>{RISK_LABELS[row.riskLevel]}</StatusChip>,
  },
];

export default function StudentsPage() {
  const [query, setQuery] = useState('');
  const [faculty, setFaculty] = useState(readFilter('faculty'));
  const [programme, setProgramme] = useState('');
  const [year, setYear] = useState('');
  const [risk, setRisk] = useState(readFilter('risk'));
  const [status, setStatus] = useState('');
  const [selected, setSelected] = useState(null);
  const search = useDebouncedValue(query);

  const { data, loading, error } = useDeanData('students', {
    q: search,
    faculty_id: faculty,
    programme,
    year,
    risk,
    status,
  });

  const rows = data?.rows || [];
  const facets = data?.facets || { faculties: [], programmes: [], years: [] };
  const graded = rows.filter((row) => row.avgGrade !== null);
  const attended = rows.filter((row) => row.attendanceRate !== null);
  const meanGrade = graded.length ? graded.reduce((total, row) => total + row.avgGrade, 0) / graded.length : null;
  const meanAttendance = attended.length
    ? attended.reduce((total, row) => total + row.attendanceRate, 0) / attended.length
    : null;
  const filtered = Boolean(query || faculty || programme || year || risk || status);

  const clear = () => {
    setQuery('');
    setFaculty('');
    setProgramme('');
    setYear('');
    setRisk('');
    setStatus('');
  };

  return (
    <div>
      <PageTitle
        eyebrow="People"
        title="Students"
        description="The full student register with each student's derived average grade, attendance rate and academic standing. Open a student to see their connected course record."
        meta={[data?.scope ? `Scope: ${data.scope}` : 'Institutional scope', data?.gradeNote]}
      />

      <LoadPanel loading={loading} error={error} hasData={Boolean(data)}>
        {data && (
          <>
            <KpiStrip
              columns={4}
              items={[
                { label: 'Students shown', value: num(data.total), hint: 'Matching these filters' },
                {
                  label: 'High risk',
                  value: rows.filter((row) => row.riskLevel === 'high').length,
                  hint: 'Below grade or attendance threshold',
                },
                { label: 'Average grade', value: nf(meanGrade), hint: 'Across the selection' },
                { label: 'Average attendance', value: pct(meanAttendance), hint: `Floor ${data.attendanceFloor}%` },
              ]}
            />

            <Surface className="mt-4" bodyClassName="p-0" title="Student register">
              <DeanToolbar
                query={query}
                onQuery={setQuery}
                placeholder="Search name, ID, group or email"
                filters={[
                  {
                    label: 'All faculties',
                    value: faculty,
                    onChange: setFaculty,
                    options: facets.faculties.map((item) => ({ value: item.id, label: item.name })),
                  },
                  {
                    label: 'All programmes',
                    value: programme,
                    onChange: setProgramme,
                    options: facets.programmes.map((item) => ({ value: item, label: item })),
                  },
                  {
                    label: 'All years',
                    value: year,
                    onChange: setYear,
                    options: facets.years.map((item) => ({ value: String(item), label: `Year ${item}` })),
                  },
                  {
                    label: 'Any standing',
                    value: risk,
                    onChange: setRisk,
                    options: [
                      { value: 'high', label: 'High risk' },
                      { value: 'medium', label: 'Watch list' },
                      { value: 'low', label: 'On track' },
                    ],
                  },
                  {
                    label: 'Any status',
                    value: status,
                    onChange: setStatus,
                    options: [
                      { value: 'active', label: STATUS_LABELS.active },
                      { value: 'academic_leave', label: STATUS_LABELS.academic_leave },
                    ],
                  },
                ]}
                resultLabel={`${num(rows.length)} students`}
                actions={
                  <button type="button" onClick={clear} className="btn-quiet btn-sm" disabled={!filtered}>
                    Reset
                  </button>
                }
              />
              {loading && <div className="h-0.5 w-full animate-pulse bg-brand/30" />}
              <DataTable
                columns={COLUMNS}
                rows={rows}
                minWidth={880}
                onRowClick={(row) => setSelected(row.id)}
                empty="No student matches these filters."
              />
            </Surface>

            <p className="mt-2 px-1 text-[11.5px] text-mutedink">
              Select a student to open their record. Access is limited to the dean’s office and is scoped to{' '}
              {data.scope}.
            </p>
          </>
        )}
      </LoadPanel>

      {selected && <StudentDetail studentId={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}