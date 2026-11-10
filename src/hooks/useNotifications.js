import { useCallback, useEffect, useRef, useState } from 'react';
import { comm } from '@/lib/communication/api';

// In-app notifications for the signed-in account.
//
// The list and the unread total both come from the communication function,
// which scopes every row to the caller's own user_id — this hook never asks
// for anybody else's notifications. Refreshes are polled (20s, and never while
// the tab is hidden) and re-run when the tab becomes visible again, so a message
// sent from another account shows up without a manual reload.
//
// `onArrive` receives the notifications that became visible on this poll, so the
// caller can raise a toast. The first load only primes: existing unread history
// is never announced as if it just happened, and the announced ids are kept per
// device so a reload cannot repeat an alert for the same message.
const SEEN_KEY = 'comm.alerts.seen';
const SEEN_LIMIT = 300;

function readSeen() {
  try {
    const raw = JSON.parse(window.localStorage.getItem(SEEN_KEY) || '[]');
    return new Set(Array.isArray(raw) ? raw : []);
  } catch {
    return new Set();
  }
}

function writeSeen(seen) {
  try {
    window.localStorage.setItem(SEEN_KEY, JSON.stringify([...seen].slice(-SEEN_LIMIT)));
  } catch {
    // Storage unavailable: the in-memory set still prevents repeats this session.
  }
}

export function useNotifications({ pollMs = 20000, onArrive } = {}) {
  const [state, setState] = useState({ items: [], unread: 0, loading: true, error: '' });
  const alive = useRef(true);
  const seen = useRef(readSeen());
  const primed = useRef(false);
  const arrive = useRef(onArrive);
  arrive.current = onArrive;

  const load = useCallback(async () => {
    try {
      const data = await comm('notifications');
      if (!alive.current) return;
      const items = data.items || [];
      // Another tab on this device may have announced something already, so the
      // stored ids are merged before deciding what is new.
      readSeen().forEach((id) => seen.current.add(id));
      const unreadItems = items.filter((item) => !item.is_read);
      const fresh = unreadItems.filter((item) => !seen.current.has(item.id));
      unreadItems.forEach((item) => seen.current.add(item.id));
      if (fresh.length) {
        writeSeen(seen.current);
        if (primed.current) arrive.current?.(fresh);
      }
      primed.current = true;
      setState({
        items,
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