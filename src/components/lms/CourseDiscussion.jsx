import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Surface from '@/components/shell/Surface';
import StatusChip from '@/components/shell/StatusChip';
import { base44 } from '@/api/base44Client';
import { shortDate } from '@/lib/studentCourses';

const field =
  'w-full rounded-lg border border-line bg-white px-3 py-2 text-[12px] text-ink focus:border-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/10';

export default function CourseDiscussion({ course, discussions, student, user, onRefresh }) {
  const [replyTo, setReplyTo] = useState(null);
  const [replyBody, setReplyBody] = useState('');
  const [newTopic, setNewTopic] = useState({ title: '', body: '' });
  const [showNew, setShowNew] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const threads = discussions.filter((item) => !item.parent_id);

  const post = async (body, parent) => {
    if (!body.trim()) {
      setError('Write a contribution before posting.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await base44.entities.Discussion.create({
        course_id: course.id,
        course_code: course.code,
        professor_id: course.professor_id,
        module_id: parent?.module_id || '',
        module_number: parent?.module_number || 0,
        parent_id: parent?.id || '',
        title: parent ? '' : newTopic.title.trim() || 'Discussion post',
        body: body.trim(),
        author_user_id: user?.id,
        author_name: student?.full_name || user?.full_name || 'Student',
        author_role: 'student',
      });
      setReplyTo(null);
      setReplyBody('');
      setNewTopic({ title: '', body: '' });
      setShowNew(false);
      await onRefresh();
    } catch {
      setError('Your post could not be saved. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Surface
      title="Discussion forum"
      subtitle="Course threads with your professor and classmates — participation is recorded against your account"
      action={
        <Button type="button" size="sm" variant="outline" onClick={() => setShowNew((value) => !value)}>
          {showNew ? 'Cancel' : 'New topic'}
        </Button>
      }
      bodyClassName="px-0 pb-0 pt-1"
    >
      {showNew && (
        <div className="space-y-2 border-b border-line bg-canvas px-5 py-3">
          <input
            className={field}
            placeholder="Topic title"
            value={newTopic.title}
            onChange={(event) => setNewTopic((prev) => ({ ...prev, title: event.target.value }))}
          />
          <textarea
            rows={3}
            className={field}
            placeholder="Your question or argument"
            value={newTopic.body}
            onChange={(event) => setNewTopic((prev) => ({ ...prev, body: event.target.value }))}
          />
          {error && <p className="text-[11px] text-critical">{error}</p>}
          <Button type="button" size="sm" disabled={busy} onClick={() => post(newTopic.body, null)}>
            {busy ? 'Posting…' : 'Post topic'}
          </Button>
        </div>
      )}

      <ul className="divide-y divide-line">
        {threads.map((thread) => {
          const replies = discussions.filter((item) => item.parent_id === thread.id);
          const isReplying = replyTo === thread.id;
          return (
            <li key={thread.id} className="px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-ink">{thread.title}</p>
                  <p className="mt-0.5 text-[10.5px] text-mutedink">
                    {thread.author_name} · {thread.author_role} · {shortDate(thread.created_date)}
                    {thread.module_number ? ` · module ${thread.module_number}` : ''}
                  </p>
                </div>
                {thread.author_role === 'professor' && <StatusChip tone="brand">Professor</StatusChip>}
              </div>

              <p className="mt-2 whitespace-pre-line text-[11.5px] leading-relaxed text-ink/80">{thread.body}</p>

              <div className="mt-3 space-y-2 border-l-2 border-line pl-3">
                {replies.map((reply) => (
                  <div key={reply.id}>
                    <p className="text-[10.5px] text-mutedink">
                      {reply.author_name} · {reply.author_role} · {shortDate(reply.created_date)}
                    </p>
                    <p className="mt-0.5 whitespace-pre-line text-[11.5px] leading-relaxed text-ink/80">{reply.body}</p>
                  </div>
                ))}
                {!replies.length && <p className="text-[11px] text-mutedink">No replies yet.</p>}
              </div>

              <div className="mt-2">
                {isReplying ? (
                  <div className="space-y-2">
                    <textarea
                      rows={3}
                      className={field}
                      placeholder="Add your reply"
                      value={replyBody}
                      onChange={(event) => setReplyBody(event.target.value)}
                    />
                    {error && <p className="text-[11px] text-critical">{error}</p>}
                    <div className="flex gap-1.5">
                      <Button type="button" size="sm" disabled={busy} onClick={() => post(replyBody, thread)}>
                        {busy ? 'Posting…' : 'Post reply'}
                      </Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => { setReplyTo(null); setReplyBody(''); }}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="link-quiet"
                    onClick={() => { setReplyTo(thread.id); setReplyBody(''); setError(''); }}
                  >
                    <MessageSquare className="h-3 w-3" /> Reply
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      {!threads.length && <p className="px-5 py-6 text-[12px] text-mutedink">No discussions opened for this course yet.</p>}
    </Surface>
  );
}