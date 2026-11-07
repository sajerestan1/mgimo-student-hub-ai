import { useEffect, useState } from 'react';
import PageTitle from '@/components/shell/PageTitle';
import Surface from '@/components/shell/Surface';
import StatusChip from '@/components/shell/StatusChip';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { APPLICATIONS, STUDENT, formatDate, isoIn } from '@/lib/studentWorkspace';

const TYPES = ['Enrolment certificate', 'Transcript (English)', 'Transcript (Russian)', 'Academic leave request'];

const REQUEST_STATUS = {
  submitted: { label: 'Submitted', tone: 'brand' },
  under_review: { label: 'In review', tone: 'warning' },
  approved: { label: 'Approved', tone: 'positive' },
  rejected: { label: 'Rejected', tone: 'critical' },
  completed: { label: 'Completed', tone: 'positive' },
  draft: { label: 'Draft', tone: 'neutral' },
};

const RECORD_STATUS = {
  ready: { label: 'Ready to collect', tone: 'positive' },
  in_review: { label: 'In review', tone: 'warning' },
  rejected: { label: 'Rejected', tone: 'critical' },
};

export default function ApplicationsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState(null);
  const [form, setForm] = useState({ certificate_type: TYPES[0], purpose: '', needed_by: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    const page = await base44.entities.Application.list({ sort: '-created_date', limit: 10 });
    setRequests(page.items || []);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    if (!form.purpose.trim()) {
      setError('Describe what the document is needed for.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await base44.entities.Application.create({
        user_id: user?.id,
        certificate_type: form.certificate_type,
        title: form.certificate_type,
        purpose: form.purpose.trim(),
        needed_by: form.needed_by || '',
        status: 'submitted',
        submitted_date: isoIn(0),
      });
      setForm({ certificate_type: TYPES[0], purpose: '', needed_by: '' });
      await load();
    } catch {
      setError('The request could not be submitted. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const fieldClass =
    'w-full rounded-lg border border-line bg-white px-3 py-2 text-[12px] text-ink placeholder:text-mutedink/70 focus:border-royal/40 focus:outline-none focus:ring-2 focus:ring-royal/10';

  return (
    <div>
      <PageTitle
        eyebrow="Student workspace"
        title="Applications & certificates"
        description="Request enrolment certificates and transcripts, and follow the status of documents already in progress."
        meta={['Student office · Building 2, window 4', 'Turnaround 2–3 working days']}
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <Surface title="New request" subtitle="Sent to the student office">
          <form onSubmit={submit} className="space-y-3">
            <label className="block">
              <span className="mb-1 block text-[11px] font-medium text-ink">Document</span>
              <select
                value={form.certificate_type}
                onChange={(event) => setForm((prev) => ({ ...prev, certificate_type: event.target.value }))}
                className={fieldClass}
              >
                {TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-[11px] font-medium text-ink">Purpose</span>
              <input
                value={form.purpose}
                onChange={(event) => setForm((prev) => ({ ...prev, purpose: event.target.value }))}
                placeholder="e.g. Bank account opening"
                className={fieldClass}
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-[11px] font-medium text-ink">Needed by (optional)</span>
              <input
                type="date"
                value={form.needed_by}
                onChange={(event) => setForm((prev) => ({ ...prev, needed_by: event.target.value }))}
                className={fieldClass}
              />
            </label>

            {error && <p className="text-[11px] text-critical">{error}</p>}

            <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-60">
              {busy ? 'Submitting…' : 'Submit request'}
            </button>
            <p className="text-[10.5px] leading-relaxed text-mutedink">
              Requests are stored in the app database against your account ({STUDENT.studentId}). This prototype does
              not send them on to the student office yet.
            </p>
          </form>
        </Surface>

        <div className="space-y-4">
          <Surface
            title="Your submitted requests"
            subtitle={requests === null ? 'Loading…' : `${requests.length} in the database`}
            bodyClassName="px-0 pb-0 pt-1"
          >
            {requests && requests.length === 0 && (
              <p className="px-5 py-6 text-[11.5px] text-mutedink">
                No requests submitted from this prototype yet.
              </p>
            )}
            {requests && requests.length > 0 && (
              <ul className="divide-y divide-line">
                {requests.map((request) => {
                  const status = REQUEST_STATUS[request.status] || REQUEST_STATUS.submitted;
                  return (
                    <li key={request.id} className="px-5 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-[12px] font-medium text-ink">{request.certificate_type}</p>
                          <p className="mt-0.5 truncate text-[10.5px] text-mutedink">{request.purpose}</p>
                          {request.submitted_date && (
                            <p className="mt-0.5 text-[10px] text-mutedink">
                              Submitted {formatDate(request.submitted_date)}
                            </p>
                          )}
                        </div>
                        <StatusChip tone={status.tone}>{status.label}</StatusChip>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Surface>

          <Surface
            title="Example requests"
            subtitle="From the demonstration academic record"
            bodyClassName="px-0 pb-0 pt-1"
          >
            <ul className="divide-y divide-line">
              {APPLICATIONS.map((item) => {
                const status = RECORD_STATUS[item.status];
                return (
                  <li key={item.id} className="px-5 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-[12px] font-medium text-ink">{item.kind}</p>
                        <p className="mt-0.5 truncate text-[10.5px] text-mutedink">{item.purpose}</p>
                        <p className="mt-1 text-[10.5px] leading-relaxed text-mutedink">{item.note}</p>
                      </div>
                      <StatusChip tone={status.tone}>{status.label}</StatusChip>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Surface>
        </div>
      </div>
    </div>
  );
}