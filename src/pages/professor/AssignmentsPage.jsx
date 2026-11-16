import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageTitle from '@/components/shell/PageTitle';
import Surface from '@/components/shell/Surface';
import StatusChip from '@/components/shell/StatusChip';
import AssignmentForm from '@/components/professor/AssignmentForm';
import { base44 } from '@/api/base44Client';
import { DEMO_INSTITUTION } from '@/lib/demoInstitutionData';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';
import { useProfessorContext, dateLabel, dayDiff } from '@/lib/professorData';

const STATUS = {
  draft: { label: 'Draft', tone: 'neutral' },
  published: { label: 'Published', tone: 'positive' },
  closed: { label: 'Closed', tone: 'brand' },
};

export default function ProfessorAssignmentsPage() {
  const { professor, courses } = useProfessorContext();
  const [assignments, setAssignments] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    if (!professor) return;
    if (import.meta.env.VITE_DEMO_MODE === 'true') {
      const demoAssignments = courses.slice(0, 3).map((course, i) => ({
        id: 'demo-assignment-' + i, professor_id: professor.id, course_id: course.id,
        course_code: course.code, title: ['Policy Brief: Regional Cooperation','Midterm Comparative Analysis','Research Essay: Global Governance'][i],
        assessment_type: ['written_assignment','midterm','essay'][i], max_score: 100,
        due_date: ['2026-11-20','2026-11-25','2026-12-02'][i],
        submission_format: 'file', status: i === 2 ? 'draft' : 'published',
      }));
      const demoSubmissions = DEMO_INSTITUTION.students.slice(0, 6).map((student, i) => ({
        id: 'demo-submission-' + i, professor_id: professor.id,
        assignment_id: demoAssignments[i % 2].id, student_id: student.id,
        student_name: student.full_name, status: 'submitted', score: i % 3 === 0 ? 82 + i : null,
      }));
      setAssignments(demoAssignments);
      setSubmissions(demoSubmissions);
      return;
    }
    const [list, subs] = await Promise.all([
      base44.entities.Assignment.filter({ professor_id: professor.id }, { sort: '-due_date', limit: 60 }),
      base44.entities.Submission.filter({ professor_id: professor.id }, { limit: 300 }),
    ]);
    setAssignments(list.items || []);
    setSubmissions(subs.items || []);
  };

  useEffect(() => {
    load();
  }, [professor?.id]);

  const setStatus = async (assignment, status) => {
    if (import.meta.env.VITE_DEMO_MODE === 'true') { setAssignments((items) => items.map((a) => a.id === assignment.id ? { ...a, status } : a)); return; }
    await base44.entities.Assignment.update(assignment.id, { status }); await load();
  };

  const remove = async (assignment) => {
    if (import.meta.env.VITE_DEMO_MODE === 'true') { setAssignments((items) => items.filter((a) => a.id !== assignment.id)); return; }
    await base44.entities.Assignment.delete(assignment.id); await load();
  };

  const saved = async () => {
    setCreating(false);
    setEditing(null);
    await load();
  };

  if (!assignments) return <p className="py-10 text-center text-[12px] text-mutedink">Loading assignments…</p>;

  return (
    <div>
      <PageTitle
        eyebrow="Professor workspace"
        title="Assignments"
        description="Create assessed work, publish it to enrolled students, and follow submissions into the grading queue."
        meta={[`${assignments.filter((a) => a.status === 'published').length} published`, `${submissions.filter((s) => s.status === 'submitted').length} awaiting a grade`]}
        actions={
          <button type="button" onClick={() => { setCreating(true); setEditing(null); }} className="btn-primary">
            New assignment
          </button>
        }
      />

      {(creating || editing) && (
        <div className="mb-4">
          <AssignmentForm
            courses={courses}
            professor={professor}
            initial={editing}
            onSaved={saved}
            onCancel={() => { setCreating(false); setEditing(null); }}
          />
        </div>
      )}

      <Surface title="Your assignments" subtitle={`${assignments.length} in total`} bodyClassName="px-0 pb-0 pt-1">
        {assignments.length === 0 && <p className="px-5 py-6 text-[11.5px] text-mutedink">No assignments yet. Create the first one.</p>}
        <ul className="divide-y divide-line">
          {assignments.map((assignment) => {
            const subs = submissions.filter((s) => s.assignment_id === assignment.id);
            const graded = subs.filter((s) => typeof s.score === 'number').length;
            const status = STATUS[assignment.status] || STATUS.draft;
            const days = dayDiff(assignment.due_date);
            return (
              <li key={assignment.id} className="px-5 py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[12.5px] font-semibold text-ink">{assignment.title}</p>
                      <StatusChip tone={status.tone}>{status.label}</StatusChip>
                    </div>
                    <p className="mt-1 text-[11px] text-mutedink">
                      {assignment.course_code} · {assignment.assessment_type.replace('_', ' ')} · max {assignment.max_score} · due {dateLabel(assignment.due_date)}
                      {days >= 0 ? ` (${days} days)` : ' (past)'}
                    </p>
                    <p className="mt-0.5 text-[10.5px] text-mutedink">
                      {subs.length} submissions · {graded} graded · {assignment.submission_format}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Link to={`${P.professor.grading}?assignment=${assignment.id}`} className="btn-quiet btn-sm">
                      Submissions
                    </Link>
                    <button type="button" onClick={() => { setEditing(assignment); setCreating(false); }} className="btn-quiet btn-sm">
                      Edit
                    </button>
                    {assignment.status === 'published' ? (
                      <button type="button" onClick={() => setStatus(assignment, 'draft')} className="btn-quiet btn-sm">
                        Unpublish
                      </button>
                    ) : (
                      <button type="button" onClick={() => setStatus(assignment, 'published')} className="btn-quiet btn-sm">
                        Publish
                      </button>
                    )}
                    <button type="button" onClick={() => remove(assignment)} className="btn-quiet btn-sm text-critical">
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </Surface>
    </div>
  );
}