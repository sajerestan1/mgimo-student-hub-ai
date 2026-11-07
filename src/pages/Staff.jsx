import { useMemo, useState } from 'react';
import { Download, GraduationCap, Clock, BookOpen, AlertTriangle } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import Panel from '@/components/admin/Panel';
import DataTable from '@/components/admin/DataTable';
import KpiCard from '@/components/admin/KpiCard';
import FilterSelect from '@/components/admin/FilterSelect';
import SimpleModal from '@/components/admin/SimpleModal';
import { StatusByValue } from '@/components/admin/StatusPill';
import { useAdminData } from '@/lib/AdminDataContext';
import { downloadCsv } from '@/lib/exportCsv';

export default function Staff() {
  const { analytics, departments, loading } = useAdminData();
  const [faculty, setFaculty] = useState('all');
  const [department, setDepartment] = useState('all');
  const [employment, setEmployment] = useState('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);

  const rows = useMemo(
    () =>
      analytics.professorRows
        .filter((professor) => {
          const q = query.trim().toLowerCase();
          if (q && !`${professor.full_name} ${professor.title}`.toLowerCase().includes(q)) return false;
          if (faculty !== 'all' && professor.faculty_id !== faculty) return false;
          if (department !== 'all' && professor.department_id !== department) return false;
          if (employment !== 'all' && professor.employment_status !== employment) return false;
          return true;
        })
        .sort((a, b) => a.full_name.localeCompare(b.full_name)),
    [analytics.professorRows, faculty, department, employment, query]
  );

  if (loading) return <div className="h-64 animate-pulse rounded-2xl bg-white" />;

  const fullTime = analytics.professorRows.filter((professor) => professor.employment_status === 'full_time').length;
  const avgHours = analytics.professorRows.length
    ? analytics.professorRows.reduce((sum, professor) => sum + professor.totalHours, 0) / analytics.professorRows.length
    : 0;

  const exportStaff = () => {
    downloadCsv(
      'mgimo-staff-workload.csv',
      [
        { label: 'Staff member', value: (row) => row.full_name },
        { label: 'Title', value: (row) => row.title },
        { label: 'Faculty', value: (row) => row.facultyName },
        { label: 'Department', value: (row) => row.departmentName },
        { label: 'Employment', value: (row) => row.employment_status },
        { label: 'Courses', value: (row) => row.courseCount },
        { label: 'Credits', value: (row) => row.credits },
        { label: 'Weekly hours', value: (row) => row.weekly_hours },
        { label: 'Teaching load', value: (row) => row.totalHours },
      ],
      rows
    );
  };

  return (
    <div>
      <PageHeader
        eyebrow="Professors & Staff"
        title="Academic staff management"
        description="Staff directory, department assignments, teaching workload and course coverage across the university."
        actions={
          <button
            type="button"
            onClick={exportStaff}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E1E8F2] bg-white px-3 py-2 text-[11.5px] font-medium text-ink hover:bg-[#F7FAFD]"
          >
            <Download className="h-3.5 w-3.5" /> Export workload
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Academic staff" value={analytics.kpis.totalStaff} caption="all employment types" icon={GraduationCap} />
        <KpiCard label="Full-time" value={fullTime} caption="permanent academic staff" icon={GraduationCap} accent="green" />
        <KpiCard label="Average teaching load" value={`${avgHours.toFixed(1)} h`} caption="weekly hours plus credits" icon={Clock} accent="gold" />
        <KpiCard
          label="Courses without professor"
          value={analytics.coursesWithoutProfessor.length}
          caption="unassigned course offerings"
          icon={AlertTriangle}
          accent={analytics.coursesWithoutProfessor.length ? 'red' : 'navy'}
        />
      </div>

      <Panel className="mt-4" bodyClassName="p-4">
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search staff member"
            className="h-8 rounded-lg border border-[#E1E8F2] px-2.5 text-[11.5px] focus:border-navy/40 focus:outline-none"
          />
          <FilterSelect
            label="Faculty"
            value={faculty}
            onChange={(value) => {
              setFaculty(value);
              setDepartment('all');
            }}
            options={[{ value: 'all', label: 'All faculties' }, ...analytics.facultyRows.map((row) => ({ value: row.id, label: row.code }))]}
          />
          <FilterSelect
            label="Department"
            value={department}
            onChange={setDepartment}
            options={[
              { value: 'all', label: 'All departments' },
              ...departments
                .filter((item) => faculty === 'all' || item.faculty_id === faculty)
                .map((item) => ({ value: item.id, label: item.name })),
            ]}
          />
          <FilterSelect
            label="Employment"
            value={employment}
            onChange={setEmployment}
            options={[
              { value: 'all', label: 'All employment types' },
              { value: 'full_time', label: 'Full-time' },
              { value: 'part_time', label: 'Part-time' },
              { value: 'visiting', label: 'Visiting' },
            ]}
          />
        </div>
      </Panel>

      <Panel className="mt-4" title="Staff directory" subtitle={`${rows.length} staff members`} bodyClassName="p-0">
        <DataTable
          onRowClick={setSelected}
          columns={[
            {
              key: 'name',
              label: 'Staff member',
              render: (row) => (
                <div>
                  <p className="font-medium text-ink">{row.full_name}</p>
                  <p className="text-[10px] text-mutedink">{row.title}</p>
                </div>
              ),
            },
            { key: 'faculty', label: 'Faculty', render: (row) => <span className="text-[11px]">{row.facultyName}</span> },
            { key: 'department', label: 'Department', render: (row) => <span className="text-[11px]">{row.departmentName}</span> },
            { key: 'status', label: 'Employment', render: (row) => <StatusByValue value={row.employment_status} /> },
            { key: 'courses', label: 'Courses', align: 'center', render: (row) => row.courseCount },
            { key: 'credits', label: 'Credits', align: 'center', render: (row) => row.credits },
            { key: 'hours', label: 'Weekly h', align: 'right', render: (row) => row.weekly_hours },
            { key: 'load', label: 'Teaching load', align: 'right', render: (row) => <span className="font-semibold">{row.totalHours} h</span> },
          ]}
          rows={rows}
        />
      </Panel>

      <SimpleModal open={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.full_name} subtitle={selected?.title}>
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-[11.5px]">
              {[
                ['Faculty', selected.facultyName],
                ['Department', selected.departmentName],
                ['Employment', selected.employment_status.replace(/_/g, ' ')],
                ['Hire date', selected.hire_date],
                ['Weekly contact hours', selected.weekly_hours],
                ['Teaching load', `${selected.totalHours} h`],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-[9.5px] uppercase tracking-[0.12em] text-mutedink">{label}</p>
                  <p className="mt-0.5 capitalize text-ink">{value || '—'}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="mb-1.5 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-mutedink">
                <BookOpen className="h-3 w-3" /> Assigned courses ({selected.courses.length})
              </p>
              {selected.courses.length === 0 ? (
                <p className="text-[11.5px] text-mutedink">No course assignments recorded.</p>
              ) : (
                <ul className="space-y-1">
                  {selected.courses.map((course) => (
                    <li key={course.id} className="flex items-center justify-between gap-2 rounded-lg border border-[#EEF2F8] px-2.5 py-1.5">
                      <span className="truncate text-[11.5px] text-ink">
                        {course.code} · {course.title}
                      </span>
                      <span className="shrink-0 text-[10px] text-mutedink">{course.credits} credits</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <p className="text-[10px] text-mutedink">
              Workload is calculated from stored course credits and recorded weekly contact hours. No performance
              evaluations are inferred from this data.
            </p>
          </div>
        )}
      </SimpleModal>
    </div>
  );
}