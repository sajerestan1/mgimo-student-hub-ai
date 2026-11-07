import { useEffect, useState } from 'react';
import { Sparkles, RefreshCw, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { generateDeanBriefing } from '@/lib/aiEngine';
import { useAdminData } from '@/lib/AdminDataContext';

let sessionCache = null;

export default function AiBriefing() {
  const context = useAdminData();
  const [briefing, setBriefing] = useState(sessionCache);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { analytics, loading: dataLoading } = context;

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateDeanBriefing({ data: context, analytics });
      sessionCache = result;
      setBriefing(result);
    } catch (err) {
      setError('The briefing could not be generated from the current records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!briefing && !dataLoading && analytics.kpis.totalStudents > 0) {
      generate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataLoading]);

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#102D50] via-[#123355] to-[#0B2140] p-5 text-white shadow-[0_18px_40px_-28px_rgba(16,45,80,0.9)]">
      <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-gold/10 blur-2xl" />
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/15 ring-1 ring-gold/30">
            <Sparkles className="h-4 w-4 text-gold" strokeWidth={1.9} />
          </span>
          <div>
            <h2 className="font-heading text-[16px] leading-tight">AI Dean’s Briefing</h2>
            <p className="text-[10px] uppercase tracking-[0.16em] text-gold/80">Generated from current records</p>
          </div>
        </div>
        <button
          type="button"
          onClick={generate}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-[10.5px] font-medium text-white/80 transition-colors hover:bg-white/10 disabled:opacity-50"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Analysing' : 'Regenerate'}
        </button>
      </div>

      {loading && !briefing && (
        <div className="mt-5 space-y-2.5">
          {[0, 1, 2].map((row) => (
            <div key={row} className="h-3 animate-pulse rounded bg-white/10" style={{ width: `${88 - row * 12}%` }} />
          ))}
          <p className="pt-2 text-[11px] text-white/45">Reading academic, attendance and administrative records…</p>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-lg border border-gold/30 bg-white/5 p-3 text-[11px] text-white/70">
          {error}{' '}
          <button type="button" onClick={generate} className="font-semibold text-gold underline">
            Try again
          </button>
        </div>
      )}

      {briefing && (
        <div className="mt-4">
          <p className="text-[12px] leading-relaxed text-white/70">{briefing.answer}</p>
          {briefing.findings.length > 0 && (
            <ul className="mt-3.5 space-y-1.5">
              {briefing.findings.slice(0, 5).map((finding) => (
                <li key={finding} className="flex gap-2 text-[11.5px] leading-relaxed text-white/85">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gold" />
                  {finding}
                </li>
              ))}
            </ul>
          )}
          {briefing.actions.length > 0 && (
            <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.05] p-3">
              <p className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-gold/80">Recommended actions</p>
              <ul className="mt-1.5 space-y-1.5">
                {briefing.actions.slice(0, 3).map((action) => (
                  <li key={action} className="flex gap-2 text-[11.5px] text-white/80">
                    <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-gold/80" />
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="mt-3.5 flex items-center justify-between">
            <span className="text-[9.5px] text-white/35">Decision support only — demonstration records.</span>
            <Link to="/assistant" className="inline-flex items-center gap-1 text-[11px] font-medium text-gold hover:underline">
              Ask the assistant
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}