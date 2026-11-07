import { useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, CalendarDays } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import Panel from '@/components/admin/Panel';
import FilterSelect from '@/components/admin/FilterSelect';
import SimpleModal from '@/components/admin/SimpleModal';
import { useAdminData } from '@/lib/AdminDataContext';
import { formatDate } from '@/lib/exportCsv';

const TYPES = [
  { value: 'exam_period', label: 'Examination period' },
  { value: 'deadline', label: 'Academic deadline' },
  { value: 'faculty_meeting', label: 'Faculty meeting' },
  { value: 'department_meeting', label: 'Department meeting' },
  { value: 'university_event', label: 'University event' },
  { value: 'semester', label: 'Semester milestone' },
];

const EMPTY = { title: '', type: 'deadline', start_date: '', end_date: '', faculty_id: '', location: '', description: '' };

export default function CalendarPage() {
  const { analytics, faculties, events, saveEvent, deleteEvent, loading } = useAdminData();
  const [type, setType] = useState('all');
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const grouped = useMemo(() => {
    const filtered = events
      .filter((event) => type === 'all' || event.type === type)
      .sort((a, b) => (a.start_date < b.start_date ? -1 : 1));
    const groups = {};
    filtered.forEach((event) => {
      const key = event.start_date
        ? new Date(`${event.start_date}T00:00:00`).toLocaleString('en-GB', { month: 'long', year: 'numeric' })
        : 'Unscheduled';
      groups[key] = groups[key] || [];
      groups[key].push(event);
    });
    return Object.entries(groups);
  }, [events, type]);

  if (loading) return <div className="h-64 animate-pulse rounded-2xl bg-white" />;

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await saveEvent(
        {
          title: form.title,
          type: form.type,
          start_date: form.start_date,
          end_date: form.end_date || form.start_date,
          faculty_id: form.faculty_id,
          location: form.location,
          description: form.description,
        },
        form.id
      );
      setForm(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Academic Calendar"
        title="Administrative academic calendar"
        description="Semester milestones, examination periods, deadlines and faculty meetings."
        actions={
          <button
            type="button"
            onClick={() => setForm({ ...EMPTY })}
            className="inline-flex items-center gap-1.5 rounded-lg bg-navy px-3.5 py-2 text-[11.5px] font-medium text-white hover:bg-navy-mid"
          >
            <Plus className="h-3.5 w-3.5" /> Add event
          </button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel
          title="Calendar"
          subtitle={`${events.length} academic events on file`}
          className="lg:col-span-2"
          bodyClassName="p-4"
          actions={
            <FilterSelect
              value={type}
              onChange={setType}
              options={[{ value: 'all', label: 'All event types' }, ...TYPES]}
              className="w-44"
            />
          }
        >
          {grouped.length === 0 && <p className="py-8 text-center text-[12px] text-mutedink">No events recorded for this filter.</p>}
          <div className="space-y-5">
            {grouped.map(([month, items]) => (
              <div key={month}>
                <p className="mb-2 text-[9.5px] font-semibold uppercase tracking-[0.16em] text-mutedink">{month}</p>
                <ul className="space-y-1.5">
                  {items.map((event) => (
                    <li key={event.id} className="flex items-start gap-3 rounded-lg border border-[#EEF2F8] px-3 py-2">
                      <span className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-md bg-[#F2F6FB] text-navy">
                        <span className="text-[12px] font-semibold leading-none">
                          {new Date(`${event.start_date}T00:00:00`).getDate()}
                        </span>
                        <span className="text-[8px] uppercase leading-none text-mutedink">
                          {new Date(`${event.start_date}T00:00:00`).toLocaleString('en-GB', { month: 'short' })}
                        </span>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[12px] font-medium text-ink">{event.title}</span>
                        <span className="block truncate text-[10.5px] capitalize text-mutedink">
                          {event.type.replace(/_/g, ' ')} · {analytics.facultyById[event.faculty_id]?.name || 'University-wide'}
                          {event.location ? ` · ${event.location}` : ''}
                        </span>
                        {event.description && <span className="mt-0.5 block text-[11px] text-mutedink">{event.description}</span>}
                      </span>
                      <span className="flex shrink-0 gap-1">
                        <button type="button" onClick={() => setForm({ ...event })} className="rounded p-1.5 text-mutedink hover:bg-[#F1F5FB]">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteEvent(event.id)}
                          className="rounded p-1.5 text-mutedink hover:bg-[#FBECEB] hover:text-[#A33A38]"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Upcoming" subtitle="Next deadlines and meetings" bodyClassName="p-4">
          <ul className="space-y-2">
            {analytics.upcomingEvents.map((event) => (
              <li key={event.id} className="rounded-lg border border-[#EEF2F8] px-3 py-2">
                <p className="text-[11.5px] font-medium text-ink">{event.title}</p>
                <p className="text-[10.5px] capitalize text-mutedink">
                  {formatDate(event.start_date)} · {event.type.replace(/_/g, ' ')}
                </p>
              </li>
            ))}
            {analytics.upcomingEvents.length === 0 && (
              <li className="py-6 text-center text-[11.5px] text-mutedink">
                <CalendarDays className="mx-auto mb-1.5 h-4 w-4" />
                No upcoming events.
              </li>
            )}
          </ul>
        </Panel>
      </div>

      <SimpleModal open={Boolean(form)} onClose={() => setForm(null)} title={form?.id ? 'Edit event' : 'Add calendar event'}>
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
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-mutedink">Type</span>
                <select
                  value={form.type}
                  onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}
                  className="mt-1 h-9 w-full rounded-lg border border-[#E1E8F2] px-2.5 text-[12px]"
                >
                  {TYPES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-mutedink">Faculty (optional)</span>
                <select
                  value={form.faculty_id || ''}
                  onChange={(event) => setForm((prev) => ({ ...prev, faculty_id: event.target.value }))}
                  className="mt-1 h-9 w-full rounded-lg border border-[#E1E8F2] px-2.5 text-[12px]"
                >
                  <option value="">University-wide</option>
                  {faculties.map((faculty) => (
                    <option key={faculty.id} value={faculty.id}>
                      {faculty.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-mutedink">Start date</span>
                <input
                  type="date"
                  required
                  value={form.start_date}
                  onChange={(event) => setForm((prev) => ({ ...prev, start_date: event.target.value }))}
                  className="mt-1 h-9 w-full rounded-lg border border-[#E1E8F2] px-2.5 text-[12px]"
                />
              </label>
              <label className="block">
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-mutedink">End date</span>
                <input
                  type="date"
                  value={form.end_date || ''}
                  onChange={(event) => setForm((prev) => ({ ...prev, end_date: event.target.value }))}
                  className="mt-1 h-9 w-full rounded-lg border border-[#E1E8F2] px-2.5 text-[12px]"
                />
              </label>
            </div>
            <label className="block">
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-mutedink">Location</span>
              <input
                value={form.location || ''}
                onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
                className="mt-1 h-9 w-full rounded-lg border border-[#E1E8F2] px-2.5 text-[12px]"
              />
            </label>
            <label className="block">
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-mutedink">Description</span>
              <textarea
                rows={2}
                value={form.description || ''}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                className="mt-1 w-full rounded-lg border border-[#E1E8F2] px-2.5 py-2 text-[12px]"
              />
            </label>
            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={() => setForm(null)} className="rounded-lg border border-[#E1E8F2] px-3 py-2 text-[11.5px]">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="rounded-lg bg-navy px-3.5 py-2 text-[11.5px] font-medium text-white disabled:opacity-60">
                {saving ? 'Saving…' : 'Save event'}
              </button>
            </div>
          </form>
        )}
      </SimpleModal>
    </div>
  );
}