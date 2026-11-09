import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { fetchTimetable } from '@/lib/timetable/api';
import { mondayOf } from '@/lib/timetable/week';
import { claimOfflineOwner, readTimetable, saveTimetable } from '@/lib/offline/store';

/**
 * One week of the caller's schedule, live when possible and saved when not.
 * Network failures never replace a good saved week: the cache is only written
 * after a successful, validated server response.
 */
export function useTimetable(workspace) {
  const { user } = useAuth();
  const [weekStart, setWeekStart] = useState(() => mondayOf());
  const [payload, setPayload] = useState(null);
  const [syncedAt, setSyncedAt] = useState(null);
  const [source, setSource] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));
  const requestId = useRef(0);

  const load = useCallback(
    async (week, { manual = false } = {}) => {
      if (!user?.id) return;
      const ticket = ++requestId.current;
      if (manual) setSyncing(true);
      setError('');

      // 1. Show the saved week immediately, so an offline start is instant.
      const cached = await readTimetable({ accountId: user.id, workspace, weekStart: week });
      if (ticket === requestId.current && cached?.payload) {
        setPayload(cached.payload);
        setSyncedAt(cached.savedAt);
        setSource('cache');
      }

      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        if (ticket === requestId.current) {
          setLoading(false);
          setSyncing(false);
          if (!cached?.payload) setError('You are offline and this week has not been saved on this device yet.');
        }
        return;
      }

      // 2. Refresh from the server. A failure keeps whatever we already had.
      try {
        const fresh = await fetchTimetable(week);
        if (ticket !== requestId.current) return;
        setPayload(fresh);
        setSource('live');
        const stamp = new Date().toISOString();
        setSyncedAt(stamp);
        await saveTimetable({ accountId: user.id, workspace, weekStart: week, payload: fresh });
      } catch (caught) {
        if (ticket !== requestId.current) return;
        const message = String(caught?.message || '');
        setError(
          message && message.length < 160
            ? message
            : 'Your timetable could not be refreshed. The saved copy is shown until the connection returns.',
        );
      } finally {
        if (ticket === requestId.current) {
          setLoading(false);
          setSyncing(false);
        }
      }
    },
    [user?.id, workspace],
  );

  useEffect(() => {
    if (!user?.id) return;
    claimOfflineOwner(user.id);
  }, [user?.id]);

  useEffect(() => {
    // A new week must never show the previous week's entries while it loads.
    setPayload(null);
    setSyncedAt(null);
    setSource('');
    setError('');
    setLoading(true);
    load(weekStart);
  }, [weekStart, load]);

  useEffect(() => {
    const goOnline = () => {
      setOnline(true);
      load(weekStart);
    };
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, [load, weekStart]);

  return {
    weekStart,
    setWeekStart,
    payload,
    syncedAt,
    source,
    error,
    loading,
    syncing,
    online,
    sync: () => load(weekStart, { manual: true }),
  };
}