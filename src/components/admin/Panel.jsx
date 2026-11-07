import { cn } from '@/lib/utils';

export default function Panel({ title, subtitle, actions, children, className, bodyClassName, heading }) {
  return (
    <section className={cn('card-surface overflow-hidden', className)}>
      {(title || actions) && (
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#EEF2F8] px-4 py-3.5 sm:px-5">
          <div className="min-w-0">
            {title && (
              <h2 className={cn('font-heading text-[16px] leading-tight text-ink', heading === 'sans' && 'font-body text-[13.5px] font-semibold')}>
                {title}
              </h2>
            )}
            {subtitle && <p className="mt-0.5 text-[11.5px] leading-relaxed text-mutedink">{subtitle}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={cn('p-4 sm:p-5', bodyClassName)}>{children}</div>
    </section>
  );
}