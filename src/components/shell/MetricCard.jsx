import { cn } from '@/lib/utils';

const TONES = {
  neutral: 'bg-[#E3E8F1]',
  positive: 'bg-positive',
  warning: 'bg-warning',
  critical: 'bg-critical',
  brand: 'bg-brand',
};

export default function MetricCard({ label, value, hint, tone = 'neutral', footer }) {
  return (
    <div className="card-surface p-3.5">
      <div className="flex items-center gap-1.5">
        <span className={cn('h-1.5 w-1.5 rounded-full', TONES[tone] || TONES.neutral)} />
        <p className="text-[11px] font-medium text-mutedink">{label}</p>
      </div>
      <p className="mt-1.5 text-[22px] font-semibold leading-none tracking-[-0.02em] text-ink">{value}</p>
      {hint && <p className="mt-1.5 text-[10.5px] leading-relaxed text-mutedink">{hint}</p>}
      {footer}
    </div>
  );
}