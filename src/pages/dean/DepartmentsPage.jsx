import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import PageTitle from '@/components/shell/PageTitle';
import KpiStrip from '@/components/shell/KpiStrip';
import Surface from '@/components/shell/Surface';
import StatusChip from '@/components/shell/StatusChip';
import DataTable from '@/components/dean/DataTable';
import DeanToolbar from '@/components/dean/DeanToolbar';
import LoadPanel from '@/components/dean/LoadPanel';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';
import { gradeTone, nf, num, pct, readFilter, useDeanData } from '@/lib/deanApi';

const COLUMNS = [
  {
    key: 'name',
    label: 'Department',
    render: (row) => (
      <div>
        <p className="font-medium text-ink">{row.name}</p>
        <p className="mt-0.5 text-[12.5px] text-mutedink">
          {row.code} · Head {row.head_name}
        </p>
      </div>
    ),
  },
  { key: 'faculty', label: 'Faculty', render: (row) => <span className="text-mutedink">{row.faculty}</span> },
  { key: 'students', label: 'Students', align: 'right', render: (row) => num(row.students) },
  { key: 'professors', label: 'Staff', align: 'right' },
  { key: 'courses', label: 'Courses', align: 'right' },
  {
    key: 'avgGrade',
    label: 'Avg grade',
    align: 'right',
    render: (row) => <StatusChip tone={gradeTone(row.avgGrade)}>{nf(row.avgGrade)}</StatusChip>,
  },
  { key: 'attendanceRate', label: 'Attendance', align: 'right', render: (row) => pct(row.attendanceRate) },
  {
    key: 'atRisk',
    label: 'At risk',
    align: 'right',
    render: (row) => <span className={row.atRisk ? 'font-medium text-critical' : 'text-mutedink'}>{row.atRisk}</span>,
  },
  {
    key: 'open',
    label: '',
    align: 'right',
    render: (row) => (
      <Link to={`${P.dean.students}?faculty=${row.faculty_id}`} className="link-quiet whitespace-nowrap">
        Students <ArrowRight className="h-3 w-3" />
      </Link>
    ),
  },
];

export default function DepartmentsPage() {
  const { data, loading, error } = useDeanData('departments');
  const [faculty, setFaculty] = useState(readFilter('faculty'));
  const [query, setQuery] = useState('');

  const all = data?.rows || [];
  const needle = query.trim().toLowerCase();
  const rows = all.filter((row) => {
    if (faculty && row.faculty_id !== faculty) return false;
    if (!needle) return true;
    return [row.name, row.code, row.head_name, row.faculty].join(' ').toLowerCase().includes(needle);
  });

  const faculties = [...new Map(all.map((row) => [row.faculty_id, row.faculty])).entries()]
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const staff = rows.reduce((total, row) => total + row.professors, 0);
  const students = rows.reduce((total, row) => total + row.students, 0);
  const graded = rows.filter((row) => row.avgGrade !== null);
  const meanGrade = graded.length ? graded.reduce((total, row) => total + row.avgGrade, 0) / graded.length : null;

  return (
    <div>
      <PageTitle
        eyebrow="Academic structure"
        title="Departments"
        description="Departments grouped by faculty, with head of department, teaching strength and the academic health of the student body they own."
        meta={[data?.scope ? `Scope: ${data.scope}` : 'Institutional scope', `${all.length} departments`]}
      />

      <LoadPanel loading={loading} error={error} hasData={Boolean(data)}>
        {data && (
          <>
            <KpiStrip
              columns={4}
              items={[
                { label: 'Departments shown', value: rows.length, hint: `of ${all.length} in scope` },
                { label: 'Students', value: num(students), hint: 'Owned by these departments' },
                { label: 'Academic staff', value: staff, hint: 'Assigned teaching staff' },
                { label: 'Average grade', value: nf(meanGrade), hint: 'Across the selection' },
              ]}
            />

            <Surface className="mt-4" bodyClassName="p-0" title="Department register">
              <DeanToolbar
                query={query}
                onQuery={setQuery}
                placeholder="Search department or head"
                filters={[{ label: 'All faculties', value: faculty, onChange: setFaculty, options: faculties }]}
                resultLabel={`${rows.length} departments`}
              />
              <DataTable columns={COLUMNS} rows={rows} minWidth={980} empty="No department matches these filters." />
            </Surface>
          </>
        )}
      </LoadPanel>
    </div>
  );
}