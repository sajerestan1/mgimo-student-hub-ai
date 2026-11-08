import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PageTitle from '@/components/shell/PageTitle';
import Surface from '@/components/shell/Surface';
import StatusChip from '@/components/shell/StatusChip';
import CourseGradebookTable from '@/components/professor/CourseGradebookTable';
import QuizReviewPanel from '@/components/professor/QuizReviewPanel';
import { base44 } from '@/api/base44Client';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';
import { useProfessorContext, dateLabel, todayIso } from '@/lib/professorData';
import { loadCourseGradebook } from '@/lib/academicRecords';

const field = 'w-full rounded-lg border border-line bg-white px-3 py-2 text-[12px] text-ink focus:border-royal/40 focus:outline-none focus:ring-2 focus:ring-royal/10';

export default function ProfessorGradingPage() {
  const { professor, courses } = useProfessorContext();
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [statusFilter, setStatusFilter] = useState('submitted');
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ score: '', feedback: '' });
  const [busy, setBusy] = useState(false);
  const params = new URLSearchParams(window.location.search);
  const [assignmentFilter, setAssignmentFilter] = useState(params.get('assignment') || 'all');
  const [courseId, setCourseId] = useState('');
  const [courseData, setCourseData] = useState(null);

  const load = async () => {
    if (!professor) return;
    const [list, subs] = await Promise.all([
      base44.entities.Assignment.filter({ professor_id: professor.id }, { sort: '-due_date', limit: 60 }),
      base44.entities.Submission.filter({ professor_id: professor.id }, { sort: '-submitted_at', limit: 300 }),
    ]);
    setAssignments(list.items || []);
    setSubmissions(subs.items || []);
  };

  useEffect(() => {
    load();
  }, [professor?.id]);

  useEffect(() => {
    if (!courseId && courses.length) setCourseId(courses[0].id);
  }, [courses, courseId]);

  const loadCourse = async () => {
    if (!courseId) return;
    const data = await loadCourseGradebook(courseId);
    const pending = data.attempts.filter((a) => a.review_status === 'pending_review');
    const quizIds = [...new Set(pending.map((a) => a.quiz_id))];
    const questionPage = quizIds.length
      ? await base44.entities.QuizQuestion.filter({ quiz_id: { $in: quizIds } }, { sort: 'order', limit: 200 })
      : { items: [] };
    setCourseData({ ...data, pending, questions: questionPage.items || [] });
  };

  useEffect(() => {
    loadCourse();
  }, [courseId]);

  const rows = useMemo(() => submissions.filter((s) => {
    if (assignmentFilter !== 'all' && s.assignment_id !== assignmentFilter) return false;
    if (statusFilter === 'submitted') return s.status === 'submitted';
    if (statusFilter === 'graded') return typeof s.score === 'number';
    return true;
  }), [submissions, assignmentFilter, statusFilter]);

  const open = (submission) => {
    setSelected(submission);
    setForm({ score: typeof submission.score === 'number' ? String(submission.score) : '', feedback: submission.feedback || '' });
  };

  const save = async () => {
    if (!selected) return;
    const assignment = assignments.find((a) => a.id === selected.assignment_id);
    const max = assignment?.max_score || 100;
    const score = Number(form.score);
    if (Number.isNaN(score) || score < 0 || score > max) return;
    setBusy(true);
    try {
      await base44.entities.Submission.update(selected.id, {
        score,
        feedback: form.feedback.trim(),
        status: 'returned',
        graded_at: todayIso(),
        graded_by: professor.full_name,
      });
      setSelected(null);
      await load();
      await loadCourse();
    } finally {
      setBusy(false);
    }
  };

  if (!professor) return <p className="py-10 text-center text-[12px] text-mutedink">Loading grading queue…</p>;

  return (
    <div>
      <PageTitle
        eyebrow="Professor workspace"
        title="Submissions & grading"
        description="Review student work, enter a score and return written feedback — the result appears in the student workspace straight away."
        meta={[`${submissions.filter((s) => s.status === 'submitted').length} awaiting`, `${submissions.filter((s) => typeof s.score === 'number').length} graded`]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="rounded-lg border border-line bg-white px-2.5 py-1.5 text-[11.5px] text-ink">
              {courses.map((course) => (
                <option key={course.id} value={course.id}>{course.code} · {course.title}</option>
              ))}
            </select>
            <Link to={P.professor.assignments} className="btn-quiet">
              Manage assignments
            </Link>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <Surface
          title="Submission queue"
          subtitle={`${rows.length} matching submissions`}
          bodyClassName="px-0 pb-0 pt-1"
          action={
            <div className="flex flex-wrap gap-1.5">
              <select value={assignmentFilter} onChange={(e) => setAssignmentFilter(e.target.value)} className="rounded-lg border border-line bg-white px-2 py-1 text-[11px] text-ink">
                <option value="all">All assignments</option>
                {assignments.map((a) => (
                  <option key={a.id} value={a.id}>{a.course_code} — {a.title.slice(0, 34)}</option>
                ))}
              </select>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-line bg-white px-2 py-1 text-[11px] text-ink">
                <option value="submitted">To grade</option>
                <option value="graded">Graded</option>
                <option value="all">All</option>
              </select>
            </div>
          }
        >
          {rows.length === 0 && <p className="px-5 py-6 text-[11.5px] text-mutedink">Nothing matches this filter.</p>}
          <ul className="divide-y divide-line">
            {rows.map((submission) => {
              const assignment = assignments.find((a) => a.id === submission.assignment_id);
              return (
                <li key={submission.id}>
                  <button type="button" onClick={() => open(submission)} className="row-hover flex w-full items-start justify-between gap-3 px-5 py-3 text-left">
                    <span className="min-w-0">
                      <span className="block truncate text-[12px] font-medium text-ink">{submission.student_name}</span>
                      <span className="mt-0.5 block truncate text-[10.5px] text-mutedink">
                        {assignment?.course_code} · {assignment?.title} · submitted {dateLabel(submission.submitted_at)}
                      </span>
                    </span>
                    <StatusChip tone={typeof submission.score === 'number' ? 'positive' : 'warning'}>
                      {typeof submission.score === 'number' ? `${submission.score}/${assignment?.max_score || 100}` : 'To grade'}
                    </StatusChip>
                  </button>
                </li>
              );
            })}
          </ul>
        </Surface>

        <Surface title={selected ? 'Grade submission' : 'Select a submission'} subtitle={selected ? selected.student_name : 'Pick a submission from the queue'}>
          {!selected && <p className="text-[11.5px] text-mutedink">Open any submission to review the student's work, enter a score and return feedback.</p>}
          {selected && (
            <div className="space-y-3">
              <div className="rounded-lg border border-line bg-canvas px-3 py-2">
                <p className="text-[11px] text-mutedink">Student work</p>
                <p className="mt-1 text-[11.5px] leading-relaxed text-ink">{selected.content || 'No written comment was attached.'}</p>
                {selected.file_url && (
                  <a href={selected.file_url} target="_blank" rel="noreferrer" className="link-quiet mt-2 inline-flex">
                    Open attachment
                  </a>
                )}
              </div>

              <label className="block">
                <span className="mb-1 block text-[11px] font-medium text-ink">Score</span>
                <input type="number" min="0" value={form.score} onChange={(e) => setForm((p) => ({ ...p, score: e.target.value }))} className={field} />
              </label>

              <label className="block">
                <span className="mb-1 block text-[11px] font-medium text-ink">Feedback to the student</span>
                <textarea rows={5} value={form.feedback} onChange={(e) => setForm((p) => ({ ...p, feedback: e.target.value }))} className={field} placeholder="What worked, what to improve, and the mark rationale" />
              </label>

              <div className="flex items-center gap-2">
                <button type="button" onClick={save} disabled={busy} className="btn-primary disabled:opacity-60">
                  {busy ? 'Saving…' : 'Save & return grade'}
                </button>
                <button type="button" onClick={() => setSelected(null)} className="btn-quiet">
                  Close
                </button>
              </div>
            </div>
          )}
        </Surface>
      </div>

      {courseData && (
        <div className="mt-4 space-y-4">
          <CourseGradebookTable data={courseData} />
          <QuizReviewPanel
            attempts={courseData.pending}
            quizzes={courseData.quizzes}
            questions={courseData.questions}
            professor={professor}
            onReviewed={loadCourse}
          />
        </div>
      )}
    </div>
  );
}