import { useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import PageTitle from '@/components/shell/PageTitle';
import Surface from '@/components/shell/Surface';
import { NOTIFICATIONS } from '@/lib/demoUniversity';

const TONE = {
  critical: 'bg-critical',
  warning: 'bg-warning',
  info: 'bg-brand',
};

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'critical', label: 'Critical' },
];

export default function NotificationsPage() {
  const [filter, setFilter] = useState('all');
  const [readAll, setReadAll] = useState(false);

  const rows = NOTIFICATIONS.filter((item) => {
    if (filter === 'critical') return item.tone === 'critical';
    if (filter === 'unread') return !readAll;
    return true;
  });

  return (
    <div className="mx-auto max-w-3xl">
      <PageTitle
        eyebrow="Inbox"
        title="Notifications"
        description="Institutional signals from the demonstration dataset."
        actions={
          <button
            type="button"
            onClick={() => setReadAll(true)}
            disabled={readAll}
            className="btn-quiet btn-sm disabled:opacity-50"
          >
            <Check className="h-3.5 w-3.5" /> {readAll ? 'All read' : 'Mark all as read'}
          </button>
        }
      />

      <div className="mb-3 inline-flex rounded-lg border border-line bg-canvas p-0.5">
        {FILTERS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setFilter(item.key)}
            className={cn(
              'rounded-[6px] px-3 py-1.5 text-[11.5px] font-medium transition-colors',
              filter === item.key
                ? 'bg-white text-ink shadow-[0_1px_2px_rgba(16,27,51,0.08)]'
                : 'text-mutedink hover:text-ink'
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <Surface bodyClassName="p-0">
        <ul className="divide-y divide-line">
          {rows.map((item) => (
            <li key={item.id} className="row-hover flex items-start gap-3 px-5 py-3.5">
              <span className={cn('mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full', readAll ? 'bg-[#D9DFEA]' : TONE[item.tone])} />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[12.5px] font-medium text-ink">{item.title}</p>
                  <span className="shrink-0 text-[10.5px] tabular-nums text-mutedink">{item.time}</span>
                </div>
                <p className="mt-0.5 text-[11.5px] leading-relaxed text-mutedink">{item.detail}</p>
              </div>
            </li>
          ))}
          {rows.length === 0 && (
            <li className="px-5 py-14 text-center">
              <p className="text-[13px] font-medium text-ink">You are all caught up</p>
              <p className="mt-1 text-[11.5px] text-mutedink">No notifications match this filter.</p>
            </li>
          )}
        </ul>
      </Surface>
    </div>
  );
}