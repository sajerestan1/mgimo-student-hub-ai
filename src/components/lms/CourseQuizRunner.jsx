import { useEffect, useMemo, useRef, useState } from 'react';
import { Clock, Play, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Surface from '@/components/shell/Surface';
import StatusChip from '@/components/shell/StatusChip';
import { base44 } from '@/api/base44Client';
import { shortDate } from '@/lib/studentCourses';
import { bestAttempt } from '@/lib/lms';

const isObjective = (question) => !['short_answer', 'essay'].includes(question.type);

export default function CourseQuizRunner({ course, quizzes, questions, attempts, student, onRefresh }) {
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const answersRef = useRef({});
  const submitRef = useRef(null);

  const quizQuestions = useMemo(
    () => questions.filter((q) => q.quiz_id === activeQuiz?.id).sort((a, b) => a.order - b.order),
    [questions, activeQuiz]
  );

  const submit = async () => {
    if (!activeQuiz || busy) return;
    setBusy(true);
    try {
      const current = answersRef.current;
      const possible = quizQuestions.reduce((sum, q) => sum + (q.points || 1), 0);
      let earned = 0;
      let correct = 0;
      quizQuestions.forEach((question, index) => {
        const given = current[index];
        if (question.type === 'multiple_select') {
          const right = (question.correct_answers?.length ? question.correct_answers : [question.correct_index]).slice().sort();
          const got = (Array.isArray(given) ? given : []).slice().sort();
          if (right.length === got.length && right.every((v, i) => v === got[i])) {
            earned += question.points || 1;
            correct += 1;
          }
        } else if (isObjective(question) && Number(given) === question.correct_index) {
          earned += question.points || 1;
          correct += 1;
        }
      });
      const score = Math.round((earned / Math.max(1, possible)) * 100);
      // Stored as strings: a single choice is its index, a multiple select is a
      // comma-joined list, and an unanswered question is "-1".
      const storedAnswers = quizQuestions.map((_, index) => {
        const given = current[index];
        return Array.isArray(given) ? given.join(',') : String(given ?? -1);
      });
      await base44.entities.QuizAttempt.create({
        quiz_id: activeQuiz.id,
        course_id: course.id,
        professor_id: course.professor_id,
        student_user_id: student?.user_id,
        student_id: student?.id,
        student_name: student?.full_name,
        answers: storedAnswers,
        score,
        max_score: 100,
        submitted_at: new Date().toISOString().slice(0, 10),
      });
      setResult({ score, correct, possible, answers: { ...current } });
      await onRefresh();
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => { submitRef.current = submit; });

  useEffect(() => {
    if (activeQuiz === null) return undefined;
    setSecondsLeft((activeQuiz.duration_minutes || 20) * 60);
    const timer = setInterval(() => {
      setSecondsLeft((value) => {
        if (value <= 1) {
          clearInterval(timer);
          submitRef.current?.();
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeQuiz?.id]);

  const close = () => {
    setActiveQuiz(null);
    setAnswers({});
    setResult(null);
  };

  const toggleMulti = (index, optionIndex) => {
    setAnswers((prev) => {
      const current = Array.isArray(prev[index]) ? prev[index] : [];
      return {
        ...prev,
        [index]: current.includes(optionIndex) ? current.filter((v) => v !== optionIndex) : [...current, optionIndex],
      };
    });
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = String(secondsLeft % 60).padStart(2, '0');

  return (
    <Surface
      title="Quizzes and knowledge checks"
      subtitle={`${quizzes.length} published quiz${quizzes.length === 1 ? '' : 'zes'} · attempts are recorded and scored automatically`}
      bodyClassName="px-0 pb-0 pt-1"
    >
      <ul className="divide-y divide-line">
        {quizzes.map((quiz) => {
          const own = attempts.filter((a) => a.quiz_id === quiz.id);
          const best = bestAttempt(attempts, quiz.id);
          const used = own.length;
          const limitReached = used >= (quiz.attempt_limit || 2);
          const isActive = activeQuiz?.id === quiz.id;
          const quizQuestionsForThis = questions.filter((q) => q.quiz_id === quiz.id);

          return (
            <li key={quiz.id} className="px-5 py-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-ink">{quiz.title}</p>
                  <p className="mt-0.5 text-[11px] text-mutedink">
                    {quizQuestionsForThis.length} questions · {quiz.duration_minutes} minutes · pass mark {quiz.pass_mark}% · attempt{' '}
                    {Math.min(used + (limitReached ? 0 : 1), quiz.attempt_limit || 2)} of {quiz.attempt_limit || 2} · open until{' '}
                    {shortDate(quiz.available_until)}
                  </p>
                  <p className="mt-1 text-[11.5px] leading-relaxed text-mutedink">{quiz.instructions}</p>
                  {own.length > 0 && (
                    <ul className="mt-2 space-y-0.5">
                      {own.map((attempt) => (
                        <li key={attempt.id} className="text-[11px] text-ink/70">
                          Attempt — {attempt.score}% ({attempt.score >= (quiz.pass_mark || 60) ? 'pass' : 'below pass mark'}) on{' '}
                          {shortDate(attempt.submitted_at)}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  {best ? (
                    <StatusChip tone={best.score >= (quiz.pass_mark || 60) ? 'positive' : 'critical'}>
                      Best {best.score}%
                    </StatusChip>
                  ) : (
                    <StatusChip tone="brand">Not attempted</StatusChip>
                  )}
                  {!isActive && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={limitReached}
                      onClick={() => { setResult(null); setAnswers({}); setActiveQuiz(quiz); }}
                    >
                      {limitReached ? 'Attempt limit reached' : used ? <><RotateCcw className="mr-1 h-3 w-3" /> Retake</> : <><Play className="mr-1 h-3 w-3" /> Start quiz</>}
                    </Button>
                  )}
                </div>
              </div>

              {isActive && (
                <div className="mt-3 space-y-4 rounded-lg border border-line bg-canvas p-3.5">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-medium text-ink">Attempt in progress</p>
                    <span className="chip bg-white text-ink">
                      <Clock className="mr-1 h-3 w-3" /> {minutes}:{seconds}
                    </span>
                  </div>

                  {quizQuestions.map((question, index) => {
                    const given = answers[index];
                    const correctSet = question.correct_answers?.length ? question.correct_answers : [question.correct_index];
                    const wasCorrect = result
                      ? question.type === 'multiple_select'
                        ? correctSet.slice().sort().join() === (Array.isArray(result.answers[index]) ? result.answers[index] : []).slice().sort().join()
                        : Number(result.answers[index]) === question.correct_index
                      : false;

                    return (
                      <div key={question.id} className="rounded-lg border border-line bg-white p-3">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-[12px] font-medium leading-relaxed text-ink">
                            {index + 1}. {question.prompt}
                          </p>
                          <span className="shrink-0 text-[10px] uppercase tracking-[0.06em] text-mutedink">
                            {question.type.replace(/_/g, ' ')} · {question.difficulty}
                          </span>
                        </div>

                        <div className="mt-2 space-y-1">
                          {(question.options || []).map((option, optionIndex) => {
                            const selected = question.type === 'multiple_select'
                              ? (given || []).includes(optionIndex)
                              : Number(given) === optionIndex;
                            const reveal = result && correctSet.includes(optionIndex);
                            return (
                              <label
                                key={optionIndex}
                                className={`flex items-start gap-2 rounded-md border px-2 py-1.5 text-[11.5px] ${
                                  reveal ? 'border-positive/40 bg-positive/5 text-ink' : 'border-line text-ink/80'
                                }`}
                              >
                                <input
                                  className="mt-0.5"
                                  type={question.type === 'multiple_select' ? 'checkbox' : 'radio'}
                                  name={`q-${question.id}`}
                                  checked={selected}
                                  disabled={Boolean(result)}
                                  onChange={() =>
                                    question.type === 'multiple_select'
                                      ? toggleMulti(index, optionIndex)
                                      : setAnswers((prev) => ({ ...prev, [index]: optionIndex }))
                                  }
                                />
                                <span>{option}</span>
                              </label>
                            );
                          })}
                        </div>

                        {result && (
                          <div className="mt-2 rounded-md bg-canvas px-2.5 py-2">
                            <p className={`text-[11px] font-medium ${wasCorrect ? 'text-positive' : 'text-critical'}`}>
                              {wasCorrect ? 'Correct' : 'Incorrect'}
                            </p>
                            <p className="mt-0.5 text-[11px] leading-relaxed text-mutedink">{question.explanation}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {result ? (
                    <div className="rounded-lg border border-line bg-white p-3">
                      <p className="text-[13px] font-semibold text-ink">
                        Score: {result.score}% ({result.correct} of {quizQuestions.length} correct)
                      </p>
                      <p className="mt-1 text-[11.5px] text-mutedink">
                        {result.score >= (quiz.pass_mark || 60) ? 'Passed. ' : 'Below the pass mark. '}
                        Your attempt has been recorded and is visible to your professor.
                      </p>
                      <Button type="button" size="sm" variant="outline" className="mt-2" onClick={close}>
                        Close
                      </Button>
                    </div>
                  ) : (
                    <Button type="button" size="sm" onClick={submit} disabled={busy}>
                      {busy ? 'Scoring…' : 'Submit attempt'}
                    </Button>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {!quizzes.length && <p className="px-5 py-6 text-[12px] text-mutedink">No quizzes published for this course yet.</p>}
    </Surface>
  );
}