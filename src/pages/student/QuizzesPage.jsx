import { useEffect, useState } from 'react';
import PageTitle from '@/components/shell/PageTitle';
import Surface from '@/components/shell/Surface';
import StatusChip from '@/components/shell/StatusChip';
import CourseQuizzesPanel from '@/components/student/CourseQuizzesPanel';
import { daysUntil, dueLabel, loadStudentPortal, shortDate } from '@/lib/studentPortal';
import { useI18n } from '@/i18n/I18nProvider';

export default function QuizzesPage() {
  const { t, language } = useI18n();
  const [context, setContext] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    loadStudentPortal()
      .then(setContext)
      .catch(() => setFailed(true));
  }, []);

  if (failed) return <p className="card-surface px-5 py-6 text-[15px] text-critical">{t('student.quizzes.error')}</p>;
  if (!context) return <div className="h-64 animate-pulse rounded-xl bg-white" />;

  const quizzes = context.quizzes || [];
  const attempted = quizzes.filter((quiz) => quiz.attempts > 0);
  const closing = quizzes
    .filter((quiz) => quiz.state !== 'graded' && daysUntil(quiz.availableUntil) !== null && daysUntil(quiz.availableUntil) >= 0)
    .sort((a, b) => daysUntil(a.availableUntil) - daysUntil(b.availableUntil));

  if (!context.linked) {
    return (
      <div>
        <PageTitle eyebrow={t('student.common.studentWorkspace')} title={t('student.quizzes.title')} />
        <p className="card-surface px-5 py-8 text-[15px] text-mutedink">
          {context.scopeNote || t('student.common.notLinked')}
        </p>
      </div>
    );
  }

  return (
    <div>
      <PageTitle
        eyebrow={t('student.common.studentWorkspace')}
        title={t('student.quizzes.title')}
        description={t('student.quizzes.description')}
        meta={[
          t('student.quizzes.published', { count: quizzes.length }),
          t('student.quizzes.attemptedMeta', { count: attempted.length }),
          t('student.quizzes.closingMeta', { count: closing.length }),
        ]}
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ['published', String(quizzes.length)],
          ['attempted', String(attempted.length)],
          ['closing', String(closing.length)],
          ['graded', String(quizzes.filter((quiz) => quiz.state === 'graded').length)],
        ].map(([key, value]) => (
          <div key={key} className="card-surface px-4 py-3.5">
            <p className="text-[13px] text-mutedink">{t(`student.quizzes.metrics.${key}`)}</p>
            <p className="mt-1 text-[26px] font-semibold leading-none tracking-[-0.02em] tabular-nums text-ink">{value}</p>
            <p className="mt-1.5 text-[13px] text-mutedink">{t(`student.quizzes.metrics.${key}Hint`)}</p>
          </div>
        ))}
      </div>

      {quizzes.length === 0 && (
        <p className="card-surface mb-4 px-5 py-6 text-[15px] text-mutedink">{t('student.quizzes.empty')}</p>
      )}

      <CourseQuizzesPanel />

      {attempted.length > 0 && (
        <Surface
          title={t('student.quizzes.attemptRecord')}
          subtitle={t('student.quizzes.attemptRecordHint')}
          bodyClassName="px-0 pb-0 pt-0"
        >
          <ul className="divide-y divide-line">
            {attempted.map((quiz) => (
              <li key={quiz.id} className="flex flex-col gap-1.5 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-[15px] font-medium text-ink">{quiz.title}</p>
                  <p className="mt-0.5 text-[13px] text-mutedink">
                    {quiz.courseCode} · {t('student.quizzes.attemptMeta', { used: quiz.attempts, limit: quiz.attemptLimit, mark: quiz.passMark })}
                    {quiz.availableUntil
                      ? ` · ${t('student.quizzes.closesAt', { date: shortDate(quiz.availableUntil, undefined, language) })}`
                      : ''}
                  </p>
                </div>
                <StatusChip tone={quiz.score === null ? 'warning' : quiz.score >= quiz.passMark ? 'positive' : 'critical'}>
                  {quiz.score === null ? t('student.quizzes.awaitingGrade') : `${quiz.score}%`}
                </StatusChip>
              </li>
            ))}
          </ul>
        </Surface>
      )}

      {closing.length > 0 && (
        <p className="mt-4 rounded-lg border border-line bg-white px-4 py-3 text-[14px] leading-relaxed text-mutedink">
          {t('student.quizzes.stillOpen', {
            list: closing.map((quiz) => `${quiz.courseCode} — ${dueLabel(quiz.availableUntil, t)}`).join(', '),
          })}
        </p>
      )}
    </div>
  );
}