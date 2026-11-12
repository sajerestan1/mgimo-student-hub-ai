import { Link } from 'react-router-dom';
import StatusChip from '@/components/shell/StatusChip';
import ProgressBar from '@/components/shell/ProgressBar';
import { COURSE_TONE, score } from '@/lib/academicIntelligence';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';
import { useI18n } from '@/i18n/I18nProvider';

const TILE = 'rounded-xl border border-line bg-white px-4 py-3.5';

function TrendNote({ trend }) {
  const { t } = useI18n();
  const tone = trend.direction === 'improving' ? 'text-positive' : trend.direction === 'declining' ? 'text-critical' : 'text-mutedink';
  return (
    <p className={`mt-1 text-[13px] ${tone}`}>
      {t(`intel.status.trend.${trend.direction}`)}
      {trend.delta !== null && trend.direction !== 'stable' && (
        <span className="text-mutedink"> · {trend.delta > 0 ? '+' : ''}{trend.delta} {t('intel.overview.trendDelta')}</span>
      )}
    </p>
  );
}

export default function PerformanceOverview({ performance, attendance }) {
  const { t } = useI18n();
  const courses = performance.courses || [];
  const scored = courses.filter((course) => course.average !== null);
  const cumulative = performance.cumulative;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className={TILE}>
          <p className="text-[13px] font-medium text-mutedink">{t('intel.overview.semesterAverage')}</p>
          <p className="mt-1 text-[26px] font-semibold leading-none tabular-nums text-ink">{score(performance.semesterAverage)}</p>
          <p className="mt-1.5 text-[12.5px] text-mutedink">{t('intel.overview.calculated', { credits: performance.credits })}</p>
        </div>
        <div className={TILE}>
          <p className="text-[13px] font-medium text-mutedink">{t('intel.overview.officialRegister')}</p>
          <p className="mt-1 text-[26px] font-semibold leading-none tabular-nums text-ink">
            {cumulative.average === null ? '—' : `${cumulative.average.toFixed(1)}`}
            <span className="ml-1 text-[14px] font-medium text-mutedink">/ {cumulative.scaleMax}</span>
          </p>
          <p className="mt-1.5 text-[12.5px] text-mutedink">{t('intel.overview.recorded', { count: cumulative.count, scale: cumulative.scaleLabel })}</p>
        </div>
        <div className={TILE}>
          <p className="text-[13px] font-medium text-mutedink">{t('intel.overview.graded')}</p>
          <p className="mt-1 text-[26px] font-semibold leading-none tabular-nums text-ink">{performance.gradedAssessments}</p>
          <p className="mt-1.5 text-[12.5px] text-mutedink">
            {t('intel.overview.awaiting', { awaiting: performance.awaitingAssessments, courses: scored.length })}
          </p>
        </div>
        <div className={TILE}>
          <p className="text-[13px] font-medium text-mutedink">{t('intel.overview.notSubmitted')}</p>
          <p className={`mt-1 text-[26px] font-semibold leading-none tabular-nums ${performance.missingAssessments ? 'text-critical' : 'text-ink'}`}>
            {performance.missingAssessments}
          </p>
          <p className="mt-1.5 text-[12.5px] text-mutedink">{t('intel.overview.pastDue')}</p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className={TILE}>
          <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-mutedink">{t('intel.overview.strengths')}</p>
          {performance.strengths.length ? (
            <ul className="mt-2 space-y-1.5">
              {performance.strengths.map((course) => (
                <li key={course.id} className="flex items-center justify-between gap-2">
                  <Link to={`${P.student.courses}/${course.id}`} className="truncate text-[14px] font-medium text-ink hover:underline">
                    {course.code} · {course.title}
                  </Link>
                  <span className="shrink-0 text-[14px] font-semibold tabular-nums text-positive">{course.average}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-[13px] text-mutedink">{t('intel.overview.noStrengths')}</p>
          )}
        </div>

        <div className={TILE}>
          <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-mutedink">{t('intel.overview.attention')}</p>
          {performance.attention.length ? (
            <ul className="mt-2 space-y-2">
              {performance.attention.slice(0, 4).map((course) => (
                <li key={course.id}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[14px] font-medium text-ink">{course.code}</span>
                    <StatusChip tone={COURSE_TONE[course.status]}>{t(`intel.status.course.${course.status}`)}</StatusChip>
                  </div>
                  <TrendNote trend={course.trend} />
                  <p className="mt-0.5 text-[12.5px] text-mutedink">{course.reasons[0]}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-[13px] text-mutedink">{t('intel.overview.noAttention')}</p>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-line bg-canvas px-4 py-3">
        <p className="text-[13px] leading-relaxed text-mutedink">
          <span className="font-semibold text-ink">{t('intel.overview.howTitle')}</span>{' '}
          {t('intel.overview.howBody', { scaleMax: cumulative.scaleMax })}
          {attendance?.rate !== null && attendance?.rate !== undefined && (
            <> {t('intel.overview.attendanceNote', { rate: attendance.rate, entries: attendance.registerEntries })}</>
          )}
        </p>
        {scored.length > 0 && (
          <div className="mt-3">
            <ProgressBar value={performance.semesterAverage || 0} tone="brand" />
          </div>
        )}
      </div>
    </div>
  );
}