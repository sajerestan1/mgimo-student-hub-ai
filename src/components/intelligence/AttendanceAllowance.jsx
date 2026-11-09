import StatusChip from '@/components/shell/StatusChip';
import ProgressBar from '@/components/shell/ProgressBar';
import { ATTENDANCE_LABEL, ATTENDANCE_TONE } from '@/lib/academicIntelligence';

const TILE = 'rounded-xl border border-line bg-white px-4 py-3.5';

export default function AttendanceAllowance({ attendance, policy }) {
  const allowance = attendance.allowance;
  const tone = ATTENDANCE_TONE[allowance.status] || 'neutral';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className={TILE}>
          <p className="text-[13px] font-medium text-mutedink">Classes missed</p>
          <p className={`mt-1 text-[24px] font-semibold leading-none tabular-nums ${allowance.used ? 'text-critical' : 'text-ink'}`}>
            {allowance.used}
          </p>
        </div>
        <div className={TILE}>
          <p className="text-[13px] font-medium text-mutedink">Remaining allowance</p>
          <p className="mt-1 text-[24px] font-semibold leading-none tabular-nums text-ink">{allowance.remaining}</p>
        </div>
        <div className={TILE}>
          <p className="text-[13px] font-medium text-mutedink">Attendance</p>
          <p className="mt-1 text-[24px] font-semibold leading-none tabular-nums text-ink">{attendance.rate === null ? '—' : `${attendance.rate}%`}</p>
        </div>
        <div className={TILE}>
          <p className="text-[13px] font-medium text-mutedink">Status</p>
          <div className="mt-1.5"><StatusChip tone={tone}>{ATTENDANCE_LABEL[allowance.status]}</StatusChip></div>
        </div>
      </div>

      <div>
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-[13px] text-mutedink">
            {allowance.used} of {allowance.limit} permitted absences used
            {allowance.usedPercent !== null && <> · {Math.round(allowance.usedPercent)}%</>}
          </p>
          <p className="text-[12.5px] text-mutedink">{policy.institution}</p>
        </div>
        <ProgressBar className="mt-1.5" value={Math.min(100, allowance.usedPercent || 0)} tone={tone === 'positive' ? 'positive' : tone === 'brand' ? 'brand' : tone === 'warning' ? 'warning' : 'critical'} />
        <p className="mt-2 text-[13px] leading-relaxed text-ink">{attendance.suggestedAction}</p>
      </div>

      <div>
        <p className="text-[12.5px] font-semibold uppercase tracking-[0.08em] text-mutedink">Alert thresholds</p>
        <ul className="mt-2 space-y-1">
          {attendance.thresholds.map((threshold) => (
            <li key={threshold.percent} className="flex items-center justify-between gap-2 text-[13px]">
              <span className={threshold.reached ? 'font-medium text-ink' : 'text-mutedink'}>
                {threshold.percent}% of the allowance · {threshold.missed} missed
              </span>
              <span className={threshold.reached ? 'text-critical' : 'text-mutedink'}>{threshold.reached ? 'Reached' : 'Not yet'}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="text-[12.5px] font-semibold uppercase tracking-[0.08em] text-mutedink">Per course</p>
        <ul className="mt-2 divide-y divide-line">
          {attendance.perCourse.map((course) => (
            <li key={course.courseId} className="flex items-center justify-between gap-3 py-2">
              <div className="min-w-0">
                <p className="truncate text-[13.5px] font-medium text-ink">{course.code || course.title}</p>
                <p className="text-[12.5px] text-mutedink">
                  {course.present} present · {course.late} late · {course.excused} excused · {course.absent} absent
                  {course.outsideEnrolment && ' · outside current enrolment'}
                </p>
              </div>
              <p className="shrink-0 text-[13.5px] font-semibold tabular-nums text-ink">{course.rate === null ? '—' : `${course.rate}%`}</p>
            </li>
          ))}
          {!attendance.perCourse.length && <li className="py-2 text-[13px] text-mutedink">No register entries recorded yet.</li>}
        </ul>
      </div>

      {attendance.bySemester.length > 1 && (
        <div>
          <p className="text-[12.5px] font-semibold uppercase tracking-[0.08em] text-mutedink">By semester</p>
          <ul className="mt-2 space-y-1">
            {attendance.bySemester.map((semester) => (
              <li key={semester.semester} className="flex items-center justify-between gap-2 text-[13px]">
                <span className="text-mutedink">{semester.semester}</span>
                <span className="tabular-nums text-ink">
                  {semester.rate === null ? '—' : `${semester.rate}%`} · {semester.absent} absent of {semester.held}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="rounded-lg bg-canvas px-3 py-2 text-[12.5px] leading-relaxed text-mutedink">
        Counted from the official class register: one entry per course per day, so a duplicated register row is never a
        second absence, and a cancelled class is neither attended nor missed. Late and excused sessions count as attended.
        Policy: {policy.absenceLimit} permitted missed classes per semester — {policy.note}
      </p>
    </div>
  );
}