import { READER_LANGUAGES, languageLabel } from '@/lib/materialTranslation';

/**
 * The reader's language controls: the detected original language and the
 * language the student explicitly chooses to translate into. Nothing is
 * translated until a target different from the source is confirmed.
 */
export default function ReaderLanguageBar({
  source,
  sourceDetection,
  target,
  onSource,
  onTarget,
  started,
  busy,
  sourceKnown,
  sameLanguage,
  canTranslate,
  onTranslate,
  cachedLanguages,
}) {
  const sourceLabel = languageLabel(source);
  const targetLabel = languageLabel(target);
  const cached = cachedLanguages.includes(target) && target !== source;

  const notice = !sourceKnown
    ? 'Select the language of the original material so the translation can be checked against it.'
    : sameLanguage
      ? `The original material is already in ${sourceLabel}. Please select another language.`
      : '';

  return (
    <div className="border-b border-line bg-white px-3 py-2 sm:px-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-[12px] font-semibold uppercase tracking-[0.06em] text-mutedink">
            Original
          </span>
          {sourceKnown ? (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-canvas px-2 py-1.5 text-[13px] font-medium text-ink">
              {sourceLabel}
              <span className="text-[11px] font-normal text-mutedink">
                {sourceDetection === 'manual' ? 'selected' : 'detected'}
              </span>
            </span>
          ) : (
            <select
              value=""
              onChange={(event) => onSource(event.target.value)}
              className="w-full rounded-lg border border-warning/50 bg-gold-light px-2 py-1.5 text-[13px] text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 sm:w-auto"
              aria-label="Original language"
            >
              <option value="">Select source language</option>
              {READER_LANGUAGES.map((language) => (
                <option key={language.code} value={language.code}>
                  {language.label}
                </option>
              ))}
            </select>
          )}
        </div>

        <span className="hidden pb-2 text-[13px] text-mutedink sm:inline">→</span>

        <label className="flex min-w-0 flex-col gap-1">
          <span className="text-[12px] font-semibold uppercase tracking-[0.06em] text-mutedink">
            Translate to
          </span>
          <select
            value={target || ''}
            onChange={(event) => onTarget(event.target.value)}
            disabled={busy}
            className="w-full rounded-lg border border-line bg-white px-2 py-1.5 text-[13px] font-medium text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 disabled:opacity-60 sm:w-auto"
            aria-label="Translation language"
          >
            {!target && <option value="">Choose a language</option>}
            {READER_LANGUAGES.map((language) => (
              <option key={language.code} value={language.code}>
                {language.native} · {language.label}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-2 sm:ms-auto">
          {cached && <span className="text-[12px] text-positive">Cached</span>}
          {!started ? (
            <button
              type="button"
              onClick={onTranslate}
              disabled={!canTranslate || busy}
              className="btn-primary btn-sm w-full disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {busy ? 'Translating…' : `Translate into ${targetLabel || 'a language'}`}
            </button>
          ) : (
            <span className="text-[12px] text-mutedink">
              {busy ? `Translating into ${targetLabel}…` : `Showing ${targetLabel}`}
            </span>
          )}
        </div>
      </div>

      {notice && (
        <p
          className={`mt-2 rounded-lg border px-2.5 py-1.5 text-[13px] ${
            sameLanguage
              ? 'border-warning/40 bg-gold-light text-[#8E6018]'
              : 'border-brand/30 bg-brand-soft text-brand-deep'
          }`}
        >
          {notice}
        </p>
      )}
    </div>
  );
}