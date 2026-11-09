import { useCallback, useEffect, useRef, useState } from 'react';
import { comm } from '@/lib/communication/api';

// In-app notifications for the signed-in account.
//
// The list and the unread total both come from the communication function,
// which scopes every row to the caller's own user_id — this hook never asks
// for anybody else's notifications. Refreshes are polled (20s) and re-run when
// the tab becomes visible again, so a message sent from another account shows
// up without a manual reload.
export function useNotifications({ pollMs = 20000 } = {}) {
  const [state, setState] = useState({ items: [], unread: 0, loading: true, error: '' });
  const alive = useRef(true);

  const load = useCallback(async () => {
    try {
      const data = await comm('notifications');
      if (!alive.current) return;
      setState({
        items: data.items || [],
        unread: Number(data.unreadTotal ?? data.unread ?? 0),
        loading: false,
        error: '',
      });
    } catch (error) {
      if (!alive.current) return;
      setState((current) => ({ ...current, loading: false, error: error.message }));
    }
  }, []);

  useEffect(() => {
    alive.current = true;
    load();
    const timer = setInterval(() => {
      if (!document.hidden) load();
    }, pollMs);
    const onVisible = () => {
      if (!document.hidden) load();
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    return () => {
      alive.current = false;
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, [load, pollMs]);

  // Optimistic so the badge drops the moment it is clicked; the server write
  // is what the next poll confirms.
  const markRead = useCallback(async (id) => {
    let wasUnread = false;
    setState((current) => {
      wasUnread = current.items.some((item) => item.id === id && !item.is_read);
      return {
        ...current,
        items: current.items.map((item) => (item.id === id ? { ...item, is_read: true } : item)),
        unread: Math.max(0, current.unread - (wasUnread ? 1 : 0)),
      };
    });
    await comm('notificationsRead', { notificationId: id });
  }, []);

  const markAllRead = useCallback(async () => {
    setState((current) => ({
      ...current,
      items: current.items.map((item) => ({ ...item, is_read: true })),
      unread: 0,
    }));
    await comm('notificationsRead', {});
  }, []);

  return { ...state, markRead, markAllRead, refresh: load };
}