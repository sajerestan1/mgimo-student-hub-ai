import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, BellOff, Bell, Paperclip, Pin, Send, ShieldAlert, X, Download, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { comm, formatStamp, formatSize, isAudioMime, OFFICIAL_STATUSES, uploadAttachment, ATTACHMENT_LIMIT } from '@/lib/communication/api';
import { usePolling } from '@/hooks/useCommunication';
import MessageComposer from './MessageComposer';
import MessageReactions from './MessageReactions';
import AudioBubble from './AudioBubble';
import AssistantPanel from './AssistantPanel';

const ROLE_TONE = {
  student: 'bg-[#EDF1FE] text-[#3B5AE0]',
  professor: 'bg-[#FCEAEA] text-[#A91F1F]',
  staff: 'bg-[#FCF3E4] text-[#8E6018]',
  system: 'bg-[#F2F4F8] text-[#5A6779]',
};

const toneFor = (role) => (['admin', 'dean', 'deputy_dean', 'academic_staff'].includes(role) ? 'staff' : role);

export default function ThreadView({ boot, threadId, focusMessageId = '', onBack, onChanged }) {
  const [state, setState] = useState({ loading: true, error: '', data: null });
  const [draft, setDraft] = useState('');
  const [reply, setReply] = useState(null);
  const [files, setFiles] = useState([]);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState('');
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [reportFor, setReportFor] = useState(null);
  const [reportReason, setReportReason] = useState('spam');
  const [reportNote, setReportNote] = useState('');
  const bottom = useRef(null);
  const listRef = useRef(null);
  const focusedKey = useRef('');
  const lastSeen = useRef('');
  const [highlightId, setHighlightId] = useState('');

  const load = useCallback(async () => {
    const data = await comm('thread', { threadId });
    setState({ loading: false, error: '', data });
    return data;
  }, [threadId]);

  useEffect(() => {
    setState({ loading: true, error: '', data: null });
    setDraft('');
    setReply(null);
    load()
      .then((data) => {
        lastSeen.current = data?.messages?.length ? data.messages[data.messages.length - 1].id : '';
        return comm('markRead', { threadId });
      })
      .catch((error) => setState({ loading: false, error: error.message, data: null }));
  }, [threadId, load]);

  // The poll refreshes the conversation; the read receipt is written only when
  // something new actually arrived, so an open conversation costs no writes.
  usePolling(async () => {
    const data = await load();
    const newest = data?.messages?.length ? data.messages[data.messages.length - 1].id : '';
    if (newest && newest !== lastSeen.current) {
      lastSeen.current = newest;
      await comm('markRead', { threadId });
    }
  }, 25000);

  useEffect(() => {
    bottom.current?.scrollIntoView({ block: 'end' });
  }, [state.data?.messages?.length]);

  // A notification deep link (?thread=…&message=…) opens the conversation at
  // the message it announced. Once per target, so polling never re-scrolls.
  useEffect(() => {
    if (!focusMessageId) return;
    const key = `${threadId}:${focusMessageId}`;
    if (focusedKey.current === key) return;
    const messages = state.data?.messages || [];
    if (!messages.some((message) => message.id === focusMessageId)) return;

    focusedKey.current = key;
    setHighlightId(focusMessageId);
    const scroll = setTimeout(() => {
      listRef.current?.querySelector(`[data-mid="${focusMessageId}"]`)?.scrollIntoView({ block: 'center' });
    }, 80);
    const clear = setTimeout(() => setHighlightId(''), 3200);
    return () => {
      clearTimeout(scroll);
      clearTimeout(clear);
    };
  }, [focusMessageId, threadId, state.data]);

  // One send path for text, attachments, voice notes and AI transcripts: the
  // recorder passes its own body and audio, the composer passes only the draft.
  const send = async (override = {}) => {
    if (sending) return;
    const body = override.body ?? draft;
    const outgoing = [...files, ...(override.attachments || [])];
    if (!body.trim() && !outgoing.length) return;
    setSending(true);
    setNotice('');
    try {
      await comm('send', {
        threadId,
        body,
        replyToId: reply?.id || '',
        attachments: outgoing,
        clientKey: `${boot?.id || 'user'}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      });
      setDraft('');
      setFiles([]);
      setReply(null);
      await load();
      onChanged?.();
    } catch (error) {
      setNotice(error.message);
      throw error;
    } finally {
      setSending(false);
    }
  };

  const react = async (message, emoji) => {
    try {
      await comm('react', { messageId: message.id, emoji });
      await load();
    } catch (error) {
      setNotice(error.message);
    }
  };

  const attach = async (event) => {
    const chosen = [...event.target.files].slice(0, ATTACHMENT_LIMIT - files.length);
    setNotice('');
    for (const file of chosen) {
      try {
        const uploaded = await uploadAttachment(file);
        setFiles((current) => [...current, uploaded]);
      } catch (error) {
        setNotice(error.message);
      }
    }
    event.target.value = '';
  };

  const togglePin = async (message) => {
    try {
      await comm('pin', { messageId: message.id, pinned: !message.pinned });
      await load();
    } catch (error) {
      setNotice(error.message);
    }
  };

  const download = async (message, attachment) => {
    try {
      const data = await comm('downloadAttachment', { messageId: message.id, index: attachment.index });
      window.open(data.url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      setNotice(error.message);
    }
  };

  const submitReport = async () => {
    try {
      await comm('report', { messageId: reportFor.id, reason: reportReason, note: reportNote });
      setReportFor(null);
      setReportNote('');
      setNotice('Report sent to the moderation team.');
    } catch (error) {
      setNotice(error.message);
    }
  };

  const setStatus = async (status) => {
    try {
      await comm('setOfficialStatus', { threadId, status });
      await load();
    } catch (error) {
      setNotice(error.message);
    }
  };

  const toggleMute = async () => {
    const muted = !thread?.muted;
    try {
      await comm('mute', { threadId, muted });
      await load();
    } catch (error) {
      setNotice(error.message);
    }
  };

  if (state.loading) return <div className="card-surface h-[420px] animate-pulse" />;
  if (state.error) {
    return (
      <div className="card-surface p-6">
        <p className="text-[15px] font-semibold text-ink">Conversation unavailable</p>
        <p className="mt-1 text-[14px] text-mutedink">{state.error}</p>
      </div>
    );
  }

  const { thread, messages, participants, permissions } = state.data;
  const pinned = messages.filter((message) => message.pinned);

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_280px]">
      <div className="card-surface flex min-h-[460px] flex-col overflow-hidden">
        <header className="flex items-start gap-2 border-b border-line px-4 py-3">
          <button type="button" onClick={onBack} className="icon-btn lg:hidden" aria-label="Back to conversations">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-[17px] font-semibold tracking-[-0.01em] text-ink">{thread.title}</h2>
            <p className="mt-0.5 truncate text-[13px] text-mutedink">
              {thread.type === 'official'
                ? `Official · ${thread.category || 'General'} · ${(thread.status || 'open').replace(/_/g, ' ')}`
                : thread.type === 'group'
                  ? `Group · ${thread.member_count} members · coordinator ${thread.coordinator_name || '—'}`
                  : 'Private conversation'}
            </p>
          </div>
          <button
            type="button"
            onClick={toggleMute}
            className="icon-btn"
            title={thread.muted ? 'Unmute notifications' : 'Mute notifications'}
          >
            {thread.muted ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
          </button>
        </header>

        {thread.type === 'official' && permissions.canManageStatus && (
          <div className="flex flex-wrap items-center gap-1.5 border-b border-line bg-[#FAFBFD] px-4 py-2">
            <span className="text-[12px] font-medium uppercase tracking-wide text-mutedink">Status</span>
            {OFFICIAL_STATUSES.map((entry) => (
              <button
                key={entry.value}
                type="button"
                onClick={() => setStatus(entry.value)}
                className={cn(
                  'rounded-md px-2 py-1 text-[12px] font-medium',
                  (thread.status || 'open') === entry.value ? 'bg-navy text-white' : 'text-mutedink hover:bg-white',
                )}
              >
                {entry.label}
              </button>
            ))}
          </div>
        )}

        <div ref={listRef} className="scroll-thin flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {!messages.length && (
            <p className="py-8 text-center text-[14px] text-mutedink">No messages yet. Say hello.</p>
          )}
          {messages.map((message) => (
            <div
              key={message.id}
              data-mid={message.id}
              className={cn(
                'flex flex-col rounded-lg',
                message.mine ? 'items-end' : 'items-start',
                message.id === highlightId && 'ring-2 ring-brand/40',
              )}
            >
              <div className="mb-1 flex items-center gap-1.5">
                <span className="text-[13px] font-medium text-ink">{message.sender_name}</span>
                <span className={cn('rounded px-1.5 py-px text-[11px] font-medium capitalize', ROLE_TONE[toneFor(message.sender_role)] || ROLE_TONE.system)}>
                  {message.sender_role}
                </span>
                <span className="text-[12px] text-mutedink">{formatStamp(message.created_date)}</span>
                {message.pinned && <Pin className="h-3 w-3 text-[#8E6018]" />}
              </div>
              <div
                className={cn(
                  'max-w-[85%] rounded-xl px-3 py-2 text-[15px] leading-[1.55]',
                  message.kind === 'system'
                    ? 'bg-[#F2F4F8] text-[13px] italic text-mutedink'
                    : message.mine
                      ? 'bg-navy text-white'
                      : 'bg-[#F4F6FA] text-ink',
                )}
              >
                {message.reply_to_preview && (
                  <p className={cn('mb-1 border-l-2 pl-2 text-[13px]', message.mine ? 'border-white/40 text-white/70' : 'border-line text-mutedink')}>
                    {message.reply_to_preview}
                  </p>
                )}
                {message.hidden ? (
                  <span className="inline-flex items-center gap-1 text-[13px] italic">
                    <ShieldAlert className="h-3.5 w-3.5" /> Message hidden by moderation
                  </span>
                ) : (
                  <p className="whitespace-pre-wrap break-words">{message.body}</p>
                )}
                {message.edited_at && <span className="mt-1 block text-[11px] opacity-70">edited</span>}
                {!!message.attachments.length && (
                  <div className="mt-2 space-y-1">
                    {message.attachments.map((attachment) => (
                      isAudioMime(attachment.mime) ? (
                        <AudioBubble
                          key={attachment.index}
                          message={message}
                          attachment={attachment}
                          mine={message.mine}
                        />
                      ) : (
                      <button
                        key={attachment.index}
                        type="button"
                        onClick={() => download(message, attachment)}
                        className={cn(
                          'flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-[13px]',
                          message.mine ? 'bg-white/10 text-white' : 'bg-white text-ink',
                        )}
                      >
                        <Download className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{attachment.name}</span>
                        <span className="ml-auto shrink-0 text-[11px] opacity-70">{formatSize(attachment.size)}</span>
                      </button>
                      )
                    ))}
                  </div>
                )}
              </div>
              {message.kind !== 'system' && (
                <div className="mt-1 flex items-center gap-2.5">
                  <button type="button" onClick={() => setReply(message)} className="text-[12px] text-mutedink hover:text-ink">
                    Reply
                  </button>
                  {permissions.canPin && (
                    <button type="button" onClick={() => togglePin(message)} className="text-[12px] text-mutedink hover:text-ink">
                      {message.pinned ? 'Unpin' : 'Pin'}
                    </button>
                  )}
                  {!message.mine && (
                    <button type="button" onClick={() => setReportFor(message)} className="text-[12px] text-mutedink hover:text-[#A23B3B]">
                      Report
                    </button>
                  )}
                </div>
              )}
              {message.kind !== 'system' && (
                <MessageReactions
                  reactions={message.reactions || []}
                  mine={boot?.id}
                  canReact={permissions.canPost}
                  onReact={(emoji) => react(message, emoji)}
                />
              )}
            </div>
          ))}
          <div ref={bottom} />
        </div>

        {reportFor && (
          <div className="border-t border-line bg-[#FCF7F7] px-4 py-3">
            <p className="text-[13px] font-semibold text-ink">Report a message</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <select
                value={reportReason}
                onChange={(event) => setReportReason(event.target.value)}
                className="rounded-lg border border-line bg-white px-2 py-1.5 text-[14px]"
              >
                {['spam', 'abuse', 'offensive', 'harassment', 'other'].map((reason) => (
                  <option key={reason} value={reason}>{reason}</option>
                ))}
              </select>
              <input
                value={reportNote}
                onChange={(event) => setReportNote(event.target.value)}
                placeholder="What happened? (optional)"
                className="min-w-[180px] flex-1 rounded-lg border border-line px-2 py-1.5 text-[14px]"
              />
              <button type="button" onClick={submitReport} className="btn-primary btn-sm">Send report</button>
              <button type="button" onClick={() => setReportFor(null)} className="btn-quiet btn-sm">Cancel</button>
            </div>
          </div>
        )}

        {assistantOpen && (
          <AssistantPanel
            threadId={threadId}
            draftText={draft}
            onInsert={(text) => setDraft(text)}
            onClose={() => setAssistantOpen(false)}
          />
        )}

        <MessageComposer
          value={draft}
          onChange={setDraft}
          canPost={permissions.canPost}
          onSend={send}
          onAttach={attach}
          files={files}
          onRemoveFile={(file) => setFiles((current) => current.filter((row) => row.file_uri !== file.file_uri))}
          reply={reply}
          onClearReply={() => setReply(null)}
          sending={sending}
          notice={notice}
          threadId={threadId}
          onAssistant={() => setAssistantOpen((current) => !current)}
        />
      </div>

      <aside className="hidden space-y-3 xl:block">
        <section className="card-surface p-4">
          <h3 className="text-[14px] font-semibold text-ink">
            {thread.type === 'group' ? 'Group' : 'Participants'}
          </h3>
          {thread.type === 'group' && (
            <p className="mt-1 text-[13px] leading-relaxed text-mutedink">
              Coordinator: {thread.coordinator_name || 'not appointed'} · {thread.member_count} active members
            </p>
          )}
          <ul className="mt-2 space-y-1.5">
            {participants.slice(0, 12).map((person) => (
              <li key={`${person.user_id}-${person.name}`} className="flex items-center gap-1.5 text-[13px] text-ink">
                <Users className="h-3.5 w-3.5 text-mutedink" />
                <span className="truncate">{person.name}</span>
                {person.group_role === 'coordinator' && (
                  <span className="ml-auto rounded bg-[#EFEAFE] px-1.5 py-px text-[11px] font-medium text-[#5B4DEB]">coordinator</span>
                )}
                {person.status === 'pending' && (
                  <span className="ml-auto rounded bg-[#FCF3E4] px-1.5 py-px text-[11px] font-medium text-[#8E6018]">pending</span>
                )}
              </li>
            ))}
          </ul>
          {!participants.length && <p className="mt-1 text-[13px] text-mutedink">No participants listed.</p>}
        </section>

        <section className="card-surface p-4">
          <h3 className="text-[14px] font-semibold text-ink">Pinned messages</h3>
          {!pinned.length && <p className="mt-1 text-[13px] text-mutedink">Nothing pinned.</p>}
          <ul className="mt-2 space-y-2">
            {pinned.map((message) => (
              <li key={message.id} className="rounded-lg bg-[#FAFBFD] px-2 py-1.5 text-[13px] text-mutedink">
                <span className="font-medium text-ink">{message.sender_name}</span> · {message.body.slice(0, 90)}
              </li>
            ))}
          </ul>
        </section>
      </aside>
    </div>
  );
}