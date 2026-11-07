import { cn } from '@/lib/utils';

export default function Surface({ title, subtitle, action, className, bodyClassName, children }) {
  return (
    <section className={cn('card-surface overflow-hidden', className)}>
      {(title || action) && (
        <header className="flex items-start justify-between gap-3 border-b border-[#EEF1F7] px-4 py-3">
          <div className="min-w-0">
            <h2 className="text-[13px] font-semibold tracking-tight text-ink">{title}</h2>
            {subtitle && <p className="mt-0.5 text-[11px] leading-relaxed text-mutedink">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={cn('p-4', bodyClassName)}>{children}</div>
    </section>
  );
}