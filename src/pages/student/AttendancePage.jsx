import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageTitle from '@/components/shell/PageTitle';
import Surface from '@/components/shell/Surface';
import StatusChip from '@/components/shell/StatusChip';
import { loadStudentPortal } from '@/lib/studentPortal';
import { loadAcademicIntelligence, ATTENDANCE_TONE } from '@/lib/academicIntelligence';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';
import { useI18n } from '@/i18n/I18nProvider';

const STATS = [
  ['present', 'text-positive'],
  ['late', 'text-warning'],
  ['excused', 'text-brand'],
  ['absent', 'text-critical'],
];

export default function AttendancePage() {
  const { t } = useI18n();
  const [context, setContext] = useState(null);
  const [intel, setIntel] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    loadStudentPortal()
      .then(setContext)
      .catch(() => setFailed(true));
    // The absence allowance is an addition: if it cannot be loaded, the register
    // below still renders.
    loadAcademicIntelligence()
      .then(setIntel)
      .catch(() => setIntel(null));
  }, []);

  if (failed) return <p className="card-surface px-5 py-6 text-[15px] text-critical">{t('student.attendance.error')}</p>;
  if (!context) return <div className="h-64 animate-pulse rounded-xl bg-white" />;

  const attendance = context.attendance || {};
  const overall = attendance.overall ?? 0;
  const held = Number(attendance.held) || 0;
  const byCourse = Array.isArray(attendance.byCourse) ? attendance.byCourse : [];
  const recorded = byCourse.filter((course) => course.total > 0);

  if (!context.linked || !held) {
    return (
      <div>
        <PageTitle eyebrow={t('student.common.studentWorkspace')} title={t('student.attendance.title')} />
        <p className="card-surface px-5 py-8 text-[15px] leading-relaxed text-mutedink">
          {context.linked ? t('student.attendance.noRegister') : context.scopeNote || t('student.common.notLinked')}
        </p>
      </div>
    );
  }

  return (
    <div>
      <PageTitle
        eyebrow={t('student.common.studentWorkspace')}
        title={t('student.attendance.title')}
        description={t('student.attendance.description')}
        meta={[
          t('student.attendance.metaSessions', { count: held }),
          t('student.attendance.metaCourses', { count: byCourse.length }),
        ]}
      />

      {intel?.attendance && (
        <div className="card-surface mb-4 flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <div>
              <p className="text-[12.5px] text-mutedink">{t('student.attendance.missedClasses')}</p>
              <p className="text-[18px] font-semibold tabular-nums text-ink">{intel.attendance.allowance.used}</p>
            </div>
            <div>
              <p className="text-[12.5px] text-mutedink">{t('student.attendance.remaining')}</p>
              <p className="text-[18px] font-semibold tabular-nums text-ink">{intel.attendance.allowance.remaining}</p>
            </div>
            <div>
              <p className="text-[12.5px] text-mutedink">{t('student.attendance.permitted')}</p>
              <p className="text-[18px] font-semibold tabular-nums text-ink">{intel.attendance.allowance.limit}</p>
            </div>
            <StatusChip tone={ATTENDANCE_TONE[intel.attendance.allowance.status] || 'neutral'}>
              {t(`student.attendance.allowance.${intel.attendance.allowance.status}`)}
            </StatusChip>
          </div>
          <Link to={P.student.intelligence} className="text-[13px] font-medium text-brand hover:underline">
            {t('student.attendance.allowanceLink')}
          </Link>
        </div>
      )}

      <div className="mb-4 grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <div className="card-surface flex flex-col justify-center px-5 py-6">
          <p className="text-[13px] font-medium text-mutedink">{t('student.attendance.rate')}</p>
          <p className="mt-1 text-[32px] font-semibold leading-none tracking-[-0.02em] tabular-nums text-ink">
            {overall}%
          </p>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-line">
            <div
              className={`h-full rounded-full ${overall >= 80 ? 'bg-positive' : overall >= 60 ? 'bg-warning' : 'bg-critical'}`}
              style={{ width: `${overall}%` }}
            />
          </div>
          <p className="mt-3 text-[13px] leading-relaxed text-mutedink">{t('student.attendance.rateNote')}</p>
        </div>

        <div className="card-surface overflow-hidden">
          <div className="grid grid-cols-2 gap-px bg-line sm:grid-cols-4">
            {STATS.map(([key, tone]) => (
              <div key={key} className="bg-white px-4 py-4">
                <p className="text-[13px] text-mutedink">{t(`student.attendance.status.${key}`)}</p>
                <p className={`mt-1 text-[22px] font-semibold tabular-nums ${tone}`}>
                  {byCourse.reduce((sum, course) => sum + (course[key] || 0), 0)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Surface
        title={t('student.attendance.byCourse')}
        subtitle={t('student.attendance.byCourseHint')}
        bodyClassName="px-0 pb-0 pt-0"
      >
        {recorded.length ? (
          <ul className="divide-y divide-line">
            {recorded.map((course) => (
              <li key={course.code} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-medium text-ink">
                    {course.code} · {course.title}
                  </p>
                  <p className="mt-0.5 text-[13px] text-mutedink">
                    {t('student.attendance.courseCounts', {
                      present: course.present,
                      late: course.late,
                      excused: course.excused,
                      absent: course.absent,
                    })}
                  </p>
                </div>
                <p className="shrink-0 text-[15px] font-semibold tabular-nums text-ink">{course.rate}%</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-5 py-6 text-[15px] text-mutedink">{t('student.attendance.noCourse')}</p>
        )}
      </Surface>
    </div>
  );
}