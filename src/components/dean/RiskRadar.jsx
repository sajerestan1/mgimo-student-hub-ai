import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Radar } from 'lucide-react';
import ProgressBar from '@/components/shell/ProgressBar';
import { RISK_FLAGS, RISK_SUMMARY } from '@/lib/demoUniversity';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';

const SEVERITY_TONE = (gpa) => (gpa < 3 ? 'critical' : 'warning');

export default function RiskRadar() {
  return (
    <section className="overflow-hidden rounded-xl border border-[#1B2A47] bg-[#0F1A31] text-white">
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 pb-3 pt-4">
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg bg-brand/15 text-[#9FB6FF]">
            <Radar className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-[18px] font-semibold leading-tight tracking-[-0.01em] text-white">AI academic risk radar</h2>
            <p className="mt-1 text-[11.5px] text-white/50">Signal preview · intelligence layer arrives in Stage 2</p>
          </div>
        </div>
        <span className="rounded-md border border-white/15 px-2 py-0.5 text-[10.5px] font-medium text-white/55">
          Preview
        </span>
      </div>

      <div className="grid grid-cols-3 gap-px border-y border-white/10 bg-white/10">
        {RISK_SUMMARY.map((item) => (
          <div key={item.label} className="bg-[#0F1A31] px-4 py-3">
            <p className="text-[10.5px] text-white/45">{item.label}</p>
            <p className="mt-1 text-[15px] font-semibold leading-none text-white">{item.value}</p>
            <p className="mt-1 text-[10.5px] leading-snug text-white/40">{item.hint}</p>
          </div>
        ))}
      </div>

      <div className="px-5 pb-4 pt-3.5">
        <div className="flex items-baseline justify-between">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-white/35">
            Flagged for support
          </p>
          <p className="text-[10.5px] text-white/35">5 of 165</p>
        </div>
        <ul className="mt-2 divide-y divide-white/[0.07]">
          {RISK_FLAGS.slice(0, 4).map((student) => (
            <li key={student.id} className="flex items-center justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-[12.5px] font-medium text-white">{student.name}</p>
                <p className="mt-0.5 truncate text-[11px] text-white/45">
                  {student.faculty.replace('Faculty of ', '')} · Year {student.year}
                </p>
              </div>
              <div className="flex w-24 shrink-0 items-center gap-2">
                <div className="flex-1">
                  <ProgressBar value={(student.gpa / 5) * 100} tone={SEVERITY_TONE(student.gpa)} className="h-1 bg-white/12" />
                </div>
                <span className="w-8 text-right text-[11px] font-medium tabular-nums text-white/75">
                  {student.gpa.toFixed(2)}
                </span>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3">
          <p className="max-w-[19rem] text-[10.5px] leading-relaxed text-white/40">
            Computed from fictional records. Live explanations and interventions are not implemented yet.
          </p>
          <Link
            to={P.dean.risk}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-[11.5px] font-medium text-[#0F1A31] transition-colors hover:bg-white/90"
          >
            <Sparkles className="h-3.5 w-3.5" /> Ask the assistant <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}