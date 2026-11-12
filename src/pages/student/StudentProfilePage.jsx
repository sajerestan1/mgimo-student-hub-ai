import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageTitle from '@/components/shell/PageTitle';
import Surface from '@/components/shell/Surface';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';
import { loadStudentPortal } from '@/lib/studentPortal';
import { useWorkspace } from '@/lib/workspaceRole';
import { useI18n } from '@/i18n/I18nProvider';

export default function StudentProfilePage() {
  const { preview, workspace } = useWorkspace();
  const { t } = useI18n();
  const [context, setContext] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStudentPortal()
      .then(setContext)
      .catch(() => setError(t('office.profile.loadError')));
  }, []);

  if (error) return <p className="card-surface px-5 py-6 text-[15px] text-critical">{error}</p>;
  if (!context) return <div className="h-64 animate-pulse rounded-xl bg-white" />;

  const profile = context.profile;
  if (!profile) {
    return (
      <div>
        <PageTitle eyebrow={t('studentPreview.eyebrow')} title={t('studentPreview.profileTitle')} />
        <div className="card-surface px-5 py-8">
          <p className="text-[15px] leading-relaxed text-mutedink">
            {preview ? t('studentPreview.body') : context.scopeNote || t('studentPreview.unlinked')}
          </p>
          <Link to={preview ? workspace.home : P.student.dashboard} className="btn-quiet mt-4 inline-flex">
            {preview ? t('studentPreview.back') : t('studentPreview.backToDashboard')}
          </Link>
        </div>
      </div>
    );
  }

  const initials = (profile.full_name || '')
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const rows = [
    [t('office.profile.studentId'), profile.student_id || '—'],
    [t('office.profile.program'), profile.program || '—'],
    [t('office.profile.faculty'), profile.faculty || '—'],
    [t('office.profile.department'), profile.department || '—'],
    [t('office.profile.year'), profile.year ? t('office.profile.yearValue', { year: profile.year }) : '—'],
    [t('office.profile.group'), profile.group_name || '—'],
    [t('office.profile.enrolment'), (profile.enrollment_status || 'active').replace(/_/g, ' ')],
  ];

  return (
    <div>
      <PageTitle
        eyebrow={t('student.common.studentWorkspace')}
        title={t('office.profile.title')}
        description={t('office.profile.description')}
        actions={
          <Link to="/settings" className="btn-quiet">
            {t('office.profile.accountSettings')}
          </Link>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <Surface title={t('office.profile.academicRecord')}>
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-royal/10 text-[15px] font-semibold text-royal">
              {initials || '—'}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[16px] font-semibold tracking-[-0.01em] text-ink">{profile.full_name}</p>
              <p className="truncate text-[13px] text-mutedink">{profile.email}</p>
            </div>
          </div>

          <dl className="mt-4 space-y-2 text-[14px]">
            {rows.map(([label, value]) => (
              <div
                key={label}
                className="flex items-start justify-between gap-3 border-b border-line pb-2 last:border-0 last:pb-0"
              >
                <dt className="text-mutedink">{label}</dt>
                <dd className="max-w-[60%] text-right font-medium capitalize text-ink">{value}</dd>
              </div>
            ))}
          </dl>
        </Surface>

        <div className="space-y-4">
          <Surface title={t('office.profile.academicStanding')}>
            {context.summary.average === null ? (
              <p className="text-[14px] leading-relaxed text-mutedink">
                {t('office.profile.noStanding')}
              </p>
            ) : (
              <>
                <p className="text-[26px] font-semibold leading-none tracking-[-0.02em] tabular-nums text-ink">
                  {context.summary.average.toFixed(1)}
                  <span className="ml-2 text-[15px] font-medium text-mutedink">{context.summary.averageLetter}</span>
                </p>
                <p className="mt-2 text-[14px] leading-relaxed text-mutedink">
                  {t('office.profile.weightedNote')}
                </p>
                <Link to={P.student.grades} className="link-quiet mt-3 inline-flex text-[14px]">
                  {t('office.profile.openGrades')}
                </Link>
              </>
            )}
          </Surface>

          <Surface title={t('office.profile.courseLoad')}>
            <dl className="space-y-2 text-[14px]">
              {[
                [t('office.profile.activeCourses'), String(context.summary.courseCount)],
                [t('office.profile.credits'), String(context.summary.credits)],
                [
                  t('office.profile.modulesCompleted'),
                  `${context.summary.modulesCompleted} of ${context.summary.modulesTotal}`,
                ],
                [t('office.profile.attendance'), context.summary.attendanceRate === null ? t('office.profile.notRecorded') : `${context.summary.attendanceRate}%`],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between border-b border-line pb-2 last:border-0 last:pb-0">
                  <dt className="text-mutedink">{label}</dt>
                  <dd className="font-medium text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </Surface>
        </div>
      </div>
    </div>
  );
}