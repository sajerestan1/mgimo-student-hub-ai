import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatStamp } from '@/lib/communication/api';
import { useNotifications } from '@/hooks/useNotifications';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const ALL_NOTIFICATIONS = '/communication/notifications';
const VISIBLE = 6;

export default function NotificationBell() {
  const navigate = useNavigate();
  const { items, unread, loading, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);

  const openItem = async (item) => {
    setOpen(false);
    try {
      if (!item.is_read) await markRead(item.id);
    } catch {
      /* the destination still opens if the read receipt failed */
    }
    navigate(item.link || ALL_NOTIFICATIONS);
  };

  const markEverything = async () => {
    try {
      await markAllRead();
    } catch {
      /* the badge keeps its count until the next poll */
    }
  };

  const preview = items.slice(0, VISIBLE);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button type="button" className="icon-btn relative" aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}>
          <Bell className="h-[18px] w-[18px]" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex min-w-[17px] items-center justify-center rounded-full bg-critical px-1 text-[11px] font-semibold leading-[17px] text-white ring-2 ring-white">
              {unread > 99 ? '99+' : unread}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[22rem] max-w-[calc(100vw-1.5rem)]">
        <div className="flex items-center justify-between gap-2 px-2 py-1.5">
          <DropdownMenuLabel className="p-0 text-[14px] text-ink">
            Notifications
            {unread > 0 && <span className="ml-1.5 font-normal text-mutedink">({unread} new)</span>}
          </DropdownMenuLabel>
          {unread > 0 && (
            <button
              type="button"
              onClick={markEverything}
              className="text-[13px] font-medium text-brand hover:text-brand-deep"
            >
              Mark all read
            </button>
          )}
        </div>
        <DropdownMenuSeparator />

        {loading && <p className="px-3 py-4 text-[13px] text-mutedink">Loading notifications…</p>}
        {!loading && !preview.length && (
          <p className="px-3 py-4 text-[13px] text-mutedink">No notifications yet.</p>
        )}

        {preview.map((item) => {
          const context = [item.sender_name, item.conversation_name].filter(Boolean).join(' · ');
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => openItem(item)}
              className={cn(
                'flex w-full items-start gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-canvas',
                !item.is_read && 'bg-[#F8FAFF]',
              )}
            >
              <span
                className={cn('mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full', item.is_read ? 'bg-line' : 'bg-brand')}
              />
              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    'block truncate text-[14px] text-ink',
                    !item.is_read ? 'font-semibold' : 'font-medium',
                  )}
                >
                  {item.title}
                </span>
                {context && <span className="mt-0.5 block truncate text-[12.5px] text-mutedink">{context}</span>}
                {item.body && <span className="mt-0.5 block truncate text-[13px] text-mutedink">{item.body}</span>}
                <span className="mt-1 block text-[12px] text-mutedink">{formatStamp(item.created_date)}</span>
              </span>
            </button>
          );
        })}

        <DropdownMenuSeparator />
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            navigate(ALL_NOTIFICATIONS);
          }}
          className="w-full px-3 py-2 text-center text-[14px] font-medium text-brand hover:bg-canvas"
        >
          View all notifications
        </button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}