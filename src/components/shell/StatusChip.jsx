import { cn } from '@/lib/utils';

const TONES = {
  positive: 'bg-[#E9F5EF] text-[#1D7A50]',
  warning: 'bg-[#FCF3E4] text-[#8E6018]',
  critical: 'bg-[#FBECEC] text-[#A23B3B]',
  brand: 'bg-[#EDF1FE] text-[#3B5AE0]',
  neutral: 'bg-[#F2F4F8] text-[#5A6779]',
};

export default function StatusChip({ tone = 'neutral', children, className }) {
  return <span className={cn('chip', TONES[tone] || TONES.neutral, className)}>{children}</span>;
}