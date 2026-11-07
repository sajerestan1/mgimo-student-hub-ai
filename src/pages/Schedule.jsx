import { useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarX2, MapPin } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { LoadingState, ErrorState } from '@/components/LoadingState';
import ClassCard from '@/components/schedule/ClassCard';
import EmptyState from '@/components/EmptyState';
import { useStudentData } from '@/lib/StudentDataContext';
import {
  addDays,
  formatLongDate,
  formatShortDate,
  startOfAcademicWeek,
  weekdayNumber,
  WEEKDAY_SHORT,
} from '@/lib/academic';
import { cn } from '@/lib/utils';

export default function Schedule() {
  const { loading, error, reload, schedule } = useStudentData();
  const [view, setView] = useState('day');
  const [selectedDate, setSelectedDate] = useState(new Date());

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const weekStart = startOfAcademicWeek(selectedDate);
  const weekDays = Array.from({ length: 6 }, (_, index) => addDays(weekStart, index));
  const selectedWeekday = weekdayNumber(selectedDate);
  const todayWeekday = weekdayNumber(new Date());

  const dayEntries = [...schedule]
    .filter((entry) => Number(entry.weekday) === selectedWeekday)
    .sort((a, b) => String(a.start_time).localeCompare(String(b.start_time)));

  const shift = (direction) => {
    const step = view === 'day' ? direction : direction * 7;
    setSelectedDate((current) => addDays(current, step));
  };

  return (
    <div className="fade-up">
      <PageHeader
        eyebrow="Timetable"
        title="Academic schedule"
        description="Your weekly classes, lecturers, rooms and consultation hours."
        actions={
          <div className="flex rounded-xl border border-[#E4E9F2] bg-white p-1">
            {['day', 'week'].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setView(option)}
                className={cn(
                  'rounded-lg px-3.5 py-1.5 text-[12px] font-medium capitalize transition-colors',
                  view === option ? 'bg-navy text-white shadow-sm' : 'text-slate-500 hover:text-navy'
                )}
              >
                {option}
              </button>
            ))}
          </div>
        }
      />

      <div className="card-surface mb-5 flex flex-wrap items-center justify-between gap-3 px-3 py-2.5 sm:px-4">
        <button
          type="button"
          onClick={() => shift(-1)}
          className="rounded-lg p-2 text-navy-mid transition-colors hover:bg-[#F1F5FB]"
          aria-label="Previous"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="order-first w-full text-center sm:order-none sm:w-auto">
          <p className="font-heading text-[15px] text-navy-deep sm:text-[17px]">
            {view === 'day' ? formatLongDate(selectedDate) : `Week of ${formatShortDate(weekStart)}`}
          </p>
          <p className="mt-0.5 text-[10.5px] text-slate-400">
            {view === 'day'
              ? `${dayEntries.length} ${dayEntries.length === 1 ? 'class' : 'classes'}`
              : `${weekDays.filter((day) => schedule.some((entry) => Number(entry.weekday) === weekdayNumber(day))).length} study days`}
          </p>
        </div>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => setSelectedDate(new Date())}
            className="rounded-lg border border-[#E4E9F2] px-2.5 py-1.5 text-[11px] font-medium text-navy-mid transition-colors hover:bg-[#F1F5FB]"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => shift(1)}
            className="rounded-lg p-2 text-navy-mid transition-colors hover:bg-[#F1F5FB]"
            aria-label="Next"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {view === 'day' ? (
        dayEntries.length === 0 ? (
          <EmptyState
            icon={CalendarX2}
            title="No classes on this day"
            description="Choose another date, or switch to the weekly view to plan your week."
          />
        ) : (
          <div className="space-y-2.5">
            {dayEntries.map((entry) => (
              <ClassCard key={entry.id} entry={entry} />
            ))}
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {weekDays.map((day, index) => {
            const weekday = index + 1;
            const entries = [...schedule]
              .filter((entry) => Number(entry.weekday) === weekday)
              .sort((a, b) => String(a.start_time).localeCompare(String(b.start_time)));
            const isToday = weekday === todayWeekday;

            return (
              <button
                key={weekday}
                type="button"
                onClick={() => {
                  setSelectedDate(day);
                  setView('day');
                }}
                className={cn(
                  'flex flex-col rounded-2xl border bg-white p-3.5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-24px_rgba(16,42,76,0.55)]',
                  isToday ? 'border-gold/50 bg-[#FDFBF6]' : 'border-[#E9EEF6]'
                )}
              >
                <div className="mb-2.5 flex items-baseline justify-between">
                  <p
                    className={cn(
                      'text-[10px] font-semibold uppercase tracking-[0.18em]',
                      isToday ? 'text-gold' : 'text-slate-400'
                    )}
                  >
                    {WEEKDAY_SHORT[index]}
                  </p>
                  <p className="text-[11px] tabular-nums text-slate-400">{formatShortDate(day)}</p>
                </div>

                {entries.length === 0 ? (
                  <p className="py-3 text-[11.5px] text-slate-400">No classes</p>
                ) : (
                  <ul className="space-y-2">
                    {entries.map((entry) => (
                      <li key={entry.id} className="rounded-lg border border-[#EEF1F7] px-2.5 py-2">
                        <p className="text-[10.5px] font-semibold tabular-nums text-navy-mid">
                          {entry.start_time}
                        </p>
                        <p className="mt-0.5 text-[11.5px] font-medium leading-tight text-navy-deep">
                          {entry.title}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-400">
                          <MapPin className="h-2.5 w-2.5" />
                          {entry.room}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}