import { useEffect, useState } from 'react';
import Surface from '@/components/shell/Surface';
import StatusChip from '@/components/shell/StatusChip';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { loadStudentCourses, shortDate } from '@/lib/studentCourses';

export default function CourseQuizzesPanel() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [ctx, setCtx] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const context = await loadStudentCourses(user?.id);
    setCtx(context);
    if (!context.courseIds.length) {
      setQuizzes([]);
      return;
    }
    const [quizPage, attemptPage] = await Promise.all([
      base44.entities.Quiz.filter({ course_id: { $in: context.courseIds }, status: 'published' }, { limit: 30 }),
      base44.entities.QuizAttempt.filter({ student_user_id: user.id }, { limit: 100 }),
    ]);
    const list = quizPage.items || [];
    setQuizzes(list);
    const ids = list.map((q) => q.id);
    if (ids.length) {
      const qs = await base44.entities.QuizQuestion.filter({ quiz_id: { $in: ids } }, { sort: 'order', limit: 200 });
      setQuestions(qs.items || []);
    }
    setAttempts(attemptPage.items || []);
  };

  useEffect(() => {
    load();
  }, [user?.id]);

  const submitAttempt = async (quiz) => {
    const quizQuestions = questions.filter((q) => q.quiz_id === quiz.id).sort((a, b) => a.order - b.order);
    setBusy(true);
    try {
      const maxScore = quizQuestions.reduce((sum, q) => sum + (q.points || 1), 0);
      const score = quizQuestions.reduce((sum, q, index) => (Number(answers[index]) === q.correct_index ? sum + (q.points || 1) : sum), 0);
      await base44.entities.QuizAttempt.create({
        quiz_id: quiz.id,
        course_id: quiz.course_id,
        professor_id: quiz.professor_id,
        student_user_id: user.id,
        student_id: ctx.student.id,
        student_name: ctx.student.full_name,
        answers: quizQuestions.map((_, index) => Number(answers[index] ?? -1)),
        score: Math.round((score / Math.max(1, maxScore)) * 100),
        max_score: 100,
        submitted_at: new Date().toISOString().slice(0, 10),
      });
      setActiveId(null);
      setAnswers({});
      await load();
    } finally {
      setBusy(false);
    }
  };

  if (!quizzes || !quizzes.length) return null;

  return (
    <div className="mb-4">
      <Surface title="Quizzes set by your professors" subtitle="Published checks you can attempt now" bodyClassName="px-0 pb-0 pt-1">
        <ul className="divide-y divide-line">
          {quizzes.map((quiz) => {
            const attempt = attempts.find((a) => a.quiz_id === quiz.id);
            const quizQuestions = questions.filter((q) => q.quiz_id === quiz.id).sort((a, b) => a.order - b.order);
            const isOpen = activeId === quiz.id;
            return (
              <li key={quiz.id} className="px-5 py-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-[12.5px] font-semibold text-ink">{quiz.title}</p>
                    <p className="mt-0.5 text-[11px] text-mutedink">
                      {quiz.course_code} · {quizQuestions.length} questions · {quiz.duration_minutes} minutes
                      {quiz.available_until ? ` · until ${shortDate(quiz.available_until)}` : ''}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {attempt ? (
                      <StatusChip tone={attempt.score >= 60 ? 'positive' : 'critical'}>{attempt.score}% scored</StatusChip>
                    ) : (
                      <button type="button" onClick={() => { setActiveId(isOpen ? null : quiz.id); setAnswers({}); }} className="btn-quiet btn-sm">
                        {isOpen ? 'Close' : 'Start quiz'}
                      </button>
                    )}
                  </div>
                </div>

                {isOpen && !attempt && (
                  <div className="mt-3 space-y-3 rounded-lg border border-line bg-canvas px-3 py-3">
                    {quizQuestions.map((question, index) => (
                      <div key={question.id}>
                        <p className="text-[11.5px] font-medium text-ink">{index + 1}. {question.prompt}</p>
                        <div className="mt-1 grid gap-1 sm:grid-cols-2">
                          {(question.options || []).map((option, optionIndex) => (
                            <label key={optionIndex} className="flex items-center gap-2 text-[11px] text-mutedink">
                              <input
                                type="radio"
                                name={`${question.id}`}
                                checked={Number(answers[index]) === optionIndex}
                                onChange={() => setAnswers((prev) => ({ ...prev, [index]: optionIndex }))}
                              />
                              {option}
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                    <button type="button" onClick={() => submitAttempt(quiz)} disabled={busy} className="btn-primary disabled:opacity-60">
                      {busy ? 'Scoring…' : 'Submit answers'}
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </Surface>
    </div>
  );
}