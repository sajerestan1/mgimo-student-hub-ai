import { Link } from 'react-router-dom';
import { Link2, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import StatusChip from '@/components/shell/StatusChip';
import ProgressBar from '@/components/shell/ProgressBar';
import { COURSE_LABEL, COURSE_TONE, TREND_LABEL, score } from '@/lib/academicIntelligence';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';

const TREND_ICON = { improving: TrendingUp, declining: TrendingDown, stable: Minus, insufficient: Minus };

export default function CoursePerformanceCard({ course }) {
  const TrendIcon = TREND_ICON[course.trend.direction] || Minus;
  const trendTone =
    course.trend.direction === 'improving' ? 'text-positive' : course.trend.direction === 'declining' ? 'text-critical' : 'text-mutedink';

  return (
    <div className="card-surface flex flex-col p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link to={`${P.student.courses}/${course.id}`} className="flex items-center gap-1 text-[15px] font-semibold text-ink hover:underline">
            <span className="truncate">{course.code}</span>
            <Link2 className="h-3.5 w-3.5 shrink-0 opacity-40" />
          </Link>
          <p className="mt-0.5 line-clamp-2 text-[13px] leading-snug text-mutedink">{course.title}</p>
        </div>
        <StatusChip tone={COURSE_TONE[course.status]}>{COURSE_LABEL[course.status]}</StatusChip>
      </div>

      <div className="mt-3 flex items-end gap-2">
        <p className="text-[30px] font-semibold leading-none tabular-nums text-ink">{score(course.average)}</p>
        <p className="pb-1 text-[13px] text-mutedink">
          {course.average === null ? 'no graded items' : `calculated · ${course.letter} · ${course.gradedCount} graded`}
        </p>
      </div>

      <div className="mt-3 space-y-2">
        {course.breakdown.filter((group) => group.total).map((group) => (
          <div key={group.key}>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[12.5px] text-mutedink">{group.label}</span>
              <span className="text-[12.5px] font-medium tabular-nums text-ink">
                {group.average === null ? 'nothing graded' : `${group.average}`}
                <span className="font-normal text-mutedink"> · {group.graded}/{group.total}</span>
              </span>
            </div>
            <ProgressBar className="mt-1" value={group.average || 0} tone={group.average === null ? 'navy' : group.average >= 70 ? 'positive' : group.average >= 50 ? 'warning' : 'critical'} />
          </div>
        ))}
      </div>

      <div className="mt-3 border-t border-line pt-3">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[12.5px] text-mutedink">Coursework completion</span>
          <span className="text-[12.5px] font-medium tabular-nums text-ink">
            {course.completion.percent === null ? '—' : `${course.completion.percent}%`}
            <span className="font-normal text-mutedink"> · {course.completion.completed}/{course.completion.total}</span>
          </span>
        </div>
        <ProgressBar className="mt-1" value={course.completion.percent || 0} tone="brand" />
      </div>

      <div className="mt-3 flex items-start gap-1.5">
        <TrendIcon className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${trendTone}`} />
        <p className="text-[12.5px] leading-relaxed text-mutedink">
          <span className={trendTone}>{TREND_LABEL[course.trend.direction]}</span>
          {course.trend.delta !== null && course.trend.direction !== 'stable' && (
            <> · {course.trend.delta > 0 ? '+' : ''}{course.trend.delta} points from earlier to later results</>
          )}
          {course.trend.series.length > 0 && <> · {course.trend.series.length} graded points</>}
        </p>
      </div>

      {course.missing.length > 0 && (
        <div className="mt-3 rounded-lg bg-[#FBECEC] px-3 py-2">
          <p className="text-[12.5px] font-semibold text-[#A23B3B]">Not submitted ({course.missing.length})</p>
          <ul className="mt-1 space-y-0.5">
            {course.missing.slice(0, 3).map((title) => (
              <li key={title} className="truncate text-[12.5px] text-[#8E2F2F]">· {title}</li>
            ))}
          </ul>
        </div>
      )}

      {course.attendance && course.attendance.rate !== null && (
        <p className="mt-3 text-[12.5px] text-mutedink">
          Attendance {course.attendance.rate}% · {course.attendance.absent} absent of {course.attendance.held} recorded sessions
        </p>
      )}
    </div>
  );
}