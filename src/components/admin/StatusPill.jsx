import { cn } from '@/lib/utils';

const TONES = {
  navy: 'bg-[#EDF2F9] text-[#102D50]',
  blue: 'bg-[#E9F1FA] text-[#2A5C8A]',
  gold: 'bg-gold/20 text-[#8A6C26]',
  green: 'bg-[#EAF5EF] text-[#2F6B4F]',
  red: 'bg-[#FBECEB] text-[#A33A38]',
  yellow: 'bg-[#FCF3DF] text-[#8A6C26]',
  gray: 'bg-[#F1F4F8] text-[#687C96]',
  purple: 'bg-[#F0EDF9] text-[#5B4A8A]',
  pink: 'bg-[#FCEDF3] text-[#A3486C]',
};

export function StatusPill({ label, tone = 'gray', className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded px-2 py-0.5 text-[10px] font-semibold capitalize',
        TONES[tone] || TONES.gray,
        className
      )}
    >
      {String(label || '').replace(/_/g, ' ')}
    </span>
  );
}

const REQUEST_TONES = {
  submitted: 'blue',
  under_review: 'yellow',
  awaiting_information: 'pink',
  approved: 'green',
  rejected: 'red',
  completed: 'gray',
  draft: 'gray',
  scheduled: 'yellow',
  published: 'green',
  archived: 'gray',
  active: 'green',
  academic_leave: 'yellow',
  graduated: 'blue',
  withdrawn: 'red',
  full_time: 'green',
  part_time: 'yellow',
  visiting: 'blue',
  open: 'yellow',
  in_progress: 'blue',
  done: 'green',
};

export function StatusByValue({ value, label }) {
  return <StatusPill label={label || value} tone={REQUEST_TONES[value] || 'gray'} />;
}

const RISK = {
  high: { label: 'High', tone: 'bg-[#FBECEB] text-[#A33A38] border-[#F0CFCC]' },
  medium: { label: 'Medium', tone: 'bg-[#FCF3DF] text-[#8A6C26] border-[#EFE0BE]' },
  low: { label: 'Low', tone: 'bg-[#EAF1FA] text-[#2A5C8A] border-[#D6E3F2]' },
  none: { label: 'No risk', tone: 'bg-[#F1F4F8] text-[#687C96] border-[#E3E9F1]' },
};

export function RiskBadge({ level = 'none', className }) {
  const config = RISK[level] || RISK.none;
  return (
    <span className={cn('inline-flex rounded border px-2 py-0.5 text-[10px] font-semibold', config.tone, className)}>
      {config.label}
    </span>
  );
}