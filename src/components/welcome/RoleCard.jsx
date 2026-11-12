import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

// Card tones are literal class strings so the build keeps them.
const TONES = {
  blue: 'bg-welcome-blue hover:bg-welcome-blueDeep',
  red: 'bg-welcome-red hover:bg-welcome-redDeep',
  navy: 'bg-welcome-navy hover:bg-[#16283C]',
};

/**
 * A workspace entry point. It is navigation only: the destination is the
 * sign-in flow, which never assigns a role or a permission.
 */
export default function RoleCard({ label, icon: Icon, tone = 'blue', to, className }) {
  return (
    <Link
      to={to}
      className={cn(
        'flex min-h-[112px] flex-col items-center justify-center gap-2.5 rounded-[18px] px-4 py-5 text-center transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-welcome-navy/50 focus-visible:ring-offset-2 focus-visible:ring-offset-welcome-canvas',
        'sm:min-h-[148px] sm:gap-3 sm:py-6',
        TONES[tone],
        className,
      )}
    >
      <Icon className="h-8 w-8 text-white sm:h-9 sm:w-9" strokeWidth={1.6} aria-hidden="true" />
      <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-white sm:text-[13px]">
        {label}
      </span>
    </Link>
  );
}