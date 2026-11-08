import { useState } from 'react';
import { Paperclip } from 'lucide-react';
import Surface from '@/components/shell/Surface';
import { base44 } from '@/api/base44Client';
import { RESOURCE_TYPES, field } from '@/lib/contentTypes';

// Create or edit a learning resource. Saves into the existing LearningResource
// collection, so it appears in the student course workspace once published.
export default function ResourceForm({ initial, modules, defaultModuleId, busy, onCancel, onSubmit }) {
  const [form, setForm] = useState({
    title: initial?.title || '',
    type: initial?.type || 'reading',
    module_id: initial?.module_id || defaultModuleId || modules[0]?.id || '',
    description: initial?.description || '',
    content: initial?.content || '',
    visible_to_students: initial ? Boolean(initial.visible_to_students) : false,
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) {
      setError('Give the resource a title.');
      return;
    }
    setError('');
    let stored = {};
    try {
      if (file) {
        setUploading(true);
        const res = await base44.integrations.Core.UploadPrivateFile({ file });
        stored = { file_url: res.file_uri, file_name: file.name };
      }
    } catch {
      setUploading(false);
      setError('The file could not be uploaded. Please try again.');
      return;
    }
    setUploading(false);
    const module = modules.find((row) => row.id === form.module_id);
    onSubmit({
      title: form.title.trim(),
      type: form.type,
      module_id: form.module_id,
      module_number: module?.module_number ?? 0,
      description: form.description.trim(),
      content: form.content,
      visible_to_students: form.visible_to_students,
      ...stored,
    });
  };

  return (
    <Surface title={initial ? 'Edit resource' : 'New learning resource'} subtitle="Publishing makes it visible to every enrolled student">
      <form onSubmit={submit} className="space-y-3">
        <label className="block">
          <span className="mb-1 block text-[11px] font-medium text-ink">Title</span>
          <input value={form.title} onChange={(e) => set('title', e.target.value)} className={field} placeholder="Exchange-rate regimes: worked examples" />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="mb-1 block text-[11px] font-medium text-ink">Type</span>
            <select value={form.type} onChange={(e) => set('type', e.target.value)} className={field}>
              {RESOURCE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-medium text-ink">Module</span>
            <select value={form.module_id} onChange={(e) => set('module_id', e.target.value)} className={field}>
              {modules.map((module) => (
                <option key={module.id} value={module.id}>Module {module.module_number} · {module.title}</option>
              ))}
            </select>
          </label>
        </div>
        <label className="block">
          <span className="mb-1 block text-[11px] font-medium text-ink">Description</span>
          <textarea rows={2} value={form.description} onChange={(e) => set('description', e.target.value)} className={field} placeholder="One line shown in the resource list" />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-medium text-ink">Content</span>
          <textarea rows={7} value={form.content} onChange={(e) => set('content', e.target.value)} className={field} placeholder="The material students read. Markdown headings and lists are supported." />
        </label>
        <div>
          <span className="mb-1 block text-[11px] font-medium text-ink">Attach file (optional)</span>
          <div className="rounded-lg border border-dashed border-line bg-canvas/60 px-3 py-3 text-center">
            <input
              id="resource-file"
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xlsx,.csv,.txt,.md,.png,.jpg,.jpeg"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <label htmlFor="resource-file" className="inline-flex cursor-pointer items-center gap-1.5 text-[11.5px] font-medium text-royal hover:text-royal-deep">
              <Paperclip className="h-3.5 w-3.5" />
              {file ? 'Choose a different file' : 'Choose a file'}
            </label>
            <p className="mt-1 truncate text-[10.5px] text-mutedink">
              {file ? file.name : initial?.file_name || 'PDF, DOCX, PPTX, XLSX, CSV or an image'}
            </p>
          </div>
        </div>
        <label className="flex items-center gap-2 text-[11.5px] text-ink">
          <input type="checkbox" checked={form.visible_to_students} onChange={(e) => set('visible_to_students', e.target.checked)} />
          Publish to enrolled students
        </label>
        {error && <p className="text-[11px] text-critical">{error}</p>}
        <div className="flex items-center gap-2">
          <button type="submit" disabled={busy || uploading} className="btn-primary disabled:opacity-60">
            {uploading ? 'Uploading…' : busy ? 'Saving…' : initial ? 'Save resource' : 'Create resource'}
          </button>
          <button type="button" onClick={onCancel} className="btn-quiet">
            Cancel
          </button>
        </div>
      </form>
    </Surface>
  );
}