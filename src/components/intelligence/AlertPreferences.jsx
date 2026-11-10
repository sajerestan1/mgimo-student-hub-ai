import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { saveAcademicPreferences } from '@/lib/academicIntelligence';

// Every switch below is enforced by the scheduled reminder run, not only stored:
// a category that is off produces no in-app reminder and no email.
const GROUPS = [
  {
    title: 'Where reminders reach you',
    items: [
      {
        key: 'in_app_delivery',
        label: 'In-app reminders',
        hint: 'Show reminders in your notifications and the bell in the header.',
      },
      {
        key: 'email_delivery',
        label: 'Email reminders',
        hint: 'Send to the email address registered on your account. Reminders are never sent to any other address.',
      },
    ],
  },
  {
    title: 'Deadlines',
    items: [
      {
        key: 'assignment_reminders',
        label: 'Assignment reminders',
        hint: '7 days, 3 days and 1 day before an assignment is due, and on the day itself.',
      },
      {
        key: 'quiz_reminders',
        label: 'Quiz reminders',
        hint: 'Before a quiz closes, while you still have attempts available.',
      },
      {
        key: 'exam_reminders',
        label: 'Examination reminders',
        hint: 'The same schedule for assessments recorded as examinations.',
      },
      {
        key: 'overdue_alerts',
        label: 'Overdue work',
        hint: 'After a deadline passes: at 1, 3, 7 and 14 days late, then no further reminders.',
      },
    ],
  },
  {
    title: 'Attendance and performance',
    items: [
      {
        key: 'attendance_alerts',
        label: 'Attendance alerts',
        hint: 'When your recorded absences approach the permitted allowance.',
      },
      {
        key: 'threshold_alerts',
        label: 'Attendance threshold warnings',
        hint: 'At 50%, 70%, 80%, 90% and 100% of the permitted absences.',
      },
      {
        key: 'course_performance_alerts',
        label: 'Course performance alerts',
        hint: 'When the recorded results in one course need attention.',
      },
      {
        key: 'overall_performance_alerts',
        label: 'Overall performance alerts',
        hint: 'When your calculated semester average needs attention.',
      },
    ],
  },
  {
    title: 'Digests',
    items: [
      {
        key: 'daily_digest',
        label: 'Daily digest',
        hint: 'One summary email each day: overdue work, deadlines in the next 7 days, attendance and courses needing attention.',
      },
      {
        key: 'weekly_digest',
        label: 'Weekly digest',
        hint: 'The same summary each Monday, in addition to any daily digest.',
      },
    ],
  },
];

const TIMINGS = [
  { value: 'morning', label: 'Morning (08:00)' },
  { value: 'afternoon', label: 'Afternoon (13:00)' },
  { value: 'evening', label: 'Evening (18:00)' },
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
      toast({ title: 'Reminder preferences saved' });
      onSaved?.();
    } catch (error) {
      toast({ title: 'Preferences were not saved', description: error.message, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      {GROUPS.map((group) => (
        <section key={group.title} className="mb-4 last:mb-0">
          <p className="eyebrow mb-1">{group.title}</p>
          <ul className="divide-y divide-line">
            {group.items.map((item) => (
              <li key={item.key} className="flex items-start justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="text-[13.5px] font-medium text-ink">{item.label}</p>
                  <p className="mt-0.5 text-[12.5px] leading-relaxed text-mutedink">{item.hint}</p>
                </div>
                <Switch
                  checked={Boolean(form[item.key])}
                  onCheckedChange={(value) => setForm((current) => ({ ...current, [item.key]: value }))}
                  aria-label={item.label}
                  className="shrink-0"
                />
              </li>
            ))}
          </ul>
        </section>
      ))}

      <section className="mb-4">
        <p className="eyebrow mb-1">When reminders arrive</p>
        <div className="flex flex-col gap-2 py-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-[13.5px] font-medium text-ink">Preferred reminder timing</p>
            <p className="mt-0.5 text-[12.5px] leading-relaxed text-mutedink">
              Deadline and digest reminders are delivered in this window. Attendance and performance alerts are added
              during the same run.
            </p>
          </div>
          <select
            value={form.reminder_timing || 'morning'}
            onChange={(event) => setForm((current) => ({ ...current, reminder_timing: event.target.value }))}
            className="w-full shrink-0 rounded-lg border border-line bg-white px-2 py-1.5 text-[14px] outline-none focus:border-brand sm:w-48"
            aria-label="Preferred reminder timing"
          >
            {TIMINGS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </section>

      <section>
        <p className="eyebrow mb-1">Institution</p>
        <div className="flex flex-col gap-2 py-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-[13.5px] font-medium text-ink">Your institution</p>
            <p className="mt-0.5 text-[12.5px] leading-relaxed text-mutedink">
              Determines which attendance policy your alerts use.
            </p>
          </div>
          <input
            value={school}
            onChange={(event) => setSchool(event.target.value)}
            className="w-full rounded-lg border border-line bg-white px-3 py-1.5 text-[14px] outline-none focus:border-brand sm:w-64"
            aria-label="Institution"
          />
        </div>
      </section>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="max-w-md text-[12.5px] leading-relaxed text-mutedink">
          Account and security notifications are never affected by these settings. You cannot change official attendance
          records, grades or the institutional policy from here.
        </p>
        <button type="button" onClick={save} disabled={busy} className="btn-primary disabled:opacity-60">
          {busy ? 'Saving…' : 'Save preferences'}
        </button>
      </div>
    </div>
  );
}