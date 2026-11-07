import { useMemo, useState } from 'react';
import { Plus, Send } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import Panel from '@/components/admin/Panel';
import DataTable from '@/components/admin/DataTable';
import KpiCard from '@/components/admin/KpiCard';
import FilterSelect from '@/components/admin/FilterSelect';
import SimpleModal from '@/components/admin/SimpleModal';
import { StatusByValue } from '@/components/admin/StatusPill';
import { useAdminData } from '@/lib/AdminDataContext';
import { formatDate } from '@/lib/exportCsv';

const CATEGORIES = [
  'Certificate of Enrollment',
  'Academic Transcript',
  'Academic Leave',
  'Grade Appeal',
  'Transfer Request',
  'Duplicate Student ID',
  'Scholarship Application',
  'Schedule Conflict Resolution',
  'Exam Retake Permission',
  'Dormitory Reference Letter',
  'Graduation Certificate',
  'Course Withdrawal',
];

const ASSIGNEES = ['Registrar Office', 'Deputy Dean for Academic Affairs', 'Faculty Administrator', 'Dean’s Office'];

const ACTIONS = {
  submitted: [
    ['under_review', 'Start review'],
    ['awaiting_information', 'Request information'],
    ['approved', 'Approve'],
    ['rejected', 'Reject'],
  ],
  under_review: [
    ['awaiting_information', 'Request information'],
    ['approved', 'Approve'],
    ['rejected', 'Reject'],
  ],
  awaiting_information: [
    ['under_review', 'Resume review'],
    ['approved', 'Approve'],
    ['rejected', 'Reject'],
  ],
  approved: [['completed', 'Mark completed']],
  rejected: [['under_review', 'Reopen review']],
  completed: [],
};

const EMPTY_FORM = {
  student_id: '',
  category: CATEGORIES[0],
  description: '',
  priority: 'normal',
  due_date: '',
};

