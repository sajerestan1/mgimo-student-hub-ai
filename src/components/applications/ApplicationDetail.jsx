import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/StatusBadge';
import { STATUS_META, formatDateValue } from '@/lib/academic';

function Row({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-[#F1F4FA] py-2.5 last:border-0 sm:flex-row sm:items-baseline sm:justify-between">
      <span className="text-[11px] uppercase tracking-[0.12em] text-slate-400">{label}</span>
      <span className="text-[12.5px] text-navy-deep sm:max-w-[62%] sm:text-right">{value}</span>
    </div>
  );
}

export default function ApplicationDetail({ application, open, onOpenChange, onSubmitted }) {
  if (!application) return null;
  const history = application.history || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3">
            <DialogTitle className="font-heading text-[19px] leading-snug text-navy-deep">
              {application.title}
            </DialogTitle>
            <StatusBadge status={application.status} />
          </div>
          <DialogDescription className="text-[12px] text-slate-500">
            {application.certificate_type}
          </DialogDescription>
        </DialogHeader>

        <div className="pt-1">
          <div className="rounded-xl border border-[#EEF1F7] px-3.5">
            <Row label="Purpose" value={application.purpose || '—'} />
            <Row label="Needed by" value={application.needed_by ? formatDateValue(application.needed_by) : 'Not specified'} />
            <Row
              label="Submitted"
              value={application.submitted_date ? formatDateValue(application.submitted_date) : 'Not submitted'}
            />
          </div>

          <h3 className="mb-3 mt-5 text-[11px] uppercase tracking-[0.16em] text-slate-400">
            Status history
          </h3>
          <ol className="space-y-3">
            {history.length === 0 && (
              <li className="text-[12px] text-slate-500">No status updates recorded yet.</li>
            )}
            {history.map((step, index) => (
              <li key={`${step.status}-${index}`} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-gold" />
                  {index < history.length - 1 && <span className="mt-1 w-px flex-1 bg-[#E4E9F2]" />}
                </div>
                <div className="pb-2">
                  <p className="text-[12.5px] font-medium text-navy-deep">
                    {(STATUS_META[step.status] || STATUS_META.draft).label}
                    <span className="ml-2 font-normal text-slate-400">{step.date}</span>
                  </p>
                  {step.note && <p className="mt-0.5 text-[11.5px] text-slate-500">{step.note}</p>}
                </div>
              </li>
            ))}
          </ol>

          {application.status === 'draft' && onSubmitted && (
            <Button
              type="button"
              onClick={async () => {
                await onSubmitted(application);
                onOpenChange(false);
              }}
              className="mt-4 w-full rounded-xl bg-navy text-[12.5px] hover:bg-navy-deep"
            >
              Submit this application
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}