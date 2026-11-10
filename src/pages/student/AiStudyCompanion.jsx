import { useEffect, useRef, useState } from 'react';
import { ArrowUp, BookOpen, Sparkles } from 'lucide-react';
import PageTitle from '@/components/shell/PageTitle';
import Surface from '@/components/shell/Surface';
import MarkdownMessage from '@/components/assistant/MarkdownMessage';
import { base44 } from '@/api/base44Client';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';
import { Link } from 'react-router-dom';
import { firstName, loadStudentPortal } from '@/lib/studentPortal';
import { useI18n } from '@/i18n/I18nProvider';

const PROMPT_KEYS = ['ai.prompt1', 'ai.prompt2', 'ai.prompt3', 'ai.prompt4'];

export default function AiStudyCompanion() {
  const { t, language, languages } = useI18n();
  const [context, setContext] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  // Empty means "follow the interface language"; the student may ask for
  // another answer language for this session without changing the interface.
  const [answerLanguage, setAnswerLanguage] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    loadStudentPortal().then(setContext);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
  }, [messages, busy]);

  // The record is assembled on the server from the signed-in account: the
  // browser never sends a student id, so no other student's data is reachable.
  // The answer language is a presentation preference only.
  const ask = async (question) => {
    const text = (question ?? input).trim();
    if (!text || busy) return;
    const history = messages.slice(-6).map((message) => ({ role: message.role, text: message.text }));
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInput('');
    setBusy(true);
    setError('');
    try {
      const response = await base44.functions.invoke('studentAssistant', {
        question: text,
        history,
        language: answerLanguage || language,
      });
      if (response?.data?.code === 'not_linked') {
        setMessages((prev) => [...prev, { role: 'assistant', text: t('ai.notLinked') }]);
        return;
      }
      const answer = response?.data?.answer;
      if (!answer) throw new Error('empty');
      setMessages((prev) => [...prev, { role: 'assistant', text: answer }]);
    } catch {
      setError(t('ai.error'));
    } finally {
      setBusy(false);
    }
  };

  const summary = context?.summary;
  const profile = context?.profile;

  return (
    <div>
      <PageTitle
        eyebrow={t('ai.eyebrow')}
        title={t('ai.title')}
        description={t('ai.description')}
        meta={[
          summary ? t('ai.metaCourses', { count: summary.courseCount }) : t('ai.metaLoading'),
          summary?.average === null
            ? t('ai.metaNoAverage')
            : summary
              ? t('ai.metaAverage', { value: summary.average.toFixed(1) })
              : '',
          t('ai.metaNotStored'),
        ].filter(Boolean)}
      />

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <section className="card-surface flex min-h-[460px] flex-col overflow-hidden">
          <header className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-3.5">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-royal/10 text-royal">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[15px] font-semibold text-ink">{t('ai.companionTitle')}</p>
                <p className="text-[13px] text-mutedink">{t('ai.companionSub')}</p>
              </div>
            </div>
            <label className="flex items-center gap-1.5 text-[13px] text-mutedink">
              <span>{t('ai.responseLanguage')}</span>
              <select
                value={answerLanguage}
                onChange={(event) => setAnswerLanguage(event.target.value)}
                className="h-8 rounded-lg border border-line bg-white px-2 text-[13px] text-ink"
              >
                <option value="">{t('ai.sameAsInterface')}</option>
                {languages.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.nativeName}
                  </option>
                ))}
              </select>
            </label>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
            {messages.length === 0 && (
              <div className="py-4">
                <p className="text-[15px] font-medium text-ink">
                  {t('ai.greeting', { name: firstName(profile) })}
                </p>
                <p className="mt-1 text-[14px] leading-relaxed text-mutedink">{t('ai.intro')}</p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {PROMPT_KEYS.map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => ask(t(key))}
                      className="rounded-lg border border-line bg-canvas/60 px-3 py-2 text-start text-[14px] leading-snug text-ink transition-colors hover:border-royal/30 hover:bg-royal/5"
                    >
                      {t(key)}
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
                  className={`max-w-[88%] rounded-xl px-3.5 py-2.5 text-[14px] leading-relaxed ${
                    message.role === 'user'
                      ? 'whitespace-pre-line bg-royal text-white'
                      : 'border border-line bg-canvas/60 text-ink'
                  }`}
                >
                  {message.role === 'user' ? message.text : <MarkdownMessage>{message.text}</MarkdownMessage>}
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
                {t('ai.reading')}
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
                placeholder={t('ai.placeholder')}
                className="max-h-32 min-h-[40px] flex-1 resize-none rounded-lg border border-line bg-white px-3 py-2 text-[15px] text-ink placeholder:text-mutedink/70 focus:border-royal/40 focus:outline-none focus:ring-2 focus:ring-royal/10"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-royal text-white transition-colors hover:bg-royal-deep disabled:opacity-40"
                aria-label={t('ai.send')}
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1.5 text-[12px] text-mutedink">{t('ai.disclaimer')}</p>
          </form>
        </section>

        <div className="space-y-4">
          <Surface title={t('ai.scopeTitle')} subtitle={t('ai.scopeSub')}>
            {summary ? (
              <ul className="space-y-1.5 text-[14px] leading-relaxed text-ink/80">
                <li>· {t('ai.scopeCourses', { count: summary.courseCount })}</li>
                <li>· {t('ai.scopeAssignments', { count: summary.pending + summary.overdue })}</li>
                <li>· {t('ai.scopeQuizzes', { total: summary.quizTotal, attempted: summary.quizAttempted })}</li>
                <li>· {t('ai.scopeGraded', { count: summary.graded })}</li>
                <li>· {t('ai.scopeMaterials', { count: summary.materialCount })}</li>
              </ul>
            ) : (
              <p className="text-[14px] text-mutedink">{t('ai.metaLoading')}</p>
            )}
            <p className="mt-3 border-t border-line pt-3 text-[13px] leading-relaxed text-mutedink">
              {t('ai.scopeNote')}
            </p>
          </Surface>

          <Surface title={t('ai.related')}>
            <div className="space-y-2 text-[14px]">
              <Link to={P.student.assignments} className="link-quiet flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" /> {t('ai.openAssignments')}
              </Link>
              <Link to={P.student.quizzes} className="link-quiet flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" /> {t('ai.openQuizzes')}
              </Link>
              <Link to={P.student.grades} className="link-quiet flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" /> {t('ai.openGrades')}
              </Link>
            </div>
          </Surface>
        </div>
      </div>
    </div>
  );
}