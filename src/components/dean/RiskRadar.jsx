import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Radar, RefreshCw } from 'lucide-react';
import ProgressBar from '@/components/shell/ProgressBar';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';
import { nf, num, pct, useDeanData } from '@/lib/deanApi';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';

/**
 * The live academic risk radar on the Dean's command center. Reads the same
 * authorised institutional dataset as the full radar page and recomputes itself
 * whenever marks are written or the operator returns to the tab.
 */
export default function RiskRadar({ onCountsChange }) {
  const [revision, setRevision] = useState(0);
  const { data, loading, error } = useDeanData('risk', {}, revision);
  const [updatedAt, setUpdatedAt] = useState(null);

  useEffect(() => {
    if (data) setUpdatedAt(new Date());
  }, [data]);

  useEffect(() => {
    if (data?.counts && onCountsChange) onCountsChange(data.counts);
  }, [data, onCountsChange]);

  // Live channel: a new or corrected mark, or a return to the window,
  // triggers one debounced recomputation on the server.
  useEffect(() => {
    let timer;
    const bump = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setRevision((value) => value + 1), 2000);
    };
    const stop = [];
    try {
      stop.push(base44.entities.AcademicRecord.subscribe(bump));
    } catch {
      /* the live channel is optional; focus and manual refresh still apply */
    }
    window.addEventListener('focus', bump);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('focus', bump);
      stop.forEach((fn) => typeof fn === 'function' && fn());
    };
  }, []);

  const counts = data?.counts;
  const flagged = counts ? counts.high + counts.medium : null;
  const rows = (data?.rows || []).slice(0, 5);

  const tiles = [
    { label: 'High risk', value: counts ? num(counts.high) : '—', hint: 'Immediate intervention', tone: 'text-[#FFB3B3]' },
    { label: 'Watch list', value: counts ? num(counts.medium) : '—', hint: 'Monitoring required', tone: 'text-[#F3D6A0]' },
    { label: 'In intervention', value: counts ? num(counts.monitoring) : '—', hint: 'Cases already tracked', tone: 'text-white' },
    {
      label: 'Population flagged',
      value: counts && counts.total ? pct((flagged / counts.total) * 100, 0) : '—',
      hint: counts ? `${flagged} of ${num(counts.total)} students` : 'Share of student body',
      tone: 'text-white',
    },
  ];

  return (
    <section className="overflow-hidden rounded-xl border border-[#1B2A47] bg-[#0F1A31] text-white">
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 pb-3 pt-4">
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg bg-brand/15 text-[#9FB6FF]">
            <Radar className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-[18px] font-semibold leading-tight tracking-[-0.01em] text-white">Academic risk radar</h2>
            <p className="mt-1 text-[11.5px] text-white/50">Live signals from performance and attendance records</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-white/15 px-2 py-0.5 text-[10.5px] font-medium text-white/60">
            <span className={cn('h-1.5 w-1.5 rounded-full', loading ? 'bg-warning' : 'bg-[#3DDC97]')} />
            {loading ? 'Updating' : 'Live'}
          </span>
          {updatedAt && (
            <span className="text-[10.5px] tabular-nums text-white/40">
              {updatedAt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button
            type="button"
            onClick={() => setRevision((value) => value + 1)}
            aria-label="Refresh risk signals"
            className="text-white/40 transition-colors hover:text-white"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px border-y border-white/10 bg-white/10">
        {tiles.map((item) => (
          <div key={item.label} className="bg-[#0F1A31] px-4 py-3">
            <p className="text-[10.5px] text-white/45">{item.label}</p>
            <p className={cn('mt-1 text-[15px] font-semibold leading-none tabular-nums', item.tone)}>{item.value}</p>
            <p className="mt-1 text-[10.5px] leading-snug text-white/40">{item.hint}</p>
          </div>
        ))}
      </div>

      <div className="px-5 pb-4 pt-3.5">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-white/35">Priority interventions</p>
          {flagged > 0 && (
            <p className="text-[10.5px] tabular-nums text-white/35">
              {Math.min(rows.length, flagged)} of {flagged} flagged
            </p>
          )}
        </div>

        {error && <p className="py-4 text-[11.5px] leading-relaxed text-white/60">{error}</p>}

        {!error && rows.length === 0 && (
          <p className="py-4 text-[11.5px] text-white/50">
            {loading ? 'Recomputing from live records…' : 'No student crosses a risk threshold right now.'}
          </p>
        )}

        <ul className="mt-2 divide-y divide-white/[0.07]">
          {rows.map((row) => (
            <li key={row.id} className="flex items-center justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-[12.5px] font-medium text-white">{row.full_name}</p>
                <p className="mt-0.5 truncate text-[11px] text-white/45">
                  {row.faculty_code || row.faculty} · Year {row.year} · {pct(row.attendanceRate, 0)} attendance
                </p>
                {row.labels?.length > 0 && (
                  <p className="mt-0.5 truncate text-[10.5px] text-white/35">{row.labels.join(' · ')}</p>
                )}
              </div>
              <div className="w-20 shrink-0">
                <p className="text-right text-[12.5px] font-semibold tabular-nums text-white">{nf(row.avgGrade, 0)}</p>
                <ProgressBar
                  value={row.avgGrade || 0}
                  tone={row.riskLevel === 'high' ? 'critical' : 'warning'}
                  className="mt-1 h-1 bg-white/12"
                />
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3">
          <p className="max-w-[19rem] text-[10.5px] leading-relaxed text-white/40">
            Recomputed on the server from live marks and attendance registers. High risk means an average below the pass mark
            or critically low attendance.
          </p>
          <Link
            to={P.dean.risk}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-[11.5px] font-medium text-[#0F1A31] transition-colors hover:bg-white/90"
          >
            <Radar className="h-3.5 w-3.5" /> Open risk radar <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}