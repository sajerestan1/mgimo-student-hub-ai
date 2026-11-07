import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Download, Search, ArrowRight } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import Panel from '@/components/admin/Panel';
import DataTable from '@/components/admin/DataTable';
import FilterSelect from '@/components/admin/FilterSelect';
import { RiskBadge, StatusByValue } from '@/components/admin/StatusPill';
import { useAdminData } from '@/lib/AdminDataContext';
import { downloadCsv, formatGpa, formatPercent } from '@/lib/exportCsv';

export default function Students() {
  const { analytics, departments, loading, error, reload } = useAdminData();
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState(() => new URLSearchParams(window.location.search).get('q') || '');

  useEffect(() => {
    const next = new URLSearchParams(location.search).get('q');
    if (next !== null) setQuery(next);
  }, [location.search]);
  const [faculty, setFaculty] = useState('all');
  const [department, setDepartment] = useState('all');
  const [year, setYear] = useState('all');
  const [status, setStatus] = useState('all');
  const [risk, setRisk] = useState('all');
  const [visible, setVisible] = useState(40);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return analytics.studentInsights
      .filter((insight) => {
        const student = insight.student;
        if (q && !(`${student.full_name} ${student.student_id} ${student.program}`.toLowerCase().includes(q))) return false;
        if (faculty !== 'all' && student.faculty_id !== faculty) return false;
        if (department !== 'all' && student.department_id !== department) return false;
        if (year !== 'all' && String(student.year) !== year) return false;
        if (status !== 'all' && student.enrollment_status !== status) return false;
        if (risk === 'flagged' && !['high', 'medium'].includes(insight.level)) return false;
        if (risk !== 'all' && risk !== 'flagged' && insight.level !== risk) return false;
        return true;
      })
      .sort((a, b) => a.student.full_name.localeCompare(b.student.full_name));
  }, [analytics.studentInsights, query, faculty, department, year, status, risk]);

  const exportRows = () => {
    downloadCsv(
      'mgimo-students.csv',
      [
        { label: 'Student', value: (row) => row.student.full_name },
        { label: 'Student ID', value: (row) => row.student.student_id },
        { label: 'Faculty', value: (row) => row.facultyName },
        { label: 'Department', value: (row) => row.departmentName },
        { label: 'Programme', value: (row) => row.student.program },
        { label: 'Year', value: (row) => row.student.year },
        { label: 'Status', value: (row) => row.student.enrollment_status },
        { label: 'GPA', value: (row) => formatGpa(row.gpa) },
        { label: 'Attendance %', value: (row) => formatPercent(row.attendanceRate) },
        { label: 'Risk', value: (row) => row.level },
      ],
      rows
    );
  };

  const departmentsForFaculty = departments.filter((item) => faculty === 'all' || item.faculty_id === faculty);

  return (
    <div>
      <PageHeader
        eyebrow="Student Management"
        title="Student directory"
        description="Search, filter and open the full academic record of any student within your authorised scope."
        actions={
          <button
            type="button"
            onClick={exportRows}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E1E8F2] bg-white px-3 py-2 text-[11.5px] font-medium text-ink hover:bg-[#F7FAFD]"
          >
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
        }
      />

      <Panel bodyClassName="p-4">
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-6">
          <div className="relative sm:col-span-2">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-mutedink" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, ID or programme"
              className="h-8 w-full rounded-lg border border-[#E1E8F2] bg-white pl-8 pr-2.5 text-[11.5px] text-ink placeholder:text-mutedink/80 focus:border-navy/40 focus:outline-none focus:ring-2 focus:ring-navy/10"
            />
          </div>
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
              ...departmentsForFaculty.map((item) => ({ value: item.id, label: item.name })),
            ]}
          />
          <FilterSelect
            label="Study year"
            value={year}
            onChange={setYear}
            options={[{ value: 'all', label: 'All years' }, ...[1, 2, 3, 4].map((value) => ({ value: String(value), label: `Year ${value}` }))]}
          />
          <FilterSelect
            label="Risk"
            value={risk}
            onChange={setRisk}
            options={[
              { value: 'all', label: 'All risk levels' },
              { value: 'flagged', label: 'Flagged (high/medium)' },
              { value: 'high', label: 'High' },
              { value: 'medium', label: 'Medium' },
              { value: 'low', label: 'Low' },
              { value: 'none', label: 'No current risk' },
            ]}
          />
          <FilterSelect
            label="Enrolment status"
            value={status}
            onChange={setStatus}
            options={[
              { value: 'all', label: 'All statuses' },
              { value: 'active', label: 'Active' },
              { value: 'academic_leave', label: 'Academic leave' },
              { value: 'graduated', label: 'Graduated' },
              { value: 'withdrawn', label: 'Withdrawn' },
            ]}
          />
        </div>

        <p className="mt-3 text-[10.5px] text-mutedink">
          {loading ? 'Loading records…' : `${rows.length} students match the current filters`}
          {error ? ` · ${error}` : ''}
        </p>
      </Panel>

      <Panel className="mt-4" bodyClassName="p-0">
        <DataTable
          onRowClick={(row) => navigate(`/students/${row.student.id}`)}
          emptyLabel={loading ? 'Loading students…' : 'No students match these filters.'}
          columns={[
            {
              key: 'name',
              label: 'Student',
              render: (row) => (
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{row.student.full_name}</p>
                  <p className="truncate text-[10px] text-mutedink">{row.student.student_id}</p>
                </div>
              ),
            },
            { key: 'faculty', label: 'Faculty', render: (row) => <span className="text-[11px]">{row.facultyName}</span> },
            { key: 'year', label: 'Year', align: 'center', render: (row) => row.student.year },
            { key: 'gpa', label: 'GPA', align: 'right', render: (row) => <span className="font-medium">{formatGpa(row.gpa)}</span> },
            { key: 'att', label: 'Attendance', align: 'right', render: (row) => formatPercent(row.attendanceRate) },
            { key: 'risk', label: 'Risk', render: (row) => <RiskBadge level={row.level} /> },
            {
              key: 'status',
              label: 'Enrolment',
              render: (row) => <StatusByValue value={row.student.enrollment_status} />,
            },
            { key: 'open', label: '', align: 'right', render: () => <ArrowRight className="ml-auto h-3.5 w-3.5 text-mutedink" /> },
          ]}
          rows={rows.slice(0, visible)}
        />
        {rows.length > visible && (
          <div className="border-t border-[#EEF2F8] p-3 text-center">
            <button
              type="button"
              onClick={() => setVisible((value) => value + 40)}
              className="rounded-lg border border-[#E1E8F2] px-3 py-1.5 text-[11.5px] font-medium text-ink hover:bg-[#F7FAFD]"
            >
              Load more ({rows.length - visible} remaining)
            </button>
          </div>
        )}
        {rows.length === 0 && error && (
          <div className="p-4 text-center">
            <button type="button" onClick={reload} className="rounded-lg bg-navy px-3 py-1.5 text-[11.5px] text-white">
              Retry loading records
            </button>
          </div>
        )}
      </Panel>
    </div>
  );
}