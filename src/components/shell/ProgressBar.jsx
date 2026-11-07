import { cn } from '@/lib/utils';

const TONES = {
  brand: 'bg-brand',
  positive: 'bg-positive',
  warning: 'bg-warning',
  critical: 'bg-critical',
  navy: 'bg-navy',
};

export default function ProgressBar({ value, tone = 'brand', className }) {
  const width = Math.min(100, Math.max(0, Math.round(value)));
  return (
    <div className={cn('h-1.5 w-full overflow-hidden rounded-full bg-[#EEF1F6]', className)}>
      <div
        className={cn('h-full rounded-full transition-[width] duration-500 ease-out', TONES[tone] || TONES.brand)}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}