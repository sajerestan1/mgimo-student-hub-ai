import { useState } from 'react';
import { Check, Copy, Loader2, Sparkles, X } from 'lucide-react';
import { comm } from '@/lib/communication/api';

// Suggestions only: every result is labelled as AI-generated and only reaches the
// composer when the user chooses to insert it. Nothing is ever sent from here.
const MODES = [
  { key: 'draft', label: 'Draft a message' },
  { key: 'rewrite', label: 'Rewrite professionally' },
  { key: 'simplify', label: 'Make it simpler' },
  { key: 'suggest', label: 'Suggest a reply' },
  { key: 'translate', label: 'Translate' },
  { key: 'explain', label: 'Explain a procedure' },
  { key: 'summarise', label: 'Summarise this chat' },
];

const AUDIENCES = [
  { value: 'classmate', label: 'A classmate' },
  { value: 'professor', label: 'A professor' },
  { value: 'dean-office', label: 'The Dean\u2019s Office' },
];

export default function AssistantPanel({ threadId, draftText, onInsert, onClose }) {
  const [mode, setMode] = useState(threadId ? 'rewrite' : 'draft');
  const [text, setText] = useState(draftText || '');
  const [audience, setAudience] = useState('classmate');
  const [language, setLanguage] = useState('');
  const [state, setState] = useState({ loading: false, suggestion: '', error: '' });
  const [copied, setCopied] = useState(false);

  const run = async () => {
    setState({ loading: true, suggestion: '', error: '' });
    setCopied(false);
    try {
      const data = await comm('assistant', { mode, threadId, text, audience, language });
      setState({ loading: false, suggestion: data.suggestion, error: '' });
    } catch (error) {
      setState({ loading: false, suggestion: '', error: error.message });
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(state.suggestion);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="border-t border-line bg-[#FAFBFD] px-3 py-3 sm:px-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="flex items-center gap-1.5 text-[14px] font-semibold text-ink">
            <Sparkles className="h-4 w-4 text-[#5B4DEB]" /> AI writing assistant
          </h3>
          <p className="mt-0.5 text-[12px] text-mutedink">
            Suggestions only. Review and edit before anything is sent.
          </p>
        </div>
        <button type="button" onClick={onClose} className="icon-btn h-7 w-7" aria-label="Close assistant">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {MODES.map((entry) => (
          <button
            key={entry.key}
            type="button"
            onClick={() => setMode(entry.key)}
            className={`rounded-md px-2 py-1 text-[12px] font-medium ${
              mode === entry.key ? 'bg-navy text-white' : 'bg-white text-mutedink hover:text-ink'
            }`}
          >
            {entry.label}
          </button>
        ))}
      </div>

      {mode === 'draft' && (
        <label className="mt-2 flex flex-wrap items-center gap-2 text-[13px] text-mutedink">
          Recipient
          <select
            value={audience}
            onChange={(event) => setAudience(event.target.value)}
            className="rounded-md border border-line bg-white px-2 py-1 text-[13px]"
          >
            {AUDIENCES.map((entry) => (
              <option key={entry.value} value={entry.value}>{entry.label}</option>
            ))}
          </select>
        </label>
      )}

      {mode === 'translate' && (
        <label className="mt-2 flex flex-wrap items-center gap-2 text-[13px] text-mutedink">
          Language
          <input
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            placeholder="French, Arabic, Russian…"
            className="min-w-[140px] flex-1 rounded-md border border-line px-2 py-1 text-[13px]"
          />
        </label>
      )}

      {mode !== 'summarise' && (
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={3}
          placeholder={mode === 'draft' ? 'What do you need to say?' : 'Paste or write the message above'}
          className="mt-2 w-full resize-y rounded-lg border border-line bg-white px-3 py-2 text-[14px] outline-none focus:border-brand"
        />
      )}

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button type="button" onClick={run} disabled={state.loading} className="btn-primary btn-sm">
          {state.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {state.loading ? 'Thinking…' : 'Ask assistant'}
        </button>
        {!!draftText && mode !== 'summarise' && (
          <button type="button" onClick={() => setText(draftText)} className="btn-quiet btn-sm">
            Use composer text
          </button>
        )}
      </div>

      {state.error && <p className="mt-2 text-[13px] text-[#A23B3B]">{state.error}</p>}

      {!!state.suggestion && (
        <div className="mt-2 rounded-lg border border-[#DDD8FB] bg-white p-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5B4DEB]">
            AI suggestion · not sent
          </p>
          <p className="mt-1 whitespace-pre-wrap text-[14px] leading-[1.55] text-ink">{state.suggestion}</p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => onInsert(state.suggestion)}
              className="btn-primary btn-sm"
            >
              Insert into composer
            </button>
            <button type="button" onClick={copy} className="btn-quiet btn-sm">
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              type="button"
              onClick={() => setState({ loading: false, suggestion: '', error: '' })}
              className="btn-quiet btn-sm"
            >
              Discard
            </button>
          </div>
        </div>
      )}
    </section>
  );
}