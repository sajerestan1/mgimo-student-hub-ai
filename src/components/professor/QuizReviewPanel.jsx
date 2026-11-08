import { useMemo, useState } from 'react';
import Surface from '@/components/shell/Surface';
import StatusChip from '@/components/shell/StatusChip';
import { base44 } from '@/api/base44Client';
import { field } from '@/lib/contentTypes';
import { todayIso } from '@/lib/professorData';

const OBJECTIVE = new Set(['multiple_choice', 'multiple_select', 'true_false']);
const isObjective = (question) => OBJECTIVE.has(question.type);

const objectivePoints = (question, raw) => {
  if (raw === undefined || raw === null || raw === '') return 0;
  if (question.type === 'multiple_select') {
    const right = (question.correct_answers?.length ? question.correct_answers : [question.correct_index]).slice().sort();
    const given = String(raw).split(',').filter(Boolean).map(Number).sort();
    return right.length === given.length && right.every((value, index) => value === given[index]) ? question.points || 1 : 0;
  }
  return Number(raw) === question.correct_index ? question.points || 1 : 0;
};

// Marks the written (short-answer and essay) questions of a submitted attempt.
// The saved score is what the student's gradebook then reads.
export default function QuizReviewPanel({ attempts, quizzes, questions, professor, onReviewed }) {
  const [selectedId, setSelectedId] = useState('');
  const [marks, setMarks] = useState({});
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);

  const selected = useMemo(() => attempts.find((row) => row.id === selectedId) || null, [attempts, selectedId]);
  const quiz = selected ? quizzes.find((row) => row.id === selected.quiz_id) : null;
  const quizQuestions = useMemo(
    () => (selected ? questions.filter((q) => q.quiz_id === selected.quiz_id).sort((a, b) => a.order - b.order) : []),
    [questions, selected]
  );

  const open = (attempt) => {
    setSelectedId(attempt.id);
    setComment(attempt.feedback || '');
    const initial = {};
    (attempt.manual_grades || []).forEach((row) => { initial[row.index] = String(row.points); });
    setMarks(initial);
  };

  const save = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      const possible = quizQuestions.reduce((sum, q) => sum + (q.points || 1), 0);
      let earned = 0;
      const manual = [];
      quizQuestions.forEach((question, index) => {
        if (isObjective(question)) {
          earned += objectivePoints(question, selected.answers?.[index]);
          return;
        }
        const points = Math.max(0, Math.min(question.points || 1, Number(marks[index]) || 0));
        earned += points;
        manual.push({ index, points, feedback: '' });
      });
      const score = Math.round((earned / Math.max(1, possible)) * 100);
      await base44.entities.QuizAttempt.update(selected.id, {
        score,
        max_score: 100,
        manual_grades: manual,
        review_status: 'reviewed',
        feedback: comment.trim(),
        reviewed_by: professor?.full_name || 'Professor',
        reviewed_at: todayIso(),
      });
      setSelectedId('');
      setMarks({});
      setComment('');
      await onReviewed();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Surface
      title="Quiz attempts to review"
      subtitle="Written answers are marked here; the result then feeds the course gradebook"
      bodyClassName="px-0 pb-0 pt-1"
    >
      {!attempts.length && (
        <p className="px-5 py-6 text-[11.5px] text-mutedink">No quiz attempts are waiting for review.</p>
      )}

      {attempts.length > 0 && (
        <ul className="divide-y divide-line">
          {attempts.map((attempt) => {
            const attemptQuiz = quizzes.find((row) => row.id === attempt.quiz_id);
            const active = selectedId === attempt.id;
            return (
              <li key={attempt.id} className="px-5 py-3">
                <button type="button" onClick={() => (active ? setSelectedId('') : open(attempt))} className="flex w-full items-start justify-between gap-3 text-left">
                  <span className="min-w-0">
                    <span className="block truncate text-[12px] font-medium text-ink">{attempt.student_name}</span>
                    <span className="mt-0.5 block truncate text-[10.5px] text-mutedink">
                      {attemptQuiz?.title} · submitted {attempt.submitted_at} · automatic score {attempt.score}%
                    </span>
                  </span>
                  <StatusChip tone="warning">Awaiting review</StatusChip>
                </button>

                {active && (
                  <div className="mt-3 space-y-3 rounded-lg border border-line bg-canvas p-3">
                    {quizQuestions.map((question, index) => {
                      const answer = selected?.answers?.[index];
                      const objective = isObjective(question);
                      return (
                        <div key={question.id} className="rounded-lg border border-line bg-white p-3">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-[11.5px] font-medium leading-relaxed text-ink">{index + 1}. {question.prompt}</p>
                            <span className="shrink-0 text-[10px] uppercase tracking-[0.06em] text-mutedink">
                              {question.points || 1} pt{(question.points || 1) === 1 ? '' : 's'}
                            </span>
                          </div>
                          <p className="mt-1 whitespace-pre-line rounded-md bg-canvas px-2 py-1.5 text-[11px] leading-relaxed text-ink/80">
                            {answer && answer !== '-1' ? (objective ? `Option ${Number(answer) + 1}` : answer) : 'No answer given'}
                          </p>
                          {!objective && (
                            <label className="mt-2 block">
                              <span className="mb-1 block text-[10.5px] font-medium text-ink">Points awarded</span>
                              <input
                                type="number"
                                min="0"
                                max={question.points || 1}
                                value={marks[index] ?? ''}
                                onChange={(e) => setMarks((prev) => ({ ...prev, [index]: e.target.value }))}
                                className={field}
                              />
                            </label>
                          )}
                        </div>
                      );
                    })}

                    <label className="block">
                      <span className="mb-1 block text-[11px] font-medium text-ink">Feedback to the student</span>
                      <textarea rows={3} value={comment} onChange={(e) => setComment(e.target.value)} className={field} placeholder="Comments on the written answers" />
                    </label>

                    <div className="flex items-center gap-2">
                      <button type="button" onClick={save} disabled={busy} className="btn-primary btn-sm disabled:opacity-60">
                        {busy ? 'Saving…' : 'Save reviewed result'}
                      </button>
                      <button type="button" onClick={() => setSelectedId('')} className="btn-quiet btn-sm">Close</button>
                      {quiz && <span className="text-[10.5px] text-mutedink">{quiz.title}</span>}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Surface>
  );
}