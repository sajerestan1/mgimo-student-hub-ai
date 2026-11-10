import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp } from 'lucide-react';
import Surface from '@/components/shell/Surface';
import StatusChip from '@/components/shell/StatusChip';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';
import { useI18n } from '@/i18n/I18nProvider';
import PanelTitle from './PanelTitle';
import PerformanceChart from './PerformanceChart';

const toneFor = (average) =>
  average === null ? 'text-mutedink' : average >= 70 ? 'text-positive' : average >= 50 ? 'text-warning' : 'text-critical';

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
    <Surface
      className="h-full"
      title={<PanelTitle icon={TrendingUp} tone="brand">{t('student.dashboard.performance.title')}</PanelTitle>}
      subtitle={
        scored.length
          ? scored.length === 1
            ? t('student.dashboard.performance.acrossOne')
            : t('student.dashboard.performance.acrossMany', { count: scored.length })
          : t('student.dashboard.performance.none')
      }
      action={
        <Link to={P.student.intelligence} className="link-quiet text-[13.5px]">
          {t('student.dashboard.performance.open')}
          <ArrowRight className="dir-icon h-3.5 w-3.5" />
        </Link>
      }
      bodyClassName="px-4 pb-4 pt-1"
    >
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-mutedink">
            {t('student.dashboard.metrics.semesterAverage')}
          </p>
          <p className="mt-1 text-[30px] font-semibold leading-none tracking-[-0.02em] tabular-nums text-ink">
            {average === null ? '—' : average}
            <span className="ms-1 text-[13px] font-normal text-mutedink">/ 100</span>
          </p>
        </div>
        <StatusChip tone={average === null ? 'neutral' : average >= 70 ? 'positive' : average >= 50 ? 'warning' : 'critical'}>
          {context.summary?.averageLetter || '—'}
        </StatusChip>
      </div>

      {scored.length > 0 && <PerformanceChart courses={scored.slice(0, 8)} average={average} />}

      {scored.length > 0 && (
        <ul className="mt-1 divide-y divide-line">
          {scored.slice(0, 4).map((course) => (
            <li key={course.id} className="flex items-center justify-between gap-3 py-2">
              <div className="min-w-0">
                <p className="truncate text-[13.5px] font-medium text-ink">
                  {course.code} · {course.title}
                </p>
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

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line pt-2 text-[12.5px] text-mutedink">
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
    </Surface>
  );
}