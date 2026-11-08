import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, UserPlus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const field = 'mt-1 h-10 w-full rounded-lg border border-line bg-white px-3 text-[15px] text-ink';
const labelClass = 'text-[14px] font-medium text-ink';

export default function CreateAccountDialog({ faculties, departments, canManageAdmins, onClose, onCreated }) {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    role: 'student',
    phone: '',
    faculty_id: '',
    department_id: '',
    group_name: '',
    programme: '',
    student_id: '',
    professor_id: '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const response = await base44.functions.invoke('adminUsers', { action: 'create', ...form });
      const data = response?.data || {};
      if (data.error) throw new Error(data.error);
      onCreated?.(form);
    } catch (createError) {
      setError(createError?.message || 'The account could not be created.');
    } finally {
      setBusy(false);
    }
  };

  const roles = [
    { value: 'student', label: 'Student' },
    { value: 'professor', label: 'Professor' },
    ...(canManageAdmins ? [{ value: 'admin', label: 'Administrator' }] : []),
  ];

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92dvh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New institutional account</DialogTitle>
        </DialogHeader>
        <p className="-mt-1 text-[14px] leading-relaxed text-mutedink">
          The account holder receives an invitation from the university and sets their own password. No password is
          created here or stored by this application.
        </p>

        <form onSubmit={submit} className="mt-3 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="new-name">Full name</label>
              <input id="new-name" className={field} value={form.full_name} onChange={set('full_name')} required />
            </div>
            <div>
              <label className={labelClass} htmlFor="new-email">Login email</label>
              <input id="new-email" type="email" className={field} value={form.email} onChange={set('email')} required />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="new-role">Role</label>
              <select id="new-role" className={field} value={form.role} onChange={set('role')}>
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="new-phone">Phone number</label>
              <input id="new-phone" className={field} value={form.phone} onChange={set('phone')} placeholder="+7 ..." />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="new-faculty">Faculty</label>
              <select id="new-faculty" className={field} value={form.faculty_id} onChange={set('faculty_id')}>
                <option value="">Not assigned</option>
                {faculties.map((faculty) => (
                  <option key={faculty.id} value={faculty.id}>{faculty.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="new-department">Department</label>
              <select id="new-department" className={field} value={form.department_id} onChange={set('department_id')}>
                <option value="">Not applicable</option>
                {departments
                  .filter((department) => !form.faculty_id || !department.faculty_id || department.faculty_id === form.faculty_id)
                  .map((department) => (
                    <option key={department.id} value={department.id}>{department.name}</option>
                  ))}
              </select>
            </div>
          </div>

          {form.role === 'student' && (
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className={labelClass} htmlFor="new-student-id">Student ID</label>
                <input id="new-student-id" className={field} value={form.student_id} onChange={set('student_id')} placeholder="IE-23-0417" />
              </div>
              <div>
                <label className={labelClass} htmlFor="new-group">Class / group</label>
                <input id="new-group" className={field} value={form.group_name} onChange={set('group_name')} placeholder="IE-31" />
              </div>
              <div>
                <label className={labelClass} htmlFor="new-programme">Programme</label>
                <input id="new-programme" className={field} value={form.programme} onChange={set('programme')} />
              </div>
            </div>
          )}

          {form.role === 'professor' && (
            <div>
              <label className={labelClass} htmlFor="new-professor-id">Professor ID</label>
              <input id="new-professor-id" className={field} value={form.professor_id} onChange={set('professor_id')} placeholder="PR-1180" />
            </div>
          )}

          {error && <p className="rounded-lg bg-[#FBECEC] px-3 py-2 text-[14px] text-critical">{error}</p>}

          <div className="flex flex-wrap justify-end gap-2 pt-1">
            <button type="button" className="btn-quiet" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={busy}>
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserPlus className="h-3.5 w-3.5" />}
              Create and invite
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}