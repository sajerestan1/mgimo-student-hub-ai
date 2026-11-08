import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import StatusChip from '@/components/shell/StatusChip';
import {
  accountRoleLabel,
  ROLE_LABELS,
  ROLE_TONES,
  STATUS_LABELS,
  STATUS_TONES,
  dateLabel,
} from '@/lib/accounts';

const field = 'mt-1 h-9 w-full rounded-lg border border-line bg-white px-2.5 text-[15px] text-ink disabled:bg-canvas disabled:text-mutedink';
const labelClass = 'text-[13px] font-medium text-mutedink';

function Row({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-line py-1.5 last:border-0">
      <dt className="text-[13px] text-mutedink">{label}</dt>
      <dd className="truncate text-[14px] font-medium text-ink">{value || '—'}</dd>
    </div>
  );
}

export default function UserRecordPanel({ account, faculties, departments, canManageAdmins, onClose, onChanged }) {
  const [form, setForm] = useState({
    full_name: account.full_name || '',
    phone: account.phone || '',
    contact_email: account.contact_email || '',
    faculty_id: account.faculty_id || '',
    department_id: account.department_id || '',
    group_name: account.group_name || '',
    programme: account.programme || '',
    student_id: account.student_id || '',
    professor_id: account.professor_id || '',
    role: account.role || 'student',
    admin_level: account.admin_level || 'standard',
  });
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [confirmStatus, setConfirmStatus] = useState('');

  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const run = async (kind, payload) => {
    setError('');
    setNotice('');
    setBusy(kind);
    try {
      const response = await base44.functions.invoke('adminUsers', payload);
      const data = response?.data || {};
      if (data.error) throw new Error(data.error);
      return data;
    } catch (actionError) {
      setError(actionError?.message || 'The action could not be completed.');
      return null;
    } finally {
      setBusy('');
    }
  };

  const save = async (event) => {
    event.preventDefault();
    const data = await run('save', { action: 'update', userId: account.id, patch: form });
    if (data) {
      setNotice(data.changed ? 'Changes saved and recorded in the audit log.' : 'No changes to save.');
      onChanged?.();
    }
  };

  const changeStatus = async (status) => {
    if (confirmStatus !== status) {
      setConfirmStatus(status);
      return;
    }
    setConfirmStatus('');
    const data = await run(status, { action: 'setStatus', userId: account.id, status });
    if (data) {
      setNotice(`Account status set to ${STATUS_LABELS[status].toLowerCase()}. Academic records are retained.`);
      onChanged?.();
    }
  };

  const resetPassword = async () => {
    const data = await run('reset', { action: 'resetPassword', userId: account.id });
    if (data) {
      setNotice(
        data.ok
          ? `A secure recovery email was sent to ${data.email}. No password is shown or stored here.`
          : `The recovery email could not be sent: ${data.message}`
      );
    }
  };

  const departmentOptions = departments.filter(
    (department) => !form.faculty_id || !department.faculty_id || department.faculty_id === form.faculty_id
  );

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92dvh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            {account.full_name || 'Account'}
            <StatusChip tone={ROLE_TONES[account.role] || 'neutral'}>{accountRoleLabel(account)}</StatusChip>
            <StatusChip tone={STATUS_TONES[account.account_status] || 'neutral'}>
              {STATUS_LABELS[account.account_status]}
            </StatusChip>
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
          <form onSubmit={save} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="edit-name">Full name</label>
                <input id="edit-name" className={field} value={form.full_name} onChange={set('full_name')} />
              </div>
              <div>
                <label className={labelClass} htmlFor="edit-phone">Phone number</label>
                <input id="edit-phone" className={field} value={form.phone} onChange={set('phone')} />
              </div>
              <div>
                <label className={labelClass} htmlFor="edit-email">Institutional email</label>
                <input id="edit-email" type="email" className={field} value={form.contact_email} onChange={set('contact_email')} />
              </div>
              <div>
                <label className={labelClass} htmlFor="edit-role">Role</label>
                <select id="edit-role" className={field} value={form.role} onChange={set('role')}>
                  {['student', 'professor', 'admin', 'dean', 'academic_staff', 'faculty_admin', 'department_head'].map((role) => (
                    <option key={role} value={role}>{ROLE_LABELS[role]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass} htmlFor="edit-faculty">Faculty</label>
                <select id="edit-faculty" className={field} value={form.faculty_id} onChange={set('faculty_id')}>
                  <option value="">Not assigned</option>
                  {faculties.map((faculty) => (
                    <option key={faculty.id} value={faculty.id}>{faculty.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass} htmlFor="edit-department">Department</label>
                <select id="edit-department" className={field} value={form.department_id} onChange={set('department_id')}>
                  <option value="">Not applicable</option>
                  {departmentOptions.map((department) => (
                    <option key={department.id} value={department.id}>{department.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass} htmlFor="edit-group">Class / group</label>
                <input id="edit-group" className={field} value={form.group_name} onChange={set('group_name')} />
              </div>
              <div>
                <label className={labelClass} htmlFor="edit-programme">Programme</label>
                <input id="edit-programme" className={field} value={form.programme} onChange={set('programme')} />
              </div>
              <div>
                <label className={labelClass} htmlFor="edit-student-id">Student ID</label>
                <input id="edit-student-id" className={field} value={form.student_id} onChange={set('student_id')} />
              </div>
              <div>
                <label className={labelClass} htmlFor="edit-professor-id">Professor ID</label>
                <input id="edit-professor-id" className={field} value={form.professor_id} onChange={set('professor_id')} />
              </div>
              {form.role === 'admin' && (
                <div>
                  <label className={labelClass} htmlFor="edit-level">Administration level</label>
                  <select
                    id="edit-level"
                    className={field}
                    value={form.admin_level}
                    onChange={set('admin_level')}
                    disabled={!canManageAdmins}
                  >
                    <option value="standard">Administrator</option>
                    <option value="super">Super Administrator</option>
                  </select>
                </div>
              )}
            </div>

            {error && <p className="rounded-lg bg-[#FBECEC] px-3 py-2 text-[14px] text-critical">{error}</p>}
            {notice && <p className="rounded-lg bg-[#E9F5EF] px-3 py-2 text-[14px] text-positive">{notice}</p>}

            <div className="flex flex-wrap gap-2">
              <button type="submit" className="btn-primary" disabled={busy === 'save'}>
                {busy === 'save' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Save changes
              </button>
              <button type="button" className="btn-quiet" onClick={resetPassword} disabled={busy === 'reset'}>
                {busy === 'reset' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Reset password
              </button>
            </div>
          </form>

          <aside className="space-y-3">
            <div>
              <p className="eyebrow mb-1">Account</p>
              <dl>
                <Row label="Sign-in email" value={account.email} />
                <Row label="Created" value={dateLabel(account.created_date)} />
                <Row label="Last sign-in" value={account.last_login_at ? dateLabel(account.last_login_at) : 'Not yet'} />
                <Row label="Provisioning" value={account.provisioned ? 'Administrator-created' : 'Not provisioned'} />
                <Row label="Profile" value={account.profile_complete ? 'Complete' : `Missing: ${account.missing.join(', ')}`} />
              </dl>
            </div>

            <div>
              <p className="eyebrow mb-1">Account status</p>
              <div className="flex flex-col gap-1.5">
                {['active', 'suspended', 'deactivated'].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => changeStatus(status)}
                    disabled={account.account_status === status || busy === status}
                    className={`btn-quiet justify-start ${account.account_status === status ? 'border-brand/40 text-brand' : ''}`}
                  >
                    {busy === status && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    {account.account_status === status
                      ? `${STATUS_LABELS[status]} (current)`
                      : confirmStatus === status
                      ? `Confirm ${STATUS_LABELS[status].toLowerCase()}`
                      : `${status === 'active' ? 'Activate / reactivate' : STATUS_LABELS[status]}`}
                  </button>
                ))}
              </div>
            </div>

            <p className="rounded-lg bg-canvas px-3 py-2 text-[13px] leading-relaxed text-mutedink">
              Passwords are never displayed or retrieved. A reset sends the account holder a secure recovery link, and the
              change is written to the audit log.
            </p>
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  );
}