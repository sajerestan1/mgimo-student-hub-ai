import { ChevronRight, CalendarDays } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import { formatDateValue } from '@/lib/academic';

export default function ApplicationCard({ application, onOpen }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(application)}
      className="card-surface w-full p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-[0_18px_34px_-26px_rgba(16,42,76,0.6)] sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[14px] font-medium leading-snug text-navy-deep">{application.title}</p>
          <p className="mt-0.5 text-[11.5px] text-slate-500">{application.certificate_type}</p>
        </div>
        <StatusBadge status={application.status} />
      </div>

      {application.purpose && (
        <p className="mt-2.5 line-clamp-2 text-[12px] leading-relaxed text-slate-500">
          {application.purpose}
        </p>
      )}

      <div className="mt-3.5 flex items-center justify-between border-t border-[#F1F4FA] pt-3">
        <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <CalendarDays className="h-3 w-3" />
          {application.submitted_date
            ? `Submitted ${formatDateValue(application.submitted_date)}`
            : 'Not submitted yet'}
        </span>
        <span className="flex items-center gap-1 text-[11.5px] font-medium text-navy-mid">
          Details <ChevronRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </button>
  );
}