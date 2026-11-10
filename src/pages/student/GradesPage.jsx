import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageTitle from '@/components/shell/PageTitle';
import Surface from '@/components/shell/Surface';
import StatusChip from '@/components/shell/StatusChip';
import AssessmentRows from '@/components/student/AssessmentRows';
import TranscriptTable from '@/components/student/TranscriptTable';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';
import { loadStudentPortal } from '@/lib/studentPortal';
import { letterFor } from '@/lib/lms';
import { useI18n } from '@/i18n/I18nProvider';

const COMPLETION = {
  completed: { labelKey: 'student.grades.completion.completed', tone: 'positive' },
  in_progress: { labelKey: 'student.grades.completion.inProgress', tone: 'brand' },
  not_started: { labelKey: 'student.grades.completion.notStarted', tone: 'neutral' },
};

const standingFor = (summary) => {
  if (summary.average === null) return 'none';
  if (summary.average < 50) return 'risk';
  if (summary.average < 60) return 'attention';
  return 'good';
};

export default function GradesPage() {
  const { t } = useI18n();
  const [context, setContext] = useState(null);

  useEffect(() => {
    let alive = true;
    loadStudentPortal().then((data) => {
      if (alive) setContext(data);
    });
    return () => { alive = false; };
  }, []);

  if (!context) return <p className="py-10 text-center text-[15px] text-mutedink">{t('student.grades.loading')}</p>;

  // One shape, one source: the same gradebook result the dashboard reads.
  const student = context.profile;
  const courses = context.courses.map((course) => ({
    course: { id: course.id, code: course.code, title: course.title },
    professor: course.professor,
    credits: course.credits,
    gradebook: {
      rows: course.rows,
      weighted: course.weighted,
      awaiting: course.awaiting,
      missing: course.missing,
      weightScored: course.weightScored,
      graded: course.graded,
    },
    moduleProgress: course.moduleProgress,
    completion: course.completion,
  }));
  const summary = {
    ...context.summary,
    assessmentsRecorded: context.summary.graded,
    missing: context.courses.reduce((sum, course) => sum + course.missing, 0),
    modulePercent: context.summary.modulesTotal
      ? Math.round((context.summary.modulesCompleted / context.summary.modulesTotal) * 100)
      : 0,
  };

  if (!student) {
    return (
      <Surface title={t('student.grades.noStudentRecord')}>
        <p className="text-[12px] text-mutedink">{t('student.grades.noStudentRecordBody')}</p>
      </Surface>
    );
  }

  const standing = standingFor(summary);
  const standingLabel = t(`student.grades.standingValue.${standing}`);
  const transcriptRows = courses.map((entry) => ({
    code: entry.course.code,
    title: entry.course.title,
    professor: entry.professor,
    credits: entry.credits,
    score: entry.gradebook.weighted,
    completion: entry.completion,
  }));

  return (
    <div>
      <PageTitle
        eyebrow={t('student.common.studentWorkspace')}
        title={t('student.grades.title')}
        description={t('student.grades.description')}
        meta={[
          t('student.grades.metaCourses', { count: courses.length }),
          t('student.grades.metaCredits', { count: summary.credits }),
          standingLabel,
        ]}
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          [
            'average',
            summary.average === null ? '—' : `${summary.average.toFixed(1)}`,
            t('student.grades.metrics.averageHint', { letter: summary.averageLetter }),
          ],
          ['recorded', String(summary.assessmentsRecorded), t('student.grades.metrics.recordedHint', { count: summary.awaiting })],
          ['credits', String(summary.credits), t('student.grades.metrics.creditsHint', { count: summary.missing })],
          ['standing', standingLabel, t('student.grades.metrics.standingHint', { percent: summary.modulePercent })],
        ].map(([key, value, hint]) => (
          <div key={key} className="card-surface px-4 py-3.5">
            <p className="text-[13px] text-mutedink">{t(`student.grades.metrics.${key}`)}</p>
            <p className="mt-1 text-[18px] font-semibold leading-none tracking-[-0.02em] text-ink">{value}</p>
            <p className="mt-1.5 text-[13px] text-mutedink">{hint}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Surface title={t('student.grades.courseRecord')} subtitle={t('student.grades.courseRecordHint')} bodyClassName="px-0 pb-0 pt-1">
          {!courses.length && <p className="px-5 py-6 text-[13px] text-mutedink">{t('student.grades.notEnrolled')}</p>}
          <ul className="divide-y divide-line">
            {courses.map((entry) => {
              const completion = COMPLETION[entry.completion] || COMPLETION.not_started;
              return (
                <li key={entry.course.id} className="px-5 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[14px] font-semibold text-ink">
                        <span className="font-mono text-[13px] text-mutedink">{entry.course.code}</span>
                        <span className="mx-1.5 text-line">·</span>
                        {entry.course.title}
                      </p>
                      <p className="mt-0.5 text-[13px] text-mutedink">
                        {t('student.grades.courseMeta', {
                          professor: entry.professor,
                          credits: entry.credits,
                          done: entry.moduleProgress.completed,
                          total: entry.moduleProgress.total,
                          percent: entry.gradebook.weightScored,
                        })}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        <StatusChip tone={completion.tone}>{t(completion.labelKey)}</StatusChip>
                        {entry.gradebook.awaiting > 0 && (
                          <StatusChip tone="warning">{t('student.grades.awaitingChip', { count: entry.gradebook.awaiting })}</StatusChip>
                        )}
                        {entry.gradebook.missing > 0 && (
                          <StatusChip tone="critical">{t('student.grades.missingChip', { count: entry.gradebook.missing })}</StatusChip>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 text-end">
                      <p className="text-[15px] font-semibold tabular-nums text-ink">
                        {entry.gradebook.weighted === null ? '—' : entry.gradebook.weighted.toFixed(1)}
                      </p>
                      <p className="text-[13px] font-medium text-mutedink">
                        {entry.gradebook.weighted === null ? t('student.grades.noGradeYet') : letterFor(entry.gradebook.weighted)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <AssessmentRows rows={entry.gradebook.rows} />
                  </div>
                </li>
              );
            })}
          </ul>
        </Surface>

        <div className="space-y-4">
          <Surface title={t('student.grades.metrics.standing')}>
            <p className="text-[14px] leading-relaxed text-ink/80">
              {t('student.grades.standingBody', { standing: standingLabel.toLowerCase() })}
            </p>
            <dl className="mt-3 space-y-2 border-t border-line pt-3 text-[13px]">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-mutedink">{t('student.grades.programme')}</dt>
                <dd className="text-end font-medium text-ink">{student.program || '—'}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-mutedink">{t('student.grades.group')}</dt>
                <dd className="font-medium text-ink">{student.group_name || '—'}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-mutedink">{t('student.grades.enrolment')}</dt>
                <dd className="font-medium capitalize text-ink">{(student.enrollment_status || 'active').replace(/_/g, ' ')}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-mutedink">{t('student.grades.modulesCompleted')}</dt>
                <dd className="font-medium text-ink">
                  {t('student.grades.ofTotal', { done: summary.modulesCompleted, total: summary.modulesTotal })}
                </dd>
              </div>
            </dl>
          </Surface>

          <Surface title={t('student.grades.weighting')} subtitle={t('student.grades.weightingHint')}>
            <ul className="space-y-1.5 text-[13px] leading-relaxed text-mutedink">
              <li>{t('student.grades.weight1')}</li>
              <li>{t('student.grades.weight2')}</li>
              <li>{t('student.grades.weight3')}</li>
              <li>{t('student.grades.weight4')}</li>
            </ul>
          </Surface>
        </div>
      </div>

      <Surface
        className="mt-4"
        title={t('student.grades.semesterResults')}
        subtitle={t('student.grades.semesterSubtitle', {
          courses: courses.length,
          credits: summary.credits,
          average: summary.average === null ? '—' : summary.average.toFixed(1),
          letter: summary.averageLetter,
        })}
        bodyClassName="p-0"
        footer={
          <div className="flex flex-col gap-1.5 text-[13px] leading-relaxed text-mutedink sm:flex-row sm:items-center sm:justify-between">
            <span>{t('student.grades.transcriptNote')}</span>
            <Link to={P.student.applications} className="link-quiet shrink-0">
              {t('student.grades.requestCopy')}
            </Link>
          </div>
        }
      >
        <TranscriptTable rows={transcriptRows} />
      </Surface>
    </div>
  );
}