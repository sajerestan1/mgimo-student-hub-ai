import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';
import { buildBriefing } from '@/lib/studentPortal';
import { useI18n } from '@/i18n/I18nProvider';

const DOT = {
  critical: 'bg-critical',
  warning: 'bg-warning',
  brand: 'bg-royal',
  positive: 'bg-positive',
  neutral: 'bg-mutedink',
};

export default function AcademicBriefing({ context }) {
  const { t } = useI18n();
  const insights = buildBriefing(context, t);

  return (
    <section className="card-surface overflow-hidden">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-royal/10 text-royal">
            <Sparkles className="h-4 w-4" strokeWidth={1.9} />
          </span>
          <h2 className="text-[length:var(--type-card)] font-semibold text-ink">
            {t('student.dashboard.briefing.title')}
          </h2>
        </div>
        <Link to={P.student.ai} className="link-quiet text-[13px]">
          {t('student.dashboard.briefing.ask')}
        </Link>
      </header>

      <div className="grid gap-3 px-4 py-4 md:grid-cols-3">
        {insights.map((insight) => (
          <div key={insight.key} className="rounded-xl border border-line bg-canvas px-3 py-2.5">
            <span className={`block h-1.5 w-1.5 rounded-full ${DOT[insight.tone] || DOT.neutral}`} />
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink/85">{insight.text}</p>
            <Link
              to={insight.to}
              className="mt-1.5 inline-flex items-center gap-1 text-[12.5px] font-medium text-brand hover:underline"
            >
              {insight.cta}
              <span className="dir-icon">→</span>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}