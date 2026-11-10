import { useEffect, useState } from 'react';
import { Lock, Search, Building2 } from 'lucide-react';
import { comm, OFFICIAL_CATEGORIES } from '@/lib/communication/api';
import { cn } from '@/lib/utils';

export default function DirectoryView({ boot, onStarted }) {
  const [state, setState] = useState({ items: [], loading: true, error: '' });
  const [query, setQuery] = useState('');
  const [busyId, setBusyId] = useState('');
  const [official, setOfficial] = useState({ open: false, category: OFFICIAL_CATEGORIES[0], subject: '', body: '' });
  const [notice, setNotice] = useState('');

  const load = async (search = '') => {
    const data = await comm('candidates', { q: search });
    setState({ items: data.items, loading: false, error: '' });
  };

  useEffect(() => {
    load().catch((error) => setState({ items: [], loading: false, error: error.message }));
  }, []);

  const startPrivate = async (row) => {
    setBusyId(row.user_id);
    setNotice('');
    try {
      const data = await comm('startPrivate', { targetUserId: row.user_id });
      onStarted(data.threadId);
    } catch (error) {
      setNotice(error.message);
    } finally {
      setBusyId('');
    }
  };

  const startOfficial = async () => {
    setBusyId('official');
    setNotice('');
    try {
      const data = await comm('startOfficial', {
        category: official.category,
        subject: official.subject,
        body: official.body,
      });
      onStarted(data.threadId);
    } catch (error) {
      setNotice(error.message);
    } finally {
      setBusyId('');
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
      <section className="card-surface overflow-hidden">
        <div className="border-b border-line p-4">
          <h2 className="text-[17px] font-semibold text-ink">Authorised directory</h2>
          <p className="mt-1 text-[13px] leading-relaxed text-mutedink">
            Only people you are allowed to contact appear here — students across the university, the professors who
            teach your courses, and institutional staff where policy allows.
          </p>
          <div className="relative mt-3">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-mutedink" />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                load(event.target.value).catch(() => {});
              }}
              placeholder="Search name, group or role"
              className="w-full rounded-lg border border-line py-2 pl-8 pr-2 text-[14px] outline-none focus:border-brand"
            />
          </div>
        </div>

        <div className="divide-y divide-line/70">
          {state.loading && <div className="p-4"><div className="h-16 animate-pulse rounded-lg bg-[#F3F5F9]" /></div>}
          {!state.loading && !state.items.length && (
            <p className="p-6 text-center text-[14px] text-mutedink">Nobody matches that search in your authorised directory.</p>
          )}
          {state.items.map((row) => (
            <div key={row.user_id} className="flex items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-medium text-ink">{row.name}</p>
                <p className="truncate text-[13px] text-mutedink">
                  <span className="capitalize">{row.role}</span>
                  {row.group ? ` · ${row.group}` : ''} · {row.reason}
                </p>
              </div>
              <button
                type="button"
                onClick={() => startPrivate(row)}
                disabled={busyId === row.user_id}
                className="btn-quiet btn-sm"
              >
                <Lock className="h-3.5 w-3.5" /> {busyId === row.user_id ? 'Opening…' : 'Message'}
              </button>
            </div>
          ))}
        </div>
      </section>

      <aside className="space-y-3">
        <section className="card-surface p-4">
          <h2 className="flex items-center gap-1.5 text-[15px] font-semibold text-ink">
            <Building2 className="h-4 w-4 text-[#8E6018]" /> Dean’s Office
          </h2>
          <p className="mt-1 text-[13px] leading-relaxed text-mutedink">
            Official enquiries are handled by the administration. Replies arrive in the same thread and every change of
            status is notified.
          </p>
          {!official.open ? (
            <button type="button" onClick={() => setOfficial((current) => ({ ...current, open: true }))} className="btn-primary btn-sm mt-3">
              Open official enquiry
            </button>
          ) : (
            <div className="mt-3 space-y-2">
              <select
                value={official.category}
                onChange={(event) => setOfficial((current) => ({ ...current, category: event.target.value }))}
                className="w-full rounded-lg border border-line px-2 py-1.5 text-[14px]"
              >
                {OFFICIAL_CATEGORIES.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <input
                value={official.subject}
                onChange={(event) => setOfficial((current) => ({ ...current, subject: event.target.value }))}
                placeholder="Subject"
                className="w-full rounded-lg border border-line px-2 py-1.5 text-[14px]"
              />
              <textarea
                value={official.body}
                onChange={(event) => setOfficial((current) => ({ ...current, body: event.target.value }))}
                rows={3}
                placeholder="Describe your issue"
                className="w-full rounded-lg border border-line px-2 py-1.5 text-[14px]"
              />
              <div className="flex gap-2">
                <button type="button" onClick={startOfficial} disabled={busyId === 'official'} className="btn-primary btn-sm">
                  {busyId === 'official' ? 'Sending…' : 'Send enquiry'}
                </button>
                <button type="button" onClick={() => setOfficial((current) => ({ ...current, open: false }))} className="btn-quiet btn-sm">
                  Cancel
                </button>
              </div>
            </div>
          )}
          {notice && <p className={cn('mt-2 text-[13px]', 'text-[#A23B3B]')}>{notice}</p>}
        </section>
      </aside>
    </div>
  );
}