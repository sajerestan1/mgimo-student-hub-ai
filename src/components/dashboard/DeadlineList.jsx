import { Link } from 'react-router-dom';
import { Clock, ChevronRight } from 'lucide-react';
import { CATEGORY_META, formatDateValue } from '@/lib/academic';

export default function DeadlineList({ notifications }) {
  const deadlines = notifications
    .filter((item) => item.due_date)
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 4);

  return (
    <section className="card-surface p-5 sm:p-6">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="font-heading text-[17px] text-navy-deep">Upcoming deadlines</h2>
        <span className="flex items-center gap-1 text-[11px] text-slate-400">
          <Clock className="h-3 w-3" /> From your notifications
        </span>
      </div>

      {deadlines.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[#DDE5F1] px-4 py-8 text-center text-[12px] text-slate-500">
          No deadlines are listed in your account right now.
        </p>
      ) : (
        <ul className="space-y-2.5">
          {deadlines.map((item) => {
            const meta = CATEGORY_META[item.category] || CATEGORY_META.reminder;
            return (
              <li key={item.id}>
                <Link
                  to="/notifications"
                  className="flex items-center gap-3 rounded-xl border border-[#EEF1F7] px-3.5 py-3 transition-colors hover:border-gold/40 hover:bg-[#FCFAF5]"
                >
                  <span className="h-8 w-[3px] shrink-0 rounded-full bg-gold" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-navy-deep">{item.title}</p>
                    <p className="mt-0.5 text-[11px] text-slate-500">{meta.label}</p>
                  </div>
                  <span className="shrink-0 text-[11px] font-medium text-navy-mid">
                    {formatDateValue(item.due_date)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <Link
        to="/notifications"
        className="mt-3.5 flex items-center justify-center gap-1 text-[11.5px] font-medium text-navy-mid hover:text-navy"
      >
        Open notification center <ChevronRight className="h-3.5 w-3.5" />
      </Link>
    </section>
  );
}