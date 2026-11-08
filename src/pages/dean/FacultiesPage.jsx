import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import PageTitle from '@/components/shell/PageTitle';
import KpiStrip from '@/components/shell/KpiStrip';
import Surface from '@/components/shell/Surface';
import StatusChip from '@/components/shell/StatusChip';
import DataTable from '@/components/dean/DataTable';
import LoadPanel from '@/components/dean/LoadPanel';
import { FacultyComparisonChart } from '@/components/dean/InstitutionCharts';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';
import { gradeTone, nf, num, pct, useDeanData } from '@/lib/deanApi';

const COLUMNS = [
  {
    key: 'name',
    label: 'Faculty',
    render: (row) => (
      <div>
        <p className="font-medium text-ink">{row.name}</p>
        <p className="mt-0.5 text-[12.5px] text-mutedink">
          {row.code} · Dean {row.dean_name}
          {row.established ? ` · est. ${row.established}` : ''}
        </p>
      </div>
    ),
  },
  { key: 'departments', label: 'Departments', align: 'right' },
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
      <Link to={`${P.dean.departments}?faculty=${row.id}`} className="link-quiet whitespace-nowrap">
        Departments <ArrowRight className="h-3 w-3" />
      </Link>
    ),
  },
];

export default function FacultiesPage() {
  const { data, loading, error } = useDeanData('faculties');
  const rows = data?.rows || [];
  const staff = rows.reduce((total, row) => total + row.professors, 0);
  const students = rows.reduce((total, row) => total + row.students, 0);
  const departments = rows.reduce((total, row) => total + row.departments, 0);
  const atRisk = rows.reduce((total, row) => total + row.atRisk, 0);
  const graded = rows.filter((row) => row.avgGrade !== null);
  const meanGrade = graded.length
    ? graded.reduce((total, row) => total + row.avgGrade, 0) / graded.length
    : null;

  return (
    <div>
      <PageTitle
        eyebrow="Academic structure"
        title="Faculties"
        description="Every school in the institution with its departments, population, teaching load and academic health. Open a faculty to inspect its departments."
        meta={[data?.scope ? `Scope: ${data.scope}` : 'Institutional scope', data?.gradeNote]}
      />

      <LoadPanel loading={loading} error={error} hasData={Boolean(data)}>
        {data && (
          <>
            <KpiStrip
              columns={6}
              items={[
                { label: 'Faculties', value: rows.length, hint: `${departments} departments` },
                { label: 'Students', value: num(students), hint: 'Active enrolment records' },
                { label: 'Academic staff', value: staff, hint: 'Professors and lecturers' },
                { label: 'Average grade', value: nf(meanGrade), hint: 'Mean of faculty averages' },
                { label: 'Students at risk', value: atRisk, hint: 'Below grade or attendance threshold' },
                {
                  label: 'Coverage',
                  value: `${rows.filter((row) => row.avgGrade !== null).length}/${rows.length}`,
                  hint: 'Faculties with recorded marks',
                },
              ]}
            />

            <Surface
              className="mt-4"
              title="Average grade and attendance by faculty"
              subtitle="Both measures on the same 0–100 scale"
              bodyClassName="px-3 pb-3 pt-2"
            >
              <FacultyComparisonChart rows={rows} height={230} />
            </Surface>

            <Surface className="mt-4" bodyClassName="p-0" title="Faculty register" subtitle={`${rows.length} faculties`}>
              <LoadPanel loading={loading} error={null} hasData={Boolean(data)}>
                <DataTable columns={COLUMNS} rows={rows} minWidth={980} empty="No faculties are recorded yet." />
              </LoadPanel>
            </Surface>
          </>
        )}
      </LoadPanel>
    </div>
  );
}