import { AlertCircle, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';

const LABELS = {
  pending: 'Queued for translation',
  translating: 'Translating',
  complete: 'Translation complete',
  outdated: 'Source material changed',
  failed: 'Translation stopped',
  unsupported: 'Not readable as text',
};

// One status line for the whole reader: what the engine is doing, how far it
// has got, and the single action available when something went wrong.
export default function TranslationStatusBanner({
  status,
  chunkDone = 0,
  chunkTotal = 0,
  error,
  note,
  busy,
  onRegenerate,
}) {
  if (status === 'complete' && !error) {
    return (
      <div className="flex items-center gap-2 border-b border-line bg-[#F2F9F5] px-4 py-2 text-[13px] text-[#1D7A50] sm:px-5">
        <CheckCircle2 className="h-3.5 w-3.5" />
        {LABELS.complete} · {chunkDone} of {chunkTotal} sections of work cached for this material
      </div>
    );
  }

  if (status === 'unsupported') {
    return (
      <div className="flex items-start gap-2 border-b border-line bg-canvas px-4 py-2 text-[13px] text-mutedink sm:px-5">
        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>{note || 'This material cannot be read as text, so it has no translation. The original file is still available.'}</span>
      </div>
    );
  }

  if (status === 'failed' || status === 'outdated') {
    return (
      <div className="flex flex-col gap-2 border-b border-line bg-[#FDF4F4] px-4 py-2 text-[13px] text-[#A23B3B] sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <span className="flex items-start gap-2">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            {status === 'outdated'
              ? 'The professor updated this material. The stored translation belongs to the previous version.'
              : error || 'The translation could not be completed.'}
          </span>
        </span>
        <button
          type="button"
          onClick={onRegenerate}
          disabled={busy}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#E7C9C9] bg-white px-2.5 py-1 text-[13px] font-medium text-[#A23B3B] hover:bg-[#FDF4F4] disabled:opacity-60"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          {busy ? 'Restarting…' : status === 'outdated' ? 'Regenerate translation' : 'Try again'}
        </button>
      </div>
    );
  }

  const percent = chunkTotal ? Math.round((chunkDone / chunkTotal) * 100) : 0;
  return (
    <div className="border-b border-line bg-white px-4 py-2 sm:px-5">
      <div className="flex items-center justify-between gap-2 text-[13px] text-mutedink">
        <span className="flex items-center gap-1.5">
          <Loader2 className={`h-3.5 w-3.5 ${busy ? 'animate-spin' : ''}`} />
          {LABELS[status] || 'Preparing'} · {chunkDone} of {chunkTotal || '—'} sections
        </span>
        <span className="tabular-nums">{percent}%</span>
      </div>
      <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-canvas">
        <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}