import { ChevronLeft, ChevronRight } from 'lucide-react';
import { mondayOf, shiftWeek, weekLabel } from '@/lib/timetable/week';
import ExportMenu from '@/components/timetable/ExportMenu';
import { useI18n } from '@/i18n/I18nProvider';

export default function TimetableToolbar({ weekStart, onWeekChange, onExport, busy }) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col gap-3 border-b border-line px-5 pb-3 pt-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-1.5">
        <button type="button" className="icon-btn" onClick={() => onWeekChange(shiftWeek(weekStart, -1))} aria-label={t('office.timetable.prevWeek')}>
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="min-w-[190px] text-center">
          <p className="text-[13px] font-semibold text-ink">{weekLabel(weekStart)}</p>
          <p className="text-[11px] text-mutedink">{t('office.timetable.selectWeek')}</p>
        </div>
        <button type="button" className="icon-btn" onClick={() => onWeekChange(shiftWeek(weekStart, 1))} aria-label={t('office.timetable.nextWeek')}>
          <ChevronRight className="h-4 w-4" />
        </button>
        <input
          type="date"
          value={weekStart}
          onChange={(event) => event.target.value && onWeekChange(mondayOf(event.target.value))}
          aria-label={t('office.timetable.jumpWeek')}
          className="ml-1 w-[136px] rounded-lg border border-line bg-white px-2 py-1.5 text-[13px] text-ink"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <ExportMenu onExport={onExport} busy={busy} disabled={busy} />
      </div>
    </div>
  );
}