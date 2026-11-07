import { cn } from '@/lib/utils';

export default function KpiCard({ label, value, caption, icon: Icon, trend, accent = 'navy' }) {
  const accents = {
    navy: 'text-navy bg-[#EEF3FA]',
    gold: 'text-[#9A7B33] bg-gold/15',
    red: 'text-[#A33A38] bg-[#FBEDEC]',
    green: 'text-[#2F6B4F] bg-[#ECF5F0]',
  };

  return (
    <div className="card-surface p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10.5px] font-medium uppercase tracking-[0.12em] text-mutedink">{label}</p>
        {Icon && (
          <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-lg', accents[accent] || accents.navy)}>
            <Icon className="h-3.5 w-3.5" strokeWidth={1.9} />
          </span>
        )}
      </div>
      <p className="mt-2 font-heading text-[26px] leading-none text-ink">{value}</p>
      <div className="mt-2 flex items-center gap-1.5">
        {trend && (
          <span
            className={cn(
              'rounded px-1.5 py-0.5 text-[10px] font-semibold',
              String(trend).startsWith('-') ? 'bg-[#FBEDEC] text-[#A33A38]' : 'bg-[#ECF5F0] text-[#2F6B4F]'
            )}
          >
            {trend}
          </span>
        )}
        {caption && <span className="text-[10.5px] text-mutedink">{caption}</span>}
      </div>
    </div>
  );
}