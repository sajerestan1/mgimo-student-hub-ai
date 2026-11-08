import PageTitle from '@/components/shell/PageTitle';
import KpiStrip from '@/components/shell/KpiStrip';
import Surface from '@/components/shell/Surface';
import StatusChip from '@/components/shell/StatusChip';
import DataTable from '@/components/dean/DataTable';
import LoadPanel from '@/components/dean/LoadPanel';
import { FacultyComparisonChart, GradeDistributionChart, TermTrendChart } from '@/components/dean/InstitutionCharts';
import { gradeTone, nf, num, pct, useDeanData } from '@/lib/deanApi';

const FACULTY_COLUMNS = [
  { key: 'name', label: 'Faculty', render: (row) => <span className="font-medium text-ink">{row.name}</span> },
  { key: 'students', label: 'Students', align: 'right' },
  {
    key: 'avgGrade',
    label: 'Avg grade',
    align: 'right',
    render: (row) => <StatusChip tone={gradeTone(row.avgGrade)}>{nf(row.avgGrade)}</StatusChip>,
  },
  { key: 'passRate', label: 'Pass rate', align: 'right', render: (row) => pct(row.passRate) },
  { key: 'attendanceRate', label: 'Attendance', align: 'right', render: (row) => pct(row.attendanceRate) },
];

const COURSE_COLUMNS = [
  {
    key: 'code',
    label: 'Course',
    render: (row) => (
      <div>
        <p className="font-medium text-ink">{row.code}</p>
        <p className="mt-0.5 text-[12.5px] text-mutedink">{row.title}</p>
      </div>
    ),
  },
  { key: 'faculty_code', label: 'Faculty', align: 'right' },
  { key: 'graded', label: 'Marks', align: 'right' },
  {
    key: 'avgGrade',
    label: 'Average',
    align: 'right',
    render: (row) => <StatusChip tone={gradeTone(row.avgGrade)}>{nf(row.avgGrade)}</StatusChip>,
  },
];

export default function PerformancePage() {
  const { data, loading, error } = useDeanData('performance');

  return (
    <div>
      <PageTitle
        eyebrow="Intelligence"
        title="Academic performance"
        description="Institutional outcome across faculties, programmes, terms and course levels, computed from every academic record in scope."
        meta={[data?.scope ? `Scope: ${data.scope}` : 'Institutional scope', data?.gradeNote]}
      />

      <LoadPanel loading={loading} error={error} hasData={Boolean(data)}>
        {data && (
          <>
            <KpiStrip
              columns={5}
              items={[
                { label: 'Average grade', value: nf(data.overall.avgGrade), hint: 'All recorded marks' },
                { label: 'Pass rate', value: pct(data.overall.passRate), hint: 'Marks at or above 60' },
                { label: 'Assessments', value: num(data.overall.assessed), hint: 'Records in scope' },
                { label: 'Students', value: num(data.overall.students), hint: 'In the academic register' },
                { label: 'Courses', value: num(data.overall.courses), hint: 'Active catalogue' },
              ]}
            />

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <Surface title="Grade trend by term" subtitle="Average mark per term, normalised" bodyClassName="px-3 pb-3 pt-2">
                <TermTrendChart rows={data.terms} />
              </Surface>
              <Surface title="Grade distribution" subtitle="Number of marks per band" bodyClassName="px-3 pb-3 pt-2">
                <GradeDistributionChart rows={data.distribution} />
              </Surface>
            </div>

            <Surface
              className="mt-4"
              title="Faculty comparison"
              subtitle="Average grade against attendance, same scale"
              bodyClassName="px-3 pb-3 pt-2"
            >
              <FacultyComparisonChart rows={data.byFaculty} />
            </Surface>

            <Surface className="mt-4" bodyClassName="p-0" title="Outcome by faculty">
              <DataTable columns={FACULTY_COLUMNS} rows={data.byFaculty} minWidth={680} empty="No faculty data in scope." />
            </Surface>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <Surface bodyClassName="p-0" title="Strongest courses" subtitle="Highest average, at least five marks">
                <DataTable columns={COURSE_COLUMNS} rows={data.strongest} minWidth={460} empty="Not enough graded courses yet." />
              </Surface>
              <Surface bodyClassName="p-0" title="Courses needing attention" subtitle="Lowest average, at least five marks">
                <DataTable columns={COURSE_COLUMNS} rows={data.weakest} minWidth={460} empty="Not enough graded courses yet." />
              </Surface>
            </div>

            <Surface className="mt-4" bodyClassName="p-0" title="Outcome by course level">
              <DataTable
                columns={[
                  { key: 'level', label: 'Level', render: (row) => <span className="font-medium capitalize text-ink">{row.level}</span> },
                  { key: 'courses', label: 'Courses', align: 'right' },
                  {
                    key: 'avgGrade',
                    label: 'Average grade',
                    align: 'right',
                    render: (row) => <StatusChip tone={gradeTone(row.avgGrade)}>{nf(row.avgGrade)}</StatusChip>,
                  },
                  { key: 'passRate', label: 'Pass rate', align: 'right', render: (row) => pct(row.passRate) },
                ]}
                rows={data.levelSplit}
                minWidth={520}
                empty="No course levels recorded."
              />
            </Surface>
          </>
        )}
      </LoadPanel>
    </div>
  );
}