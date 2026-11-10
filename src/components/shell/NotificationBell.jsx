import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatStamp } from '@/lib/communication/api';
import { useNotifications } from '@/hooks/useNotifications';
import { useI18n } from '@/i18n/I18nProvider';
import { useToast } from '@/components/ui/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { showBrowserAlert } from '@/lib/messageAlerts';
import BrowserAlertsToggle from './BrowserAlertsToggle';
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
  const { toast } = useToast();
  // The arrival callback lives in a ref so the polling effect in the hook keeps
  // one stable subscription while it can still reach the newest markRead.
  const announceRef = useRef(null);
  const { items, unread, loading, markRead, markAllRead } = useNotifications({
    onArrive: (fresh) => announceRef.current?.(fresh),
  });
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  // A message that arrives while the reader is in the app is announced once: an
  // in-app toast, and a desktop alert too if they turned that on. Both open the
  // conversation through the same authorised link the bell row uses.
  const announce = useCallback(
    (fresh) => {
      const newest = fresh[0];
      if (!newest) return;
      const openConversation = async () => {
        setOpen(false);
        try {
          await markRead(newest.id);
        } catch {
          /* the conversation still opens if the read receipt failed */
        }
        navigate(newest.link || ALL_NOTIFICATIONS);
      };
      const many = fresh.length > 1;
      const title = many ? `${fresh.length} new messages` : newest.title;
      const detail = newest.body || newest.conversation_name || '';

      toast({
        title,
        description: many ? 'Open your inbox to read them' : detail || undefined,
        action: (
          <ToastAction altText="Open conversation" onClick={openConversation}>
            Open
          </ToastAction>
        ),
      });

      showBrowserAlert({
        id: newest.id,
        title,
        body: many ? 'Open your inbox to read them' : detail,
        onOpen: openConversation,
      });
    },
    [markRead, navigate, toast],
  );
  announceRef.current = announce;

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
        <button
          type="button"
          className="icon-btn relative"
          aria-label={unread ? t('notifications.ariaUnread', { count: unread }) : t('notifications.ariaLabel')}
        >
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
            {t('notifications.title')}
            {unread > 0 && (
              <span className="ms-1.5 font-normal text-mutedink">
                {t('notifications.newCount', { count: unread })}
              </span>
            )}
          </DropdownMenuLabel>
          {unread > 0 && (
            <button
              type="button"
              onClick={markEverything}
              className="text-[13px] font-medium text-brand hover:text-brand-deep"
            >
              {t('notifications.markAllRead')}
            </button>
          )}
        </div>
        <DropdownMenuSeparator />

        {loading && <p className="px-3 py-4 text-[13px] text-mutedink">{t('notifications.loading')}</p>}
        {!loading && !preview.length && (
          <p className="px-3 py-4 text-[13px] text-mutedink">{t('notifications.empty')}</p>
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
        <BrowserAlertsToggle />
        <DropdownMenuSeparator />
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            navigate(ALL_NOTIFICATIONS);
          }}
          className="w-full px-3 py-2 text-center text-[14px] font-medium text-brand hover:bg-canvas"
        >
          {t('notifications.viewAll')}
        </button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}