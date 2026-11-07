import { useState } from 'react';
import { Building2, Plus, Users, GraduationCap, Pencil } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import Panel from '@/components/admin/Panel';
import DataTable from '@/components/admin/DataTable';
import KpiCard from '@/components/admin/KpiCard';
import SimpleModal from '@/components/admin/SimpleModal';
import { useAdminData } from '@/lib/AdminDataContext';
import { formatGpa, formatPercent } from '@/lib/exportCsv';

const EMPTY_FACULTY = { name: '', code: '', dean_name: '', established: new Date().getFullYear(), description: '' };
const EMPTY_DEPT = { name: '', code: '', head_name: '', faculty_id: '' };

export default function Faculties() {
  const { analytics, faculties, departments, professors, courses, requests, saveFaculty, saveDepartment, loading } =
    useAdminData();
  const [selectedId, setSelectedId] = useState(null);
  const [facultyForm, setFacultyForm] = useState(null);
  const [deptForm, setDeptForm] = useState(null);
  const [saving, setSaving] = useState(false);

  if (loading) return <div className="h-64 animate-pulse rounded-2xl bg-white" />;

  const rows = analytics.facultyRows;
  const selected = rows.find((row) => row.id === selectedId) || rows[0];
  const selectedFaculty = faculties.find((faculty) => faculty.id === selected?.id);
  const facultyDepartments = departments.filter((dept) => dept.faculty_id === selected?.id);
  const facultyStaff = professors.filter((professor) => professor.faculty_id === selected?.id);
  const facultyCourses = courses.filter((course) => course.faculty_id === selected?.id);
  const facultyRequests = requests.filter((request) => request.faculty_id === selected?.id);

  const submitFaculty = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await saveFaculty(
        {
          name: facultyForm.name,
          code: facultyForm.code,
          dean_name: facultyForm.dean_name,
          established: Number(facultyForm.established) || null,
          description: facultyForm.description,
        },
        facultyForm.id
      );
      setFacultyForm(null);
    } finally {
      setSaving(false);
    }
  };

  const submitDepartment = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await saveDepartment(
        {
          name: deptForm.name,
          code: deptForm.code,
          head_name: deptForm.head_name,
          faculty_id: deptForm.faculty_id || selected?.id,
        },
        deptForm.id
      );
      setDeptForm(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Faculties & Departments"
        title="Faculty management"
        description="Faculty and department profiles, academic leadership, population, performance and administrative workload."
        actions={
          <button
            type="button"
            onClick={() => setFacultyForm({ ...EMPTY_FACULTY })}
            className="inline-flex items-center gap-1.5 rounded-lg bg-navy px-3.5 py-2 text-[11.5px] font-medium text-white hover:bg-navy-mid"
          >
            <Plus className="h-3.5 w-3.5" /> Add faculty
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Faculties" value={analytics.kpis.facultyCount} caption="academic schools" icon={Building2} accent="navy" />
        <KpiCard label="Departments" value={analytics.kpis.departmentCount} caption="across all faculties" icon={Building2} accent="gold" />
        <KpiCard label="Students" value={analytics.kpis.totalStudents} caption="active enrolments" icon={Users} accent="navy" />
        <KpiCard label="Academic staff" value={analytics.kpis.totalStaff} caption="professors and lecturers" icon={GraduationCap} accent="gold" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel title="Faculty directory" subtitle="Select a faculty to inspect" bodyClassName="p-0">
          <ul className="divide-y divide-[#F1F5FA]">
            {rows.map((row) => (
              <li key={row.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(row.id)}
                  className={`flex w-full items-start justify-between gap-2 px-4 py-3 text-left transition-colors ${
                    selected?.id === row.id ? 'bg-[#F5F8FC]' : 'hover:bg-[#F9FBFD]'
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-[12.5px] font-medium text-ink">{row.name}</span>
                    <span className="mt-0.5 block truncate text-[10.5px] text-mutedink">
                      {row.code} · {row.departmentCount} departments · {row.deanName || 'dean not assigned'}
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block text-[13px] font-semibold text-ink">{formatGpa(row.avgGpa)}</span>
                    <span className="block text-[9px] uppercase tracking-[0.1em] text-mutedink">avg GPA</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Panel>

        <div className="space-y-4 lg:col-span-2">
          {selected && (
            <Panel
              title={selected.name}
              subtitle={selectedFaculty?.description || 'Faculty profile'}
              actions={
                <button
                  type="button"
                  onClick={() => setFacultyForm({ ...selectedFaculty })}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#E1E8F2] px-2.5 py-1.5 text-[11px] font-medium text-ink hover:bg-[#F7FAFD]"
                >
                  <Pencil className="h-3 w-3" /> Edit
                </button>
              }
              bodyClassName="p-4"
            >
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  ['Dean', selected.deanName || 'Not assigned'],
                  ['Students', selected.studentCount],
                  ['Staff', selected.staffCount],
                  ['Departments', selected.departmentCount],
                  ['Attendance', formatPercent(selected.attendanceRate)],
                  ['Pass rate', formatPercent(selected.passRate)],
                  ['At risk', selected.riskCount],
                  ['Requests', selected.requestCount],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg bg-[#F7FAFD] px-2.5 py-2">
                    <p className="text-[9px] uppercase tracking-[0.1em] text-mutedink">{label}</p>
                    <p className="mt-0.5 text-[12.5px] font-semibold text-ink">{value}</p>
                  </div>
                ))}
              </div>
              {facultyCourses.length > 0 && (
                <p className="mt-3 text-[10.5px] text-mutedink">
                  Courses offered: {facultyCourses.map((course) => course.code).join(', ')}
                </p>
              )}
            </Panel>
          )}

          <Panel
            title="Departments"
            subtitle="Department profiles and academic leadership"
            actions={
              <button
                type="button"
                onClick={() => setDeptForm({ ...EMPTY_DEPT, faculty_id: selected?.id })}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#E1E8F2] px-2.5 py-1.5 text-[11px] font-medium text-ink hover:bg-[#F7FAFD]"
              >
                <Plus className="h-3 w-3" /> Add
              </button>
            }
            bodyClassName="p-0"
          >
            <DataTable
              dense
              onRowClick={(row) => setDeptForm({ ...departments.find((dept) => dept.id === row.id) })}
              emptyLabel="No departments recorded for this faculty."
              columns={[
                { key: 'name', label: 'Department', render: (row) => <span className="font-medium">{row.name}</span> },
                { key: 'head', label: 'Head', render: (row) => row.headName || '—' },
                { key: 'students', label: 'Students', align: 'right' },
                { key: 'staff', label: 'Staff', align: 'right' },
                { key: 'gpa', label: 'Avg GPA', align: 'right', render: (row) => formatGpa(row.avgGpa) },
                { key: 'att', label: 'Attendance', align: 'right', render: (row) => formatPercent(row.attendanceRate) },
                { key: 'risk', label: 'At risk', align: 'right' },
              ]}
              rows={analytics.departmentRows.filter((row) => row.facultyId === selected?.id)}
            />
          </Panel>

          <Panel title="Faculty staff and requests" bodyClassName="p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-mutedink">Academic staff ({facultyStaff.length})</p>
                <ul className="mt-1.5 space-y-1">
                  {facultyStaff.slice(0, 6).map((professor) => (
                    <li key={professor.id} className="flex items-center justify-between gap-2 text-[11.5px]">
                      <span className="truncate text-ink">{professor.full_name}</span>
                      <span className="shrink-0 text-[10px] text-mutedink">{professor.title}</span>
                    </li>
                  ))}
                  {facultyStaff.length === 0 && <li className="text-[11.5px] text-mutedink">No staff assigned.</li>}
                </ul>
              </div>
              <div>
                <p className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-mutedink">
                  Administrative requests ({facultyRequests.length})
                </p>
                <ul className="mt-1.5 space-y-1">
                  {facultyRequests.slice(0, 6).map((request) => (
                    <li key={request.id} className="flex items-center justify-between gap-2 text-[11.5px]">
                      <span className="truncate text-ink">{request.category}</span>
                      <span className="shrink-0 text-[10px] capitalize text-mutedink">{request.status.replace(/_/g, ' ')}</span>
                    </li>
                  ))}
                  {facultyRequests.length === 0 && <li className="text-[11.5px] text-mutedink">No requests recorded.</li>}
                </ul>
              </div>
            </div>
          </Panel>
        </div>
      </div>

      <SimpleModal
        open={Boolean(facultyForm)}
        onClose={() => setFacultyForm(null)}
        title={facultyForm?.id ? 'Edit faculty' : 'Add faculty'}
        subtitle="Demonstration records — changes are stored in the application database."
      >
        {facultyForm && (
          <form onSubmit={submitFaculty} className="space-y-3">
            {[
              ['name', 'Faculty name'],
              ['code', 'Short code'],
              ['dean_name', 'Dean'],
            ].map(([field, label]) => (
              <label key={field} className="block">
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-mutedink">{label}</span>
                <input
                  required={field !== 'dean_name'}
                  value={facultyForm[field] || ''}
                  onChange={(event) => setFacultyForm((prev) => ({ ...prev, [field]: event.target.value }))}
                  className="mt-1 h-9 w-full rounded-lg border border-[#E1E8F2] px-2.5 text-[12px] text-ink focus:border-navy/40 focus:outline-none"
                />
              </label>
            ))}
            <label className="block">
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-mutedink">Established</span>
              <input
                type="number"
                value={facultyForm.established || ''}
                onChange={(event) => setFacultyForm((prev) => ({ ...prev, established: event.target.value }))}
                className="mt-1 h-9 w-full rounded-lg border border-[#E1E8F2] px-2.5 text-[12px]"
              />
            </label>
            <label className="block">
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-mutedink">Description</span>
              <textarea
                value={facultyForm.description || ''}
                onChange={(event) => setFacultyForm((prev) => ({ ...prev, description: event.target.value }))}
                rows={3}
                className="mt-1 w-full rounded-lg border border-[#E1E8F2] px-2.5 py-2 text-[12px]"
              />
            </label>
            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={() => setFacultyForm(null)} className="rounded-lg border border-[#E1E8F2] px-3 py-2 text-[11.5px]">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="rounded-lg bg-navy px-3.5 py-2 text-[11.5px] font-medium text-white disabled:opacity-60">
                {saving ? 'Saving…' : 'Save faculty'}
              </button>
            </div>
          </form>
        )}
      </SimpleModal>

      <SimpleModal
        open={Boolean(deptForm)}
        onClose={() => setDeptForm(null)}
        title={deptForm?.id ? 'Edit department' : 'Add department'}
      >
        {deptForm && (
          <form onSubmit={submitDepartment} className="space-y-3">
            {[
              ['name', 'Department name'],
              ['code', 'Short code'],
              ['head_name', 'Department head'],
            ].map(([field, label]) => (
              <label key={field} className="block">
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-mutedink">{label}</span>
                <input
                  required={field !== 'head_name'}
                  value={deptForm[field] || ''}
                  onChange={(event) => setDeptForm((prev) => ({ ...prev, [field]: event.target.value }))}
                  className="mt-1 h-9 w-full rounded-lg border border-[#E1E8F2] px-2.5 text-[12px]"
                />
              </label>
            ))}
            <label className="block">
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-mutedink">Faculty</span>
              <select
                value={deptForm.faculty_id || ''}
                onChange={(event) => setDeptForm((prev) => ({ ...prev, faculty_id: event.target.value }))}
                className="mt-1 h-9 w-full rounded-lg border border-[#E1E8F2] px-2.5 text-[12px]"
              >
                {faculties.map((faculty) => (
                  <option key={faculty.id} value={faculty.id}>
                    {faculty.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={() => setDeptForm(null)} className="rounded-lg border border-[#E1E8F2] px-3 py-2 text-[11.5px]">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="rounded-lg bg-navy px-3.5 py-2 text-[11.5px] font-medium text-white disabled:opacity-60">
                {saving ? 'Saving…' : 'Save department'}
              </button>
            </div>
          </form>
        )}
      </SimpleModal>
    </div>
  );
}