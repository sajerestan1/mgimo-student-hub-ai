import { useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { LoadingState, ErrorState } from '@/components/LoadingState';
import EmptyState from '@/components/EmptyState';
import CategoryIcon from '@/components/notifications/CategoryIcon';
import { Button } from '@/components/ui/button';
import { useStudentData } from '@/lib/StudentDataContext';
import { CATEGORY_META, formatDateValue, relativeTime } from '@/lib/academic';
import { cn } from '@/lib/utils';

export default function Notifications() {
  const { loading, error, reload, notifications, unreadCount, setNotificationRead, markAllNotificationsRead } =
    useStudentData();
  const [filter, setFilter] = useState('all');

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const visible = filter === 'unread' ? notifications.filter((item) => !item.is_read) : notifications;

  return (
    <div className="fade-up">
      <PageHeader
        eyebrow="Notification center"
        title="Notifications"
        description="Announcements, schedule changes, application updates and academic reminders."
        actions={
          <Button
            type="button"
            variant="outline"
            disabled={unreadCount === 0}
            onClick={markAllNotificationsRead}
            className="rounded-xl text-[12.5px]"
          >
            <CheckCheck className="mr-1.5 h-3.5 w-3.5" /> Mark all as read
          </Button>
        }
      />

      <div className="mb-5 flex items-center gap-2">
        {[
          { key: 'all', label: 'All', count: notifications.length },
          { key: 'unread', label: 'Unread', count: unreadCount },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilter(tab.key)}
            className={cn(
              'rounded-xl border px-3.5 py-1.5 text-[12px] font-medium transition-colors',
              filter === tab.key
                ? 'border-navy bg-navy text-white'
                : 'border-[#E4E9F2] bg-white text-slate-500 hover:text-navy'
            )}
          >
            {tab.label} <span className="ml-1 opacity-70">{tab.count}</span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={filter === 'unread' ? 'You are all caught up' : 'No notifications yet'}
          description={
            filter === 'unread'
              ? 'Every notification in your account has been read.'
              : 'Announcements from the dean’s office will appear here.'
          }
        />
      ) : (
        <ul className="space-y-2.5">
          {visible.map((item) => {
            const meta = CATEGORY_META[item.category] || CATEGORY_META.announcement;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setNotificationRead(item.id, !item.is_read)}
                  className={cn(
                    'card-surface flex w-full gap-3.5 p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-gold/40 sm:p-5',
                    !item.is_read && 'ring-1 ring-inset ring-gold/25'
                  )}
                >
                  <span
                    className={cn(
                      'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                      meta.className
                    )}
                  >
                    <CategoryIcon category={item.category} className="h-4 w-4" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-[13.5px] font-medium leading-snug text-navy-deep">
                        {item.title}
                      </p>
                      {!item.is_read && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />}
                    </div>
                    {item.body && (
                      <p className="mt-1 text-[12px] leading-relaxed text-slate-500">{item.body}</p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px] text-slate-400">
                      <span className="font-medium uppercase tracking-wide">{meta.label}</span>
                      <span>{relativeTime(item.created_date)}</span>
                      {item.due_date && (
                        <span className="text-navy-mid">Due {formatDateValue(item.due_date)}</span>
                      )}
                      <span className="ml-auto text-[10.5px] text-navy-mid">
                        {item.is_read ? 'Mark as unread' : 'Mark as read'}
                      </span>
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}