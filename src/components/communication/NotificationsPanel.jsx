import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { comm, formatStamp } from '@/lib/communication/api';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'message', label: 'Messages' },
  { key: 'official', label: 'Official' },
  { key: 'announcement', label: 'Announcements' },
  { key: 'security', label: 'Security' },
];

export default function NotificationsPanel({ onChanged }) {
  const [state, setState] = useState({ loading: true, items: [], error: '' });
  const [category, setCategory] = useState('all');

  const load = async () => {
    const data = await comm('notifications');
    setState({ loading: false, items: data.items, error: '' });
  };

  useEffect(() => {
    load().catch((error) => setState({ loading: false, items: [], error: error.message }));
  }, []);

  const markAll = async () => {
    await comm('notificationsRead', {});
    await load();
    onChanged?.();
  };

  const markOne = async (id) => {
    await comm('notificationsRead', { notificationId: id });
    await load();
    onChanged?.();
  };

  const items = state.items.filter((item) => category === 'all' || item.category === category);

  return (
    <div className="card-surface overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3">
        <div className="flex flex-wrap gap-1">
          {CATEGORIES.map((entry) => (
            <button
              key={entry.key}
              type="button"
              onClick={() => setCategory(entry.key)}
              className={cn(
                'rounded-md px-2 py-1 text-[13px] font-medium',
                category === entry.key ? 'bg-canvas text-ink' : 'text-mutedink hover:text-ink',
              )}
            >
              {entry.label}
            </button>
          ))}
        </div>
        <button type="button" onClick={markAll} className="btn-quiet btn-sm ml-auto">
          Mark all as read
        </button>
      </div>

      {state.loading && <div className="p-4"><div className="h-20 animate-pulse rounded-lg bg-[#F3F5F9]" /></div>}
      {state.error && <p className="p-4 text-[13px] text-[#A23B3B]">{state.error}</p>}
      {!state.loading && !items.length && (
        <p className="p-6 text-center text-[14px] text-mutedink">No notifications in this category.</p>
      )}

      <ul className="divide-y divide-line/70">
        {items.map((item) => (
          <li key={item.id} className={cn('flex items-start gap-3 px-4 py-3', !item.is_read && 'bg-[#F8FAFF]')}>
            <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', item.is_read ? 'bg-line' : 'bg-brand')} />
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-medium text-ink">{item.title}</p>
              {item.body && <p className="mt-0.5 text-[13px] leading-relaxed text-mutedink">{item.body}</p>}
              <p className="mt-1 text-[12px] text-mutedink">{formatStamp(item.created_date)}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {!item.is_read && (
                <button type="button" onClick={() => markOne(item.id)} className="text-[12px] text-mutedink hover:text-ink">
                  Mark read
                </button>
              )}
              {item.link && (
                <Link to={item.link} className="inline-flex items-center gap-0.5 text-[12px] font-medium text-brand">
                  Open <ChevronRight className="h-3 w-3" />
                </Link>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}