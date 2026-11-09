import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { askAcademicAdvisor } from '@/lib/academicIntelligence';

const SUGGESTIONS = [
  { mode: 'explain', label: 'Explain my performance' },
  { mode: 'improve', label: 'Where am I declining?' },
  { mode: 'priorities', label: 'What should I study first?' },
  { mode: 'prepare', label: 'Prepare me for exams' },
];

export default function PerformanceAdvisor() {
  const [answer, setAnswer] = useState('');
  const [question, setQuestion] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const ask = async (payload) => {
    setBusy(true);
    setError('');
    setAnswer('');
    try {
      const data = await askAcademicAdvisor(payload);
      setAnswer(data.answer || '');
    } catch (caught) {
      setError(caught.message || 'The advisor is unavailable right now.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {SUGGESTIONS.map((item) => (
          <button
            key={item.mode}
            type="button"
            disabled={busy}
            onClick={() => ask({ mode: item.mode })}
            className="btn-quiet btn-sm disabled:opacity-60"
          >
            {item.label}
          </button>
        ))}
      </div>

      <form
        className="mt-3 flex flex-col gap-2 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          if (question.trim()) ask({ mode: 'explain', question: question.trim() });
        }}
      >
        <input
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Ask about your own results, a course or an assessment"
          className="min-w-0 flex-1 rounded-lg border border-line bg-white px-3 py-2 text-[14px] outline-none focus:border-brand"
        />
        <button type="submit" disabled={busy || !question.trim()} className="btn-primary disabled:opacity-60">
          <Sparkles className="h-4 w-4" /> Ask
        </button>
      </form>

      {busy && (
        <p className="mt-3 flex items-center gap-2 text-[13px] text-mutedink">
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-line border-t-brand" />
          Reading your recorded results…
        </p>
      )}

      {error && <p className="mt-3 text-[13px] text-critical">{error}</p>}

      {answer && !busy && (
        <div className="mt-3 rounded-xl border border-line bg-canvas px-4 py-3">
          <p className="whitespace-pre-line text-[14px] leading-relaxed text-ink">{answer}</p>
        </div>
      )}

      <p className="mt-3 text-[12.5px] leading-relaxed text-mutedink">
        The advisor reads only your own recorded results, attendance and published assessments. It cannot see other
        students, and it does not predict or guarantee a future grade — anything it says about an outcome is a
        recommendation, not a result.
      </p>
    </div>
  );
}