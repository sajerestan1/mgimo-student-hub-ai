import { useState } from 'react';
import { ShieldCheck, SlidersHorizontal, History } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import Panel from '@/components/admin/Panel';
import DataTable from '@/components/admin/DataTable';
import { useAdminData } from '@/lib/AdminDataContext';
import { roleLabel, NAV_ITEMS } from '@/lib/roles';

const PERMISSIONS = [
  ['Dean', 'Institution-wide', 'Full', 'Full', 'Approve / reject', 'Full'],
  ['Deputy Dean', 'Institution-wide', 'Full', 'Full', 'Approve / reject', 'Full'],
  ['Faculty Administrator', 'Assigned faculty', 'Assigned faculty', 'Within faculty', 'Within faculty', 'No'],
  ['Department Head', 'Assigned department', 'Assigned department', 'Within department', 'No', 'No'],
  ['Professor', 'Assigned courses', 'Assigned courses', 'Own courses', 'No', 'No'],
  ['Academic Staff', 'Institution-wide', 'Full', 'Full', 'Process requests', 'Thresholds'],
  ['Student', 'Own record only', 'Own record only', 'No', 'Own submissions', 'No'],
];

export default function Settings() {
  const { me, role, rawRole, analytics, settings, updateSetting, auditLogs, requests, students, academicRecords, attendanceRecords, faculties, courses, loading } =
    useAdminData();
  const [editing, setEditing] = useState({});

  if (loading) return <div className="h-64 animate-pulse rounded-2xl bg-white" />;

  const save = async (setting) => {
    const value = editing[setting.id];
    if (value === undefined || value === setting.value) return;
    await updateSetting(setting, String(value));
    setEditing((prev) => {
      const next = { ...prev };
      delete next[setting.id];
      return next;
    });
  };

  return (
    <div>
      <PageHeader
        eyebrow="Administration & Settings"
        title="Governance, access and thresholds"
        description="Access rules enforced by backend record policies, configurable risk thresholds and the administrative audit trail."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Your access" subtitle="Enforced by the application, not by interface visibility" bodyClassName="p-4">
          <div className="space-y-2 text-[11.5px]">
            <div className="flex justify-between rounded-lg bg-[#F7FAFD] px-2.5 py-2">
              <span className="text-mutedink">Signed in as</span>
              <span className="font-medium text-ink">{me?.full_name || me?.email}</span>
            </div>
            <div className="flex justify-between rounded-lg bg-[#F7FAFD] px-2.5 py-2">
              <span className="text-mutedink">Administrative role</span>
              <span className="font-medium capitalize text-ink">{roleLabel(role)}</span>
            </div>
            <div className="flex justify-between rounded-lg bg-[#F7FAFD] px-2.5 py-2">
              <span className="text-mutedink">Stored role value</span>
              <span className="font-medium text-ink">{rawRole}</span>
            </div>
            <div className="flex justify-between rounded-lg bg-[#F7FAFD] px-2.5 py-2">
              <span className="text-mutedink">Modules available</span>
              <span className="font-medium text-ink">{NAV_ITEMS.filter((item) => item.roles.includes(role)).length}</span>
            </div>
          </div>
          <p className="mt-2.5 text-[10px] leading-relaxed text-mutedink">
            Every institutional entity carries record policies: staff roles read institution-wide or faculty/department-scoped
            data, professors read assigned academic records, and students can only read their own records.
          </p>
        </Panel>

        <Panel title="Risk and attendance thresholds" subtitle="Used by the Academic Risk Radar and attendance alerts" className="lg:col-span-2" bodyClassName="p-4">
          <div className="space-y-2">
            {settings.map((setting) => (
              <div key={setting.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-[#EEF2F8] px-2.5 py-2">
                <div className="min-w-0 flex-1">
                  <p className="text-[11.5px] font-medium text-ink">{setting.label || setting.key}</p>
                  <p className="text-[10px] text-mutedink">{setting.description}</p>
                </div>
                <input
                  value={editing[setting.id] ?? setting.value}
                  onChange={(event) => setEditing((prev) => ({ ...prev, [setting.id]: event.target.value }))}
                  className="h-8 w-20 rounded-lg border border-[#E1E8F2] px-2 text-right text-[11.5px]"
                />
                <button
                  type="button"
                  disabled={editing[setting.id] === undefined || editing[setting.id] === setting.value}
                  onClick={() => save(setting)}
                  className="rounded-lg bg-navy px-2.5 py-1.5 text-[10.5px] font-medium text-white disabled:opacity-40"
                >
                  Save
                </button>
              </div>
            ))}
            {settings.length === 0 && <p className="text-[11.5px] text-mutedink">No thresholds configured.</p>}
          </div>
          <p className="mt-2 inline-flex items-center gap-1.5 text-[10px] text-mutedink">
            <SlidersHorizontal className="h-3 w-3" /> Changes apply immediately to risk and attendance indicators and are written to the
            audit log.
          </p>
        </Panel>
      </div>

      <Panel className="mt-4" title="Role-based access matrix" subtitle="Scope of access per administrative role" bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-[11.5px]">
            <thead>
              <tr className="border-b border-[#E9EFF7] bg-[#F7FAFD]">
                {['Role', 'Institutional data', 'Student records', 'Attendance', 'Requests', 'Settings'].map((column) => (
                  <th key={column} className="px-3 py-2 text-[9.5px] font-semibold uppercase tracking-[0.12em] text-mutedink">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS.map((row) => (
                <tr key={row[0]} className="border-b border-[#F1F5FA] last:border-0">
                  {row.map((cell, index) => (
                    <td key={index} className={`px-3 py-2 ${index === 0 ? 'font-medium text-ink' : 'text-mutedink'}`}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Administrative audit trail" subtitle="Every decision and correction recorded in this session" bodyClassName="p-0">
          <DataTable
            dense
            emptyLabel="No administrative actions recorded yet. Approve a request or correct attendance to see entries here."
            columns={[
              { key: 'action', label: 'Action', render: (row) => <span className="font-medium">{row.action}</span> },
              { key: 'target', label: 'Target', render: (row) => <span className="text-[10.5px] text-mutedink">{row.target}</span> },
              { key: 'actor', label: 'By', render: (row) => <span className="text-[10.5px]">{row.actor_name}</span> },
              {
                key: 'date',
                label: 'When',
                align: 'right',
                render: (row) => (
                  <span className="text-[10px] text-mutedink">
                    {row.logged_at ? new Date(row.logged_at).toLocaleString('en-GB') : '—'}
                  </span>
                ),
              },
            ]}
            rows={auditLogs.slice(0, 12)}
          />
        </Panel>

        <Panel title="Data integrity" subtitle="What this environment contains" bodyClassName="p-4">
          <div className="space-y-2 text-[11.5px]">
            {[
              ['Faculties', faculties.length],
              ['Departments', analytics.kpis.departmentCount],
              ['Student records', students.length],
              ['Course offerings', courses.length],
              ['Academic records', academicRecords.length],
              ['Attendance sessions', attendanceRecords.length],
              ['Requests recorded', requests.length],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between rounded-lg bg-[#F7FAFD] px-2.5 py-2">
                <span className="text-mutedink">{label}</span>
                <span className="font-medium text-ink">{value}</span>
              </div>
            ))}
          </div>
          <p className="mt-2.5 flex gap-1.5 rounded-lg bg-[#FCF3DF]/60 px-2.5 py-2 text-[10.5px] leading-relaxed text-[#8A6C26]">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            All records are synthetic demonstration data for Digital Dean, a fictional institution. They do not represent
            any real university, its students, staff or statistics.
          </p>
          <p className="mt-2 inline-flex items-center gap-1.5 text-[10px] text-mutedink">
            <History className="h-3 w-3" /> Administrative actions are attributable and auditable.
          </p>
        </Panel>
      </div>
    </div>
  );
}