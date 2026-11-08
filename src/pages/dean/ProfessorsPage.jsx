import { useState } from 'react';
import PageTitle from '@/components/shell/PageTitle';
import KpiStrip from '@/components/shell/KpiStrip';
import Surface from '@/components/shell/Surface';
import StatusChip from '@/components/shell/StatusChip';
import DataTable from '@/components/dean/DataTable';
import DeanToolbar from '@/components/dean/DeanToolbar';
import LoadPanel from '@/components/dean/LoadPanel';
import {
  EMPLOYMENT_LABELS,
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
    label: 'Academic staff',
    render: (row) => (
      <div>
        <p className="font-medium text-ink">{row.full_name}</p>
        <p className="mt-0.5 text-[12.5px] text-mutedink">
          {row.title} · {row.email}
        </p>
      </div>
    ),
  },
  { key: 'faculty', label: 'Faculty', render: (row) => <span className="text-mutedink">{row.faculty}</span> },
  { key: 'department', label: 'Department' },
  { key: 'courses', label: 'Courses', align: 'right' },
  { key: 'students', label: 'Students', align: 'right' },
  {
    key: 'avgGrade',
    label: 'Avg grade',
    align: 'right',
    render: (row) => <StatusChip tone={gradeTone(row.avgGrade)}>{nf(row.avgGrade)}</StatusChip>,
  },
  { key: 'attendanceRate', label: 'Attendance', align: 'right', render: (row) => pct(row.attendanceRate) },
  {
    key: 'employment_status',
    label: 'Contract',
    align: 'right',
    render: (row) => (
      <StatusChip tone={row.employment_status === 'full_time' ? 'positive' : 'neutral'}>
        {EMPLOYMENT_LABELS[row.employment_status] || row.employment_status}
      </StatusChip>
    ),
  },
];

export default function ProfessorsPage() {
  const [query, setQuery] = useState('');
  const [faculty, setFaculty] = useState(readFilter('faculty'));
  const [employment, setEmployment] = useState('');
  const search = useDebouncedValue(query);

  const { data, loading, error } = useDeanData('professors', { q: search, faculty_id: faculty, employment });
  const rows = data?.rows || [];
  const facets = data?.facets || { faculties: [], employment: [] };
  const graded = rows.filter((row) => row.avgGrade !== null);
  const meanGrade = graded.length ? graded.reduce((total, row) => total + row.avgGrade, 0) / graded.length : null;

  return (
    <div>
      <PageTitle
        eyebrow="People"
        title="Professors"
        description="Teaching staff with their department, contracted hours and the outcome of the courses they own."
        meta={[data?.scope ? `Scope: ${data.scope}` : 'Institutional scope', data?.gradeNote]}
      />

      <LoadPanel loading={loading} error={error} hasData={Boolean(data)}>
        {data && (
          <>
            <KpiStrip
              columns={4}
              items={[
                { label: 'Academic staff', value: num(rows.length), hint: 'Matching these filters' },
                { label: 'Courses taught', value: rows.reduce((total, row) => total + row.courses, 0), hint: 'Owned course records' },
                { label: 'Students taught', value: num(rows.reduce((total, row) => total + row.students, 0)), hint: 'Across their courses' },
                { label: 'Average grade', value: nf(meanGrade), hint: 'In courses they teach' },
              ]}
            />

            <Surface className="mt-4" bodyClassName="p-0" title="Teaching staff register">
              <DeanToolbar
                query={query}
                onQuery={setQuery}
                placeholder="Search name, department or email"
                filters={[
                  {
                    label: 'All faculties',
                    value: faculty,
                    onChange: setFaculty,
                    options: facets.faculties.map((item) => ({ value: item.id, label: item.name })),
                  },
                  {
                    label: 'Any contract',
                    value: employment,
                    onChange: setEmployment,
                    options: facets.employment.map((item) => ({
                      value: item,
                      label: EMPLOYMENT_LABELS[item] || item,
                    })),
                  },
                ]}
                resultLabel={`${num(rows.length)} staff`}
              />
              {loading && <div className="h-0.5 w-full animate-pulse bg-brand/30" />}
              <DataTable
                columns={COLUMNS}
                rows={rows}
                minWidth={960}
                empty="No staff member matches these filters."
              />
            </Surface>
          </>
        )}
      </LoadPanel>
    </div>
  );
}