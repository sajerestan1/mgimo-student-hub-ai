import { cn } from '@/lib/utils';

const TONES = {
  brand: 'bg-brand-soft text-brand',
  positive: 'bg-[#E9F5EF] text-[#1D7A50]',
  warning: 'bg-[#FCF3E4] text-[#8E6018]',
  royal: 'bg-royal/10 text-royal',
  neutral: 'bg-[#F2F4F8] text-[#5A6779]',
};

/** A panel heading: a tinted icon chip followed by the section name. */
export default function PanelTitle({ icon: Icon, tone = 'brand', children }) {
  return (
    <span className="flex items-center gap-2">
      <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-lg', TONES[tone] || TONES.brand)}>
        <Icon className="h-4 w-4" strokeWidth={1.9} />
      </span>
      <span>{children}</span>
    </span>
  );
}