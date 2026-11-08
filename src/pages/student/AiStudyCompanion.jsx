import { useEffect, useRef, useState } from 'react';
import { ArrowUp, BookOpen, Sparkles } from 'lucide-react';
import PageTitle from '@/components/shell/PageTitle';
import Surface from '@/components/shell/Surface';
import { base44 } from '@/api/base44Client';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';
import { Link } from 'react-router-dom';
import { firstName, loadStudentPortal } from '@/lib/studentPortal';

const PROMPTS = [
  'What is due soonest and how should I prepare?',
  'Where is my weakest result and what should I revise?',
  'Summarise my deadlines for the next two weeks.',
  'How many quiz attempts do I have left?',
];

export default function AiStudyCompanion() {
  const [context, setContext] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    loadStudentPortal().then(setContext);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
  }, [messages, busy]);

  // The record is assembled on the server from the signed-in account: the
  // browser never sends a student id, so no other student's data is reachable.
  const ask = async (question) => {
    const text = (question ?? input).trim();
    if (!text || busy) return;
    const history = messages.slice(-6).map((message) => ({ role: message.role, text: message.text }));
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInput('');
    setBusy(true);
    setError('');
    try {
      const response = await base44.functions.invoke('studentAssistant', { question: text, history });
      const answer = response?.data?.answer;
      if (!answer) throw new Error('empty');
      setMessages((prev) => [...prev, { role: 'assistant', text: answer }]);
    } catch {
      setError('The study companion could not answer just now. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const summary = context?.summary;
  const profile = context?.profile;

  return (
    <div>
      <PageTitle
        eyebrow="Student workspace"
        title="AI study companion"
        description="Ask about your own courses, deadlines and results. Answers are generated only from your academic record."
        meta={[
          summary ? `${summary.courseCount} courses in scope` : 'Loading your record…',
          summary?.average === null ? 'No average recorded yet' : summary ? `Average ${summary.average.toFixed(1)}` : '',
          'Answers are not stored',
        ].filter(Boolean)}
      />

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <section className="card-surface flex min-h-[460px] flex-col overflow-hidden">
          <header className="flex items-center gap-2 border-b border-line px-5 py-3.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-royal/10 text-royal">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[15px] font-semibold text-ink">Study companion</p>
              <p className="text-[13px] text-mutedink">Connected to your academic record</p>
            </div>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
            {messages.length === 0 && (
              <div className="py-4">
                <p className="text-[15px] font-medium text-ink">
                  Hello {firstName(profile)} — what are we working on?
                </p>
                <p className="mt-1 text-[14px] leading-relaxed text-mutedink">
                  I can see your courses, results, attendance, open assignments and assessment dates. Ask me to plan
                  revision, explain a result, or summarise what is due.
                </p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => ask(prompt)}
                      className="rounded-lg border border-line bg-canvas/60 px-3 py-2 text-left text-[14px] leading-snug text-ink transition-colors hover:border-royal/30 hover:bg-royal/5"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[88%] whitespace-pre-line rounded-xl px-3.5 py-2.5 text-[14px] leading-relaxed ${
                    message.role === 'user' ? 'bg-royal text-white' : 'border border-line bg-canvas/60 text-ink'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}

            {busy && (
              <div className="flex items-center gap-2 text-[14px] text-mutedink">
                <span className="flex gap-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-royal/60" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-royal/60 [animation-delay:120ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-royal/60 [animation-delay:240ms]" />
                </span>
                Reading your record…
              </div>
            )}

            {error && <p className="text-[14px] text-critical">{error}</p>}
            <div ref={endRef} />
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              ask();
            }}
            className="border-t border-line px-5 py-3"
          >
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    ask();
                  }
                }}
                rows={1}
                placeholder="Ask about your courses, deadlines or results…"
                className="max-h-32 min-h-[40px] flex-1 resize-none rounded-lg border border-line bg-white px-3 py-2 text-[15px] text-ink placeholder:text-mutedink/70 focus:border-royal/40 focus:outline-none focus:ring-2 focus:ring-royal/10"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-royal text-white transition-colors hover:bg-royal-deep disabled:opacity-40"
                aria-label="Send question"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1.5 text-[12px] text-mutedink">
              Generated by the app’s AI model from your record only. Conversations are not saved and are not visible to
              lecturers.
            </p>
          </form>
        </section>

        <div className="space-y-4">
          <Surface title="What the companion can see" subtitle="Scope of this conversation">
            {summary ? (
              <ul className="space-y-1.5 text-[14px] leading-relaxed text-ink/80">
                <li>· {summary.courseCount} enrolled courses with results and attendance</li>
                <li>· {summary.pending + summary.overdue} open assignments and their deadlines</li>
                <li>· {summary.quizTotal} published quizzes, {summary.quizAttempted} attempted</li>
                <li>· {summary.graded} graded assessments and your recorded feedback</li>
                <li>· {summary.materialCount} published course materials</li>
              </ul>
            ) : (
              <p className="text-[14px] text-mutedink">Loading your record…</p>
            )}
            <p className="mt-3 border-t border-line pt-3 text-[13px] leading-relaxed text-mutedink">
              It cannot change records, submit work, or see another student’s data.
            </p>
          </Surface>

          <Surface title="Related pages">
            <div className="space-y-2 text-[14px]">
              <Link to={P.student.assignments} className="link-quiet flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" /> Open assignments
              </Link>
              <Link to={P.student.quizzes} className="link-quiet flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" /> Quizzes &amp; exams
              </Link>
              <Link to={P.student.grades} className="link-quiet flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" /> Grades &amp; transcript
              </Link>
            </div>
          </Surface>
        </div>
      </div>
    </div>
  );
}