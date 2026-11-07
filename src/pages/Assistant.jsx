import { useEffect, useMemo, useRef, useState } from 'react';
import { Sparkles, Send, Trash2, Loader2, AlertCircle, User } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import AiAnswer from '@/components/assistant/AiAnswer';
import { useAdminData } from '@/lib/AdminDataContext';
import { askDeanAssistant } from '@/lib/aiEngine';
import { withRetry } from '@/lib/apiRetry';
import { base44 } from '@/api/base44Client';
import { roleLabel } from '@/lib/roles';

const SUGGESTIONS = [
  'What is the attendance rate today?',
  'Which faculty has the lowest attendance?',
  'How many students are at academic risk?',
  'Which departments have the highest failure rates?',
  'Compare faculty performance this semester.',
  'Show outstanding administrative requests.',
  'Prepare a weekly dean’s report.',
  'Identify students with declining GPA.',
  'Summarise attendance problems.',
];

const toList = (result) => (Array.isArray(result) ? result : result?.items || []);

function decodeAssistant(content) {
  try {
    const parsed = JSON.parse(content);
    if (parsed && typeof parsed === 'object' && parsed.answer) return parsed;
  } catch (error) {
    /* stored as plain text */
  }
  return { answer: content, findings: [], actions: [], visualization: null, table: null, limitations: '' };
}

