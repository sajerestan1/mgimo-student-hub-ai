import { useEffect, useState } from 'react';
import PageTitle from '@/components/shell/PageTitle';
import Surface from '@/components/shell/Surface';
import StatusChip from '@/components/shell/StatusChip';
import { base44 } from '@/api/base44Client';
import { useProfessorContext, dateLabel, todayIso } from '@/lib/professorData';

const field = 'w-full rounded-lg border border-line bg-white px-3 py-2 text-[12px] text-ink focus:border-royal/40 focus:outline-none focus:ring-2 focus:ring-royal/10';

export default function ProfessorQuizzesPage() {
  const { professor, courses } = useProfessorContext();
  const [quizzes, setQuizzes] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [quizForm, setQuizForm] = useState({ course_id: '', title: '', duration_minutes: 15, available_until: '', status: 'published' });
  const [qForm, setQForm] = useState({ prompt: '', options: ['', '', '', ''], correct_index: 0, points: 20 });
  const [busy, setBusy] = useState(false);

  const load = async () => {
    if (!professor) return;
    const page = await base44.entities.Quiz.filter({ professor_id: professor.id }, { sort: '-created_date', limit: 40 });
    const list = page.items || [];
    setQuizzes(list);
    if (!selectedId && list.length) setSelectedId(list[0].id);
    const ids = list.map((q) => q.id);
    if (!ids.length) return;
    const [qs, at] = await Promise.all([
      base44.entities.QuizQuestion.filter({ quiz_id: { $in: ids } }, { sort: 'order', limit: 200 }),
      base44.entities.QuizAttempt.filter({ quiz_id: { $in: ids } }, { limit: 300 }),
    ]);
    setQuestions(qs.items || []);
    setAttempts(at.items || []);
  };

  useEffect(() => {
    load();
  }, [professor?.id]);

  useEffect(() => {
    if (!quizForm.course_id && courses.length) setQuizForm((p) => ({ ...p, course_id: courses[0].id }));
  }, [courses.length]);

  const quiz = (quizzes || []).find((q) => q.id === selectedId);
  const quizQuestions = questions.filter((q) => q.quiz_id === selectedId).sort((a, b) => a.order - b.order);
  const quizAttempts = attempts.filter((a) => a.quiz_id === selectedId);

  const createQuiz = async (event) => {
    event.preventDefault();
    const course = courses.find((c) => c.id === quizForm.course_id);
    if (!course || !quizForm.title.trim()) return;
    setBusy(true);
    try {
      await base44.entities.Quiz.create({
        course_id: course.id,
        course_code: course.code,
        course_title: course.title,
        professor_id: professor.id,
        title: quizForm.title.trim(),
        duration_minutes: Number(quizForm.duration_minutes) || 15,
        available_from: todayIso(),
        available_until: quizForm.available_until,
        status: quizForm.status,
        semester: 'Fall Semester 2026',
      });
      setQuizForm({ course_id: quizForm.course_id, title: '', duration_minutes: 15, available_until: '', status: 'published' });
      setCreating(false);
      await load();
    } finally {
      setBusy(false);
    }
  };

  const addQuestion = async (event) => {
    event.preventDefault();
    if (!quiz || !qForm.prompt.trim()) return;
    setBusy(true);
    try {
      await base44.entities.QuizQuestion.create({
        quiz_id: quiz.id,
        course_id: quiz.course_id,
        prompt: qForm.prompt.trim(),
        options: qForm.options.filter(Boolean),
        correct_index: Number(qForm.correct_index),
        points: Number(qForm.points) || 20,
        order: quizQuestions.length + 1,
      });
      setQForm({ prompt: '', options: ['', '', '', ''], correct_index: 0, points: 20 });
      await load();
    } finally {
      setBusy(false);
    }
  };

  const togglePublish = async () => {
    await base44.entities.Quiz.update(quiz.id, { status: quiz.status === 'published' ? 'draft' : 'published' });
    await load();
  };

  if (!quizzes) return <p className="py-10 text-center text-[12px] text-mutedink">Loading quizzes…</p>;

  const average = quizAttempts.length
    ? Math.round(quizAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / quizAttempts.length)
    : 0;

  return (
    <div>
      <PageTitle
        eyebrow="Professor workspace"
        title="Quizzes & exams"
        description="Build multiple-choice checks, publish them to enrolled students and review the automatically scored attempts."
        meta={[`${quizzes.filter((q) => q.status === 'published').length} published`, `${questions.length} questions`]}
        actions={
          <button type="button" onClick={() => setCreating((v) => !v)} className="btn-primary">
            New quiz
          </button>
        }
      />

      {creating && (
        <div className="mb-4">
          <Surface title="Create quiz" subtitle="Students can attempt it as soon as it is published">
            <form onSubmit={createQuiz} className="grid gap-3 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-[11px] font-medium text-ink">Title</span>
                <input value={quizForm.title} onChange={(e) => setQuizForm((p) => ({ ...p, title: e.target.value }))} className={field} placeholder="Midterm knowledge check" />
              </label>
              <label className="block">
                <span className="mb-1 block text-[11px] font-medium text-ink">Course</span>
                <select value={quizForm.course_id} onChange={(e) => setQuizForm((p) => ({ ...p, course_id: e.target.value }))} className={field}>
                  {courses.map((c) => <option key={c.id} value={c.id}>{c.code} · {c.title}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-[11px] font-medium text-ink">Time limit (minutes)</span>
                <input type="number" min="5" value={quizForm.duration_minutes} onChange={(e) => setQuizForm((p) => ({ ...p, duration_minutes: e.target.value }))} className={field} />
              </label>
              <label className="block">
                <span className="mb-1 block text-[11px] font-medium text-ink">Available until</span>
                <input type="date" value={quizForm.available_until} onChange={(e) => setQuizForm((p) => ({ ...p, available_until: e.target.value }))} className={field} />
              </label>
              <label className="block">
                <span className="mb-1 block text-[11px] font-medium text-ink">Status</span>
                <select value={quizForm.status} onChange={(e) => setQuizForm((p) => ({ ...p, status: e.target.value }))} className={field}>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </label>
              <div className="sm:col-span-2">
                <button type="submit" disabled={busy} className="btn-primary disabled:opacity-60">Create quiz</button>
              </div>
            </form>
          </Surface>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_1.5fr]">
        <Surface title="Your quizzes" bodyClassName="px-0 pb-0 pt-1">
          <ul className="divide-y divide-line">
            {quizzes.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className={`flex w-full items-start justify-between gap-2 px-5 py-3 text-left ${item.id === selectedId ? 'bg-brand-soft/60' : 'row-hover'}`}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-[12px] font-medium text-ink">{item.title}</span>
                    <span className="mt-0.5 block text-[10.5px] text-mutedink">
                      {item.course_code} · {questions.filter((q) => q.quiz_id === item.id).length} questions · {attempts.filter((a) => a.quiz_id === item.id).length} attempts
                    </span>
                  </span>
                  <StatusChip tone={item.status === 'published' ? 'positive' : 'neutral'}>{item.status}</StatusChip>
                </button>
              </li>
            ))}
            {!quizzes.length && <li className="px-5 py-6 text-[11.5px] text-mutedink">No quizzes yet.</li>}
          </ul>
        </Surface>

        <div className="space-y-4">
          {quiz && (
            <>
              <Surface
                title={quiz.title}
                subtitle={`${quiz.course_code} · ${quiz.duration_minutes} minutes · available until ${dateLabel(quiz.available_until)}`}
                action={<button type="button" onClick={togglePublish} className="btn-quiet btn-sm">{quiz.status === 'published' ? 'Unpublish' : 'Publish'}</button>}
              >
                <ul className="space-y-2">
                  {quizQuestions.map((q, index) => (
                    <li key={q.id} className="rounded-lg border border-line px-3 py-2">
                      <p className="text-[11.5px] font-medium text-ink">{index + 1}. {q.prompt}</p>
                      <p className="mt-1 text-[10.5px] text-mutedink">
                        {q.options.map((o, i) => `${String.fromCharCode(65 + i)}. ${o}`).join('   ')}
                      </p>
                      <p className="mt-1 text-[10.5px] text-positive">
                        Correct: {String.fromCharCode(65 + q.correct_index)} · {q.points} points
                      </p>
                    </li>
                  ))}
                  {!quizQuestions.length && <li className="text-[11.5px] text-mutedink">No questions yet.</li>}
                </ul>
              </Surface>

              <Surface title="Add question" subtitle="Saved to this quiz immediately">
                <form onSubmit={addQuestion} className="space-y-3">
                  <input value={qForm.prompt} onChange={(e) => setQForm((p) => ({ ...p, prompt: e.target.value }))} className={field} placeholder="Question text" />
                  <div className="grid gap-2 sm:grid-cols-2">
                    {qForm.options.map((option, index) => (
                      <label key={index} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="correct"
                          checked={Number(qForm.correct_index) === index}
                          onChange={() => setQForm((p) => ({ ...p, correct_index: index }))}
                        />
                        <input
                          value={option}
                          onChange={(e) => setQForm((p) => ({ ...p, options: p.options.map((o, i) => (i === index ? e.target.value : o)) }))}
                          className={field}
                          placeholder={`Option ${String.fromCharCode(65 + index)}`}
                        />
                      </label>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="number" min="1" value={qForm.points} onChange={(e) => setQForm((p) => ({ ...p, points: e.target.value }))} className={`${field} max-w-[110px]`} />
                    <button type="submit" disabled={busy} className="btn-primary disabled:opacity-60">Add question</button>
                  </div>
                </form>
              </Surface>

              <Surface title="Attempts" subtitle={`${quizAttempts.length} attempts · average ${average}%`} bodyClassName="px-0 pb-0 pt-1">
                <ul className="divide-y divide-line">
                  {quizAttempts.map((attempt) => (
                    <li key={attempt.id} className="flex items-center justify-between gap-3 px-5 py-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-[12px] text-ink">{attempt.student_name}</p>
                        <p className="text-[10.5px] text-mutedink">{dateLabel(attempt.submitted_at)}</p>
                      </div>
                      <StatusChip tone={(attempt.score || 0) >= 60 ? 'positive' : 'critical'}>
                        {attempt.score}/{attempt.max_score || 100}
                      </StatusChip>
                    </li>
                  ))}
                  {!quizAttempts.length && <li className="px-5 py-6 text-[11.5px] text-mutedink">No attempts yet.</li>}
                </ul>
              </Surface>
            </>
          )}
        </div>
      </div>
    </div>
  );
}