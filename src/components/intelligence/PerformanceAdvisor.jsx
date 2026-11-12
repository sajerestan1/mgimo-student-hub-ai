import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import MarkdownMessage from '@/components/assistant/MarkdownMessage';
import { askAcademicAdvisor } from '@/lib/academicIntelligence';
import { useI18n } from '@/i18n/I18nProvider';

const SUGGESTIONS = [
  { mode: 'explain', key: 'explain' },
  { mode: 'improve', key: 'declining' },
  { mode: 'priorities', key: 'priorities' },
  { mode: 'prepare', key: 'prepare' },
];

export default function PerformanceAdvisor() {
  const { t } = useI18n();
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
      setError(caught.message || t('intel.advisor.unavailable'));
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
            {t(`intel.advisor.${item.key}`)}
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
          placeholder={t('intel.advisor.placeholder')}
          className="min-w-0 flex-1 rounded-lg border border-line bg-white px-3 py-2 text-[14px] outline-none focus:border-brand"
        />
        <button type="submit" disabled={busy || !question.trim()} className="btn-primary disabled:opacity-60">
          <Sparkles className="h-4 w-4" /> {t('intel.advisor.ask')}
        </button>
      </form>

      {busy && (
        <p className="mt-3 flex items-center gap-2 text-[13px] text-mutedink">
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-line border-t-brand" />
          {t('intel.advisor.reading')}
        </p>
      )}

      {error && <p className="mt-3 text-[13px] text-critical">{error}</p>}

      {answer && !busy && (
        <div className="mt-3 rounded-xl border border-line bg-canvas px-4 py-3">
          <MarkdownMessage className="text-[14px] leading-relaxed text-ink">{answer}</MarkdownMessage>
        </div>
      )}

      <p className="mt-3 text-[12.5px] leading-relaxed text-mutedink">
        {t('intel.advisor.note')}
      </p>
    </div>
  );
}