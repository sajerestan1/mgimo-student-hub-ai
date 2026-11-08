import { cn } from '@/lib/utils';

/**
 * The single panel primitive: a hairline surface with an optional header,
 * an optional footer strip, and a body whose padding can be dropped for
 * full-bleed tables and charts.
 */
export default function Surface({
  title,
  subtitle,
  action,
  footer,
  className,
  bodyClassName,
  children,
}) {
  const hasHeader = Boolean(title || action);
  return (
    <section className={cn('card-surface flex flex-col overflow-hidden', className)}>
      {(title || action) && (
        <header className="flex items-start justify-between gap-4 px-5 pb-3 pt-4">
          <div className="min-w-0">
            {title && (
              <h2 className="text-[length:var(--type-card)] font-semibold leading-tight tracking-[-0.01em] text-ink">{title}</h2>
            )}
            {subtitle && (
              <p className="mt-1 text-[length:var(--type-secondary)] leading-[1.5] text-mutedink">{subtitle}</p>
            )}
          </div>
          {action && <div className="shrink-0 pt-0.5">{action}</div>}
        </header>
      )}
      <div className={cn(hasHeader ? 'px-5 pb-5' : 'p-5', bodyClassName)}>{children}</div>
      {footer && <div className="mt-auto border-t border-line px-5 py-3">{footer}</div>}
    </section>
  );
}