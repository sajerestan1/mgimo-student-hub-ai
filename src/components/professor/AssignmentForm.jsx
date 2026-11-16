import { useState } from 'react';
import Surface from '@/components/shell/Surface';
import { base44 } from '@/api/base44Client';
import { todayIso, SEMESTER } from '@/lib/professorData';

const TYPES = ['coursework', 'essay', 'project', 'presentation', 'problem_set', 'exam'];

const empty = (courseId) => ({
  title: '',
  course_id: courseId || '',
  instructions: '',
  assessment_type: 'coursework',
  max_score: 100,
  due_date: '',
  submission_format: 'PDF',
  status: 'published',
});

const field = 'w-full rounded-lg border border-line bg-white px-3 py-2 text-[12px] text-ink focus:border-royal/40 focus:outline-none focus:ring-2 focus:ring-royal/10';

export default function AssignmentForm({ courses, professor, initial, onSaved, onDemoSave, onCancel }) {
  const [form, setForm] = useState(initial ? { ...initial } : empty(courses[0]?.id));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    const course = courses.find((c) => c.id === form.course_id);
    if (!course || !form.title.trim() || !form.due_date) {
      setError('A course, a title and a due date are required.');
      return;
    }
    setBusy(true);
    setError('');
    const payload = {
      title: form.title.trim(),
      course_id: course.id,
      course_code: course.code,
      course_title: course.title,
      professor_id: professor.id,
      instructions: form.instructions,
      assessment_type: form.assessment_type,
      max_score: Number(form.max_score) || 100,
      due_date: form.due_date,
      submission_format: form.submission_format,
      status: form.status,
      semester: SEMESTER,
      published_date: form.published_date || todayIso(),
    };
    try {
      if (import.meta.env.VITE_DEMO_MODE === 'true') {
        onDemoSave?.({ ...payload, id: initial?.id || 'demo-assignment-' + Date.now() });
      } else {
        if (initial?.id) await base44.entities.Assignment.update(initial.id, payload);
        else await base44.entities.Assignment.create(payload);
        await onSaved();
      }
    } catch {
      setError('The assignment could not be saved. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Surface title={initial ? 'Edit assignment' : 'Create assignment'} subtitle="Published work is visible to enrolled students immediately">
      <form onSubmit={submit} className="space-y-3">
        <label className="block">
          <span className="mb-1 block text-[11px] font-medium text-ink">Title</span>
          <input value={form.title} onChange={(e) => set('title', e.target.value)} className={field} placeholder="Case study: exchange-rate adjustment" />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-[11px] font-medium text-ink">Course</span>
            <select value={form.course_id} onChange={(e) => set('course_id', e.target.value)} className={field}>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.code} · {c.title}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-medium text-ink">Assessment type</span>
            <select value={form.assessment_type} onChange={(e) => set('assessment_type', e.target.value)} className={field}>
              {TYPES.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
            </select>
          </label>
        </div>

        <label className="block">
          <span className="mb-1 block text-[11px] font-medium text-ink">Instructions</span>
          <textarea value={form.instructions} onChange={(e) => set('instructions', e.target.value)} rows={4} className={field} placeholder="What students must produce, the expected length and the citation rules" />
        </label>

        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-[11px] font-medium text-ink">Due date</span>
            <input type="date" value={form.due_date} onChange={(e) => set('due_date', e.target.value)} className={field} />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-medium text-ink">Max score</span>
            <input type="number" min="1" value={form.max_score} onChange={(e) => set('max_score', e.target.value)} className={field} />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-medium text-ink">Submission format</span>
            <input value={form.submission_format} onChange={(e) => set('submission_format', e.target.value)} className={field} />
          </label>
        </div>

        <label className="block">
          <span className="mb-1 block text-[11px] font-medium text-ink">Status</span>
          <select value={form.status} onChange={(e) => set('status', e.target.value)} className={field}>
            <option value="draft">Draft — only you can see it</option>
            <option value="published">Published — students can submit</option>
            <option value="closed">Closed — no further submissions</option>
          </select>
        </label>

        {error && <p className="text-[11px] text-critical">{error}</p>}

        <div className="flex items-center gap-2">
          <button type="submit" disabled={busy} className="btn-primary disabled:opacity-60">
            {busy ? 'Saving…' : initial ? 'Save changes' : 'Create assignment'}
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel} className="btn-quiet">
              Cancel
            </button>
          )}
        </div>
      </form>
    </Surface>
  );
}