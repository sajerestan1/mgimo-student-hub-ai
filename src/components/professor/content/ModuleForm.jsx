import { useState } from 'react';
import Surface from '@/components/shell/Surface';
import { field } from '@/lib/contentTypes';

// Create or edit a module of the existing LMS course structure.
export default function ModuleForm({ initial, nextNumber, busy, onCancel, onSubmit }) {
  const [form, setForm] = useState({
    title: initial?.title || '',
    module_number: initial?.module_number ?? nextNumber,
    introduction: initial?.introduction || '',
    objectives: (initial?.objectives || []).join('\n'),
    status: initial?.status || 'published',
  });
  const [error, setError] = useState('');
  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = (event) => {
    event.preventDefault();
    if (!form.title.trim()) {
      setError('Give the module a title.');
      return;
    }
    setError('');
    onSubmit({
      title: form.title.trim(),
      module_number: Number(form.module_number) || nextNumber,
      introduction: form.introduction.trim(),
      objectives: form.objectives
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
      status: form.status,
    });
  };

  return (
    <Surface title={initial ? 'Edit module' : 'New module'} subtitle="Saved to the course structure students already follow">
      <form onSubmit={submit} className="space-y-3">
        <label className="block">
          <span className="mb-1 block text-[11px] font-medium text-ink">Title</span>
          <input value={form.title} onChange={(e) => set('title', e.target.value)} className={field} placeholder="Module 9 — Monetary policy transmission" />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="mb-1 block text-[11px] font-medium text-ink">Order</span>
            <input type="number" min="1" value={form.module_number} onChange={(e) => set('module_number', e.target.value)} className={field} />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-medium text-ink">Status</span>
            <select value={form.status} onChange={(e) => set('status', e.target.value)} className={field}>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </label>
        </div>
        <label className="block">
          <span className="mb-1 block text-[11px] font-medium text-ink">Description</span>
          <textarea rows={3} value={form.introduction} onChange={(e) => set('introduction', e.target.value)} className={field} placeholder="What this module covers and why it matters" />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-medium text-ink">Learning objectives</span>
          <textarea rows={4} value={form.objectives} onChange={(e) => set('objectives', e.target.value)} className={field} placeholder="One objective per line" />
        </label>
        {error && <p className="text-[11px] text-critical">{error}</p>}
        <div className="flex items-center gap-2">
          <button type="submit" disabled={busy} className="btn-primary disabled:opacity-60">
            {busy ? 'Saving…' : initial ? 'Save module' : 'Create module'}
          </button>
          <button type="button" onClick={onCancel} className="btn-quiet">
            Cancel
          </button>
        </div>
      </form>
    </Surface>
  );
}