export default function Requests() {
  const {
    analytics,
    students,
    requests,
    requestEvents,
    loading,
    changeRequestStatus,
    addRequestComment,
    assignRequest,
    createRequest,
  } = useAdminData();
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('all');
  const [faculty, setFaculty] = useState('all');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [note, setNote] = useState('');
  const [comment, setComment] = useState('');
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const rows = useMemo(
    () =>
      requests
        .filter((request) => {
          const q = query.trim().toLowerCase();
          if (status !== 'all' && request.status !== status) return false;
          if (category !== 'all' && request.category !== category) return false;
          if (faculty !== 'all' && request.faculty_id !== faculty) return false;
          if (q && !`${request.subject} ${request.student_name}`.toLowerCase().includes(q)) return false;
          return true;
        })
        .sort((a, b) => (a.submitted_date < b.submitted_date ? 1 : -1)),
    [requests, status, category, faculty, query]
  );

  const selected = requests.find((request) => request.id === selectedId);
  const timeline = requestEvents
    .filter((event) => event.request_id === selectedId)
    .sort((a, b) => (a.event_date < b.event_date ? -1 : 1));

  if (loading) return <div className="h-64 animate-pulse rounded-2xl bg-white" />;

  const pending = requests.filter((request) => ['submitted', 'under_review', 'awaiting_information'].includes(request.status));
  const awaiting = requests.filter((request) => request.status === 'awaiting_information');
  const completed = requests.filter((request) => request.status === 'completed');

  const act = async (nextStatus) => {
    if (!selected) return;
    await changeRequestStatus(selected, nextStatus, note || '');
    setNote('');
  };

  const submitComment = async () => {
    if (!selected || !comment.trim()) return;
    await addRequestComment(selected, comment.trim());
    setComment('');
  };

  const submitRequest = async (event) => {
    event.preventDefault();
    const student = students.find((item) => item.id === form.student_id);
    if (!student) return;
    setSaving(true);
    try {
      await createRequest({
        student_id: student.id,
        student_name: student.full_name,
        faculty_id: student.faculty_id,
        category: form.category,
        subject: `${form.category} — ${student.full_name}`,
        description: form.description,
        priority: form.priority,
        due_date: form.due_date || '',
        assigned_to: 'Registrar Office',
      });
      setForm(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Applications & Requests"
        title="Administrative request management"
        description="Submission, assignment, approval workflow and audit history for student and faculty requests."
        actions={
          <button
            type="button"
            onClick={() => setForm({ ...EMPTY_FORM, student_id: students[0]?.id || '' })}
            className="inline-flex items-center gap-1.5 rounded-lg bg-navy px-3.5 py-2 text-[11.5px] font-medium text-white hover:bg-navy-mid"
          >
            <Plus className="h-3.5 w-3.5" /> New request
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Total requests" value={requests.length} caption="all recorded requests" />
        <KpiCard label="Awaiting decision" value={pending.length} caption="submitted or under review" accent="gold" />
        <KpiCard label="Awaiting information" value={awaiting.length} caption="student response required" accent="red" />
        <KpiCard label="Completed" value={completed.length} caption="closed this semester" accent="green" />
      </div>

      <Panel className="mt-4" bodyClassName="p-4">
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search request or student"
            className="h-8 rounded-lg border border-[#E1E8F2] px-2.5 text-[11.5px] focus:border-navy/40 focus:outline-none"
          />
          <FilterSelect
            label="Status"
            value={status}
            onChange={setStatus}
            options={[
              { value: 'all', label: 'All statuses' },
              { value: 'submitted', label: 'Submitted' },
              { value: 'under_review', label: 'Under review' },
              { value: 'awaiting_information', label: 'Awaiting information' },
              { value: 'approved', label: 'Approved' },
              { value: 'rejected', label: 'Rejected' },
              { value: 'completed', label: 'Completed' },
            ]}
          />
          <FilterSelect
            label="Category"
            value={category}
            onChange={setCategory}
            options={[{ value: 'all', label: 'All categories' }, ...CATEGORIES.map((item) => ({ value: item, label: item }))]}
          />
          <FilterSelect
            label="Faculty"
            value={faculty}
            onChange={setFaculty}
            options={[{ value: 'all', label: 'All faculties' }, ...analytics.facultyRows.map((row) => ({ value: row.id, label: row.code }))]}
          />
        </div>
      </Panel>

      <Panel className="mt-4" title="Requests" subtitle={`${rows.length} requests in scope`} bodyClassName="p-0">
        <DataTable
          onRowClick={(row) => setSelectedId(row.id)}
          emptyLabel="No requests match these filters."
          columns={[
            {
              key: 'subject',
              label: 'Request',
              render: (row) => (
                <div>
                  <p className="font-medium text-ink">{row.category}</p>
                  <p className="text-[10px] text-mutedink">{row.student_name}</p>
                </div>
              ),
            },
            { key: 'faculty', label: 'Faculty', render: (row) => analytics.facultyById[row.faculty_id]?.code || '—' },
            { key: 'submitted', label: 'Submitted', render: (row) => formatDate(row.submitted_date) },
            { key: 'due', label: 'Due', render: (row) => formatDate(row.due_date) },
            { key: 'assigned', label: 'Assigned to', render: (row) => <span className="text-[10.5px]">{row.assigned_to || 'Unassigned'}</span> },
            { key: 'status', label: 'Status', align: 'right', render: (row) => <StatusByValue value={row.status} /> },
          ]}
          rows={rows}
        />
      </Panel>

      <SimpleModal
        open={Boolean(selected)}
        onClose={() => {
          setSelectedId(null);
          setNote('');
          setComment('');
        }}
        title={selected?.category}
        subtitle={selected ? `${selected.student_name} · submitted ${formatDate(selected.submitted_date)}` : ''}
        width="max-w-2xl"
      >
        {selected && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <StatusByValue value={selected.status} />
              <span className="text-[10.5px] text-mutedink">
                Priority: {selected.priority} · Due {formatDate(selected.due_date)} · Faculty {analytics.facultyById[selected.faculty_id]?.code || '—'}
              </span>
            </div>

            <p className="rounded-lg bg-[#F7FAFD] p-3 text-[11.5px] leading-relaxed text-ink">{selected.description || 'No description recorded.'}</p>

            <div className="grid gap-2 sm:grid-cols-2">
              <label className="block">
                <span className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-mutedink">Assign to</span>
                <select
                  value={selected.assigned_to || ''}
                  onChange={(event) => assignRequest(selected, event.target.value)}
                  className="mt-1 h-8 w-full rounded-lg border border-[#E1E8F2] px-2 text-[11.5px]"
                >
                  <option value="">Unassigned</option>
                  {ASSIGNEES.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-mutedink">Decision note (optional)</span>
                <input
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Reason or instruction recorded with the decision"
                  className="mt-1 h-8 w-full rounded-lg border border-[#E1E8F2] px-2 text-[11.5px]"
                />
              </label>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {ACTIONS[selected.status]?.map(([nextStatus, label]) => (
                <button
                  key={nextStatus}
                  type="button"
                  onClick={() => act(nextStatus)}
                  className={`rounded-lg px-2.5 py-1.5 text-[11px] font-medium ${
                    nextStatus === 'rejected'
                      ? 'border border-[#F0CFCC] text-[#A33A38] hover:bg-[#FBECEB]'
                      : nextStatus === 'approved' || nextStatus === 'completed'
                        ? 'bg-[#2F6B4F] text-white hover:bg-[#275a42]'
                        : 'border border-[#E1E8F2] text-ink hover:bg-[#F7FAFD]'
                  }`}
                >
                  {label}
                </button>
              ))}
              {ACTIONS[selected.status]?.length === 0 && (
                <span className="text-[11px] text-mutedink">This request is closed. Reopen review to change the decision.</span>
              )}
            </div>

            <div>
              <p className="mb-1.5 text-[9.5px] font-semibold uppercase tracking-[0.12em] text-mutedink">Status history and comments</p>
              <ol className="space-y-2.5 border-l-2 border-[#E4EAF3] pl-3">
                {timeline.map((event) => (
                  <li key={event.id}>
                    <p className="text-[11.5px] font-medium text-ink">
                      {event.type === 'comment' ? 'Comment' : `Status: ${(event.status || '').replace(/_/g, ' ')}`}
                    </p>
                    <p className="text-[10px] text-mutedink">
                      {formatDate(event.event_date)} · {event.actor_name} ({event.actor_role})
                    </p>
                    {event.note && <p className="mt-0.5 text-[11px] text-ink">{event.note}</p>}
                  </li>
                ))}
                {timeline.length === 0 && <li className="text-[11px] text-mutedink">No events recorded.</li>}
              </ol>
              <div className="mt-2 flex gap-2">
                <input
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="Add an internal comment"
                  className="h-8 flex-1 rounded-lg border border-[#E1E8F2] px-2 text-[11.5px]"
                />
                <button
                  type="button"
                  onClick={submitComment}
                  className="inline-flex items-center gap-1 rounded-lg bg-navy px-2.5 py-1.5 text-[11px] font-medium text-white"
                >
                  <Send className="h-3 w-3" /> Add
                </button>
              </div>
            </div>
          </div>
        )}
      </SimpleModal>

      <SimpleModal open={Boolean(form)} onClose={() => setForm(null)} title="New administrative request" subtitle="Recorded as demonstration data">
        {form && (
          <form onSubmit={submitRequest} className="space-y-3">
            <label className="block">
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-mutedink">Student</span>
              <select
                required
                value={form.student_id}
                onChange={(event) => setForm((prev) => ({ ...prev, student_id: event.target.value }))}
                className="mt-1 h-9 w-full rounded-lg border border-[#E1E8F2] px-2.5 text-[12px]"
              >
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.full_name} · {student.student_id}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-mutedink">Category</span>
              <select
                value={form.category}
                onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
                className="mt-1 h-9 w-full rounded-lg border border-[#E1E8F2] px-2.5 text-[12px]"
              >
                {CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-mutedink">Description</span>
              <textarea
                rows={3}
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                className="mt-1 w-full rounded-lg border border-[#E1E8F2] px-2.5 py-2 text-[12px]"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-mutedink">Priority</span>
                <select
                  value={form.priority}
                  onChange={(event) => setForm((prev) => ({ ...prev, priority: event.target.value }))}
                  className="mt-1 h-9 w-full rounded-lg border border-[#E1E8F2] px-2.5 text-[12px]"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                </select>
              </label>
              <label className="block">
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-mutedink">Processing deadline</span>
                <input
                  type="date"
                  value={form.due_date}
                  onChange={(event) => setForm((prev) => ({ ...prev, due_date: event.target.value }))}
                  className="mt-1 h-9 w-full rounded-lg border border-[#E1E8F2] px-2.5 text-[12px]"
                />
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={() => setForm(null)} className="rounded-lg border border-[#E1E8F2] px-3 py-2 text-[11.5px]">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="rounded-lg bg-navy px-3.5 py-2 text-[11.5px] font-medium text-white disabled:opacity-60">
                {saving ? 'Submitting…' : 'Submit request'}
              </button>
            </div>
          </form>
        )}
      </SimpleModal>
    </div>
  );
}