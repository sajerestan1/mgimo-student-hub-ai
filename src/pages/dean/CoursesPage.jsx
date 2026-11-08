import { useState } from 'react';
import PageTitle from '@/components/shell/PageTitle';
import KpiStrip from '@/components/shell/KpiStrip';
import Surface from '@/components/shell/Surface';
import StatusChip from '@/components/shell/StatusChip';
import DataTable from '@/components/dean/DataTable';
import DeanToolbar from '@/components/dean/DeanToolbar';
import LoadPanel from '@/components/dean/LoadPanel';
import { gradeTone, nf, num, pct, rateTone, readFilter, useDeanData, useDebouncedValue } from '@/lib/deanApi';

const COLUMNS = [
  {
    key: 'code',
    label: 'Course',
    render: (row) => (
      <div>
        <p className="font-medium text-ink">
          {row.code} · {row.title}
        </p>
        <p className="mt-0.5 text-[12.5px] text-mutedink">
          {row.level} · {row.credits ? `${row.credits} credits` : 'credits not set'}
        </p>
      </div>
    ),
  },
  { key: 'faculty_code', label: 'Faculty' },
  { key: 'professor', label: 'Instructor', render: (row) => <span className="text-mutedink">{row.professor}</span> },
  { key: 'enrolled', label: 'Enrolled', align: 'right' },
  {
    key: 'avgGrade',
    label: 'Avg grade',
    align: 'right',
    render: (row) => <StatusChip tone={gradeTone(row.avgGrade)}>{nf(row.avgGrade)}</StatusChip>,
  },
  { key: 'attendanceRate', label: 'Attendance', align: 'right', render: (row) => pct(row.attendanceRate) },
  {
    key: 'passRate',
    label: 'Pass rate',
    align: 'right',
    render: (row) => <StatusChip tone={rateTone(row.passRate)}>{pct(row.passRate, 0)}</StatusChip>,
  },
  {
    key: 'status',
    label: 'Status',
    align: 'right',
    render: (row) => (
      <StatusChip tone={row.status === 'published' ? 'positive' : row.status === 'archived' ? 'neutral' : 'warning'}>
        {row.status}
      </StatusChip>
    ),
  },
];

export default function CoursesPage() {
  const [query, setQuery] = useState('');
  const [faculty, setFaculty] = useState(readFilter('faculty'));
  const [level, setLevel] = useState('');
  const [status, setStatus] = useState('');
  const search = useDebouncedValue(query);

  const { data, loading, error } = useDeanData('courses', {
    q: search,
    faculty_id: faculty,
    level,
    status,
  });
  const rows = data?.rows || [];
  const facets = data?.facets || { faculties: [], levels: [], statuses: [] };
  const graded = rows.filter((row) => row.avgGrade !== null);
  const meanGrade = graded.length ? graded.reduce((total, row) => total + row.avgGrade, 0) / graded.length : null;

  return (
    <div>
      <PageTitle
        eyebrow="People"
        title="Courses"
        description="The course catalogue with enrolment, instructor and outcome. Every figure is derived from enrolments, academic records and attendance."
        meta={[data?.scope ? `Scope: ${data.scope}` : 'Institutional scope', data?.gradeNote]}
      />

      <LoadPanel loading={loading} error={error} hasData={Boolean(data)}>
        {data && (
          <>
            <KpiStrip
              columns={4}
              items={[
                { label: 'Courses', value: num(rows.length), hint: 'Matching these filters' },
                { label: 'Enrolments', value: num(rows.reduce((total, row) => total + row.enrolled, 0)), hint: 'Student places taken' },
                { label: 'Average grade', value: nf(meanGrade), hint: 'Across the selection' },
                {
                  label: 'Below pass rate',
                  value: rows.filter((row) => row.passRate !== null && row.passRate < 75).length,
                  hint: 'Courses under 75% pass',
                },
              ]}
            />

            <Surface className="mt-4" bodyClassName="p-0" title="Course catalogue">
              <DeanToolbar
                query={query}
                onQuery={setQuery}
                placeholder="Search code, title or instructor"
                filters={[
                  {
                    label: 'All faculties',
                    value: faculty,
                    onChange: setFaculty,
                    options: facets.faculties.map((item) => ({ value: item.id, label: item.name })),
                  },
                  {
                    label: 'All levels',
                    value: level,
                    onChange: setLevel,
                    options: facets.levels.map((item) => ({ value: item, label: item })),
                  },
                  {
                    label: 'Any status',
                    value: status,
                    onChange: setStatus,
                    options: facets.statuses.map((item) => ({ value: item, label: item })),
                  },
                ]}
                resultLabel={`${num(rows.length)} courses`}
              />
              {loading && <div className="h-0.5 w-full animate-pulse bg-brand/30" />}
              <DataTable columns={COLUMNS} rows={rows} minWidth={980} empty="No course matches these filters." />
            </Surface>
          </>
        )}
      </LoadPanel>
    </div>
  );
}