import { useEffect, useState } from 'react';
import { Pin, Search, Users, Lock, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { comm, formatStamp } from '@/lib/communication/api';
import { usePolling } from '@/hooks/useCommunication';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'private', label: 'Private' },
  { key: 'official', label: 'Official' },
  { key: 'groups', label: 'Groups' },
];

const ICONS = { private: Lock, official: Building2, group: Users };

export default function ThreadList({ boot, selectedId, onSelect }) {
  const [state, setState] = useState({ items: [], loading: true, error: '' });
  const [filter, setFilter] = useState(boot?.staff ? 'all' : 'all');
  const [query, setQuery] = useState('');

  const load = async () => {
    const data = await comm('inbox', { filter });
    setState({ items: data.items, loading: false, error: '' });
  };

  useEffect(() => {
    setState((current) => ({ ...current, loading: true }));
    load()
      .catch((error) => setState({ items: [], loading: false, error: error.message }));
  }, [filter]);

  usePolling(load, 15000);

  const items = state.items.filter((item) =>
    !query || `${item.title} ${item.preview}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="card-surface flex h-full min-h-[420px] flex-col overflow-hidden">
      <div className="border-b border-line p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-mutedink" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search conversations"
            className="w-full rounded-lg border border-line bg-white py-2 pl-8 pr-2 text-[14px] outline-none focus:border-brand"
          />
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {FILTERS.map((entry) => (
            <button
              key={entry.key}
              type="button"
              onClick={() => setFilter(entry.key)}
              className={cn(
                'rounded-md px-2 py-1 text-[13px] font-medium transition-colors',
                filter === entry.key ? 'bg-canvas text-ink' : 'text-mutedink hover:text-ink',
              )}
            >
              {entry.label}
            </button>
          ))}
        </div>
      </div>

      <div className="scroll-thin flex-1 overflow-y-auto">
        {state.loading && <div className="space-y-2 p-3">{[0, 1, 2].map((row) => <div key={row} className="h-14 animate-pulse rounded-lg bg-[#F3F5F9]" />)}</div>}
        {!state.loading && state.error && <p className="p-4 text-[13px] text-[#A23B3B]">{state.error}</p>}
        {!state.loading && !state.error && !items.length && (
          <div className="p-6 text-center">
            <p className="text-[14px] font-medium text-ink">No conversations yet</p>
            <p className="mt-1 text-[13px] leading-relaxed text-mutedink">
              Open the Directory to message an authorised classmate, professor or the Dean’s Office.
            </p>
          </div>
        )}
        {items.map((item) => {
          const Icon = ICONS[item.type] || Lock;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={cn(
                'flex w-full items-start gap-2.5 border-b border-line/70 px-3 py-3 text-left transition-colors',
                selectedId === item.id ? 'bg-[#F4F7FF]' : 'hover:bg-[#FAFBFD]',
              )}
            >
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-canvas text-mutedink">
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline gap-2">
                  <span className={cn('truncate text-[15px]', item.unread ? 'font-semibold text-ink' : 'font-medium text-ink')}>
                    {item.title}
                  </span>
                  <span className="ml-auto shrink-0 text-[12px] text-mutedink">{formatStamp(item.last_message_at)}</span>
                </span>
                <span className="mt-0.5 flex items-center gap-1.5">
                  <span className="truncate text-[13px] text-mutedink">
                    {item.last_sender_name ? `${item.last_sender_name}: ` : ''}
                    {item.preview || 'No messages yet'}
                  </span>
                  {item.unread > 0 && <span className="ml-auto h-2 w-2 shrink-0 rounded-full bg-brand" />}
                  {item.muted && <span className="text-[11px] uppercase tracking-wide text-mutedink">muted</span>}
                </span>
                {item.type === 'official' && item.status && (
                  <span className="mt-1 inline-flex rounded bg-[#FCF3E4] px-1.5 py-px text-[11px] font-medium text-[#8E6018]">
                    {item.status.replace(/_/g, ' ')}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
      <div className="border-t border-line px-3 py-2">
        <p className="flex items-center gap-1 text-[12px] text-mutedink">
          <Pin className="h-3 w-3" /> Threads refresh automatically every few seconds
        </p>
      </div>
    </div>
  );
}