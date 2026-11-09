import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, UserPlus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import StatusChip from '@/components/shell/StatusChip';
import {
  INVITATION_LABELS,
  LINK_LABELS,
  PROVISION_STATUS_LABELS,
  PROVISION_STATUS_TONES,
} from '@/lib/accounts';

const field = 'mt-1 h-10 w-full rounded-lg border border-line bg-white px-3 text-[15px] text-ink';
const labelClass = 'text-[14px] font-medium text-ink';

function StatusRow({ label, value, tone }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line py-2 last:border-0">
      <span className="text-[14px] text-mutedink">{label}</span>
      {tone ? <StatusChip tone={tone}>{value}</StatusChip> : <span className="text-[14px] font-medium text-ink">{value}</span>}
    </div>
  );
}

/**
 * Email-only student provisioning: the administrator supplies the address, the
 * server creates the invitation, the Student record, its generated identifier
 * and the account link, then reports every step back here.
 */
export default function CreateStudentAccountDialog({ faculties = [], onClose, onProvisioned }) {
  const [form, setForm] = useState({ email: '', full_name: '', group_name: '', faculty_id: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const response = await base44.functions.invoke('adminUsers', { action: 'provision_student', ...form });
      const data = response?.data || {};
      if (data.status === 'conflict') {
        setResult(data);
        return;
      }
      if (data.error) throw new Error(data.error);
      setResult(data);
      onProvisioned?.(data);
    } catch (provisionError) {
      const payload = provisionError?.response?.data;
      if (payload?.status === 'conflict') {
        setResult(payload);
        return;
      }
      setError(payload?.error || provisionError?.message || 'The student account could not be provisioned.');
    } finally {
      setBusy(false);
    }
  };

  const status = result?.status || '';
  const blocked = status === 'conflict' || status === 'failed';

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92dvh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create student account</DialogTitle>
        </DialogHeader>
        <p className="-mt-1 text-[14px] leading-relaxed text-mutedink">
          Enter the student's institutional email address. The invitation, the student record, its identifier and the
          account link are created by the server — no identifiers are typed here and no password is stored.
        </p>

        {!result ? (
          <form onSubmit={submit} className="mt-3 space-y-3">
            <div>
              <label className={labelClass} htmlFor="student-email">Student email</label>
              <input
                id="student-email"
                type="email"
                className={field}
                value={form.email}
                onChange={set('email')}
                placeholder="name@mgimo.example"
                required
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="student-name">Full name (optional)</label>
                <input id="student-name" className={field} value={form.full_name} onChange={set('full_name')} />
              </div>
              <div>
                <label className={labelClass} htmlFor="student-group">Class / group (optional)</label>
                <input id="student-group" className={field} value={form.group_name} onChange={set('group_name')} />
              </div>
            </div>
            <div>
              <label className={labelClass} htmlFor="student-faculty">Faculty (optional)</label>
              <select id="student-faculty" className={field} value={form.faculty_id} onChange={set('faculty_id')}>
                <option value="">Assign later</option>
                {faculties.map((faculty) => (
                  <option key={faculty.id} value={faculty.id}>{faculty.name}</option>
                ))}
              </select>
            </div>

            {error && <p className="text-[14px] text-critical">{error}</p>}

            <div className="flex justify-end gap-2 pt-1">
              <button type="button" className="btn-quiet" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={busy}>
                {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserPlus className="h-3.5 w-3.5" />}
                {busy ? 'Provisioning…' : 'Create student account'}
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-3">
            <p className={`rounded-lg px-3 py-2 text-[14px] ${blocked ? 'bg-[#FBECEC] text-critical' : 'bg-[#E9F5EF] text-positive'}`}>
              {blocked ? result.conflict || result.error : result.message}
            </p>

            <div className="mt-3 rounded-xl border border-line px-4 py-1">
              <StatusRow
                label="Provisioning status"
                value={PROVISION_STATUS_LABELS[status] || status || '—'}
                tone={PROVISION_STATUS_TONES[status] || 'neutral'}
              />
              <StatusRow label="Student identifier" value={result.student?.student_id || '—'} />
              <StatusRow
                label="Account link status"
                value={LINK_LABELS[result.account_link] || 'Not linked'}
                tone={result.account_link === 'linked' ? 'positive' : 'warning'}
              />
              <StatusRow
                label="Invitation status"
                value={INVITATION_LABELS[result.invitation] || 'Not sent'}
                tone={result.invitation === 'sent' ? 'positive' : 'neutral'}
              />
              {result.student?.full_name && <StatusRow label="Student" value={result.student.full_name} />}
              {result.student?.group_name && <StatusRow label="Class / group" value={result.student.group_name} />}
            </div>

            <div className="mt-3 flex justify-end gap-2">
              <button type="button" className="btn-quiet" onClick={onClose}>Done</button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}