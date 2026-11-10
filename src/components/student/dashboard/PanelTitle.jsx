import { cn } from '@/lib/utils';

const TONES = {
  brand: 'bg-[#EFF6FF] text-[#2563EB]',
  positive: 'bg-[#ECFDF5] text-[#059669]',
  warning: 'bg-[#FFFBEB] text-[#D97706]',
  critical: 'bg-[#FEF2F2] text-[#DC2626]',
  neutral: 'bg-[#F1F5F9] text-[#64748B]',
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