import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { loadAttendancePolicy, saveAttendancePolicy } from '@/lib/academicIntelligence';

/**
 * Institutional attendance policy. Only administrative staff can change it:
 * the server re-checks the caller's role on every save, and students never see
 * this control.
 */
export default function AttendancePolicyPanel() {
  const { toast } = useToast();
  const [policy, setPolicy] = useState(null);
  const [limit, setLimit] = useState('');
  const [institution, setInstitution] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    loadAttendancePolicy()
      .then(({ policy: loaded }) => {
        setPolicy(loaded);
        setLimit(String(loaded.absenceLimit));
        setInstitution(loaded.institution);
      })
      .catch(() => setPolicy(null));
  }, []);

  const save = async () => {
    setBusy(true);
    try {
      const { policy: saved } = await saveAttendancePolicy({ absenceLimit: Number(limit), institution });
      setPolicy(saved);
      setLimit(String(saved.absenceLimit));
      toast({ title: 'Attendance policy saved' });
    } catch (error) {
      toast({ title: 'Policy was not saved', description: error.message, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card-surface mb-4 px-4 py-3.5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-mutedink">Attendance policy</p>
          <p className="mt-1 text-[13px] leading-relaxed text-mutedink">
            Permitted missed classes per semester, used by every student allowance and threshold alert.
            {policy?.configured ? '' : ' Currently the prototype default.'}
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-[12.5px] text-mutedink">
            Institution
            <input
              value={institution}
              onChange={(event) => setInstitution(event.target.value)}
              className="mt-1 block w-48 rounded-lg border border-line bg-white px-2.5 py-1.5 text-[14px] text-ink outline-none focus:border-brand"
            />
          </label>
          <label className="text-[12.5px] text-mutedink">
            Permitted absences
            <input
              type="number"
              min="1"
              max="200"
              value={limit}
              onChange={(event) => setLimit(event.target.value)}
              className="mt-1 block w-24 rounded-lg border border-line bg-white px-2.5 py-1.5 text-[14px] text-ink outline-none focus:border-brand"
            />
          </label>
          <button type="button" onClick={save} disabled={busy || !policy} className="btn-primary disabled:opacity-60">
            {busy ? 'Saving…' : 'Save policy'}
          </button>
        </div>
      </div>
    </div>
  );
}