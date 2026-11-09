import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Plus, RefreshCw, Search, ShieldCheck, UserPlus } from 'lucide-react';
import PageTitle from '@/components/shell/PageTitle';
import Surface from '@/components/shell/Surface';
import UserRosterTable from '@/components/admin/users/UserRosterTable';
import CreateAccountDialog from '@/components/admin/users/CreateAccountDialog';
import CreateStudentAccountDialog from '@/components/admin/users/CreateStudentAccountDialog';
import UserRecordPanel from '@/components/admin/users/UserRecordPanel';
import AuditTrailPanel from '@/components/admin/users/AuditTrailPanel';

const selectClass = 'h-9 rounded-lg border border-line bg-white px-2.5 text-[14px] text-ink';

export default function UserManagement() {
  const [data, setData] = useState({ users: [], faculties: [], departments: [], canManageAdmins: false });
  const [filters, setFilters] = useState({ search: '', role: 'all', faculty_id: 'all', group_name: 'all', status: 'all' });
  const [query, setQuery] = useState('');
  const [version, setVersion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('accounts');
  const [creating, setCreating] = useState(false);
  const [provisioning, setProvisioning] = useState(false);
  const [repairing, setRepairing] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [flash, setFlash] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const response = await base44.functions.invoke('adminUsers', { action: 'list', ...filters });
        const payload = response?.data || {};
        if (payload.error) throw new Error(payload.error);
        if (alive) setData(payload);
      } catch (loadError) {
        if (alive) setError(loadError?.message || 'Accounts could not be loaded.');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [filters, version]);

  const refresh = () => setVersion((value) => value + 1);

  // Aligns every student account with its authoritative student record and
  // reconciles class-group membership. Safe to run repeatedly.
  const reconcile = async () => {
    setRepairing(true);
    setFlash('');
    try {
      const response = await base44.functions.invoke('adminUsers', { action: 'reconcileIdentities' });
      const payload = response?.data || {};
      if (payload.error) throw new Error(payload.error);
      setFlash(
        `Academic identities reconciled: ${payload.inspected} account${payload.inspected === 1 ? '' : 's'} inspected, ` +
          `${payload.repaired} aligned with their student record, ${payload.conflicts} conflict${payload.conflicts === 1 ? '' : 's'} reported.`
      );
      refresh();
    } catch (repairError) {
      setFlash(repairError?.message || 'The academic identities could not be reconciled.');
    } finally {
      setRepairing(false);
    }
  };
  const selected = data.users.find((account) => account.id === selectedId) || null;
  const groups = [...new Set(data.users.map((account) => account.group_name).filter(Boolean))].sort();

  return (
    <div>
      <PageTitle
        eyebrow="Administration"
        title="User management"
        description="Create institutional accounts, assign roles and academic placements, manage account status and password recovery. Every change is authorised on the server and written to the audit log."
        actions={
          <>
            <button type="button" className="btn-quiet" onClick={refresh}>
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </button>
            <button type="button" className="btn-quiet" onClick={reconcile} disabled={repairing}>
              {repairing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5" />}
              Reconcile identities
            </button>
            <button type="button" className="btn-quiet" onClick={() => setCreating(true)}>
              <Plus className="h-3.5 w-3.5" /> New account
            </button>
            <button type="button" className="btn-primary" onClick={() => setProvisioning(true)}>
              <UserPlus className="h-3.5 w-3.5" /> Create student account
            </button>
          </>
        }
      />

      {flash && <p className="mb-3 rounded-lg bg-[#E9F5EF] px-3 py-2 text-[14px] text-positive">{flash}</p>}

      <div className="mb-4 flex gap-1 border-b border-line">
        {[
          ['accounts', 'Accounts'],
          ['audit', 'Audit log'],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`-mb-px border-b-2 px-3 py-2 text-[14px] font-medium transition-colors ${
              tab === key ? 'border-brand text-brand' : 'border-transparent text-mutedink hover:text-ink'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'accounts' ? (
        <>
          <Surface bodyClassName="px-0 pb-0 pt-0">
            <div className="flex flex-wrap items-end gap-2 border-b border-line px-5 py-3">
              <form
                className="flex items-end gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  setFilters((current) => ({ ...current, search: query.trim() }));
                }}
              >
                <div>
                  <label className="text-[13px] font-medium text-mutedink" htmlFor="account-search">Search</label>
                  <input
                    id="account-search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Name, email, student or professor ID"
                    className="mt-1 h-9 w-[260px] rounded-lg border border-line bg-white px-2.5 text-[14px] text-ink"
                  />
                </div>
                <button type="submit" className="btn-quiet">
                  <Search className="h-3.5 w-3.5" /> Search
                </button>
              </form>

              <div>
                <label className="text-[13px] font-medium text-mutedink" htmlFor="filter-role">Role</label>
                <select
                  id="filter-role"
                  className={`mt-1 ${selectClass}`}
                  value={filters.role}
                  onChange={(event) => setFilters((current) => ({ ...current, role: event.target.value }))}
                >
                  <option value="all">All roles</option>
                  <option value="student">Student</option>
                  <option value="professor">Professor</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div>
                <label className="text-[13px] font-medium text-mutedink" htmlFor="filter-faculty">Faculty</label>
                <select
                  id="filter-faculty"
                  className={`mt-1 ${selectClass}`}
                  value={filters.faculty_id}
                  onChange={(event) => setFilters((current) => ({ ...current, faculty_id: event.target.value }))}
                >
                  <option value="all">All faculties</option>
                  {data.faculties.map((faculty) => (
                    <option key={faculty.id} value={faculty.id}>{faculty.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[13px] font-medium text-mutedink" htmlFor="filter-group">Class / group</label>
                <select
                  id="filter-group"
                  className={`mt-1 ${selectClass}`}
                  value={filters.group_name}
                  onChange={(event) => setFilters((current) => ({ ...current, group_name: event.target.value }))}
                >
                  <option value="all">All groups</option>
                  {groups.map((group) => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[13px] font-medium text-mutedink" htmlFor="filter-status">Status</label>
                <select
                  id="filter-status"
                  className={`mt-1 ${selectClass}`}
                  value={filters.status}
                  onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
                >
                  <option value="all">All statuses</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="deactivated">Deactivated</option>
                </select>
              </div>
            </div>

            {loading ? (
              <p className="flex items-center gap-2 px-5 py-10 text-[14px] text-mutedink">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading accounts…
              </p>
            ) : error ? (
              <p className="px-5 py-10 text-[14px] text-critical">{error}</p>
            ) : (
              <UserRosterTable
                users={data.users}
                faculties={data.faculties}
                onOpen={(account) => {
                  setFlash('');
                  setSelectedId(account.id);
                }}
              />
            )}

            <div className="border-t border-line px-5 py-2.5 text-[13px] text-mutedink">
              {data.users.length} account{data.users.length === 1 ? '' : 's'} shown
              {data.canManageAdmins ? ' · you may administer administrator accounts' : ' · administrator accounts are managed by a Super Administrator'}
            </div>
          </Surface>
        </>
      ) : (
        <AuditTrailPanel version={version} />
      )}

      {creating && (
        <CreateAccountDialog
          faculties={data.faculties}
          departments={data.departments}
          canManageAdmins={data.canManageAdmins}
          onClose={() => setCreating(false)}
          onCreated={(form) => {
            setCreating(false);
            setFlash(
              `Invitation sent to ${form.email}. The account activates with the ${form.role} role when it is first signed in.`
            );
            refresh();
          }}
        />
      )}

      {provisioning && (
        <CreateStudentAccountDialog
          faculties={data.faculties}
          onClose={() => setProvisioning(false)}
          onProvisioned={(result) => {
            setFlash(result.message || 'The student account was provisioned.');
            refresh();
          }}
        />
      )}

      {selected && (
        <UserRecordPanel
          key={selected.id}
          account={selected}
          faculties={data.faculties}
          departments={data.departments}
          canManageAdmins={data.canManageAdmins}
          onClose={() => setSelectedId(null)}
          onChanged={refresh}
        />
      )}
    </div>
  );
}