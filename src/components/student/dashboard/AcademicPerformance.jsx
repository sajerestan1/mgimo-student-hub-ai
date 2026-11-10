import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';
import { useI18n } from '@/i18n/I18nProvider';

const toneFor = (average) => (average === null ? 'text-mutedink' : average >= 70 ? 'text-positive' : average >= 50 ? 'text-warning' : 'text-critical');

/**
 * Dashboard section. It reads the academic context the dashboard has already
 * loaded, so the averages here are the same calculated figures the full
 * Academic Intelligence page reports — no second request, no second source.
 */
export default function AcademicPerformance({ context }) {
  const { t } = useI18n();
  const scored = (context.courses || []).filter((course) => course.weighted !== null);
  const average = context.summary?.average ?? null;
  const missing = (context.assignments || []).filter((row) => row.state === 'overdue');
  const weakest = [...scored].sort((a, b) => a.weighted - b.weighted)[0];

  return (
    <section className="card-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[length:var(--type-card)] font-semibold text-ink">
            {t('student.dashboard.performance.title')}
          </h2>
          <p className="mt-0.5 text-[13px] text-mutedink">
            {scored.length
              ? scored.length === 1
                ? t('student.dashboard.performance.acrossOne')
                : t('student.dashboard.performance.acrossMany', { count: scored.length })
              : t('student.dashboard.performance.none')}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[24px] font-semibold leading-none tabular-nums text-ink">{average === null ? '—' : average}</p>
          <p className="mt-0.5 text-[12.5px] text-mutedink">{context.summary?.averageLetter || '—'}</p>
        </div>
      </div>

      {scored.length > 0 && (
        <ul className="mt-3 divide-y divide-line">
          {scored.slice(0, 4).map((course) => (
            <li key={course.id} className="flex items-center justify-between gap-3 py-2">
              <div className="min-w-0">
                <p className="truncate text-[13.5px] font-medium text-ink">{course.code} · {course.title}</p>
                <p className="text-[12.5px] text-mutedink">
                  {t('student.dashboard.performance.graded', { count: course.graded })}
                  {course.missing
                    ? t('student.dashboard.performance.notSubmitted', { count: course.missing })
                    : ''}
                </p>
              </div>
              <span className={`shrink-0 text-[14px] font-semibold tabular-nums ${toneFor(course.weighted)}`}>
                {course.weighted}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-mutedink">
        {missing.length > 0 && (
          <span className="font-medium text-critical">
            {missing.length === 1
              ? t('student.dashboard.performance.overdueOne')
              : t('student.dashboard.performance.overdueMany', { count: missing.length })}
          </span>
        )}
        {context.summary?.attendanceRate !== null && context.summary?.attendanceRate !== undefined && (
          <span>{t('student.dashboard.performance.attendance', { rate: context.summary.attendanceRate })}</span>
        )}
        {weakest && (
          <span>{t('student.dashboard.performance.lowest', { code: weakest.code, score: weakest.weighted })}</span>
        )}
      </div>

      <Link to={P.student.intelligence} className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium text-brand hover:underline">
        {t('student.dashboard.performance.open')} <ArrowRight className="dir-icon h-3.5 w-3.5" />
      </Link>
    </section>
  );
}