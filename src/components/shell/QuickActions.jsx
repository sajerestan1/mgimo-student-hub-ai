import { Link } from 'react-router-dom';
import Surface from './Surface';

/**
 * Compact, icon-led shortcuts. Icons carry meaning (destination), never decoration.
 */
export default function QuickActions({ title = 'Quick actions', items, className }) {
  return (
    <Surface title={title} className={className} bodyClassName="px-2 pb-2 pt-1">
      <div className="grid grid-cols-2 gap-0.5 sm:grid-cols-3 xl:grid-cols-6">
        {items.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              to={action.to}
              className="group flex items-center gap-2 rounded-lg px-2.5 py-2 text-[12px] font-medium text-ink/75 transition-colors hover:bg-canvas hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25"
            >
              <Icon className="h-4 w-4 shrink-0 text-mutedink transition-colors group-hover:text-brand" strokeWidth={1.8} />
              <span className="truncate">{action.label}</span>
            </Link>
          );
        })}
      </div>
    </Surface>
  );
}