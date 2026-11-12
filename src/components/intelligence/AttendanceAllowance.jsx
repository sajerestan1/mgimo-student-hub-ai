import StatusChip from '@/components/shell/StatusChip';
import ProgressBar from '@/components/shell/ProgressBar';
import { ATTENDANCE_TONE } from '@/lib/academicIntelligence';
import { useI18n } from '@/i18n/I18nProvider';

const TILE = 'rounded-xl border border-line bg-white px-4 py-3.5';

export default function AttendanceAllowance({ attendance, policy }) {
  const { t } = useI18n();
  const allowance = attendance.allowance;
  const tone = ATTENDANCE_TONE[allowance.status] || 'neutral';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className={TILE}>
          <p className="text-[13px] font-medium text-mutedink">{t('intel.allowance.missed')}</p>
          <p className={`mt-1 text-[24px] font-semibold leading-none tabular-nums ${allowance.used ? 'text-critical' : 'text-ink'}`}>
            {allowance.used}
          </p>
        </div>
        <div className={TILE}>
          <p className="text-[13px] font-medium text-mutedink">{t('intel.allowance.remaining')}</p>
          <p className="mt-1 text-[24px] font-semibold leading-none tabular-nums text-ink">{allowance.remaining}</p>
        </div>
        <div className={TILE}>
          <p className="text-[13px] font-medium text-mutedink">{t('intel.allowance.attendance')}</p>
          <p className="mt-1 text-[24px] font-semibold leading-none tabular-nums text-ink">{attendance.rate === null ? '—' : `${attendance.rate}%`}</p>
        </div>
        <div className={TILE}>
          <p className="text-[13px] font-medium text-mutedink">{t('intel.allowance.status')}</p>
          <div className="mt-1.5"><StatusChip tone={tone}>{t(`intel.status.attendance.${allowance.status}`)}</StatusChip></div>
        </div>
      </div>

      <div>
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-[13px] text-mutedink">
            {t('intel.allowance.usedOfLimit', { used: allowance.used, limit: allowance.limit })}
            {allowance.usedPercent !== null && <> · {Math.round(allowance.usedPercent)}%</>}
          </p>
          <p className="text-[12.5px] text-mutedink">{policy.institution}</p>
        </div>
        <ProgressBar className="mt-1.5" value={Math.min(100, allowance.usedPercent || 0)} tone={tone === 'positive' ? 'positive' : tone === 'brand' ? 'brand' : tone === 'warning' ? 'warning' : 'critical'} />
        <p className="mt-2 text-[13px] leading-relaxed text-ink">{attendance.suggestedAction}</p>
      </div>

      <div>
        <p className="text-[12.5px] font-semibold uppercase tracking-[0.08em] text-mutedink">{t('intel.allowance.thresholds')}</p>
        <ul className="mt-2 space-y-1">
          {attendance.thresholds.map((threshold) => (
            <li key={threshold.percent} className="flex items-center justify-between gap-2 text-[13px]">
              <span className={threshold.reached ? 'font-medium text-ink' : 'text-mutedink'}>
                {t('intel.allowance.thresholdRow', { percent: threshold.percent, missed: threshold.missed })}
              </span>
              <span className={threshold.reached ? 'text-critical' : 'text-mutedink'}>{threshold.reached ? t('intel.allowance.reached') : t('intel.allowance.notYet')}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="text-[12.5px] font-semibold uppercase tracking-[0.08em] text-mutedink">{t('intel.allowance.perCourse')}</p>
        <ul className="mt-2 divide-y divide-line">
          {attendance.perCourse.map((course) => (
            <li key={course.courseId} className="flex items-center justify-between gap-3 py-2">
              <div className="min-w-0">
                <p className="truncate text-[13.5px] font-medium text-ink">{course.code || course.title}</p>
                <p className="text-[12.5px] text-mutedink">
                  {t('intel.allowance.courseRow', { present: course.present, late: course.late, excused: course.excused, absent: course.absent })}
                  {course.outsideEnrolment && ` · ${t('intel.allowance.outsideEnrolment')}`}
                </p>
              </div>
              <p className="shrink-0 text-[13.5px] font-semibold tabular-nums text-ink">{course.rate === null ? '—' : `${course.rate}%`}</p>
            </li>
          ))}
          {!attendance.perCourse.length && <li className="py-2 text-[13px] text-mutedink">{t('intel.allowance.noEntries')}</li>}
        </ul>
      </div>

      {attendance.bySemester.length > 1 && (
        <div>
          <p className="text-[12.5px] font-semibold uppercase tracking-[0.08em] text-mutedink">{t('intel.allowance.bySemester')}</p>
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
        {t('intel.allowance.registerNote')}
        {' '}
        {t('intel.allowance.policyLine', { limit: policy.absenceLimit, note: policy.note })}
      </p>
    </div>
  );
}