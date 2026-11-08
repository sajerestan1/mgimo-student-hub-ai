import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';
import { buildBriefing } from '@/lib/studentPortal';

const DOT = {
  critical: 'bg-critical',
  warning: 'bg-warning',
  brand: 'bg-royal',
  positive: 'bg-positive',
  neutral: 'bg-mutedink',
};

export default function AcademicBriefing({ context }) {
  const insights = buildBriefing(context);

  return (
    <section className="card-surface flex flex-col overflow-hidden">
      <header className="flex items-center gap-2 px-5 pb-2 pt-4">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-royal/10 text-royal">
          <Sparkles className="h-3.5 w-3.5" />
        </span>
        <h2 className="text-[length:var(--type-card)] font-semibold text-ink">Academic briefing</h2>
      </header>
      <ul className="space-y-2.5 px-5 pb-4">
        {insights.map((insight) => (
          <li key={insight.key} className="flex gap-2.5">
            <span className={`mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full ${DOT[insight.tone] || DOT.neutral}`} />
            <div className="min-w-0">
              <p className="text-[14px] leading-relaxed text-ink/85">{insight.text}</p>
              <Link to={insight.to} className="mt-0.5 inline-flex items-center gap-1 text-[13px] font-medium text-brand">
                {insight.cta}
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-auto border-t border-line px-5 py-2.5">
        <Link to={P.student.ai} className="link-quiet text-[13px]">
          Ask the study companion
        </Link>
      </div>
    </section>
  );
}