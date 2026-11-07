import { useEffect, useState } from 'react';
import PageTitle from '@/components/shell/PageTitle';
import Surface from '@/components/shell/Surface';
import StatusChip from '@/components/shell/StatusChip';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useProfessorContext, dateLabel } from '@/lib/professorData';

const field = 'w-full rounded-lg border border-line bg-white px-3 py-2 text-[12px] text-ink focus:border-royal/40 focus:outline-none focus:ring-2 focus:ring-royal/10';

export default function ProfessorDiscussionsPage() {
  const { professor, courses } = useProfessorContext();
  const { user } = useAuth();
  const [threads, setThreads] = useState(null);
  const [replies, setReplies] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [reply, setReply] = useState('');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ course_id: '', title: '', body: '' });
  const [busy, setBusy] = useState(false);

  const load = async () => {
    if (!professor) return;
    const ids = courses.map((c) => c.id);
    if (!ids.length) { setThreads([]); return; }
    const page = await base44.entities.Discussion.filter({ course_id: { $in: ids } }, { sort: '-created_date', limit: 150 });
    const all = page.items || [];
    const heads = all.filter((d) => !d.parent_id);
    setThreads(heads);
    setReplies(all.filter((d) => d.parent_id));
    if (!selectedId && heads.length) setSelectedId(heads[0].id);
  };

  useEffect(() => {
    load();
  }, [professor?.id, courses.length]);

  useEffect(() => {
    if (!form.course_id && courses.length) setForm((p) => ({ ...p, course_id: courses[0].id }));
  }, [courses.length]);

  const thread = (threads || []).find((t) => t.id === selectedId);
  const threadReplies = replies.filter((r) => r.parent_id === selectedId);

  const postReply = async (event) => {
    event.preventDefault();
    if (!reply.trim() || !thread) return;
    setBusy(true);
    try {
      await base44.entities.Discussion.create({
        course_id: thread.course_id,
        course_code: thread.course_code,
        professor_id: professor.id,
        parent_id: thread.id,
        title: 'Re',
        body: reply.trim(),
        author_user_id: user?.id,
        author_name: professor.full_name,
        author_role: 'professor',
      });
      setReply('');
      await load();
    } finally {
      setBusy(false);
    }
  };

  const startThread = async (event) => {
    event.preventDefault();
    const course = courses.find((c) => c.id === form.course_id);
    if (!course || !form.title.trim() || !form.body.trim()) return;
    setBusy(true);
    try {
      await base44.entities.Discussion.create({
        course_id: course.id,
        course_code: course.code,
        professor_id: professor.id,
        parent_id: null,
        title: form.title.trim(),
        body: form.body.trim(),
        author_user_id: user?.id,
        author_name: professor.full_name,
        author_role: 'professor',
      });
      setForm({ course_id: form.course_id, title: '', body: '' });
      setCreating(false);
      await load();
    } finally {
      setBusy(false);
    }
  };

  if (!threads) return <p className="py-10 text-center text-[12px] text-mutedink">Loading discussions…</p>;

  return (
    <div>
      <PageTitle
        eyebrow="Professor workspace"
        title="Discussions"
        description="Student questions and course announcements, grouped by course thread."
        meta={[`${threads.length} threads`, `${replies.length} replies`]}
        actions={
          <button type="button" onClick={() => setCreating((v) => !v)} className="btn-primary">
            New thread
          </button>
        }
      />

      {creating && (
        <div className="mb-4">
          <Surface title="Start a thread" subtitle="Posted to the course discussion board">
            <form onSubmit={startThread} className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-[11px] font-medium text-ink">Course</span>
                <select value={form.course_id} onChange={(e) => setForm((p) => ({ ...p, course_id: e.target.value }))} className={field}>
                  {courses.map((c) => <option key={c.id} value={c.id}>{c.code} · {c.title}</option>)}
                </select>
              </label>
              <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className={field} placeholder="Thread title" />
              <textarea rows={3} value={form.body} onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))} className={field} placeholder="Message to the class" />
              <button type="submit" disabled={busy} className="btn-primary disabled:opacity-60">Post thread</button>
            </form>
          </Surface>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <Surface title="Course threads" bodyClassName="px-0 pb-0 pt-1">
          <ul className="divide-y divide-line">
            {threads.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className={`w-full px-5 py-3 text-left ${item.id === selectedId ? 'bg-brand-soft/60' : 'row-hover'}`}
                >
                  <p className="truncate text-[12px] font-medium text-ink">{item.title}</p>
                  <p className="mt-0.5 truncate text-[10.5px] text-mutedink">
                    {item.course_code} · {item.author_name} · {dateLabel(item.created_date)} · {replies.filter((r) => r.parent_id === item.id).length} replies
                  </p>
                </button>
              </li>
            ))}
            {!threads.length && <li className="px-5 py-6 text-[11.5px] text-mutedink">No discussions yet.</li>}
          </ul>
        </Surface>

        {thread && (
          <Surface title={thread.title} subtitle={`${thread.course_code} · started by ${thread.author_name}`}>
            <div className="space-y-3">
              <div className="rounded-lg border border-line bg-canvas px-3 py-2">
                <p className="text-[11.5px] leading-relaxed text-ink">{thread.body}</p>
              </div>
              <ul className="space-y-2">
                {threadReplies.map((item) => (
                  <li key={item.id} className="rounded-lg border border-line px-3 py-2">
                    <div className="flex items-center gap-2">
                      <p className="text-[11.5px] font-medium text-ink">{item.author_name}</p>
                      <StatusChip tone={item.author_role === 'professor' ? 'brand' : 'neutral'}>{item.author_role}</StatusChip>
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-mutedink">{item.body}</p>
                  </li>
                ))}
                {!threadReplies.length && <li className="text-[11.5px] text-mutedink">No replies yet.</li>}
              </ul>
              <form onSubmit={postReply} className="space-y-2">
                <textarea rows={3} value={reply} onChange={(e) => setReply(e.target.value)} className={field} placeholder="Reply to the student" />
                <button type="submit" disabled={busy} className="btn-primary disabled:opacity-60">Post reply</button>
              </form>
            </div>
          </Surface>
        )}
      </div>
    </div>
  );
}