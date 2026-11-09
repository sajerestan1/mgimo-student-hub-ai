import { useCallback, useEffect, useRef, useState } from 'react';
import { comm } from '@/lib/communication/api';

// Near-real-time refresh: the backend is polled while a view is open. There are
// no fake unread counts — the numbers come from the same server query that
// filters every thread, so a poll that fails simply leaves the last counts.
export function useCommunication() {
  const [boot, setBoot] = useState(null);
  const [counts, setCounts] = useState({ unreadMessages: 0, unreadNotifications: 0 });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await comm('bootstrap');
      setBoot(data.identity);
      setCounts(data.counts || { unreadMessages: 0, unreadNotifications: 0 });
      setError('');
    } catch (caught) {
      setError(caught.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, 60000);
    return () => clearInterval(timer);
  }, [load]);

  return { boot, counts, error, loading, refresh: load };
}

export function usePolling(fn, interval = 12000) {
  const saved = useRef(fn);
  saved.current = fn;

  useEffect(() => {
    let alive = true;
    const tick = async () => {
      if (!alive || document.hidden) return;
      try {
        await saved.current();
      } catch (error) {
        /* a failed refresh keeps the last good view */
      }
    };
    tick();
    const timer = setInterval(tick, interval);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [interval]);
}