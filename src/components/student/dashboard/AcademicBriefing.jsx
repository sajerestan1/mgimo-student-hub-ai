import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';
import { buildBriefing } from '@/lib/studentPortal';
import { useI18n } from '@/i18n/I18nProvider';

const DOT = {
  critical: 'bg-[#DC2626]',
  warning: 'bg-[#D97706]',
  brand: 'bg-[#2563EB]',
  positive: 'bg-[#059669]',
  neutral: 'bg-[#64748B]',
};

export default function AcademicBriefing({ context }) {
  const { t } = useI18n();
  const insights = buildBriefing(context, t);

  return (
    <section className="card-surface overflow-hidden">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#EFF6FF] text-[#2563EB]">
            <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
          </span>
          <h2 className="truncate text-[15px] font-semibold text-ink">
            {t('student.dashboard.briefing.title')}
          </h2>
        </div>
        <Link
          to={P.student.ai}
          className="inline-flex shrink-0 items-center gap-1 text-[13px] font-medium text-[#2563EB] transition-colors hover:text-[#1D4ED8]"
        >
          {t('student.dashboard.briefing.ask')}
        </Link>
      </header>

      <div className="grid gap-2 px-4 py-3 md:grid-cols-3">
        {insights.map((insight) => (
          <div key={insight.key} className="flex min-w-0 items-start gap-2 rounded-lg border border-line bg-[#F6F8FC] px-3 py-2">
            <span className={`mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full ${DOT[insight.tone] || DOT.neutral}`} />
            <div className="min-w-0">
              <p className="line-clamp-3 text-[13px] leading-[1.5] text-ink/85">{insight.text}</p>
              <Link
                to={insight.to}
                className="mt-1 inline-flex items-center gap-1 text-[12.5px] font-medium text-[#2563EB] hover:text-[#1D4ED8] hover:underline"
              >
                {insight.cta}
                <span className="dir-icon">→</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}