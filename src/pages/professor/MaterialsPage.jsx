import { useEffect, useState } from 'react';
import PageTitle from '@/components/shell/PageTitle';
import Surface from '@/components/shell/Surface';
import StatusChip from '@/components/shell/StatusChip';
import { base44 } from '@/api/base44Client';
import { useProfessorContext, dateLabel, todayIso, openStoredFile } from '@/lib/professorData';

const field = 'w-full rounded-lg border border-line bg-white px-3 py-2 text-[12px] text-ink focus:border-royal/40 focus:outline-none focus:ring-2 focus:ring-royal/10';
const TYPES = ['lecture_notes', 'presentation', 'reading', 'dataset', 'other'];

export default function ProfessorMaterialsPage() {
  const { professor, courses } = useProfessorContext();
  const [materials, setMaterials] = useState(null);
  const [form, setForm] = useState({ course_id: '', title: '', topic: '', type: 'lecture_notes', description: '' });
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    if (!professor) return;
    const page = await base44.entities.CourseMaterial.filter({ professor_id: professor.id }, { sort: '-uploaded_at', limit: 100 });
    setMaterials(page.items || []);
  };

  useEffect(() => {
    load();
  }, [professor?.id]);

  useEffect(() => {
    if (!form.course_id && courses.length) setForm((prev) => ({ ...prev, course_id: courses[0].id }));
  }, [courses.length]);

  const upload = async (event) => {
    event.preventDefault();
    const course = courses.find((c) => c.id === form.course_id);
    if (!course || !form.title.trim()) {
      setError('Choose a course and give the material a title.');
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
      setForm({ course_id: form.course_id, title: '', topic: '', type: 'lecture_notes', description: '' });
      setFile(null);
      event.target.reset();
      await load();
    } catch {
      setError('The material could not be saved.');
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (material) => {
    await base44.entities.CourseMaterial.update(material.id, { published: !material.published });
    await load();
  };

  const remove = async (material) => {
    await base44.entities.CourseMaterial.delete(material.id);
    await load();
  };

  if (!materials) return <p className="py-10 text-center text-[12px] text-mutedink">Loading course materials…</p>;

  return (
    <div>
      <PageTitle
        eyebrow="Professor workspace"
        title="Course materials"
        description="Upload lecture notes, presentations, readings and datasets. Published materials are visible to enrolled students."
        meta={[`${materials.filter((m) => m.published).length} published`, `${materials.length} in total`]}
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_1.3fr]">
        <Surface title="Add material" subtitle="Files are stored privately; students open them through a signed link">
          <form onSubmit={upload} className="space-y-3">
            <label className="block">
              <span className="mb-1 block text-[11px] font-medium text-ink">Course</span>
              <select value={form.course_id} onChange={(e) => setForm((p) => ({ ...p, course_id: e.target.value }))} className={field}>
                {courses.map((c) => <option key={c.id} value={c.id}>{c.code} · {c.title}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] font-medium text-ink">Title</span>
              <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className={field} placeholder="Lecture 7 — exchange-rate regimes" />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-[11px] font-medium text-ink">Topic / week</span>
                <input value={form.topic} onChange={(e) => setForm((p) => ({ ...p, topic: e.target.value }))} className={field} placeholder="Week 7" />
              </label>
              <label className="block">
                <span className="mb-1 block text-[11px] font-medium text-ink">Type</span>
                <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))} className={field}>
                  {TYPES.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                </select>
              </label>
            </div>
            <label className="block">
              <span className="mb-1 block text-[11px] font-medium text-ink">Description</span>
              <textarea rows={2} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className={field} />
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] font-medium text-ink">File (optional)</span>
              <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full text-[11px] text-mutedink" />
            </label>
            {error && <p className="text-[11px] text-critical">{error}</p>}
            <button type="submit" disabled={busy} className="btn-primary disabled:opacity-60">
              {busy ? 'Uploading…' : 'Publish material'}
            </button>
          </form>
        </Surface>

        <Surface title="Your materials" bodyClassName="px-0 pb-0 pt-1" subtitle="Grouped by upload date">
          <ul className="divide-y divide-line">
            {materials.map((material) => (
              <li key={material.id} className="px-5 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[12px] font-medium text-ink">{material.title}</p>
                    <p className="mt-0.5 text-[10.5px] text-mutedink">
                      {material.course_code} · {material.topic || 'No topic'} · {material.type.replace('_', ' ')} · {dateLabel(material.uploaded_at)}
                    </p>
                    {material.file_url && (
                      <button type="button" onClick={() => openStoredFile(material.file_url)} className="link-quiet mt-1 inline-flex">
                        {material.file_name || 'Open file'}
                      </button>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <StatusChip tone={material.published ? 'positive' : 'neutral'}>{material.published ? 'Published' : 'Draft'}</StatusChip>
                    <button type="button" onClick={() => toggle(material)} className="btn-quiet btn-sm">
                      {material.published ? 'Unpublish' : 'Publish'}
                    </button>
                    <button type="button" onClick={() => remove(material)} className="btn-quiet btn-sm text-critical">Delete</button>
                  </div>
                </div>
              </li>
            ))}
            {!materials.length && <li className="px-5 py-6 text-[11.5px] text-mutedink">No materials yet.</li>}
          </ul>
        </Surface>
      </div>
    </div>
  );
}