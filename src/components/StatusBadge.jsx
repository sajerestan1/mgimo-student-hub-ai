import { STATUS_META } from '@/lib/academic';
import { cn } from '@/lib/utils';

export default function StatusBadge({ status, className }) {
  const meta = STATUS_META[status] || STATUS_META.draft;
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-inset',
        meta.className,
        className
      )}
    >
      {meta.label}
    </span>
  );
}