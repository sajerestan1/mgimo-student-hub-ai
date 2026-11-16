import { useEffect, useState } from 'react';
import Surface from '@/components/shell/Surface';
import StatusChip from '@/components/shell/StatusChip';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { loadStudentCourses, shortDate } from '@/lib/studentCourses';
import { DEMO_INSTITUTION } from '@/lib/demoInstitutionData';
import { useI18n } from '@/i18n/I18nProvider';

export default function CourseQuizzesPanel() {
  const { t, language } = useI18n();
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
    if (import.meta.env.VITE_DEMO_MODE === 'true') {
      const demoQuizzes = [{ id: 'demo-quiz-ir', course_id: context.courseIds[0], course_code: context.courses[0]?.code, professor_id: 'prof-demo', title: 'IR Theory — Module 4', duration_minutes: 15, available_until: '2026-11-22', status: 'published' }];
      const demoQuestions = [{ id: 'dq1', quiz_id: 'demo-quiz-ir', order: 1, prompt: 'Which concept emphasizes state sovereignty?', options: ['Realism','Liberalism','Constructivism','Marxism'], correct_index: 0, points: 1 }, { id: 'dq2', quiz_id: 'demo-quiz-ir', order: 2, prompt: 'Who is a central actor in classical realism?', options: ['NGOs','The state','Individuals only','International courts'], correct_index: 1, points: 1 }];
      setQuizzes(demoQuizzes); setQuestions(demoQuestions); setAttempts([]); return;
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
      const attemptRecord = {
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
      };
      if (import.meta.env.VITE_DEMO_MODE === 'true') setAttempts((prev) => [...prev, { ...attemptRecord, id: 'demo-attempt-' + Date.now() }]);
      else await base44.entities.QuizAttempt.create(attemptRecord);
      setActiveId(null);
      setAnswers({});
      if (import.meta.env.VITE_DEMO_MODE !== 'true') await load();
    } finally {
      setBusy(false);
    }
  };

  if (!quizzes || !quizzes.length) return null;

  return (
    <div className="mb-4">
      <Surface
        title={t('student.quizzes.panelTitle')}
        subtitle={t('student.quizzes.panelHint')}
        bodyClassName="px-0 pb-0 pt-1"
      >
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
                      {quiz.course_code} · {t('student.quizzes.questions', { count: quizQuestions.length })} ·{' '}
                      {t('student.quizzes.minutes', { count: quiz.duration_minutes })}
                      {quiz.available_until
                        ? ` · ${t('student.quizzes.until', { date: shortDate(quiz.available_until, undefined, language) })}`
                        : ''}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {attempt ? (
                      <StatusChip tone={attempt.score >= 60 ? 'positive' : 'critical'}>
                        {t('student.quizzes.scored', { score: attempt.score })}
                      </StatusChip>
                    ) : (
                      <button type="button" onClick={() => { setActiveId(isOpen ? null : quiz.id); setAnswers({}); }} className="btn-quiet btn-sm">
                        {isOpen ? t('student.quizzes.close') : t('student.quizzes.start')}
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
                      {busy ? t('student.quizzes.scoring') : t('student.quizzes.submit')}
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