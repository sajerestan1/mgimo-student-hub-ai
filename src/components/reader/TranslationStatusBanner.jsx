import { AlertCircle, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';

// One status line for the whole reader: what the engine is doing, how much of the
// document is really finished, and the single action available when something
// went wrong. Every number here is measured work, never a timer.
export default function TranslationStatusBanner({
  status,
  totalSections = 0,
  translatedSections = 0,
  failedSections = 0,
  error,
  note,
  busy,
  onRegenerate,
}) {
  const percent = totalSections ? Math.round((translatedSections / totalSections) * 100) : 0;

  if (status === 'complete') {
    return (
      <div className="flex flex-wrap items-center gap-2 border-b border-line bg-[#F2F9F5] px-4 py-2.5 text-[13.5px] font-medium text-[#1D7A50] sm:px-5">
        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
        <span>
          Translation complete · {translatedSections} of {totalSections} sections
        </span>
        <span className="ms-auto font-semibold tabular-nums">{percent}%</span>
      </div>
    );
  }

  if (status === 'unsupported') {
    return (
      <div className="flex items-start gap-2 border-b border-line bg-canvas px-4 py-2 text-[13px] text-mutedink sm:px-5">
        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>{note || 'This material cannot be read as text, so it has no translation. The original file is still available.'}</span>
      </div>
    );
  }

  if (status === 'failed' || status === 'outdated' || (error && !busy)) {
    return (
      <div className="flex flex-col gap-2 border-b border-line bg-[#FDF4F4] px-4 py-2.5 text-[13px] text-[#A23B3B] sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <span className="flex items-start gap-2">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>
            {status === 'outdated'
              ? 'The professor updated this material. The stored translation belongs to the previous version.'
              : error || 'The translation could not be completed.'}
            {totalSections > 0 && (
              <span className="ms-1 whitespace-nowrap font-medium">
                {translatedSections} of {totalSections} sections saved.
              </span>
            )}
          </span>
        </span>
        <button
          type="button"
          onClick={onRegenerate}
          disabled={busy}
          className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-lg border border-[#E7C9C9] bg-white px-2.5 py-1.5 text-[13px] font-medium text-[#A23B3B] hover:bg-[#FDF4F4] disabled:opacity-60 sm:self-auto"
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          {busy ? 'Restarting…' : status === 'outdated' ? 'Regenerate translation' : 'Try again'}
        </button>
      </div>
    );
  }

  return (
    <div className="border-b border-line bg-white px-4 py-2.5 sm:px-5">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[13.5px] text-ink">
        <span className="flex items-center gap-2">
          <Loader2 className={`h-4 w-4 text-brand ${busy ? 'animate-spin' : ''}`} aria-hidden="true" />
          <span className="font-medium">Translating material…</span>
          <span className="text-mutedink">
            {translatedSections} of {totalSections || '—'} sections completed
          </span>
        </span>
        <span className="flex items-center gap-2 tabular-nums">
          {failedSections > 0 && <span className="text-[#A23B3B]">{failedSections} not translated</span>}
          <span className="font-semibold">{percent}%</span>
        </span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-canvas">
        <div className="h-full rounded-full bg-brand transition-all duration-300" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}