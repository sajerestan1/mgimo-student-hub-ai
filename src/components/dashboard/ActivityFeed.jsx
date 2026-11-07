import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import CategoryIcon from '@/components/notifications/CategoryIcon';
import { relativeTime } from '@/lib/academic';

export default function ActivityFeed({ notifications }) {
  const items = [...notifications]
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
    .slice(0, 4);

  return (
    <section className="card-surface p-5 sm:p-6">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="font-heading text-[17px] text-navy-deep">Recent academic activity</h2>
        <Link
          to="/notifications"
          className="flex shrink-0 items-center gap-1 text-[12px] font-medium text-navy-mid hover:text-navy"
        >
          View all <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[#DDE5F1] px-4 py-8 text-center text-[12px] text-slate-500">
          No academic activity yet.
        </p>
      ) : (
        <ul className="space-y-3.5">
          {items.map((item) => (
            <li key={item.id} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F1F5FB] text-navy-mid">
                <CategoryIcon category={item.category} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] leading-snug text-navy-deep">{item.title}</p>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  {relativeTime(item.created_date)}
                  {!item.is_read && (
                    <span className="ml-2 inline-flex items-center gap-1 text-gold">
                      <span className="h-1 w-1 rounded-full bg-gold" /> new
                    </span>
                  )}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}