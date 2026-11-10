import { useEffect, useMemo, useState } from 'react';
import PageTitle from '@/components/shell/PageTitle';
import Surface from '@/components/shell/Surface';
import MarkdownMessage from '@/components/assistant/MarkdownMessage';
import { base44 } from '@/api/base44Client';
import { useProfessorContext, loadTeaching } from '@/lib/professorData';

const PROMPTS = [
  'Draft five quiz questions on exchange-rate adjustment',
  'Summarise what my courses show about student engagement',
  'Suggest constructive feedback for a weak policy brief',
  'Outline a 90-minute seminar plan on current-account imbalances',
];

export default function AiTeachingAssistant() {
  const { professor, courses } = useProfessorContext();
  const [context, setContext] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'I can help with teaching materials, quiz questions, assignment briefs, feedback wording and reading your own course records. What are you working on?' },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!professor) return;
    loadTeaching(professor.id, courses).then((data) => {
      const summary = courses.map((course) => {
        const roster = new Set(data.enrollments.filter((e) => e.course_id === course.id).map((e) => e.student_id)).size;
        const assignments = data.assignments.filter((a) => a.course_id === course.id && a.status === 'published').length;
        const pending = data.submissions.filter((s) => s.course_id === course.id && s.status === 'submitted').length;
        const graded = data.submissions.filter((s) => s.course_id === course.id && typeof s.score === 'number');
        const avg = graded.length ? Math.round(graded.reduce((sum, s) => sum + s.score, 0) / graded.length) : null;
        return `${course.code} ${course.title}: ${roster} students, ${assignments} published assignments, ${pending} pending submissions, average graded score ${avg === null ? 'n/a' : avg}`;
      }).join('\n');
      setContext(summary);
    });
  }, [professor?.id, courses.length]);

  const systemContext = useMemo(() => (
    `You are the AI teaching assistant inside a university professor workspace. The professor is ${professor?.full_name || 'the user'}. `
    + `Only rely on these course figures when discussing records:\n${context || 'No course data is loaded.'}\n\n`
    + 'Rules: answer directly and concisely; never invent student names, grades or records beyond the figures above; '
    + 'never assign a final grade or make a disciplinary decision — propose a mark range and feedback wording the professor must review; '
    + 'do not repeat the same phrasing you already used. Use short paragraphs or bullet lists.'
  ), [context, professor?.full_name]);

  const send = async (prompt) => {
    const text = (prompt ?? input).trim();
    if (!text || busy) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setBusy(true);
    try {
      const answer = await base44.integrations.Core.InvokeLLM({
        prompt: `${systemContext}\n\nProfessor request: ${text}`,
      });
      setMessages((prev) => [...prev, { role: 'assistant', content: typeof answer === 'string' ? answer : JSON.stringify(answer) }]);
    } catch {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'The assistant could not reach the language model just now. Your course records are unaffected — please try the request again.',
      }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageTitle
        eyebrow="Professor workspace"
        title="AI teaching assistant"
        description="Draft materials, generate questions and read your own course figures. Suggestions are drafts for you to review."
        meta={['Uses your live course records as context', 'Never assigns grades automatically']}
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <Surface title="Conversation" subtitle="Ask about teaching preparation or your course data">
          <div className="max-h-[440px] space-y-3 overflow-y-auto scroll-thin pr-1">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`rounded-lg px-3 py-2 text-[11.5px] leading-relaxed ${
                  message.role === 'user' ? 'ml-8 bg-brand-soft text-ink' : 'mr-8 border border-line bg-white text-ink'
                }`}
              >
                {message.role === 'user' ? message.content : <MarkdownMessage>{message.content}</MarkdownMessage>}
              </div>
            ))}
            {busy && <p className="text-[11px] text-mutedink">The assistant is drafting a response…</p>}
          </div>

          <form
            onSubmit={(event) => { event.preventDefault(); send(); }}
            className="mt-3 flex items-center gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the teaching assistant…"
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-[12px] text-ink focus:border-royal/40 focus:outline-none focus:ring-2 focus:ring-royal/10"
            />
            <button type="submit" disabled={busy} className="btn-primary shrink-0 disabled:opacity-60">Send</button>
          </form>
        </Surface>

        <div className="space-y-4">
          <Surface title="Suggested prompts" bodyClassName="space-y-1.5">
            {PROMPTS.map((prompt) => (
              <button key={prompt} type="button" onClick={() => send(prompt)} className="btn-quiet w-full justify-start text-left">
                {prompt}
              </button>
            ))}
          </Surface>
          <Surface title="Course context sent with each request" subtitle="Derived from your live records">
            <pre className="whitespace-pre-wrap text-[10.5px] leading-relaxed text-mutedink">{context || 'Loading course records…'}</pre>
          </Surface>
        </div>
      </div>
    </div>
  );
}