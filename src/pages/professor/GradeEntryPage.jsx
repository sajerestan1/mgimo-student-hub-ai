import { useEffect, useMemo, useState } from 'react';
import PageTitle from '@/components/shell/PageTitle';
import Surface from '@/components/shell/Surface';
import StatusChip from '@/components/shell/StatusChip';
import { base44 } from '@/api/base44Client';
import { useProfessorContext, SEMESTER, todayIso } from '@/lib/professorData';
import { withRetry } from '@/lib/apiRetry';

const ASSESSMENT_TYPES = [
  { value: 'coursework', label: 'Coursework' },
  { value: 'exam', label: 'Exam' },
  { value: 'credit', label: 'Credit / pass' },
];

const input = 'w-full rounded-lg border border-line bg-white px-3 py-2 text-[12px] text-ink focus:border-royal/40 focus:outline-none focus:ring-2 focus:ring-royal/10';
const cellInput = 'w-20 rounded-md border border-line bg-white px-2 py-1 text-[12px] text-ink focus:border-royal/40 focus:outline-none focus:ring-2 focus:ring-royal/10';

export default function GradeEntryPage() {
  const { professor, courses } = useProfessorContext();
  const [courseId, setCourseId] = useState('');
  const [assessmentType, setAssessmentType] = useState('coursework');
  const [term, setTerm] = useState('2026-2027 Fall');
  const [roster, setRoster] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [savedMessage, setSavedMessage] = useState('');

  useEffect(() => {
    if (!courseId && courses.length) setCourseId(courses[0].id);
  }, [courses, courseId]);

  const load = async (selectedCourseId, type) => {
    setRoster(null);
    setDrafts({});
    const enrollPage = await withRetry(() =>
      base44.entities.CourseEnrollment.filter({ course_id: selectedCourseId }, { limit: 200 })
    );
    const studentIds = (enrollPage.items || []).map((row) => row.student_id);
    const [studentPage, recordPage] = await Promise.all([
      studentIds.length
        ? withRetry(() => base44.entities.Student.filter({ id: { $in: studentIds } }, { sort: 'full_name', limit: 200 }))
        : Promise.resolve({ items: [] }),
      withRetry(() =>
        base44.entities.AcademicRecord.filter({ course_id: selectedCourseId, assessment_type: type }, { limit: 200 })
      ),
    ]);
    const records = recordPage.items || [];
    setRoster(
      (studentPage.items || []).map((student) => ({
        student,
        record: records.find((record) => record.student_id === student.id) || null,
      }))
    );
  };

  useEffect(() => {
    if (!courseId) return;
    load(courseId, assessmentType);
  }, [courseId, assessmentType]);

  const course = courses.find((c) => c.id === courseId);
  const pending = useMemo(
    () =>
      (roster || []).filter(({ student, record }) => {
        const raw = drafts[student.id];
        return raw !== undefined && raw !== '' && Number(raw) !== record?.grade;
      }),
    [roster, drafts]
  );
  const gradedCount = (roster || []).filter(({ record }) => typeof record?.grade === 'number').length;
  const average = (roster || []).length
    ? Math.round(
        (roster || []).reduce((sum, { record }) => sum + (typeof record?.grade === 'number' ? record.grade : 0), 0) /
          Math.max(1, (roster || []).filter(({ record }) => typeof record?.grade === 'number').length)
      )
    : 0;

  const save = async () => {
    setError('');
    setSavedMessage('');
    const invalid = pending.find(({ student }) => {
      const value = Number(drafts[student.id]);
      return Number.isNaN(value) || value < 0 || value > 100;
    });
    if (invalid) {
      setError(`Enter a mark between 0 and 100 for ${invalid.student.full_name}.`);
      return;
    }
    if (!pending.length) return;

    const updates = [];
    const creates = [];
    pending.forEach(({ student, record }) => {
      const grade = Number(drafts[student.id]);
      if (record) {
        updates.push({ id: record.id, grade, recorded_date: todayIso() });
      } else {
        creates.push({
          student_id: student.id,
          course_id: courseId,
          faculty_id: student.faculty_id,
          department_id: student.department_id,
          grade,
          assessment_type: assessmentType,
          term,
          semester: SEMESTER,
          recorded_date: todayIso(),
        });
      }
    });

    setBusy(true);
    try {
      if (updates.length) await withRetry(() => base44.entities.AcademicRecord.bulkUpdate(updates));
      if (creates.length) await withRetry(() => base44.entities.AcademicRecord.bulkCreate(creates));
      setSavedMessage(`${pending.length} record${pending.length === 1 ? '' : 's'} committed to the academic register.`);
      await load(courseId, assessmentType);
    } catch {
      setError('The grades could not be saved. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  if (!professor) return <p className="py-10 text-center text-[12px] text-mutedink">Loading grade register…</p>;

  return (
    <div>
      <PageTitle
        eyebrow="Professor workspace"
        title="Grade entry"
        description="Record marks for the students on your courses. Each entry is written straight into the academic record the dean's office and the student transcript read from."
        meta={[course ? `${course.code} · ${course.title}` : 'Select a course', `${gradedCount} recorded`, average ? `average ${average}` : 'no marks yet']}
        actions={
          pending.length ? (
            <button type="button" onClick={save} disabled={busy} className="btn-primary disabled:opacity-60">
              {busy ? 'Saving…' : `Save ${pending.length} change${pending.length === 1 ? '' : 's'}`}
            </button>
          ) : null
        }
      />

      <Surface
        title="Register"
        subtitle="Marks are on the 0–100 scale used by the academic record"
        bodyClassName="px-0 pb-0 pt-1"
        action={
          <div className="flex flex-wrap items-center gap-1.5">
            <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="rounded-lg border border-line bg-white px-2 py-1 text-[11px] text-ink">
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.code} — {c.title}</option>
              ))}
            </select>
            <select value={assessmentType} onChange={(e) => setAssessmentType(e.target.value)} className="rounded-lg border border-line bg-white px-2 py-1 text-[11px] text-ink">
              {ASSESSMENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        }
        footer={
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10.5px] uppercase tracking-[0.06em] text-mutedink">Academic term</span>
              <input value={term} onChange={(e) => setTerm(e.target.value)} className="rounded-md border border-line bg-white px-2 py-1 text-[11px] text-ink" />
            </div>
            <div className="flex items-center gap-2">
              {savedMessage && <span className="text-[11px] text-positive">{savedMessage}</span>}
              {error && <span className="text-[11px] text-critical">{error}</span>}
              <button type="button" onClick={save} disabled={busy || !pending.length} className="btn-primary disabled:opacity-50">
                {busy ? 'Saving…' : pending.length ? `Save ${pending.length} change${pending.length === 1 ? '' : 's'}` : 'No changes'}
              </button>
            </div>
          </div>
        }
      >
        {roster === null && <p className="px-5 py-6 text-[11.5px] text-mutedink">Loading students…</p>}
        {roster !== null && roster.length === 0 && (
          <p className="px-5 py-6 text-[11.5px] text-mutedink">No students are enrolled on this course yet.</p>
        )}
        {roster !== null && roster.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse">
              <thead>
                <tr className="border-y border-line bg-canvas">
                  <th className="px-5 py-2 text-left table-head">Student</th>
                  <th className="px-3 py-2 text-left table-head">Group</th>
                  <th className="px-3 py-2 text-left table-head">Recorded</th>
                  <th className="px-3 py-2 text-left table-head">New mark</th>
                  <th className="px-5 py-2 text-right table-head">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {roster.map(({ student, record }) => {
                  const draft = drafts[student.id];
                  const changed = draft !== undefined && draft !== '' && Number(draft) !== record?.grade;
                  return (
                    <tr key={student.id} className="row-hover">
                      <td className="px-5 py-2.5">
                        <p className="text-[12px] font-medium text-ink">{student.full_name}</p>
                        <p className="text-[10.5px] text-mutedink">{student.student_id}</p>
                      </td>
                      <td className="px-3 py-2.5 text-[11.5px] text-mutedink">{student.group_name || '—'}</td>
                      <td className="px-3 py-2.5 text-[11.5px] text-ink">
                        {typeof record?.grade === 'number' ? record.grade : '—'}
                      </td>
                      <td className="px-3 py-2.5">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={draft ?? (typeof record?.grade === 'number' ? String(record.grade) : '')}
                          onChange={(e) => setDrafts((prev) => ({ ...prev, [student.id]: e.target.value }))}
                          className={cellInput}
                          placeholder="—"
                        />
                      </td>
                      <td className="px-5 py-2.5 text-right">
                        <StatusChip tone={changed ? 'warning' : typeof record?.grade === 'number' ? 'positive' : 'neutral'}>
                          {changed ? 'Unsaved' : typeof record?.grade === 'number' ? 'In register' : 'Not graded'}
                        </StatusChip>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Surface>
    </div>
  );
}