import { useState } from 'react';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Surface from '@/components/shell/Surface';
import StatusChip from '@/components/shell/StatusChip';
import { base44 } from '@/api/base44Client';
import { shortDate } from '@/lib/studentCourses';

const field =
  'w-full rounded-lg border border-line bg-white px-3 py-2 text-[12px] text-ink focus:border-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/10';

const tone = { graded: 'positive', awaiting_grading: 'warning', missing: 'critical', not_submitted: 'brand' };
const label = {
  graded: 'Graded',
  awaiting_grading: 'Awaiting grading',
  missing: 'Missing',
  not_submitted: 'Not submitted',
};

export default function CourseAssignments({ course, assignments, submissions, student, onRefresh }) {
  const [openId, setOpenId] = useState(null);
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submissionFor = (assignmentId) => submissions.find((s) => s.assignment_id === assignmentId);
  const today = new Date().toISOString().slice(0, 10);

  const submit = async (assignment) => {
    if (!content.trim()) {
      setError('Write your submission or a note describing the attached file.');
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
        course_id: course.id,
        course_code: course.code,
        professor_id: course.professor_id,
        student_id: student?.id,
        student_user_id: student?.user_id,
        student_name: student?.full_name,
        student_group: student?.group_name,
        submitted_at: today,
        content: content.trim(),
        status: 'submitted',
        ...stored,
      });
      setOpenId(null);
      setContent('');
      setFile(null);
      await onRefresh();
    } catch {
      setError('The submission could not be saved. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Surface
      title="Assignments and assessment"
      subtitle={`${assignments.length} assessed items · weighted ${course.weight_assignments}% toward the final grade`}
      bodyClassName="px-0 pb-0 pt-1"
    >
      {!assignments.length && <p className="px-5 py-6 text-[12px] text-mutedink">No assignments published yet.</p>}
      <ul className="divide-y divide-line">
        {assignments.map((assignment) => {
          const submission = submissionFor(assignment.id);
          const graded = submission && typeof submission.score === 'number';
          const status = graded ? 'graded' : submission ? 'awaiting_grading' : assignment.due_date < today ? 'missing' : 'not_submitted';
          const isOpen = openId === assignment.id;
          return (
            <li key={assignment.id} className="px-5 py-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-ink">{assignment.title}</p>
                  <p className="mt-0.5 text-[11px] text-mutedink">
                    {assignment.assessment_type.replace(/_/g, ' ')} · module {assignment.module_number} · {assignment.max_score} marks · due{' '}
                    {shortDate(assignment.due_date)} · {assignment.submission_format}
                  </p>
                  <p className="mt-1.5 whitespace-pre-line text-[11.5px] leading-relaxed text-mutedink">
                    {assignment.instructions}
                  </p>
                  {assignment.objectives?.length > 0 && (
                    <ul className="mt-2 space-y-0.5">
                      {assignment.objectives.map((objective) => (
                        <li key={objective} className="text-[11px] text-ink/70">• {objective}</li>
                      ))}
                    </ul>
                  )}
                  {!!assignment.rubric?.length && (
                    <div className="mt-2 rounded-lg border border-line bg-canvas p-2.5">
                      <p className="eyebrow mb-1">Grading rubric</p>
                      <ul className="space-y-0.5 text-[11px] text-ink/75">
                        {assignment.rubric.map((row) => (
                          <li key={row.criterion}>
                            <span className="font-medium">{row.criterion}</span> ({row.points} marks) — {row.descriptor}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <p className="mt-2 text-[10.5px] text-mutedink">Late policy: {assignment.late_policy}</p>
                  {graded && (
                    <div className="mt-2 rounded-lg border border-line bg-white p-2.5">
                      <p className="text-[11.5px] font-medium text-ink">
                        <CheckCircle2 className="mr-1 inline h-3.5 w-3.5 text-positive" />
                        {submission.score}/{assignment.max_score} — feedback
                      </p>
                      <p className="mt-1 text-[11px] leading-relaxed text-ink/75">{submission.feedback || 'No written comment returned.'}</p>
                    </div>
                  )}
                  {!graded && submission && (
                    <p className="mt-2 flex items-center gap-1.5 text-[11px] text-mutedink">
                      <Clock className="h-3 w-3" /> Submitted {shortDate(submission.submitted_at)} — with your professor for grading.
                    </p>
                  )}
                  {!submission && status === 'missing' && (
                    <p className="mt-2 flex items-center gap-1.5 text-[11px] text-critical">
                      <AlertCircle className="h-3 w-3" /> No submission recorded. This item is shown as missing, not as zero.
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  <StatusChip tone={tone[status]}>
                    {graded ? `${submission.score}/${assignment.max_score}` : label[status]}
                  </StatusChip>
                  {!submission && (
                    <Button type="button" size="sm" variant={isOpen ? 'outline' : 'default'} onClick={() => { setOpenId(isOpen ? null : assignment.id); setError(''); }}>
                      {isOpen ? 'Cancel' : 'Submit work'}
                    </Button>
                  )}
                </div>
              </div>

              {isOpen && !submission && (
                <div className="mt-3 space-y-2 rounded-lg border border-line bg-canvas p-3">
                  <textarea
                    rows={4}
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                    className={field}
                    placeholder="Your answer, or a note describing the attached file"
                  />
                  <input type="file" onChange={(event) => setFile(event.target.files?.[0] || null)} className="w-full text-[11px] text-mutedink" />
                  {error && <p className="text-[11px] text-critical">{error}</p>}
                  <Button type="button" onClick={() => submit(assignment)} disabled={busy} size="sm">
                    {busy ? 'Submitting…' : 'Submit assignment'}
                  </Button>
                  <p className="text-[10px] text-mutedink">Attached files are stored privately and visible only to you and your professor.</p>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </Surface>
  );
}