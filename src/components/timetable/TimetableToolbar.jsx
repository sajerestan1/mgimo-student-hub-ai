import { ChevronLeft, ChevronRight, Download, FileText, Image as ImageIcon, Printer, Share2 } from 'lucide-react';
import { mondayOf, shiftWeek, weekLabel } from '@/lib/timetable/week';
import { cn } from '@/lib/utils';

const tone = 'btn-quiet btn-sm';

function Action({ icon: Icon, label, onClick, disabled, busy }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled || busy} className={cn(tone, 'disabled:opacity-50')}>
      <Icon className={cn('h-3.5 w-3.5', busy && 'animate-pulse')} />
      {label}
    </button>
  );
}

export default function TimetableToolbar({ weekStart, onWeekChange, onExport, busy }) {
  return (
    <div className="flex flex-col gap-3 border-b border-line px-5 pb-3 pt-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-1.5">
        <button type="button" className="icon-btn" onClick={() => onWeekChange(shiftWeek(weekStart, -1))} aria-label="Previous week">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="min-w-[190px] text-center">
          <p className="text-[13px] font-semibold text-ink">{weekLabel(weekStart)}</p>
          <p className="text-[11px] text-mutedink">Select week</p>
        </div>
        <button type="button" className="icon-btn" onClick={() => onWeekChange(shiftWeek(weekStart, 1))} aria-label="Next week">
          <ChevronRight className="h-4 w-4" />
        </button>
        <input
          type="date"
          value={weekStart}
          onChange={(event) => event.target.value && onWeekChange(mondayOf(event.target.value))}
          aria-label="Jump to week"
          className="ml-1 w-[136px] rounded-lg border border-line bg-white px-2 py-1.5 text-[13px] text-ink"
        />
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <Action icon={FileText} label="PDF" onClick={() => onExport('pdf')} disabled={busy} busy={busy === 'pdf'} />
        <Action icon={ImageIcon} label="PNG" onClick={() => onExport('png')} disabled={busy} busy={busy === 'png'} />
        <Action icon={Printer} label="Print" onClick={() => onExport('print')} disabled={busy} busy={busy === 'print'} />
        <Action icon={Share2} label="Share" onClick={() => onExport('share')} disabled={busy} busy={busy === 'share'} />
        <span className="hidden items-center gap-1 text-[11px] text-mutedink sm:inline-flex">
          <Download className="h-3 w-3" /> A4 landscape
        </span>
      </div>
    </div>
  );
}