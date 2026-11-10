import { useRef } from 'react';
import { Check, ChevronDown, Languages, Loader2 } from 'lucide-react';
import { READER_LANGUAGES, languageLabel } from '@/lib/materialTranslation';

/**
 * The reader's language controls. The detected original language and the chosen
 * target language are two separate, clearly labelled fields so they can never be
 * confused, and the single action that starts work is the red Translate Material
 * button. Nothing is translated until a target different from the source is
 * confirmed.
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
  complete,
  percent = 0,
}) {
  const selectRef = useRef(null);
  const sourceLabel = languageLabel(source);
  const targetLabel = languageLabel(target);
  const cached = (cachedLanguages || []).includes(target) && target !== source;

  const notice = !sourceKnown
    ? 'Select the language of the original material so the translation can be checked against it.'
    : sameLanguage
      ? `The original material is already in ${sourceLabel}. Please select another language.`
      : '';

  const focusLanguage = () => {
    selectRef.current?.focus();
    selectRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  };

  return (
    <div className="border-b border-line bg-white px-3 py-3 sm:px-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
        <div className="flex flex-col gap-1 sm:w-44">
          <span className="text-[12px] font-semibold uppercase tracking-[0.07em] text-mutedink">Original</span>
          {sourceKnown ? (
            <div className="flex h-11 items-center justify-between gap-2 rounded-xl border border-line bg-canvas px-3">
              <span className="truncate text-[15px] font-semibold text-ink">{sourceLabel}</span>
              <span className="shrink-0 text-[12px] font-normal text-mutedink">
                {sourceDetection === 'manual' ? 'selected' : 'detected'}
              </span>
            </div>
          ) : (
            <select
              value=""
              onChange={(event) => onSource(event.target.value)}
              aria-label="Original language"
              className="h-11 w-full rounded-xl border-2 border-welcome-red/40 bg-[#FDF4F4] px-3 text-[15px] font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-welcome-red/30"
            >
              <option value="">Select language</option>
              {READER_LANGUAGES.map((language) => (
                <option key={language.code} value={language.code}>
                  {language.label}
                </option>
              ))}
            </select>
          )}
        </div>

        <Languages className="hidden h-5 w-5 shrink-0 self-center text-mutedink sm:block" aria-hidden="true" />

        <label className="flex flex-col gap-1 sm:w-56">
          <span className="text-[12px] font-semibold uppercase tracking-[0.07em] text-brand-deep">Translate to</span>
          <div className="relative">
            <select
              ref={selectRef}
              value={target || ''}
              onChange={(event) => onTarget(event.target.value)}
              disabled={busy}
              aria-label="Translation language"
              className="h-11 w-full appearance-none rounded-xl border-2 border-brand/50 bg-brand-soft px-3 pe-9 text-[15px] font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 disabled:opacity-60"
            >
              {!target && <option value="">Choose a language</option>}
              {READER_LANGUAGES.map((language) => (
                <option key={language.code} value={language.code}>
                  {language.native} · {language.label}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-deep"
              aria-hidden="true"
            />
          </div>
        </label>

        <div className="flex flex-wrap items-center gap-2 sm:ms-auto">
          {cached && !complete && (
            <span className="inline-flex h-7 items-center rounded-md bg-[#EDF1FE] px-2 text-[12.5px] font-semibold text-brand-deep">
              Cached
            </span>
          )}

          {complete ? (
            <>
              <span className="inline-flex h-11 items-center gap-1.5 rounded-xl bg-[#E9F5EF] px-3 text-[14px] font-semibold text-[#1D7A50]">
                <Check className="h-4 w-4" aria-hidden="true" />
                Translation Ready
              </span>
              <button type="button" onClick={focusLanguage} className="btn-quiet h-11 px-3.5 text-[14px]">
                Change Language
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onTranslate}
              disabled={!canTranslate || busy || started}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-welcome-red px-5 text-[15px] font-semibold text-white shadow-sm transition-colors hover:bg-welcome-redDeep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-welcome-red/40 focus-visible:ring-offset-2 active:bg-welcome-redDeep disabled:cursor-not-allowed disabled:bg-welcome-red/50 sm:w-auto"
            >
              {started ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  {percent ? `Translating ${percent}%` : 'Translating material…'}
                </>
              ) : (
                <>
                  <Languages className="h-4 w-4" aria-hidden="true" />
                  Translate Material
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {!complete && started && targetLabel && !notice && (
        <p className="mt-2 text-[13px] text-mutedink">
          Translating into {targetLabel}. Finished sections appear as they arrive.
        </p>
      )}

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