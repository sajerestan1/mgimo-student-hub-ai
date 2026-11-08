import { useEffect, useState } from 'react';
import Surface from '@/components/shell/Surface';

const field = 'w-full rounded-lg border border-line bg-white px-3 py-2 text-[12px] text-ink focus:border-royal/40 focus:outline-none focus:ring-2 focus:ring-royal/10';

export default function AnnouncementComposer({ courses, editing, onSave, onCancelEdit }) {
  const [courseId, setCourseId] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setCourseId(editing?.course_id || courses[0]?.id || '');
    setTitle(editing?.title || '');
    setBody(editing?.body || '');
    setError('');
  }, [editing?.id, courses.length]);

  const submit = async (status) => {
    setError('');
    const course = courses.find((item) => item.id === courseId);
    if (!course) return setError('Choose the course this announcement belongs to.');
    if (!title.trim() || !body.trim()) return setError('An announcement needs a title and a message.');
    setBusy(true);
    try {
      await onSave({ id: editing?.id, title: title.trim(), body: body.trim(), course, status });
      setTitle('');
      setBody('');
    } catch {
      setError('The announcement could not be saved. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Surface
      title={editing ? 'Edit announcement' : 'New course announcement'}
      subtitle="Published announcements appear on the dashboard of every student enrolled in the course."
    >
      <div className="space-y-2.5">
        <label className="block">
          <span className="mb-1 block text-[11px] font-medium text-ink">Course</span>
          <select value={courseId} onChange={(event) => setCourseId(event.target.value)} className={field}>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.code} — {course.title}
              </option>
            ))}
            {!courses.length && <option value="">No courses assigned</option>}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-medium text-ink">Title</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Seminar moved to Thursday"
            className={field}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-medium text-ink">Message</span>
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={4}
            placeholder="What should students know?"
            className={`${field} resize-y leading-relaxed`}
          />
        </label>

        {error && <p className="text-[11px] text-critical">{error}</p>}

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button type="button" onClick={() => submit('published')} disabled={busy} className="btn-primary disabled:opacity-60">
            {busy ? 'Saving…' : editing && editing.status === 'published' ? 'Save and keep published' : 'Publish to students'}
          </button>
          <button type="button" onClick={() => submit('draft')} disabled={busy} className="btn-quiet disabled:opacity-60">
            Save as draft
          </button>
          {editing && (
            <button type="button" onClick={onCancelEdit} className="link-quiet">
              Cancel edit
            </button>
          )}
        </div>
      </div>
    </Surface>
  );
}