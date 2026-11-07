import { BookMarked } from 'lucide-react';
import PageTitle from '@/components/shell/PageTitle';
import Surface from '@/components/shell/Surface';
import StatusChip from '@/components/shell/StatusChip';
import { LIBRARY_CATALOG, LIBRARY_LOANS, formatDate, daysUntil } from '@/lib/studentWorkspace';

export default function LibraryPage() {
  const overdue = LIBRARY_LOANS.filter((loan) => daysUntil(loan.dueDate) < 0).length;

  return (
    <div>
      <PageTitle
        eyebrow="Student workspace"
        title="Library"
        description="Your loans and the reading list for this semester. The main library opens 08:00–23:00 during assessment weeks."
        meta={[`${LIBRARY_LOANS.length} loans`, overdue ? `${overdue} overdue` : 'Nothing overdue', 'Moscow campus']}
      />

      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <Surface title="Your loans" bodyClassName="px-0 pb-0 pt-1">
          <ul className="divide-y divide-line">
            {LIBRARY_LOANS.map((loan) => {
              const days = daysUntil(loan.dueDate);
              const late = days < 0;
              return (
                <li key={loan.id} className="flex items-start justify-between gap-3 px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="text-[12px] font-medium text-ink">{loan.title}</p>
                    <p className="mt-0.5 text-[10.5px] text-mutedink">
                      {loan.author} · {loan.shelf}
                    </p>
                    <p className={`mt-1 text-[10.5px] font-medium ${late ? 'text-critical' : 'text-mutedink'}`}>
                      {late ? `Overdue since ${formatDate(loan.dueDate)}` : `Due ${formatDate(loan.dueDate)}`}
                      {` · ${loan.renewals} ${loan.renewals === 1 ? 'renewal' : 'renewals'} used`}
                    </p>
                  </div>
                  <StatusChip tone={late ? 'critical' : days <= 3 ? 'warning' : 'neutral'}>
                    {late ? 'Overdue' : `${days} d`}
                  </StatusChip>
                </li>
              );
            })}
          </ul>
        </Surface>

        <Surface title="Reading list" subtitle="Titles from your course bibliographies" bodyClassName="px-0 pb-0 pt-1">
          <ul className="divide-y divide-line">
            {LIBRARY_CATALOG.map((item) => (
              <li key={item.id} className="flex items-start gap-3 px-5 py-3.5">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-canvas text-mutedink">
                  <BookMarked className="h-4 w-4" strokeWidth={1.8} />
                </span>
                <div className="min-w-0">
                  <p className="text-[12px] font-medium text-ink">{item.title}</p>
                  <p className="mt-0.5 text-[10.5px] text-mutedink">
                    {item.author} · Shelf {item.shelf}
                  </p>
                  <p className="mt-1 text-[10.5px] text-ink/70">{item.availability}</p>
                </div>
              </li>
            ))}
          </ul>
        </Surface>
      </div>

      <p className="mt-4 rounded-lg border border-line bg-white px-4 py-3 text-[11px] leading-relaxed text-mutedink">
        Online renewal and reservation are handled at the library desk in this prototype — no self-service action is
        offered here because it would not reach the library system.
      </p>
    </div>
  );
}