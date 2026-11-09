import { useEffect, useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { comm, formatStamp } from '@/lib/communication/api';
import { cn } from '@/lib/utils';

const TONE = { open: 'bg-[#FBECEC] text-[#A23B3B]', actioned: 'bg-[#E9F5EF] text-[#1D7A50]', dismissed: 'bg-[#F2F4F8] text-[#5A6779]' };

export default function ModerationPanel() {
  const [state, setState] = useState({ loading: true, items: [], error: '' });
  const [note, setNote] = useState('');

  const load = async () => {
    const data = await comm('reports');
    setState({ loading: false, items: data.items, error: '' });
  };

  useEffect(() => {
    load().catch((error) => setState({ loading: false, items: [], error: error.message }));
  }, []);

  const resolve = async (report, outcome) => {
    try {
      await comm('resolveReport', { reportId: report.id, outcome, note });
      setNote('');
      await load();
    } catch (error) {
      setState((current) => ({ ...current, error: error.message }));
    }
  };

  return (
    <div className="card-surface overflow-hidden">
      <div className="border-b border-line px-4 py-3">
        <h2 className="flex items-center gap-1.5 text-[17px] font-semibold text-ink">
          <ShieldAlert className="h-4 w-4 text-[#A23B3B]" /> Abuse and security reports
        </h2>
        <p className="mt-1 text-[13px] leading-relaxed text-mutedink">
          Reports show a minimal excerpt only. Hiding a message keeps the record and the audit trail; private
          conversations stay unreadable to staff who are not participants.
        </p>
        <input
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Decision note (recorded in the audit log)"
          className="mt-2 w-full rounded-lg border border-line px-2 py-1.5 text-[14px]"
        />
      </div>

      {state.loading && <div className="p-4"><div className="h-20 animate-pulse rounded-lg bg-[#F3F5F9]" /></div>}
      {state.error && <p className="p-4 text-[13px] text-[#A23B3B]">{state.error}</p>}
      {!state.loading && !state.items.length && <p className="p-6 text-center text-[14px] text-mutedink">The moderation queue is empty.</p>}

      <ul className="divide-y divide-line/70">
        {state.items.map((report) => (
          <li key={report.id} className="px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn('rounded px-1.5 py-px text-[11px] font-semibold uppercase', TONE[report.status])}>
                {report.status}
              </span>
              <span className="text-[14px] font-medium text-ink">{report.reason}</span>
              <span className="text-[12px] text-mutedink">
                reported by {report.reporter_name} · {formatStamp(report.created_date)}
              </span>
            </div>
            <p className="mt-1 text-[13px] leading-relaxed text-mutedink">
              “{report.excerpt || 'No excerpt'}” — attributed to {report.accused_name || 'unknown sender'}
            </p>
            {report.note && <p className="mt-1 text-[13px] text-ink">Reporter note: {report.note}</p>}
            {report.resolution && <p className="mt-1 text-[12px] text-mutedink">Decision: {report.resolution}</p>}
            {report.status === 'open' && (
              <div className="mt-2 flex gap-2">
                <button type="button" onClick={() => resolve(report, 'hide')} className="btn-primary btn-sm">Hide message</button>
                <button type="button" onClick={() => resolve(report, 'dismiss')} className="btn-quiet btn-sm">Dismiss</button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}