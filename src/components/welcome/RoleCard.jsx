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
        'flex min-h-[150px] flex-col items-center justify-center gap-4 rounded-[20px] px-4 py-7 text-center transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-welcome-navy/50 focus-visible:ring-offset-2 focus-visible:ring-offset-welcome-canvas',
        'sm:min-h-[190px]',
        TONES[tone],
        className,
      )}
    >
      <Icon className="h-9 w-9 text-white sm:h-10 sm:w-10" strokeWidth={1.6} aria-hidden="true" />
      <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-white sm:text-[13px]">
        {label}
      </span>
    </Link>
  );
}