import { useEffect, useState } from 'react';
import Surface from '@/components/shell/Surface';
import StatusChip from '@/components/shell/StatusChip';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { loadStudentCourses, shortDate } from '@/lib/studentCourses';

const field = 'w-full rounded-lg border border-line bg-white px-3 py-2 text-[12px] text-ink focus:border-royal/40 focus:outline-none focus:ring-2 focus:ring-royal/10';

export default function CourseAssignmentsPanel() {
  const { user } = useAuth();
  const [rows, setRows] = useState(null);
  const [ctx, setCtx] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [form, setForm] = useState({ content: '' });
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    const context = await loadStudentCourses(user?.id);
    setCtx(context);
    if (!context.courseIds.length) {
      setRows([]);
      return;
    }
    const [assignments, submissions] = await Promise.all([
      base44.entities.Assignment.filter({ course_id: { $in: context.courseIds }, status: 'published' }, { sort: 'due_date', limit: 50 }),
      base44.entities.Submission.filter({ student_user_id: user.id }, { limit: 100 }),
    ]);
    const subs = submissions.items || [];
    setRows((assignments.items || []).map((assignment) => ({
      assignment,
      submission: subs.find((s) => s.assignment_id === assignment.id),
    })));
  };

  useEffect(() => {
    load();
  }, [user?.id]);

  const submit = async (assignment) => {
    if (!form.content.trim()) {
      setError('Add a short note or the text of your submission.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      let stored = {};
      if (file) {
        const res = await base44.integrations.Core.UploadPrivateFile({ file });
        stored = { file_url: res.file_uri };
      }
      await base44.entities.Submission.create({
        assignment_id: assignment.id,
        course_id: assignment.course_id,
        course_code: assignment.course_code,
        professor_id: assignment.professor_id,
        student_id: ctx.student.id,
        student_user_id: user.id,
        student_name: ctx.student.full_name,
        student_group: ctx.student.group_name,
        submitted_at: new Date().toISOString().slice(0, 10),
        content: form.content.trim(),
        status: 'submitted',
        ...stored,
      });
      setOpenId(null);
      setForm({ content: '' });
      setFile(null);
      await load();
    } catch {
      setError('The submission could not be saved. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  if (!rows) return null;
  if (!rows.length) return null;

  return (
    <div className="mb-4">
      <Surface
        title="Coursework set by your professors"
        subtitle="Published assignments for the courses you are enrolled in"
        bodyClassName="px-0 pb-0 pt-1"
      >
        <ul className="divide-y divide-line">
          {rows.map(({ assignment, submission }) => {
            const isOpen = openId === assignment.id;
            const graded = submission && typeof submission.score === 'number';
            return (
              <li key={assignment.id} className="px-5 py-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-[12.5px] font-semibold text-ink">{assignment.title}</p>
                    <p className="mt-0.5 text-[11px] text-mutedink">
                      {assignment.course_code} · {assignment.assessment_type.replace('_', ' ')} · max {assignment.max_score} · due {shortDate(assignment.due_date)}
                    </p>
                    {assignment.instructions && (
                      <p className="mt-1 line-clamp-2 text-[10.5px] leading-relaxed text-mutedink">{assignment.instructions}</p>
                    )}
                    {graded && (
                      <p className="mt-1.5 text-[11px] leading-relaxed text-ink">
                        <span className="font-medium">Feedback:</span> {submission.feedback || 'No comment returned.'}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <StatusChip tone={graded ? 'positive' : submission ? 'warning' : 'brand'}>
                      {graded ? `${submission.score}/${assignment.max_score}` : submission ? 'Submitted' : 'Not submitted'}
                    </StatusChip>
                    {!submission && (
                      <button
                        type="button"
                        onClick={() => { setOpenId(isOpen ? null : assignment.id); setError(''); }}
                        className="btn-quiet btn-sm"
                      >
                        {isOpen ? 'Cancel' : 'Submit'}
                      </button>
                    )}
                  </div>
                </div>

                {isOpen && (
                  <div className="mt-3 space-y-2 rounded-lg border border-line bg-canvas px-3 py-3">
                    <textarea
                      rows={3}
                      value={form.content}
                      onChange={(e) => setForm({ content: e.target.value })}
                      className={field}
                      placeholder="Your answer, or a note describing the attached file"
                    />
                    <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full text-[11px] text-mutedink" />
                    {error && <p className="text-[11px] text-critical">{error}</p>}
                    <button type="button" onClick={() => submit(assignment)} disabled={busy} className="btn-primary disabled:opacity-60">
                      {busy ? 'Submitting…' : 'Submit assignment'}
                    </button>
                    <p className="text-[10px] text-mutedink">Attached files are stored privately.</p>
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