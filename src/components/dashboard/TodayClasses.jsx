import { Link } from 'react-router-dom';
import { ArrowUpRight, CalendarX2 } from 'lucide-react';
import ClassCard from '@/components/schedule/ClassCard';

export default function TodayClasses({ entries }) {
  return (
    <section className="card-surface p-5 sm:p-6 lg:col-span-2">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="font-heading text-[17px] text-navy-deep">Today’s classes</h2>
        <Link
          to="/schedule"
          className="flex shrink-0 items-center gap-1 text-[12px] font-medium text-navy-mid transition-colors hover:text-navy"
        >
          Full schedule <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#DDE5F1] py-10 text-center">
          <CalendarX2 className="mb-2 h-5 w-5 text-slate-300" strokeWidth={1.6} />
          <p className="text-[13px] font-medium text-navy-deep">No classes scheduled today</p>
          <p className="mt-1 text-[11.5px] text-slate-500">Enjoy the free study time.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {entries.map((entry) => (
            <ClassCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </section>
  );
}