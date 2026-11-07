import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Percent, Award, AlertTriangle } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import Panel from '@/components/admin/Panel';
import DataTable from '@/components/admin/DataTable';
import KpiCard from '@/components/admin/KpiCard';
import FilterSelect from '@/components/admin/FilterSelect';
import { RiskBadge } from '@/components/admin/StatusPill';
import { BarBlock, DonutBlock, ChartLegend } from '@/components/charts/Charts';
import { useAdminData } from '@/lib/AdminDataContext';
import { formatGpa, formatPercent } from '@/lib/exportCsv';

const mean = (values) => (values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null);
const pct = (part, total) => (total ? (part / total) * 100 : null);

export default function Performance() {
  const { analytics, academicRecords, courses, loading } = useAdminData();
  const navigate = useNavigate();
  const [faculty, setFaculty] = useState('all');

  const scopedRecords = useMemo(
    () => academicRecords.filter((record) => faculty === 'all' || record.faculty_id === faculty),
    [academicRecords, faculty]
  );

  const courseStats = useMemo(() => {
    const current = scopedRecords.filter((record) => record.term === analytics.currentTermLabel);
    return courses
      .filter((course) => faculty === 'all' || course.faculty_id === faculty)
      .map((course) => {
        const rows = current.filter((record) => record.course_id === course.id);
        return {
          id: course.id,
          code: course.code,
          title: course.title,
          facultyName: analytics.facultyById[course.faculty_id]?.code || '—',
          graded: rows.length,
          passRate: pct(rows.filter((record) => Number(record.grade) >= 3).length, rows.length),
          avg: mean(rows.map((record) => Number(record.grade))),
        };
      })
      .filter((course) => course.graded > 0)
      .sort((a, b) => (a.passRate || 0) - (b.passRate || 0));
  }, [scopedRecords, courses, faculty, analytics.currentTermLabel, analytics.facultyById]);

  const semesterComparison = useMemo(() => {
    const rows = (faculty === 'all' ? analytics.facultyRows : analytics.facultyRows.filter((row) => row.id === faculty)).map((row) => {
      const currentRows = academicRecords.filter(
        (record) => record.faculty_id === row.id && record.term === analytics.currentTermLabel
      );
      const previousRows = academicRecords.filter(
        (record) => record.faculty_id === row.id && record.term === '2025/2026 · Spring'
      );
      return {
        label: row.code,
        current: mean(currentRows.map((record) => Number(record.grade))),
        previous: mean(previousRows.map((record) => Number(record.grade))),
      };
    });
    return rows;
  }, [analytics.facultyRows, academicRecords, faculty, analytics.currentTermLabel]);

  if (loading) return <div className="h-64 animate-pulse rounded-2xl bg-white" />;

  const { kpis, gradeDistribution, examStats } = analytics;
  const flagged = analytics.studentInsights
    .filter((insight) => ['high', 'medium'].includes(insight.level))
    .sort((a, b) => (a.gpa || 5) - (b.gpa || 5))
    .slice(0, 12);

  const comparisonData = semesterComparison.flatMap((row) =>
    row.current && row.previous
      ? [
          { label: row.label, value: Number(row.current.toFixed(2)) },
          { label: `${row.label} prev`, value: Number(row.previous.toFixed(2)) },
        ]
      : [{ label: row.label, value: Number((row.current || 0).toFixed(2)) }]
  );

  return (
    <div>
      <PageHeader
        eyebrow="Academic Performance"
        title="Performance analytics"
        description="All figures are calculated from stored grade records for the current and previous semester."
        actions={
          <FilterSelect
            label="Faculty"
            value={faculty}
            onChange={setFaculty}
            options={[{ value: 'all', label: 'All faculties' }, ...analytics.facultyRows.map((row) => ({ value: row.id, label: row.code }))]}
            className="w-40"
          />
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Average performance" value={`${formatGpa(kpis.avgGpa)} / 5`} caption="current semester" icon={TrendingUp} />
        <KpiCard label="Course pass rate" value={formatPercent(kpis.passRate)} caption="grades of 3 and above" icon={Percent} accent="green" />
        <KpiCard label="Examination pass rate" value={formatPercent(examStats.passRate)} caption={`${examStats.count} exam records`} icon={Award} accent="gold" />
        <KpiCard
          label="Students below review threshold"
          value={kpis.atRisk}
          caption={`GPA below ${analytics.thresholds.gpaMedium.toFixed(1)} or attendance concerns`}
          icon={AlertTriangle}
          accent="red"
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel title="Faculty performance comparison" subtitle="Average grade, current semester" className="lg:col-span-2" bodyClassName="p-3">
          <BarBlock
            data={semesterComparison.map((row) => ({ label: row.label, value: Number((row.current || 0).toFixed(2)) }))}
            height={220}
            onSelect={() => navigate('/faculties')}
          />
        </Panel>
        <Panel title="Grade distribution" subtitle="Current semester" bodyClassName="p-3">
          <DonutBlock
            data={gradeDistribution}
            height={155}
            colors={['#102D50', '#4C79A8', '#D8B66A', '#B05C5A']}
            centerValue={formatGpa(kpis.avgGpa)}
            centerLabel="avg GPA"
          />
          <ChartLegend data={gradeDistribution} colors={['#102D50', '#4C79A8', '#D8B66A', '#B05C5A']} />
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Semester comparison" subtitle="Current versus previous semester average grade" bodyClassName="p-3">
          <BarBlock data={comparisonData} height={220} color="#183B63" />
        </Panel>
        <Panel title="Course pass rates" subtitle="Lowest performing courses first" bodyClassName="p-0">
          <DataTable
            dense
            emptyLabel="No graded course records in scope."
            columns={[
              { key: 'code', label: 'Course', render: (row) => <span className="font-medium">{row.code}</span> },
              { key: 'title', label: 'Title', render: (row) => <span className="text-[11px]">{row.title}</span> },
              { key: 'graded', label: 'Graded', align: 'center', render: (row) => row.graded },
              { key: 'pass', label: 'Pass rate', align: 'right', render: (row) => formatPercent(row.passRate) },
              { key: 'avg', label: 'Avg grade', align: 'right', render: (row) => formatGpa(row.avg) },
            ]}
            rows={courseStats}
          />
        </Panel>
      </div>

      <Panel className="mt-4" title="Academic risk identification" subtitle="Students with high or medium indicators — evidence available in the profile" bodyClassName="p-0">
        <DataTable
          dense
          onRowClick={(row) => navigate(`/students/${row.student.id}`)}
          emptyLabel="No students currently flagged."
          columns={[
            { key: 'name', label: 'Student', render: (row) => <span className="font-medium">{row.student.full_name}</span> },
            { key: 'faculty', label: 'Faculty', render: (row) => <span className="text-[11px]">{row.facultyName}</span> },
            { key: 'year', label: 'Year', align: 'center', render: (row) => row.student.year },
            { key: 'gpa', label: 'GPA', align: 'right', render: (row) => formatGpa(row.gpa) },
            { key: 'att', label: 'Attendance', align: 'right', render: (row) => formatPercent(row.attendanceRate) },
            { key: 'fails', label: 'Failed', align: 'center', render: (row) => row.failed },
            { key: 'risk', label: 'Risk', align: 'right', render: (row) => <RiskBadge level={row.level} /> },
          ]}
          rows={flagged}
        />
      </Panel>
    </div>
  );
}