export default function Assistant() {
  const context = useAdminData();
  const { me, analytics, loading } = context;
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [restored, setRestored] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!me?.id) return;
      const conversations = await withRetry(() =>
        base44.entities.Conversation.filter({ user_id: me.id }, { sort: '-updated_date', limit: 1 })
      );
      const conversation = toList(conversations)[0];
      if (conversation && active) {
        const stored = await withRetry(() =>
          base44.entities.Message.filter({ conversation_id: conversation.id }, { sort: 'created_date', limit: 60 })
        );
        if (active) {
          setConversationId(conversation.id);
          setMessages(toList(stored).map((message) => ({ role: message.role, text: message.content, payload: message.role === 'assistant' ? decodeAssistant(message.content) : null })));
        }
      }
      if (active) setRestored(true);
    })();
    return () => {
      active = false;
    };
  }, [me?.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy]);

  const history = useMemo(
    () => messages.map((message) => ({ role: message.role, content: message.role === 'assistant' ? message.payload?.answer || message.text : message.text })),
    [messages]
  );

  const ensureConversation = async (text) => {
    if (conversationId) return conversationId;
    const created = await base44.entities.Conversation.create({
      user_id: me.id,
      title: text.slice(0, 70),
      preview: text.slice(0, 120),
    });
    setConversationId(created.id);
    return created.id;
  };

  const send = async (question) => {
    const text = question.trim();
    if (!text || busy) return;
    setError(null);
    setInput('');
    const conversation = await ensureConversation(text);
    await base44.entities.Message.create({
      user_id: me.id,
      conversation_id: conversation,
      role: 'user',
      content: text,
    });
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setBusy(true);
    try {
      const response = await askDeanAssistant({ question: text, data: context, analytics, history });
      const saved = await base44.entities.Message.create({
        user_id: me.id,
        conversation_id: conversation,
        role: 'assistant',
        content: JSON.stringify(response),
      });
      setMessages((prev) => [...prev, { role: 'assistant', text: response.answer, payload: response, id: saved.id }]);
      await base44.entities.Conversation.update(conversation, { preview: response.answer.slice(0, 120) });
    } catch (err) {
      setError('The assistant could not complete this analysis. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const clearConversation = async () => {
    if (!conversationId) return;
    await base44.entities.Message.deleteMany({ conversation_id: conversationId });
    await base44.entities.Conversation.delete(conversationId);
    setConversationId(null);
    setMessages([]);
  };

  return (
    <div>
      <PageHeader
        eyebrow="AI Dean Assistant"
        title="Ask the university intelligence engine"
        description="Natural-language analysis over the institutional records you are authorised to access. Answers are computed from the application database."
        actions={
          conversationId ? (
            <button
              type="button"
              onClick={clearConversation}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#E1E8F2] bg-white px-3 py-2 text-[11.5px] font-medium text-ink hover:bg-[#F7FAFD]"
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear conversation
            </button>
          ) : null
        }
      />

      <div className="grid gap-4 lg:grid-cols-4">
        <div className="card-surface flex h-[calc(100dvh-260px)] min-h-[480px] flex-col lg:col-span-3">
          <div ref={scrollRef} className="no-scrollbar flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
            {messages.length === 0 && !loading && (
              <div className="py-6 text-center">
                <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-navy text-gold">
                  <Sparkles className="h-5 w-5" />
                </span>
                <p className="mt-2 font-heading text-[16px] text-ink">Ask about performance, attendance, risk or workload</p>
                <p className="mx-auto mt-1 max-w-md text-[11.5px] leading-relaxed text-mutedink">
                  Every answer is generated from {analytics.kpis.totalStudents} student records,{' '}
                  {context.academicRecords.length} academic results and {context.attendanceRecords.length} attendance sessions in the
                  demonstration database.
                </p>
              </div>
            )}

            {messages.map((message, index) =>
              message.role === 'user' ? (
                <div key={`${index}-user`} className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-navy px-3.5 py-2.5 text-[12px] leading-relaxed text-white">
                    {message.text}
                  </div>
                </div>
              ) : (
                <div key={`${index}-assistant`} className="flex gap-2.5">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold/20 text-[#8A6C26]">
                    <Sparkles className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0 flex-1 rounded-2xl rounded-tl-sm border border-[#E9EFF7] bg-white px-3.5 py-3">
                    {message.payload ? <AiAnswer response={message.payload} /> : <p className="text-[12px] text-ink">{message.text}</p>}
                  </div>
                </div>
              )
            )}

            {busy && (
              <div className="flex gap-2.5">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold/20 text-[#8A6C26]">
                  <Sparkles className="h-3.5 w-3.5" />
                </span>
                <div className="flex items-center gap-2 rounded-2xl border border-[#E9EFF7] bg-white px-3.5 py-2.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-navy" />
                  <span className="text-[11.5px] text-mutedink">Analysing authorised records…</span>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-[#F0CFCC] bg-[#FBECEB] px-3 py-2 text-[11.5px] text-[#A33A38]">
                <AlertCircle className="h-3.5 w-3.5" /> {error}
              </div>
            )}
          </div>

          <div className="border-t border-[#EEF2F8] p-3">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                send(input);
              }}
              className="flex items-center gap-2"
            >
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about attendance, performance, risk, workload or requests…"
                className="h-10 flex-1 rounded-xl border border-[#E1E8F2] bg-[#F7F9FC] px-3 text-[12.5px] text-ink placeholder:text-mutedink/80 focus:border-navy/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy/10"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                className="flex h-10 items-center gap-1.5 rounded-xl bg-navy px-3.5 text-[12px] font-medium text-white transition-colors hover:bg-navy-mid disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" /> Ask
              </button>
            </form>
            <p className="mt-1.5 text-[9.5px] text-mutedink">
              Demonstration records only. The assistant cannot execute administrative actions.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="card-surface p-4">
            <p className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-mutedink">Suggested questions</p>
            <ul className="mt-2 space-y-1.5">
              {SUGGESTIONS.map((suggestion) => (
                <li key={suggestion}>
                  <button
                    type="button"
                    onClick={() => send(suggestion)}
                    disabled={busy}
                    className="w-full rounded-lg border border-[#EEF2F8] px-2.5 py-1.5 text-left text-[11px] text-ink transition-colors hover:border-navy/25 hover:bg-[#F7FAFD] disabled:opacity-50"
                  >
                    {suggestion}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="card-surface p-4">
            <p className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-mutedink">Session</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EEF3FA] text-navy">
                <User className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[11.5px] font-medium text-ink">{me?.full_name || 'Dean’s Office'}</p>
                <p className="text-[10px] text-mutedink">{roleLabel(context.role)} · authorised scope</p>
              </div>
            </div>
            {!restored && <p className="mt-2 text-[10px] text-mutedink">Restoring conversation history…</p>}
          </div>
        </div>
      </div>
    </div>
  );
}