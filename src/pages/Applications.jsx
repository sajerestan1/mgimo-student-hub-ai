import { useState } from 'react';
import { FileText, Plus, CheckCircle2, X } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { LoadingState, ErrorState } from '@/components/LoadingState';
import EmptyState from '@/components/EmptyState';
import ApplicationCard from '@/components/applications/ApplicationCard';
import ApplicationForm from '@/components/applications/ApplicationForm';
import ApplicationDetail from '@/components/applications/ApplicationDetail';
import { Button } from '@/components/ui/button';
import { useStudentData } from '@/lib/StudentDataContext';
import { CERTIFICATE_TYPES, formatDateValue, toISODate } from '@/lib/academic';

export default function Applications() {
  const { loading, error, reload, applications, createApplication, updateApplication } =
    useStudentData();
  const [formOpen, setFormOpen] = useState(false);
  const [formType, setFormType] = useState(null);
  const [detailId, setDetailId] = useState(null);
  const [confirmation, setConfirmation] = useState('');

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const detail = applications.find((application) => application.id === detailId) || null;

  const handleCreate = async (payload) => {
    const record = await createApplication(payload);
    setConfirmation(
      payload.status === 'draft'
        ? 'Your draft has been saved. You can submit it whenever you are ready.'
        : 'Your application has been submitted to the dean’s office.'
    );
    if (record?.id) setDetailId(record.id);
  };

  const handleSubmitDraft = async (application) => {
    const today = toISODate(new Date());
    await updateApplication(application.id, {
      status: 'submitted',
      submitted_date: today,
      history: [
        ...(application.history || []),
        { status: 'submitted', date: today, note: 'Submitted to the Dean’s Office' },
      ],
    });
    setConfirmation('Your application has been submitted to the dean’s office.');
  };

  const openForm = (type) => {
    setFormType(type || null);
    setFormOpen(true);
  };

  return (
    <div className="fade-up">
      <PageHeader
        eyebrow="Dean’s office"
        title="Applications & certificates"
        description="Request official documents and follow every step of your application."
        actions={
          <Button
            type="button"
            onClick={() => openForm(null)}
            className="rounded-xl bg-navy text-[12.5px] hover:bg-navy-deep"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" /> New application
          </Button>
        }
      />

      {confirmation && (
        <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-emerald-800">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.8} />
          <p className="flex-1 text-[12.5px] leading-relaxed">{confirmation}</p>
          <button
            type="button"
            onClick={() => setConfirmation('')}
            className="rounded p-0.5 text-emerald-700/60 transition-colors hover:text-emerald-800"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <section className="mb-7">
        <h2 className="mb-3 font-heading text-[16px] text-navy-deep">Available certificates</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {CERTIFICATE_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => openForm(type.value)}
              className="group flex flex-col rounded-2xl border border-[#E9EEF6] bg-white p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-gold/45 hover:shadow-[0_16px_32px_-24px_rgba(16,42,76,0.55)]"
            >
              <span className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-xl bg-[#F1F5FB] text-navy-mid transition-colors group-hover:bg-gold/12 group-hover:text-gold">
                <FileText className="h-4 w-4" strokeWidth={1.7} />
              </span>
              <p className="text-[13px] font-medium leading-snug text-navy-deep">{type.label}</p>
              <p className="mt-1 text-[11.5px] leading-relaxed text-slate-500">{type.description}</p>
              <span className="mt-3 text-[11px] font-medium text-navy-mid group-hover:text-gold">
                Request this document →
              </span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-heading text-[16px] text-navy-deep">My applications</h2>
          <span className="text-[11px] text-slate-400">
            {applications.length} {applications.length === 1 ? 'record' : 'records'}
          </span>
        </div>

        {applications.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No applications yet"
            description="Choose a certificate above to create your first request."
            action={
              <Button
                type="button"
                onClick={() => openForm(null)}
                className="rounded-xl bg-navy text-[12.5px] hover:bg-navy-deep"
              >
                Create application
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
            {applications.map((application) => (
              <ApplicationCard
                key={application.id}
                application={application}
                onOpen={(item) => setDetailId(item.id)}
              />
            ))}
          </div>
        )}
      </section>

      <p className="mt-6 rounded-xl bg-[#F7F9FD] px-4 py-3 text-[11px] leading-relaxed text-slate-500">
        Fictional demonstration office. Requests are stored only inside this prototype — no real
        document is issued, and no real university system is contacted.
        {applications.length > 0 && applications.some((item) => item.needed_by)
          ? ` Next requested date: ${formatDateValue(
              applications
                .filter((item) => item.needed_by)
                .sort((a, b) => new Date(a.needed_by) - new Date(b.needed_by))[0].needed_by
            )}.`
          : ''}
      </p>

      <ApplicationForm
        open={formOpen}
        onOpenChange={setFormOpen}
        initialType={formType}
        onSubmit={handleCreate}
      />
      <ApplicationDetail
        application={detail}
        open={Boolean(detail)}
        onOpenChange={(next) => !next && setDetailId(null)}
        onSubmitted={handleSubmitDraft}
      />
    </div>
  );
}