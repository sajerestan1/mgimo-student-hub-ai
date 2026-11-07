import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Radar } from 'lucide-react';
import { RISK_FLAGS, RISK_SUMMARY } from '@/lib/demoUniversity';

export default function RiskRadar() {
  return (
    <section className="overflow-hidden rounded-2xl bg-navy text-white/75">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 px-4 py-3.5">
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-brand">
            <Radar className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-[13px] font-semibold tracking-tight text-white">AI Academic Risk Radar</h2>
            <p className="mt-0.5 text-[11px] text-white/45">Preview of the intelligence layer planned for Stage 2</p>
          </div>
        </div>
        <span className="rounded-full border border-white/15 px-2 py-0.5 text-[10px] font-medium text-white/60">
          Preview · not live
        </span>
      </div>

      <div className="grid gap-2 border-b border-white/10 px-4 py-3 sm:grid-cols-3">
        {RISK_SUMMARY.map((item) => (
          <div key={item.label} className="rounded-xl bg-white/[0.06] px-3 py-2">
            <p className="text-[10px] text-white/45">{item.label}</p>
            <p className="mt-0.5 text-[16px] font-semibold text-white">{item.value}</p>
            <p className="text-[10px] text-white/40">{item.hint}</p>
          </div>
        ))}
      </div>

      <div className="px-4 py-3">
        <p className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-white/35">Students flagged for support</p>
        <ul className="mt-2 divide-y divide-white/[0.07]">
          {RISK_FLAGS.slice(0, 4).map((student) => (
            <li key={student.id} className="flex items-center justify-between gap-3 py-2">
              <div className="min-w-0">
                <p className="truncate text-[12px] font-medium text-white">{student.name}</p>
                <p className="truncate text-[10.5px] text-white/40">
                  {student.faculty} · Year {student.year} · GPA {student.gpa.toFixed(2)}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap justify-end gap-1">
                {student.signals.map((signal) => (
                  <span key={signal} className="rounded-md bg-white/[0.08] px-1.5 py-0.5 text-[9.5px] text-white/60">
                    {signal}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-3 rounded-lg bg-white/[0.05] px-2.5 py-2 text-[10.5px] leading-relaxed text-white/45">
          Flags above are computed from fictional demonstration records. The live AI analysis, explanations and recommended
          interventions are not yet implemented.
        </p>

        <Link
          to="/ai-assistant"
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-[11.5px] font-medium text-white transition-colors hover:bg-brand/90"
        >
          <Sparkles className="h-3.5 w-3.5" /> Open AI academic assistant <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
}