import { useEffect, useMemo, useState } from 'react';
import { Upload } from 'lucide-react';
import PageTitle from '@/components/shell/PageTitle';
import Surface from '@/components/shell/Surface';
import BulkGradeTable from '@/components/professor/BulkGradeTable';
import { base44 } from '@/api/base44Client';
import { useProfessorContext, todayIso, dateLabel } from '@/lib/professorData';
import { withRetry } from '@/lib/apiRetry';
import { parseGradeCsv } from '@/lib/gradeCsv';

export default function BulkGradingPage() {
  const { professor } = useProfessorContext();
  const [assignments, setAssignments] = useState([]);
  const [assignmentId, setAssignmentId] = useState('');
  const [rows, setRows] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [feedback, setFeedback] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!professor) return;
    withRetry(() =>
      base44.entities.Assignment.filter({ professor_id: professor.id }, { sort: '-due_date', limit: 80 })
    ).then((page) => {
      const list = page.items || [];
      setAssignments(list);
      if (list.length) setAssignmentId(list[0].id);
    });
  }, [professor?.id]);

  useEffect(() => {
    if (!assignmentId) return;
    setRows(null);
    setDrafts({});
    setNotice('');
    setError('');
    withRetry(() =>
      base44.entities.Submission.filter({ assignment_id: assignmentId }, { sort: 'student_name', limit: 300 })
    ).then((page) => setRows(page.items || []));
  }, [assignmentId]);

  const assignment = assignments.find((a) => a.id === assignmentId);
  const maxScore = assignment?.max_score || 100;

  const pending = useMemo(() => {
    if (!rows) return [];
    return rows.filter((submission) => {
      const draft = drafts[submission.id];
      return draft !== undefined && draft !== '' && Number(draft) !== submission.score;
    });
  }, [rows, drafts]);

  const applyCsv = async (file) => {
    if (!file || !rows) return;
    const parsed = parseGradeCsv(await file.text());
    const next = { ...drafts };
    let matched = 0;
    const missed = [];
    parsed.forEach(({ label, score }) => {
      const key = label.toLowerCase();
      const hit = rows.find(
        (submission) =>
          submission.student_name?.toLowerCase() === key ||
          submission.student_id?.toLowerCase() === key ||
          submission.student_name?.toLowerCase().includes(key)
      );
      if (!hit) {
        missed.push(label);
        return;
      }
      next[hit.id] = String(Math.min(maxScore, Math.max(0, Math.round(score))));
      matched += 1;
    });
    setDrafts(next);
    setError(missed.length ? `${missed.length} name${missed.length === 1 ? '' : 's'} could not be matched: ${missed.slice(0, 4).join(', ')}` : '');
    setNotice(`${matched} mark${matched === 1 ? '' : 's'} read from the file — review, then commit.`);
  };

  const save = async () => {
    setError('');
    setNotice('');
    const invalid = pending.find((submission) => {
      const value = Number(drafts[submission.id]);
      return Number.isNaN(value) || value < 0 || value > maxScore;
    });
    if (invalid) {
      setError(`Enter a mark between 0 and ${maxScore} for ${invalid.student_name}.`);
      return;
    }
    if (!pending.length) return;

    setBusy(true);
    try {
      await withRetry(() =>
        base44.entities.Submission.bulkUpdate(
          pending.map((submission) => ({
            id: submission.id,
            score: Number(drafts[submission.id]),
            status: 'returned',
            graded_at: todayIso(),
            graded_by: professor.full_name,
            ...(feedback.trim() ? { feedback: feedback.trim() } : {}),
          }))
        )
      );
      const page = await withRetry(() =>
        base44.entities.Submission.filter({ assignment_id: assignmentId }, { sort: 'student_name', limit: 300 })
      );
      setRows(page.items || []);
      setDrafts({});
      setNotice(`${pending.length} grade${pending.length === 1 ? '' : 's'} committed and returned to students.`);
    } catch {
      setError('The grades could not be saved. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  if (!professor) return <p className="py-10 text-center text-[12px] text-mutedink">Loading assignments…</p>;

  return (
    <div>
      <PageTitle
        eyebrow="Professor workspace"
        title="Bulk grading"
        description="Enter marks for a whole cohort in one pass, or upload a marks file and commit them all at once. Grades are returned to students as soon as they are saved."
        meta={assignment ? [`${assignment.course_code} · ${assignment.title}`, `Max ${maxScore}`, `Due ${dateLabel(assignment.due_date)}`] : ['Choose an assignment']}
        actions={
          pending.length ? (
            <button type="button" onClick={save} disabled={busy} className="btn-primary disabled:opacity-60">
              {busy ? 'Saving…' : `Commit ${pending.length} grade${pending.length === 1 ? '' : 's'}`}
            </button>
          ) : null
        }
      />

      <Surface
        title="Assignment"
        bodyClassName="pb-4"
        action={
          <label className="btn-quiet cursor-pointer">
            <Upload className="h-3.5 w-3.5" />
            Upload marks file
            <input
              type="file"
              accept=".csv,text/csv,text/plain"
              className="hidden"
              onChange={(event) => {
                applyCsv(event.target.files?.[0]);
                event.target.value = '';
              }}
            />
          </label>
        }
      >
        <div className="grid gap-2 sm:grid-cols-[1fr_1fr]">
          <label className="block">
            <span className="mb-1 block text-[11px] font-medium text-ink">Assignment</span>
            <select
              value={assignmentId}
              onChange={(event) => setAssignmentId(event.target.value)}
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-[12px] text-ink"
            >
              {assignments.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.course_code} — {item.title}
                </option>
              ))}
              {!assignments.length && <option value="">No assignments yet</option>}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-medium text-ink">Feedback for every grade (optional)</span>
            <input
              value={feedback}
              onChange={(event) => setFeedback(event.target.value)}
              placeholder="e.g. Solid analysis — see the marking guide"
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-[12px] text-ink"
            />
          </label>
        </div>
        <p className="mt-2 text-[10.5px] leading-relaxed text-mutedink">
          File format: one student per line with their mark — <span className="font-medium text-ink">Student name, 85</span>. Commas, semicolons and tabs all work; the header row is ignored.
        </p>
      </Surface>

      <div className="mt-4">
        <Surface
          title="Cohort marks"
          subtitle={rows ? `${rows.length} submissions · ${pending.length} unsaved` : 'Loading submissions…'}
          bodyClassName="px-0 pb-0 pt-1"
          footer={
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 text-[11px]">
                {error && <span className="text-critical">{error}</span>}
                {!error && notice && <span className="text-positive">{notice}</span>}
                {!error && !notice && (
                  <span className="text-mutedink">Unsaved marks are highlighted; nothing is sent to students until you commit.</span>
                )}
              </div>
              <button type="button" onClick={save} disabled={busy || !pending.length} className="btn-primary disabled:opacity-50">
                {busy ? 'Saving…' : pending.length ? `Commit ${pending.length} grade${pending.length === 1 ? '' : 's'}` : 'No changes'}
              </button>
            </div>
          }
        >
          {rows === null && <p className="px-5 py-6 text-[11.5px] text-mutedink">Loading submissions…</p>}
          {rows !== null && (
            <BulkGradeTable
              rows={rows.map((submission) => ({ submission }))}
              drafts={drafts}
              maxScore={maxScore}
              onChange={(id, value) => setDrafts((prev) => ({ ...prev, [id]: value }))}
            />
          )}
        </Surface>
      </div>
    </div>
  );
}