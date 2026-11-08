import { useEffect, useState } from 'react';
import { Paperclip } from 'lucide-react';
import Surface from '@/components/shell/Surface';
import { base44 } from '@/api/base44Client';
import { todayIso } from '@/lib/professorData';
import { MATERIAL_TYPES } from '@/lib/materialTypes';

const field =
  'w-full rounded-lg border border-line bg-white px-3 py-2 text-[12px] text-ink focus:border-royal/40 focus:outline-none focus:ring-2 focus:ring-royal/10';

export default function MaterialUploadForm({ professor, courses, defaultCourseId, onSaved }) {
  const [form, setForm] = useState({
    course_id: defaultCourseId || courses[0]?.id || '',
    title: '',
    topic: '',
    type: 'lecture_notes',
    description: '',
  });
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (defaultCourseId && defaultCourseId !== 'all') {
      setForm((prev) => ({ ...prev, course_id: defaultCourseId }));
    }
  }, [defaultCourseId]);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const upload = async (event) => {
    event.preventDefault();
    const course = courses.find((row) => row.id === form.course_id);
    if (!course || !form.title.trim()) {
      setError('Choose a course and give the document a title.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      let stored = {};
      if (file) {
        const res = await base44.integrations.Core.UploadPrivateFile({ file });
        stored = { file_url: res.file_uri, file_name: file.name };
      }
      await base44.entities.CourseMaterial.create({
        course_id: course.id,
        course_code: course.code,
        professor_id: professor.id,
        title: form.title.trim(),
        topic: form.topic,
        type: form.type,
        description: form.description,
        published: true,
        uploaded_at: todayIso(),
        ...stored,
      });
      setForm((prev) => ({ ...prev, title: '', topic: '', description: '' }));
      setFile(null);
      event.target.reset();
      await onSaved();
    } catch {
      setError('The document could not be saved. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Surface title="Add a document" subtitle="Files are stored privately; students open them through a signed link">
      <form onSubmit={upload} className="space-y-3">
        <label className="block">
          <span className="mb-1 block text-[11px] font-medium text-ink">Course</span>
          <select value={form.course_id} onChange={(e) => set('course_id', e.target.value)} className={field}>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.code} · {course.title}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-[11px] font-medium text-ink">Document type</span>
          <select value={form.type} onChange={(e) => set('type', e.target.value)} className={field}>
            {MATERIAL_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-[11px] font-medium text-ink">Title</span>
          <input
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            className={field}
            placeholder="Lecture 7 — exchange-rate regimes"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-[11px] font-medium text-ink">Topic / week</span>
          <input value={form.topic} onChange={(e) => set('topic', e.target.value)} className={field} placeholder="Week 7" />
        </label>

        <label className="block">
          <span className="mb-1 block text-[11px] font-medium text-ink">Description</span>
          <textarea
            rows={2}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            className={field}
            placeholder="What students should take from this document"
          />
        </label>

        <div>
          <span className="mb-1 block text-[11px] font-medium text-ink">Attach file</span>
          <div className="rounded-lg border border-dashed border-line bg-canvas/60 px-3 py-3 text-center">
            <input
              id="material-file"
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xlsx,.csv,.txt,.md,.png,.jpg,.jpeg"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <label htmlFor="material-file" className="inline-flex cursor-pointer items-center gap-1.5 text-[11.5px] font-medium text-royal hover:text-royal-deep">
              <Paperclip className="h-3.5 w-3.5" />
              {file ? 'Choose a different file' : 'Choose a file'}
            </label>
            <p className="mt-1 truncate text-[10.5px] text-mutedink">
              {file ? file.name : 'PDF, DOCX, PPTX, XLSX, CSV or an image'}
            </p>
          </div>
        </div>

        {error && <p className="text-[11px] text-critical">{error}</p>}

        <button type="submit" disabled={busy} className="btn-primary disabled:opacity-60">
          {busy ? 'Uploading…' : 'Publish document'}
        </button>
      </form>
    </Surface>
  );
}