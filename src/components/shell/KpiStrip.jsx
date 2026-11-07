import { cn } from '@/lib/utils';

const COLUMNS = {
  4: 'sm:grid-cols-2 lg:grid-cols-4',
  6: 'sm:grid-cols-3 lg:grid-cols-6',
};

const DELTA_TONES = {
  positive: 'text-positive',
  warning: 'text-warning',
  critical: 'text-critical',
  neutral: 'text-mutedink',
};

/**
 * One grouped metric strip instead of a row of repeated cards. Hairlines are
 * drawn by the gap colour, so the block reads as a single instrument panel.
 */
export default function KpiStrip({ items, columns = 4, className }) {
  return (
    <section className={cn('card-surface overflow-hidden', className)}>
      <div className={cn('grid grid-cols-2 gap-px bg-line', COLUMNS[columns] || COLUMNS[4])}>
        {items.map((item) => (
          <div key={item.label} className="bg-white px-4 py-4">
            <p className="text-[11px] font-medium text-mutedink">{item.label}</p>
            <div className="mt-1.5 flex flex-wrap items-baseline gap-x-1.5">
              <p className="text-[22px] font-semibold leading-none tracking-[-0.02em] tabular-nums text-ink">
                {item.value}
              </p>
              {item.delta && (
                <span className={cn('text-[11px] font-medium', DELTA_TONES[item.tone] || DELTA_TONES.neutral)}>
                  {item.delta}
                </span>
              )}
            </div>
            {item.hint && <p className="mt-1.5 text-[11px] leading-snug text-mutedink">{item.hint}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}