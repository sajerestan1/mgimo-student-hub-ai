import { useMemo, useState } from 'react';
import { Plus, Megaphone, Pencil, Archive, Send } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import Panel from '@/components/admin/Panel';
import FilterSelect from '@/components/admin/FilterSelect';
import SimpleModal from '@/components/admin/SimpleModal';
import { StatusByValue } from '@/components/admin/StatusPill';
import { useAdminData } from '@/lib/AdminDataContext';
import { formatDate } from '@/lib/exportCsv';
import { today } from '@/lib/adminMetrics';

const AUDIENCES = [
  { value: 'university', label: 'Entire university' },
  { value: 'faculty', label: 'Faculty' },
  { value: 'department', label: 'Department' },
  { value: 'student_group', label: 'Student group' },
  { value: 'students', label: 'All students' },
  { value: 'academic_staff', label: 'Academic staff' },
];

const EMPTY = {
  title: '',
  body: '',
  audience_type: 'university',
  faculty_id: '',
  department_id: '',
  group_name: '',
  status: 'draft',
  publish_date: '',
};

export default function Announcements() {
  const { announcements, faculties, departments, saveAnnouncement, loading, me } = useAdminData();
  const [status, setStatus] = useState('all');
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const rows = useMemo(
    () =>
      announcements
        .filter((item) => status === 'all' || item.status === status)
        .sort((a, b) => ((a.publish_date || '') < (b.publish_date || '') ? 1 : -1)),
    [announcements, status]
  );

  if (loading) return <div className="h-64 animate-pulse rounded-2xl bg-white" />;

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await saveAnnouncement(
        {
          title: form.title,
          body: form.body,
          audience_type: form.audience_type,
          faculty_id: form.faculty_id,
          department_id: form.department_id,
          group_name: form.group_name,
          status: form.status,
          publish_date: form.publish_date || (form.status === 'published' ? today() : ''),
          author_name: form.author_name || me?.full_name || 'Dean’s Office',
        },
        form.id
      );
      setForm(null);
    } finally {
      setSaving(false);
    }
  };

  const quickStatus = (item, next) =>
    saveAnnouncement(
      {
        status: next,
        publish_date: next === 'published' ? today() : item.publish_date,
      },
      item.id
    );

  return (
    <div>
      <PageHeader
        eyebrow="Announcements"
        title="Announcement management"
        description="Targeted institutional communications by faculty, department, student group or staff audience."
        actions={
          <>
            <FilterSelect
              value={status}
              onChange={setStatus}
              options={[
                { value: 'all', label: 'All statuses' },
                { value: 'draft', label: 'Drafts' },
                { value: 'scheduled', label: 'Scheduled' },
                { value: 'published', label: 'Published' },
                { value: 'archived', label: 'Archived' },
              ]}
              className="w-36"
            />
            <button
              type="button"
              onClick={() => setForm({ ...EMPTY, author_name: me?.full_name || '' })}
              className="inline-flex items-center gap-1.5 rounded-lg bg-navy px-3.5 py-2 text-[11.5px] font-medium text-white hover:bg-navy-mid"
            >
              <Plus className="h-3.5 w-3.5" /> New announcement
            </button>
          </>
        }
      />

      <div className="grid gap-3 lg:grid-cols-2">
        {rows.map((item) => (
          <Panel key={item.id} bodyClassName="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Megaphone className="h-3.5 w-3.5 shrink-0 text-[#9A7B33]" />
                  <h3 className="truncate font-heading text-[15px] leading-tight text-ink">{item.title}</h3>
                </div>
                <p className="mt-0.5 text-[10.5px] text-mutedink">
                  {AUDIENCES.find((audience) => audience.value === item.audience_type)?.label || item.audience_type}
                  {item.faculty_id ? ` · ${faculties.find((faculty) => faculty.id === item.faculty_id)?.code || ''}` : ''}
                  {item.group_name ? ` · ${item.group_name}` : ''}
                  {item.publish_date ? ` · ${formatDate(item.publish_date)}` : ''}
                </p>
              </div>
              <StatusByValue value={item.status} />
            </div>
            <p className="mt-2 line-clamp-3 text-[11.5px] leading-relaxed text-ink">{item.body}</p>
            <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-[#EEF2F8] pt-2.5">
              <span className="mr-auto text-[10px] text-mutedink">{item.author_name || 'Dean’s Office'}</span>
              <button
                type="button"
                onClick={() => setForm({ ...item })}
                className="inline-flex items-center gap-1 rounded-md border border-[#E1E8F2] px-2 py-1 text-[10.5px] font-medium text-ink hover:bg-[#F7FAFD]"
              >
                <Pencil className="h-3 w-3" /> Edit
              </button>
              {item.status !== 'published' && (
                <button
                  type="button"
                  onClick={() => quickStatus(item, 'published')}
                  className="inline-flex items-center gap-1 rounded-md bg-[#2F6B4F] px-2 py-1 text-[10.5px] font-medium text-white"
                >
                  <Send className="h-3 w-3" /> Publish
                </button>
              )}
              {item.status !== 'archived' && (
                <button
                  type="button"
                  onClick={() => quickStatus(item, 'archived')}
                  className="inline-flex items-center gap-1 rounded-md border border-[#E1E8F2] px-2 py-1 text-[10.5px] font-medium text-ink hover:bg-[#F7FAFD]"
                >
                  <Archive className="h-3 w-3" /> Archive
                </button>
              )}
            </div>
          </Panel>
        ))}
        {rows.length === 0 && (
          <Panel bodyClassName="p-6">
            <p className="text-center text-[12px] text-mutedink">No announcements match this filter.</p>
          </Panel>
        )}
      </div>

      <SimpleModal open={Boolean(form)} onClose={() => setForm(null)} title={form?.id ? 'Edit announcement' : 'New announcement'}>
        {form && (
          <form onSubmit={submit} className="space-y-3">
            <label className="block">
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-mutedink">Title</span>
              <input
                required
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                className="mt-1 h-9 w-full rounded-lg border border-[#E1E8F2] px-2.5 text-[12px]"
              />
            </label>
            <label className="block">
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-mutedink">Body</span>
              <textarea
                required
                rows={4}
                value={form.body}
                onChange={(event) => setForm((prev) => ({ ...prev, body: event.target.value }))}
                className="mt-1 w-full rounded-lg border border-[#E1E8F2] px-2.5 py-2 text-[12px]"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-mutedink">Audience</span>
                <select
                  value={form.audience_type}
                  onChange={(event) => setForm((prev) => ({ ...prev, audience_type: event.target.value }))}
                  className="mt-1 h-9 w-full rounded-lg border border-[#E1E8F2] px-2.5 text-[12px]"
                >
                  {AUDIENCES.map((audience) => (
                    <option key={audience.value} value={audience.value}>
                      {audience.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-mutedink">Faculty (optional)</span>
                <select
                  value={form.faculty_id || ''}
                  onChange={(event) => setForm((prev) => ({ ...prev, faculty_id: event.target.value, department_id: '' }))}
                  className="mt-1 h-9 w-full rounded-lg border border-[#E1E8F2] px-2.5 text-[12px]"
                >
                  <option value="">All faculties</option>
                  {faculties.map((faculty) => (
                    <option key={faculty.id} value={faculty.id}>
                      {faculty.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-mutedink">Department (optional)</span>
                <select
                  value={form.department_id || ''}
                  onChange={(event) => setForm((prev) => ({ ...prev, department_id: event.target.value }))}
                  className="mt-1 h-9 w-full rounded-lg border border-[#E1E8F2] px-2.5 text-[12px]"
                >
                  <option value="">All departments</option>
                  {departments
                    .filter((dept) => !form.faculty_id || dept.faculty_id === form.faculty_id)
                    .map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                </select>
              </label>
              <label className="block">
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-mutedink">Student group (optional)</span>
                <input
                  value={form.group_name || ''}
                  onChange={(event) => setForm((prev) => ({ ...prev, group_name: event.target.value }))}
                  placeholder="e.g. IR-2A"
                  className="mt-1 h-9 w-full rounded-lg border border-[#E1E8F2] px-2.5 text-[12px]"
                />
              </label>
              <label className="block">
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-mutedink">Status</span>
                <select
                  value={form.status}
                  onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
                  className="mt-1 h-9 w-full rounded-lg border border-[#E1E8F2] px-2.5 text-[12px]"
                >
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </label>
              <label className="block">
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-mutedink">Publication date</span>
                <input
                  type="date"
                  value={form.publish_date || ''}
                  onChange={(event) => setForm((prev) => ({ ...prev, publish_date: event.target.value }))}
                  className="mt-1 h-9 w-full rounded-lg border border-[#E1E8F2] px-2.5 text-[12px]"
                />
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={() => setForm(null)} className="rounded-lg border border-[#E1E8F2] px-3 py-2 text-[11.5px]">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="rounded-lg bg-navy px-3.5 py-2 text-[11.5px] font-medium text-white disabled:opacity-60">
                {saving ? 'Saving…' : 'Save announcement'}
              </button>
            </div>
          </form>
        )}
      </SimpleModal>
    </div>
  );
}