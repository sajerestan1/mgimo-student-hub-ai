import { useEffect, useState } from 'react';
import PageTitle from '@/components/shell/PageTitle';
import Surface from '@/components/shell/Surface';
import StatusChip from '@/components/shell/StatusChip';
import CourseQuizzesPanel from '@/components/student/CourseQuizzesPanel';
import { daysUntil, dueLabel, loadStudentPortal, shortDate } from '@/lib/studentPortal';

export default function QuizzesPage() {
  const [context, setContext] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStudentPortal()
      .then(setContext)
      .catch(() => setError('Your assessments could not be loaded. Please refresh the page.'));
  }, []);

  if (error) return <p className="card-surface px-5 py-6 text-[15px] text-critical">{error}</p>;
  if (!context) return <div className="h-64 animate-pulse rounded-xl bg-white" />;

  const quizzes = context.quizzes || [];
  const attempted = quizzes.filter((quiz) => quiz.attempts > 0);
  const closing = quizzes
    .filter((quiz) => quiz.state !== 'graded' && daysUntil(quiz.availableUntil) !== null && daysUntil(quiz.availableUntil) >= 0)
    .sort((a, b) => daysUntil(a.availableUntil) - daysUntil(b.availableUntil));

  if (!context.linked) {
    return (
      <div>
        <PageTitle eyebrow="Student workspace" title="Quizzes & exams" />
        <p className="card-surface px-5 py-8 text-[15px] text-mutedink">
          {context.scopeNote || 'Your account is not linked to a student record yet.'}
        </p>
      </div>
    );
  }

  return (
    <div>
      <PageTitle
        eyebrow="Student workspace"
        title="Quizzes & exams"
        description="Published assessments for your courses, with availability, your attempts and the result recorded for each."
        meta={[`${quizzes.length} published`, `${attempted.length} attempted`, `${closing.length} closing soon`]}
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ['Published', String(quizzes.length), 'in your courses'],
          ['Attempted', String(attempted.length), 'with a recorded attempt'],
          ['Closing soon', String(closing.length), 'still open'],
          ['Graded', String(quizzes.filter((quiz) => quiz.state === 'graded').length), 'results recorded'],
        ].map(([label, value, hint]) => (
          <div key={label} className="card-surface px-4 py-3.5">
            <p className="text-[13px] text-mutedink">{label}</p>
            <p className="mt-1 text-[26px] font-semibold leading-none tracking-[-0.02em] tabular-nums text-ink">{value}</p>
            <p className="mt-1.5 text-[13px] text-mutedink">{hint}</p>
          </div>
        ))}
      </div>

      {quizzes.length === 0 && (
        <p className="card-surface mb-4 px-5 py-6 text-[15px] text-mutedink">
          No quizzes have been published for your courses yet.
        </p>
      )}

      <CourseQuizzesPanel />

      {attempted.length > 0 && (
        <Surface title="Your attempt record" subtitle="Attempts used and the result recorded for each quiz" bodyClassName="px-0 pb-0 pt-0">
          <ul className="divide-y divide-line">
            {attempted.map((quiz) => (
              <li key={quiz.id} className="flex flex-col gap-1.5 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-[15px] font-medium text-ink">{quiz.title}</p>
                  <p className="mt-0.5 text-[13px] text-mutedink">
                    {quiz.courseCode} · attempts {quiz.attempts}/{quiz.attemptLimit} · pass mark {quiz.passMark}%
                    {quiz.availableUntil ? ` · closes ${shortDate(quiz.availableUntil)}` : ''}
                  </p>
                </div>
                <StatusChip tone={quiz.score === null ? 'warning' : quiz.score >= quiz.passMark ? 'positive' : 'critical'}>
                  {quiz.score === null ? 'Awaiting grade' : `${quiz.score}%`}
                </StatusChip>
              </li>
            ))}
          </ul>
        </Surface>
      )}

      {closing.length > 0 && (
        <p className="mt-4 rounded-lg border border-line bg-white px-4 py-3 text-[14px] leading-relaxed text-mutedink">
          Still open: {closing.map((quiz) => `${quiz.courseCode} — ${dueLabel(quiz.availableUntil).toLowerCase()}`).join(', ')}.
        </p>
      )}
    </div>
  );
}