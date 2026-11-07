import { useEffect, useRef, useState } from 'react';
import { Sparkles, Send, Trash2, User as UserIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useStudentData } from '@/lib/StudentDataContext';
import { buildAssistantPrompt, SUGGESTED_PROMPTS } from '@/lib/assistantPrompt';
import { cn } from '@/lib/utils';

function items(result) {
  if (Array.isArray(result)) return result;
  return result?.items || [];
}

const markdownComponents = {
  p: ({ children }) => <p className="mb-1.5 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="mb-1.5 list-disc space-y-1 pl-4 last:mb-0">{children}</ul>,
  ol: ({ children }) => <ol className="mb-1.5 list-decimal space-y-1 pl-4 last:mb-0">{children}</ol>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  a: ({ children, href }) => (
    <a href={href} className="underline" target="_blank" rel="noreferrer">
      {children}
    </a>
  ),
};

export default function Assistant() {
  const { userId, profile, courses, schedule, grades, applications, notifications, loading } =
    useStudentData();
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [threadLoading, setThreadLoading] = useState(true);
  const [error, setError] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    const loadThread = async () => {
      setThreadLoading(true);
      try {
        const conversations = items(
          await base44.entities.Conversation.filter(
            { user_id: userId },
            { sort: '-updated_date', limit: 1 }
          )
        );
        if (!active) return;
        const latest = conversations[0];
        if (latest) {
          setConversationId(latest.id);
          const stored = items(
            await base44.entities.Message.filter(
              { conversation_id: latest.id },
              { sort: 'created_date', limit: 100 }
            )
          );
          if (active) setMessages(stored);
        }
      } catch (err) {
        if (active) setError(err?.message || 'Your conversation history could not be loaded.');
      } finally {
        if (active) setThreadLoading(false);
      }
    };
    loadThread();
    return () => {
      active = false;
    };
  }, [userId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, sending]);

  const send = async (raw) => {
    const content = String(raw || '').trim();
    if (!content || sending || !userId) return;

    setError('');
    setInput('');
    setSending(true);
    setMessages((prev) => [...prev, { id: `local-${Date.now()}`, role: 'user', content }]);

    try {
      let activeConversation = conversationId;
      if (!activeConversation) {
        const created = await base44.entities.Conversation.create({
          user_id: userId,
          title: content.slice(0, 70),
          preview: '',
        });
        activeConversation = created.id;
        setConversationId(activeConversation);
      }

      await base44.entities.Message.create({
        user_id: userId,
        conversation_id: activeConversation,
        role: 'user',
        content,
      });

      const reply = await base44.integrations.Core.InvokeLLM({
        prompt: buildAssistantPrompt(
          { profile, courses, schedule, grades, applications, notifications },
          content,
          messages
        ),
      });

      await base44.entities.Message.create({
        user_id: userId,
        conversation_id: activeConversation,
        role: 'assistant',
        content: String(reply),
      });
      await base44.entities.Conversation.update(activeConversation, {
        preview: String(reply).slice(0, 140),
      });

      setMessages((prev) => [
        ...prev,
        { id: `reply-${Date.now()}`, role: 'assistant', content: String(reply) },
      ]);
    } catch (err) {
      setError(
        err?.message ||
          'The assistant could not answer right now. Please check your connection and try again.'
      );
    } finally {
      setSending(false);
    }
  };

  const clearConversation = async () => {
    if (!conversationId) {
      setMessages([]);
      return;
    }
    if (!window.confirm('Clear this conversation? The messages will be deleted.')) return;
    try {
      await base44.entities.Message.deleteMany({ user_id: userId, conversation_id: conversationId });
      await base44.entities.Conversation.delete(conversationId);
      setConversationId(null);
      setMessages([]);
      setError('');
    } catch (err) {
      setError(err?.message || 'The conversation could not be cleared.');
    }
  };

  return (
    <div className="fade-up">
      <PageHeader
        eyebrow="AI assistant"
        title="AI student assistant"
        description="Ask about your schedule, grades, applications or notifications. Answers are built from your own records only."
        actions={
          <Button
            type="button"
            variant="outline"
            onClick={clearConversation}
            disabled={sending || (messages.length === 0 && !conversationId)}
            className="rounded-xl text-[12.5px]"
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Clear conversation
          </Button>
        }
      />

      <div className="card-surface flex h-[calc(100dvh-330px)] min-h-[460px] flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
          {threadLoading || loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#E4E9F2] border-t-navy" />
            </div>
          ) : messages.length === 0 ? (
            <div className="mx-auto flex h-full max-w-md flex-col justify-center text-center">
              <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-navy/[0.06] text-navy">
                <Sparkles className="h-5 w-5" strokeWidth={1.7} />
              </span>
              <p className="font-heading text-[18px] text-navy-deep">How can I help you today?</p>
              <p className="mt-1.5 text-[12px] leading-relaxed text-slate-500">
                I can read your own schedule, results, applications and notifications. I will never
                make up a grade or a status.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => send(prompt)}
                    className="rounded-full border border-[#E4E9F2] bg-white px-3 py-1.5 text-[11.5px] text-navy-mid transition-colors hover:border-gold/50 hover:bg-[#FCFAF5] hover:text-navy"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => {
                const isUser = message.role === 'user';
                return (
                  <div
                    key={message.id}
                    className={cn('flex items-start gap-2.5', isUser ? 'flex-row-reverse' : 'flex-row')}
                  >
                    <span
                      className={cn(
                        'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                        isUser ? 'bg-[#F1F5FB] text-navy-mid' : 'bg-navy text-gold-light'
                      )}
                    >
                      {isUser ? (
                        <UserIcon className="h-3.5 w-3.5" strokeWidth={1.8} />
                      ) : (
                        <Sparkles className="h-3.5 w-3.5" strokeWidth={1.8} />
                      )}
                    </span>
                    <div
                      className={cn(
                        'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed',
                        isUser
                          ? 'rounded-br-md bg-navy text-white'
                          : 'rounded-bl-md border border-[#E9EEF6] bg-[#F7F9FD] text-navy-deep'
                      )}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      ) : (
                        <ReactMarkdown components={markdownComponents}>
                          {message.content}
                        </ReactMarkdown>
                      )}
                    </div>
                  </div>
                );
              })}
              {sending && (
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-navy text-gold-light">
                    <Sparkles className="h-3.5 w-3.5" strokeWidth={1.8} />
                  </span>
                  <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-[#E9EEF6] bg-[#F7F9FD] px-4 py-3">
                    {[0, 150, 300].map((delay) => (
                      <span
                        key={delay}
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-navy-mid/60"
                        style={{ animationDelay: `${delay}ms` }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>
          )}
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            send(input);
          }}
          className="border-t border-[#EEF1F7] bg-white px-3 py-3 sm:px-4"
        >
          {error && (
            <p className="mb-2 rounded-xl bg-rose-50 px-3 py-2 text-[11.5px] text-rose-700">{error}</p>
          )}
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  send(input);
                }
              }}
              rows={1}
              placeholder="Ask about your schedule, grades or applications…"
              className="max-h-32 min-h-[42px] flex-1 resize-none rounded-xl border border-[#E4E9F2] px-3.5 py-2.5 text-[13px] text-navy-deep outline-none transition-colors placeholder:text-slate-400 focus:border-navy-mid focus:ring-2 focus:ring-navy/10"
            />
            <Button
              type="submit"
              disabled={!input.trim() || sending}
              className="h-[42px] rounded-xl bg-navy px-3.5 hover:bg-navy-deep"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>

      <p className="mt-3 text-center text-[10.5px] leading-relaxed text-slate-400">
        The assistant answers only from the records in your account. Fictional demonstration data.
      </p>
    </div>
  );
}