import { useEffect, useState } from 'react';
import { ShieldCheck, UserCog } from 'lucide-react';
import { comm, formatStamp } from '@/lib/communication/api';
import { cn } from '@/lib/utils';

// Coordinator appointments are scoped rows, never role changes: appointing a
// class coordinator leaves the account a student with a documented scope.
export default function CoordinatorPanel() {
  const [assignments, setAssignments] = useState({ loading: true, items: [], error: '' });
  const [academicGroup, setAcademicGroup] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [selected, setSelected] = useState('');
  const [subgroups, setSubgroups] = useState([]);
  const [scopeType, setScopeType] = useState('class');
  const [subgroupId, setSubgroupId] = useState('');
  const [reason, setReason] = useState('');
  const [notice, setNotice] = useState('');
  const [confirming, setConfirming] = useState('');

  const load = async () => {
    const data = await comm('coordinators');
    setAssignments({ loading: false, items: data.items, error: '' });
  };

  useEffect(() => {
    load().catch((error) => setAssignments({ loading: false, items: [], error: error.message }));
    comm('groups')
      .then((data) => setSubgroups(data.items.filter((row) => row.type === 'subgroup')))
      .catch(() => {});
  }, []);

  const searchGroup = async (value) => {
    setAcademicGroup(value);
    setSelected('');
    if (value.trim().length < 2) {
      setCandidates([]);
      return;
    }
    try {
      const data = await comm('coordinatorCandidates', { academicGroupId: value.trim() });
      setCandidates(data.items);
    } catch (error) {
      setNotice(error.message);
    }
  };

  const assign = async () => {
    setNotice('');
    try {
      await comm('assignCoordinator', {
        userId: selected,
        scopeType,
        academicGroupId: academicGroup.trim(),
        groupId: scopeType === 'subgroup' ? subgroupId : '',
        reason,
      });
      setReason('');
      setSelected('');
      await load();
    } catch (error) {
      setNotice(error.message);
    }
  };

  const revoke = async (assignment) => {
    try {
      await comm('revokeCoordinator', { assignmentId: assignment.id, reason });
      setConfirming('');
      setReason('');
      await load();
    } catch (error) {
      setNotice(error.message);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
      <section className="card-surface overflow-hidden">
        <div className="border-b border-line px-4 py-3">
          <h2 className="flex items-center gap-1.5 text-[17px] font-semibold text-ink">
            <ShieldCheck className="h-4 w-4 text-[#5B4DEB]" /> Coordinator appointments
          </h2>
          <p className="mt-1 text-[13px] leading-relaxed text-mutedink">
            A coordinator may post announcements, pin messages and invite members inside one group. The appointment
            grants no access to grades, academic records, private conversations, other groups or account settings.
          </p>
        </div>

        {assignments.loading && <div className="p-4"><div className="h-20 animate-pulse rounded-lg bg-[#F3F5F9]" /></div>}
        {assignments.error && <p className="p-4 text-[13px] text-[#A23B3B]">{assignments.error}</p>}
        {!assignments.loading && !assignments.items.length && (
          <p className="p-6 text-center text-[14px] text-mutedink">No coordinator has been appointed yet.</p>
        )}

        <ul className="divide-y divide-line/70">
          {assignments.items.map((row) => (
            <li key={row.id} className="px-4 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[14px] font-medium text-ink">{row.coordinator_name}</span>
                <span className="rounded bg-canvas px-1.5 py-px text-[11px] font-medium uppercase text-mutedink">
                  {row.scope_type}
                </span>
                <span className="text-[12px] text-mutedink">{row.academic_group_id || row.group_id}</span>
                <span
                  className={cn(
                    'ml-auto rounded px-1.5 py-px text-[11px] font-semibold uppercase',
                    row.status === 'active' ? 'bg-[#E9F5EF] text-[#1D7A50]' : 'bg-[#F2F4F8] text-[#5A6779]',
                  )}
                >
                  {row.status}
                </span>
              </div>
              <p className="mt-1 text-[12px] text-mutedink">
                Appointed by {row.assigned_by_name || 'administration'} · {formatStamp(row.assigned_at)}
                {row.reason ? ` · ${row.reason}` : ''}
                {row.revoked_at ? ` · revoked ${formatStamp(row.revoked_at)}` : ''}
              </p>
              {row.status === 'active' && (
                <div className="mt-2 flex items-center gap-2">
                  {confirming === row.id ? (
                    <>
                      <button type="button" onClick={() => revoke(row)} className="btn-primary btn-sm">Confirm removal</button>
                      <button type="button" onClick={() => setConfirming('')} className="btn-quiet btn-sm">Cancel</button>
                    </>
                  ) : (
                    <button type="button" onClick={() => setConfirming(row.id)} className="btn-quiet btn-sm">
                      Remove appointment
                    </button>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>

      <aside className="card-surface p-4">
        <h3 className="flex items-center gap-1.5 text-[15px] font-semibold text-ink">
          <UserCog className="h-4 w-4" /> Appoint a coordinator
        </h3>
        <div className="mt-2 space-y-2">
          <select
            value={scopeType}
            onChange={(event) => setScopeType(event.target.value)}
            className="w-full rounded-lg border border-line px-2 py-1.5 text-[14px]"
          >
            <option value="class">Class coordinator</option>
            <option value="subgroup">Subgroup coordinator</option>
          </select>

          {scopeType === 'class' ? (
            <>
              <input
                value={academicGroup}
                onChange={(event) => searchGroup(event.target.value)}
                placeholder="Academic group, e.g. IR-21A"
                className="w-full rounded-lg border border-line px-2 py-1.5 text-[14px]"
              />
              <select
                value={selected}
                onChange={(event) => setSelected(event.target.value)}
                className="w-full rounded-lg border border-line px-2 py-1.5 text-[14px]"
              >
                <option value="">Select a student</option>
                {candidates.map((row) => (
                  <option key={row.student_id || row.name} value={row.user_id} disabled={!row.linked}>
                    {row.name} {row.linked ? '' : '(no account)'}
                  </option>
                ))}
              </select>
            </>
          ) : (
            <>
              <select
                value={subgroupId}
                onChange={(event) => setSubgroupId(event.target.value)}
                className="w-full rounded-lg border border-line px-2 py-1.5 text-[14px]"
              >
                <option value="">Select a subgroup</option>
                {subgroups.map((row) => (
                  <option key={row.id} value={row.id}>{row.name}</option>
                ))}
              </select>
              <input
                value={academicGroup}
                onChange={(event) => searchGroup(event.target.value)}
                placeholder="Academic group of the student"
                className="w-full rounded-lg border border-line px-2 py-1.5 text-[14px]"
              />
              <select
                value={selected}
                onChange={(event) => setSelected(event.target.value)}
                className="w-full rounded-lg border border-line px-2 py-1.5 text-[14px]"
              >
                <option value="">Select a student</option>
                {candidates.map((row) => (
                  <option key={row.student_id || row.name} value={row.user_id} disabled={!row.linked}>
                    {row.name} {row.linked ? '' : '(no account)'}
                  </option>
                ))}
              </select>
            </>
          )}

          <input
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Reason (recorded in the audit log)"
            className="w-full rounded-lg border border-line px-2 py-1.5 text-[14px]"
          />
          <button type="button" onClick={assign} disabled={!selected} className="btn-primary btn-sm w-full disabled:opacity-60">
            Appoint coordinator
          </button>
          {notice && <p className="text-[13px] text-[#A23B3B]">{notice}</p>}
        </div>
      </aside>
    </div>
  );
}