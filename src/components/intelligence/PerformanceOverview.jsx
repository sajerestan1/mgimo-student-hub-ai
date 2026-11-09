import { Link } from 'react-router-dom';
import StatusChip from '@/components/shell/StatusChip';
import ProgressBar from '@/components/shell/ProgressBar';
import { COURSE_LABEL, COURSE_TONE, TREND_LABEL, score } from '@/lib/academicIntelligence';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';

const TILE = 'rounded-xl border border-line bg-white px-4 py-3.5';

function TrendNote({ trend }) {
  const tone = trend.direction === 'improving' ? 'text-positive' : trend.direction === 'declining' ? 'text-critical' : 'text-mutedink';
  return (
    <p className={`mt-1 text-[13px] ${tone}`}>
      {TREND_LABEL[trend.direction]}
      {trend.delta !== null && trend.direction !== 'stable' && (
        <span className="text-mutedink"> · {trend.delta > 0 ? '+' : ''}{trend.delta} points between earlier and later results</span>
      )}
    </p>
  );
}

export default function PerformanceOverview({ performance, attendance }) {
  const courses = performance.courses || [];
  const scored = courses.filter((course) => course.average !== null);
  const cumulative = performance.cumulative;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className={TILE}>
          <p className="text-[13px] font-medium text-mutedink">Semester average</p>
          <p className="mt-1 text-[26px] font-semibold leading-none tabular-nums text-ink">{score(performance.semesterAverage)}</p>
          <p className="mt-1.5 text-[12.5px] text-mutedink">Calculated · credit-weighted · {performance.credits} credits</p>
        </div>
        <div className={TILE}>
          <p className="text-[13px] font-medium text-mutedink">Official register</p>
          <p className="mt-1 text-[26px] font-semibold leading-none tabular-nums text-ink">
            {cumulative.average === null ? '—' : `${cumulative.average.toFixed(1)}`}
            <span className="ml-1 text-[14px] font-medium text-mutedink">/ {cumulative.scaleMax}</span>
          </p>
          <p className="mt-1.5 text-[12.5px] text-mutedink">Recorded · {cumulative.count} entries · {cumulative.scaleLabel}</p>
        </div>
        <div className={TILE}>
          <p className="text-[13px] font-medium text-mutedink">Assessments graded</p>
          <p className="mt-1 text-[26px] font-semibold leading-none tabular-nums text-ink">{performance.gradedAssessments}</p>
          <p className="mt-1.5 text-[12.5px] text-mutedink">
            {performance.awaitingAssessments} awaiting grading · {scored.length} courses with results
          </p>
        </div>
        <div className={TILE}>
          <p className="text-[13px] font-medium text-mutedink">Not submitted</p>
          <p className={`mt-1 text-[26px] font-semibold leading-none tabular-nums ${performance.missingAssessments ? 'text-critical' : 'text-ink'}`}>
            {performance.missingAssessments}
          </p>
          <p className="mt-1.5 text-[12.5px] text-mutedink">Past the due date with no submission</p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className={TILE}>
          <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-mutedink">Academic strengths</p>
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
            <p className="mt-2 text-[13px] text-mutedink">No course is above 70 yet, so nothing is marked as a strength.</p>
          )}
        </div>

        <div className={TILE}>
          <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-mutedink">Needs attention</p>
          {performance.attention.length ? (
            <ul className="mt-2 space-y-2">
              {performance.attention.slice(0, 4).map((course) => (
                <li key={course.id}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[14px] font-medium text-ink">{course.code}</span>
                    <StatusChip tone={COURSE_TONE[course.status]}>{COURSE_LABEL[course.status]}</StatusChip>
                  </div>
                  <TrendNote trend={course.trend} />
                  <p className="mt-0.5 text-[12.5px] text-mutedink">{course.reasons[0]}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-[13px] text-mutedink">No course currently needs attention.</p>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-line bg-canvas px-4 py-3">
        <p className="text-[13px] leading-relaxed text-mutedink">
          <span className="font-semibold text-ink">How to read this.</span> Recorded results are what your instructors
          entered. Calculated averages are computed from those graded items on a 0–100 scale. The official register uses
          the institutional marking scale ({cumulative.scaleMax}-point) and is never converted to the other scale. No
          predicted or estimated grade is produced anywhere on this page.
          {attendance?.rate !== null && attendance?.rate !== undefined && (
            <> Overall attendance is {attendance.rate}% across {attendance.registerEntries} recorded sessions.</>
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