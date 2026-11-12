import { useMemo, useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { countWords, MAX_CHARS, MIN_WORDS } from '@/lib/integrity/api';
import { useI18n } from '@/i18n/I18nProvider';

const ACCEPTED = ['.txt', '.md', '.csv', '.json'];
const MAX_FILE_BYTES = 1000000;

const field =
  'w-full rounded-lg border border-line bg-white px-3 py-2 text-[15px] text-ink placeholder:text-mutedink/70 focus:border-brand/50 focus:outline-none focus:ring-2 focus:ring-brand/20';

function readTextFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('unreadable'));
    reader.readAsText(file);
  });
}

function EngineOption({ engine, checked, onChange, busy }) {
  const { t } = useI18n();
  const configured = engine.configured === true;
  return (
    <label className={cn('flex items-start gap-2.5', (!configured || busy) && 'opacity-90')}>
      <input
        type="checkbox"
        checked={configured && checked}
        disabled={!configured || busy}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-line accent-brand"
      />
      <span className="min-w-0">
        <span className="block text-[13.5px] font-medium text-ink">
          {engine.label}
          {configured && engine.selectedProvider ? ` · ${engine.selectedProvider.label}` : ''}
        </span>
        <span className="mt-0.5 block text-[12.5px] leading-[1.5] text-mutedink">
          {configured
            ? engine.description
            : `${t('integrity.engines.notConfigured')}${
                engine.waitingFor && engine.waitingFor.length
                  ? t('integrity.form.awaitingSuffix', { names: engine.waitingFor.join(', ') })
                  : ''
              }`}
        </span>
      </span>
    </label>
  );
}

export default function AnalysisForm({ onAnalyze, busy, error, engines }) {
  const { t } = useI18n();
  const [title, setTitle] = useState('');
  const [reference, setReference] = useState('');
  const [text, setText] = useState('');
  const [external, setExternal] = useState(false);
  const [aiDetection, setAiDetection] = useState(false);
  const [consent, setConsent] = useState(false);
  const [fileError, setFileError] = useState('');
  const fileRef = useRef(null);

  const words = useMemo(() => countWords(text), [text]);
  const tooLong = text.length > MAX_CHARS;
  const engineList = Array.isArray(engines) ? engines : [];
  const externalEngine = engineList.find((row) => row.id === 'plagiarism');
  const aiEngine = engineList.find((row) => row.id === 'ai_detection');
  const usesExternal = external && Boolean(externalEngine?.configured);
  const usesDetector = aiDetection && Boolean(aiEngine?.configured);
  const sendsText = usesExternal || usesDetector;
  const providerNames = [
    usesExternal && externalEngine?.selectedProvider?.label,
    usesDetector && aiEngine?.selectedProvider?.label,
  ].filter(Boolean);

  const needsConsent = sendsText && !consent;
  const ready = Boolean(title.trim()) && words >= MIN_WORDS && !tooLong && !needsConsent;
  const canSubmit = ready && !busy;

  const reset = () => {
    setTitle('');
    setReference('');
    setText('');
    setFileError('');
    setExternal(false);
    setAiDetection(false);
    setConsent(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleFile = async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    setFileError('');
    const name = file.name.toLowerCase();
    if (!ACCEPTED.some((extension) => name.endsWith(extension))) {
      setFileError(t('integrity.form.fileFormat'));
      event.target.value = '';
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setFileError(t('integrity.form.fileSize'));
      event.target.value = '';
      return;
    }
    try {
      const value = await readTextFile(file);
      setText(value);
      if (!title.trim()) setTitle(file.name.replace(/\.[^.]+$/, ''));
    } catch (caught) {
      setFileError(caught.message === 'unreadable' ? t('integrity.form.fileUnreadable') : caught.message);
    }
  };

  const submit = (event) => {
    event.preventDefault();
    if (!canSubmit) return;
    onAnalyze({
      title: title.trim(),
      student_reference: reference.trim(),
      text,
      external_similarity: usesExternal,
      ai_detection: usesDetector,
      consent,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-3.5">
      <div className="grid gap-3 md:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-[13.5px] font-medium text-ink">{t('integrity.form.titleLabel')}</span>
          <input
            type="text"
            value={title}
            maxLength={180}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={t('integrity.form.titlePlaceholder')}
            className={field}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[13.5px] font-medium text-ink">
            {t('integrity.form.referenceLabel')}{' '}
            <span className="font-normal text-mutedink">{t('integrity.form.optional')}</span>
          </span>
          <input
            type="text"
            value={reference}
            maxLength={180}
            onChange={(event) => setReference(event.target.value)}
            placeholder={t('integrity.form.referencePlaceholder')}
            className={field}
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-[13.5px] font-medium text-ink">{t('integrity.form.textLabel')}</span>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={10}
          placeholder={t('integrity.form.textPlaceholder')}
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
            {t('integrity.form.upload')}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".txt,.md,.csv,.json,text/plain,text/markdown,text/csv,application/json"
            onChange={handleFile}
            className="hidden"
          />
          <span className="text-[12.5px] text-mutedink">{t('integrity.form.fileHint')}</span>
        </div>
        <div className="flex items-center gap-3 text-[12.5px] text-mutedink">
          <span className={cn(words >= MIN_WORDS ? 'text-ink' : 'text-warning')}>
            {t(words === 1 ? 'integrity.form.wordOne' : 'integrity.form.wordMany', {
              count: words.toLocaleString(),
            })}
          </span>
          <span>{t('integrity.form.minimum', { count: MIN_WORDS })}</span>
          {tooLong && <span className="text-critical">{t('integrity.form.overLimit')}</span>}
        </div>
      </div>

      <div className="space-y-2.5 rounded-lg border border-line bg-canvas px-3 py-2.5">
        <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-mutedink">
          {t('integrity.form.enginesHeading')}
        </p>

        <label className="flex items-start gap-2.5">
          <input type="checkbox" checked readOnly disabled className="mt-0.5 h-4 w-4 rounded border-line accent-brand" />
          <span className="min-w-0">
            <span className="block text-[13.5px] font-medium text-ink">{t('integrity.form.internalLabel')}</span>
            <span className="mt-0.5 block text-[12.5px] leading-[1.5] text-mutedink">
              {t('integrity.form.internalBody')}
            </span>
          </span>
        </label>

        {externalEngine && (
          <EngineOption
            engine={externalEngine}
            checked={external}
            busy={busy}
            onChange={(value) => {
              setExternal(value);
              if (!value && !aiDetection) setConsent(false);
            }}
          />
        )}

        {aiEngine && (
          <EngineOption
            engine={aiEngine}
            checked={aiDetection}
            busy={busy}
            onChange={(value) => {
              setAiDetection(value);
              if (!value && !external) setConsent(false);
            }}
          />
        )}

        {sendsText && (
          <label className="flex items-start gap-2.5 border-t border-line pt-2.5">
            <input
              type="checkbox"
              checked={consent}
              disabled={busy}
              onChange={(event) => setConsent(event.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-line accent-brand"
            />
            <span className="min-w-0 text-[12.5px] leading-[1.55] text-ink">
              {t('integrity.form.consent', { providers: providerNames.join(t('integrity.form.consentJoin')) })}
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
          {busy ? t('integrity.form.submitBusy') : t('integrity.form.submit')}
        </button>
        <button type="button" onClick={reset} disabled={busy} className="btn-quiet">
          {t('integrity.form.clear')}
        </button>
      </div>
    </form>
  );
}