import { MapPin } from 'lucide-react';
import { CLASS_TYPE_META } from '@/lib/academic';
import { cn } from '@/lib/utils';

export default function ClassCard({ entry }) {
  const meta = CLASS_TYPE_META[entry.type] || CLASS_TYPE_META.lecture;

  return (
    <div className="group relative flex gap-3.5 rounded-2xl border border-[#E9EEF6] bg-white p-3.5 transition-all duration-200 hover:border-gold/40 hover:shadow-[0_12px_28px_-22px_rgba(16,42,76,0.6)] sm:gap-4 sm:p-4">
      <div className="flex w-[58px] shrink-0 flex-col sm:w-[72px]">
        <span className="text-[12.5px] font-semibold tabular-nums text-navy-deep">{entry.start_time}</span>
        <span className="text-[10.5px] tabular-nums text-slate-400">{entry.end_time}</span>
      </div>
      <span className="w-[3px] shrink-0 rounded-full bg-gold/70 transition-colors group-hover:bg-gold" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <p className="text-[13.5px] font-medium leading-snug text-navy-deep">{entry.title}</p>
          <span
            className={cn(
              'shrink-0 rounded-full px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-wide',
              meta.className
            )}
          >
            {meta.label}
          </span>
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-slate-500">
          <span>{entry.instructor}</span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3 text-slate-400" />
            {entry.room}
          </span>
          {entry.course_code && <span className="text-slate-400">{entry.course_code}</span>}
        </div>
      </div>
    </div>
  );
}