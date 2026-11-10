import { useMemo, useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { countWords, MAX_CHARS, MIN_WORDS } from '@/lib/integrity/api';

const ACCEPTED = ['.txt', '.md', '.csv', '.json'];
const MAX_FILE_BYTES = 1000000;

const field =
  'w-full rounded-lg border border-line bg-white px-3 py-2 text-[15px] text-ink placeholder:text-mutedink/70 focus:border-brand/50 focus:outline-none focus:ring-2 focus:ring-brand/20';

function readTextFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('That file could not be read.'));
    reader.readAsText(file);
  });
}

export default function AnalysisForm({ onAnalyze, busy, error }) {
  const [title, setTitle] = useState('');
  const [reference, setReference] = useState('');
  const [text, setText] = useState('');
  const [screening, setScreening] = useState(false);
  const [consent, setConsent] = useState(false);
  const [fileError, setFileError] = useState('');
  const fileRef = useRef(null);

  const words = useMemo(() => countWords(text), [text]);
  const tooLong = text.length > MAX_CHARS;
  const needsConsent = screening && !consent;
  const ready = Boolean(title.trim()) && words >= MIN_WORDS && !tooLong && !needsConsent;
  const canSubmit = ready && !busy;

  const reset = () => {
    setTitle('');
    setReference('');
    setText('');
    setFileError('');
    setScreening(false);
    setConsent(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleFile = async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    setFileError('');
    const name = file.name.toLowerCase();
    if (!ACCEPTED.some((extension) => name.endsWith(extension))) {
      setFileError(
        'Supported formats are .txt, .md, .csv and .json. PDF and Word files are not extracted — paste the text instead.',
      );
      event.target.value = '';
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setFileError('That file is larger than 1 MB. Paste the text instead.');
      event.target.value = '';
      return;
    }
    try {
      const value = await readTextFile(file);
      setText(value);
      if (!title.trim()) setTitle(file.name.replace(/\.[^.]+$/, ''));
    } catch (caught) {
      setFileError(caught.message);
    }
  };

  const submit = (event) => {
    event.preventDefault();
    if (!canSubmit) return;
    onAnalyze({
      title: title.trim(),
      student_reference: reference.trim(),
      text,
      ai_screening: screening,
      ai_consent: consent,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-3.5">
      <div className="grid gap-3 md:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-[13.5px] font-medium text-ink">Submission title</span>
          <input
            type="text"
            value={title}
            maxLength={180}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Essay 2 — Sovereignty in the 21st century"
            className={field}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[13.5px] font-medium text-ink">
            Student name or submission identifier <span className="font-normal text-mutedink">(optional)</span>
          </span>
          <input
            type="text"
            value={reference}
            maxLength={180}
            onChange={(event) => setReference(event.target.value)}
            placeholder="e.g. Ivanova A. / sub-2026-118"
            className={field}
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-[13.5px] font-medium text-ink">Submitted text</span>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={10}
          placeholder="Paste the academic text you want to analyse."
          className={cn(field, 'min-h-[190px] resize-y leading-[1.65]')}
        />
      </label>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="btn-quiet btn-sm"
            disabled={busy}
          >
            <Upload className="h-4 w-4" strokeWidth={1.9} />
            Upload a text file
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".txt,.md,.csv,.json,text/plain,text/markdown,text/csv,application/json"
            onChange={handleFile}
            className="hidden"
          />
          <span className="text-[12.5px] text-mutedink">.txt, .md, .csv, .json — up to 1 MB</span>
        </div>
        <div className="flex items-center gap-3 text-[12.5px] text-mutedink">
          <span className={cn(words >= MIN_WORDS ? 'text-ink' : 'text-warning')}>
            {words} {words === 1 ? 'word' : 'words'}
          </span>
          <span>minimum {MIN_WORDS}</span>
          {tooLong && <span className="text-critical">over the character limit</span>}
        </div>
      </div>

      <div className="rounded-lg border border-line bg-canvas px-3 py-2.5">
        <label className="flex items-start gap-2.5">
          <input
            type="checkbox"
            checked={screening}
            disabled={busy}
            onChange={(event) => {
              setScreening(event.target.checked);
              if (!event.target.checked) setConsent(false);
            }}
            className="mt-0.5 h-4 w-4 rounded border-line accent-brand"
          />
          <span className="min-w-0">
            <span className="block text-[13.5px] font-medium text-ink">Also run AI-writing screening</span>
            <span className="mt-0.5 block text-[12.5px] leading-[1.5] text-mutedink">
              Off by default. The similarity check never sends your text anywhere.
            </span>
          </span>
        </label>

        {screening && (
          <label className="mt-2.5 flex items-start gap-2.5 border-t border-line pt-2.5">
            <input
              type="checkbox"
              checked={consent}
              disabled={busy}
              onChange={(event) => setConsent(event.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-line accent-brand"
            />
            <span className="min-w-0 text-[12.5px] leading-[1.55] text-ink">
              I authorise sending this text to the platform’s language-model service for this screening step:{' '}
              <span className="font-medium">Base44 Core integration — InvokeLLM</span>. The excerpt is used only to
              produce the report below.
            </span>
          </label>
        )}
      </div>

      {(error || fileError) && (
        <p className="rounded-lg border border-[#F3D6D6] bg-[#FBECEC] px-3 py-2 text-[13.5px] text-[#A23B3B]">
          {error || fileError}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button type="submit" disabled={!canSubmit} className={cn('btn-primary', !canSubmit && 'opacity-60')}>
          {busy ? 'Analysing…' : 'Analyse submission'}
        </button>
        <button type="button" onClick={reset} disabled={busy} className="btn-quiet">
          Clear input
        </button>
      </div>
    </form>
  );
}