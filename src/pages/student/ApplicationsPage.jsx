import { useEffect, useState } from 'react';
import PageTitle from '@/components/shell/PageTitle';
import Surface from '@/components/shell/Surface';
import StatusChip from '@/components/shell/StatusChip';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { APPLICATIONS, STUDENT, formatDate, isoIn } from '@/lib/studentWorkspace';
import { useI18n } from '@/i18n/I18nProvider';

// The stored value stays the canonical English label so a request keeps its
// meaning when the interface language changes.
const TYPES = [
  { value: 'Enrolment certificate', key: 'enrolment' },
  { value: 'Transcript (English)', key: 'transcriptEn' },
  { value: 'Transcript (Russian)', key: 'transcriptRu' },
  { value: 'Academic leave request', key: 'leave' },
];

const REQUEST_STATUS = {
  submitted: { key: 'submitted', tone: 'brand' },
  under_review: { key: 'under_review', tone: 'warning' },
  approved: { key: 'approved', tone: 'positive' },
  rejected: { key: 'rejected', tone: 'critical' },
  completed: { key: 'completed', tone: 'positive' },
  draft: { key: 'draft', tone: 'neutral' },
};

const RECORD_STATUS = {
  ready: { key: 'ready', tone: 'positive' },
  in_review: { key: 'in_review', tone: 'warning' },
  rejected: { key: 'rejected', tone: 'critical' },
};

export default function ApplicationsPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [requests, setRequests] = useState(null);
  const [form, setForm] = useState({ certificate_type: TYPES[0].value, purpose: '', needed_by: '' });
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
      setError(t('office.applications.errorPurpose'));
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
      setForm({ certificate_type: TYPES[0].value, purpose: '', needed_by: '' });
      await load();
    } catch {
      setError(t('office.applications.errorSubmit'));
    } finally {
      setBusy(false);
    }
  };

  const fieldClass =
    'w-full rounded-lg border border-line bg-white px-3 py-2 text-[12px] text-ink placeholder:text-mutedink/70 focus:border-royal/40 focus:outline-none focus:ring-2 focus:ring-royal/10';

  return (
    <div>
      <PageTitle
        eyebrow={t('student.common.studentWorkspace')}
        title={t('office.applications.title')}
        description={t('office.applications.description')}
        meta={['Student office · Building 2, window 4', t('office.applications.metaTurnaround')]}
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <Surface title={t('office.applications.newRequest')} subtitle={t('office.applications.newRequestSub')}>
          <form onSubmit={submit} className="space-y-3">
            <label className="block">
              <span className="mb-1 block text-[11px] font-medium text-ink">{t('office.applications.document')}</span>
              <select
                value={form.certificate_type}
                onChange={(event) => setForm((prev) => ({ ...prev, certificate_type: event.target.value }))}
                className={fieldClass}
              >
                {TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {t(`office.applications.types.${type.key}`)}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-[11px] font-medium text-ink">{t('office.applications.purpose')}</span>
              <input
                value={form.purpose}
                onChange={(event) => setForm((prev) => ({ ...prev, purpose: event.target.value }))}
                placeholder={t('office.applications.purposePlaceholder')}
                className={fieldClass}
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-[11px] font-medium text-ink">{t('office.applications.neededBy')}</span>
              <input
                type="date"
                value={form.needed_by}
                onChange={(event) => setForm((prev) => ({ ...prev, needed_by: event.target.value }))}
                className={fieldClass}
              />
            </label>

            {error && <p className="text-[11px] text-critical">{error}</p>}

            <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-60">
              {busy ? t('office.applications.submitting') : t('office.applications.submit')}
            </button>
            <p className="text-[10.5px] leading-relaxed text-mutedink">
              {t('office.applications.storageNote', { studentId: STUDENT.studentId })}
            </p>
          </form>
        </Surface>

        <div className="space-y-4">
          <Surface
            title={t('office.applications.yourRequests')}
            subtitle={requests === null ? t('common.loading') : t('office.applications.inDatabase', { count: requests.length })}
            bodyClassName="px-0 pb-0 pt-1"
          >
            {requests && requests.length === 0 && (
              <p className="px-5 py-6 text-[11.5px] text-mutedink">
                {t('office.applications.empty')}
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
                              {t('office.applications.submittedOn', { date: formatDate(request.submitted_date) })}
                            </p>
                          )}
                        </div>
                        <StatusChip tone={status.tone}>{t(`office.applications.requestStatus.${status.key}`)}</StatusChip>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Surface>

          <Surface
            title={t('office.applications.examples')}
            subtitle={t('office.applications.examplesSub')}
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
                      <StatusChip tone={status.tone}>{t(`office.applications.recordStatus.${status.key}`)}</StatusChip>
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