import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * The workspace AI assistant entry point. One shared treatment on every
 * dashboard: a blue-to-violet gradient pill that reads as the primary action
 * without competing with the page's own content. It only ever links to the
 * assistant that belongs to the signed-in role.
 */
export default function AiAssistantButton({ to, label = 'AI Assistant', className }) {
  return (
    <Link
      to={to}
      aria-label={label}
      className={cn(
        'inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#3B82F6] via-[#5B6CF6] to-[#8B5CF6] px-3.5 py-2 text-[15px] font-semibold text-white shadow-[0_8px_20px_-8px_rgba(79,70,229,0.75)] transition duration-150 hover:brightness-[1.06] hover:shadow-[0_10px_24px_-8px_rgba(79,70,229,0.85)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1] focus-visible:ring-offset-2',
        className,
      )}
    >
      <Sparkles className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
      <span className="whitespace-nowrap">{label}</span>
    </Link>
  );
}