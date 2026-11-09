import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { saveAcademicPreferences } from '@/lib/academicIntelligence';

const TOGGLES = [
  { key: 'course_performance_alerts', label: 'Course performance alerts', hint: 'When one of your courses needs attention.' },
  { key: 'overall_performance_alerts', label: 'Overall performance alerts', hint: 'When your semester average needs attention.' },
  { key: 'attendance_alerts', label: 'Attendance alerts', hint: 'Absence allowance and attendance risk.' },
  { key: 'threshold_alerts', label: 'Attendance threshold alerts', hint: 'At 50%, 70%, 80%, 90% and 100% of the permitted absences.' },
  { key: 'in_app_delivery', label: 'In-app delivery', hint: 'Show academic alerts in your notifications.' },
  { key: 'email_delivery', label: 'Email delivery', hint: 'Saved with your preferences; academic alerts are delivered in-app in this build.' },
];

const DIGESTS = [
  { value: 'off', label: 'Off' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
];

export default function AlertPreferences({ preferences, institution, onSaved }) {
  const { toast } = useToast();
  const [form, setForm] = useState({ ...preferences });
  const [school, setSchool] = useState(institution || '');
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    try {
      await saveAcademicPreferences({ preferences: form, institution: school });
      toast({ title: 'Academic alert preferences saved' });
      onSaved?.();
    } catch (error) {
      toast({ title: 'Preferences were not saved', description: error.message, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <ul className="divide-y divide-line">
        {TOGGLES.map((item) => (
          <li key={item.key} className="flex items-start justify-between gap-4 py-3">
            <div className="min-w-0">
              <p className="text-[13.5px] font-medium text-ink">{item.label}</p>
              <p className="mt-0.5 text-[12.5px] leading-relaxed text-mutedink">{item.hint}</p>
            </div>
            <Switch
              checked={Boolean(form[item.key])}
              onCheckedChange={(value) => setForm((current) => ({ ...current, [item.key]: value }))}
              aria-label={item.label}
            />
          </li>
        ))}
        <li className="flex items-start justify-between gap-4 py-3">
          <div className="min-w-0">
            <p className="text-[13.5px] font-medium text-ink">Academic digest</p>
            <p className="mt-0.5 text-[12.5px] leading-relaxed text-mutedink">A summary of results, deadlines and attendance.</p>
          </div>
          <select
            value={form.digest}
            onChange={(event) => setForm((current) => ({ ...current, digest: event.target.value }))}
            className="shrink-0 rounded-lg border border-line bg-white px-2 py-1.5 text-[14px] outline-none focus:border-brand"
            aria-label="Academic digest frequency"
          >
            {DIGESTS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </li>
        <li className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-[13.5px] font-medium text-ink">Institution</p>
            <p className="mt-0.5 text-[12.5px] leading-relaxed text-mutedink">Determines which attendance policy your alerts use.</p>
          </div>
          <input
            value={school}
            onChange={(event) => setSchool(event.target.value)}
            className="w-full rounded-lg border border-line bg-white px-3 py-1.5 text-[14px] outline-none focus:border-brand sm:w-64"
            aria-label="Institution"
          />
        </li>
      </ul>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="max-w-md text-[12.5px] leading-relaxed text-mutedink">
          Account and security notifications are never affected by these settings. You cannot change official attendance
          records or the institutional policy from here.
        </p>
        <button type="button" onClick={save} disabled={busy} className="btn-primary disabled:opacity-60">
          {busy ? 'Saving…' : 'Save preferences'}
        </button>
      </div>
    </div>
  );
}