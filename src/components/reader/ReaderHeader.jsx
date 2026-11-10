import { ArrowLeft, Download, FileDown, X } from 'lucide-react';
import StatusChip from '@/components/shell/StatusChip';
import { languageLabel } from '@/lib/materialTranslation';

const TONE = {
  complete: ['positive', 'Translated'],
  translating: ['brand', 'Translating'],
  pending: ['neutral', 'Queued'],
  outdated: ['warning', 'Source updated'],
  failed: ['critical', 'Failed'],
  unsupported: ['neutral', 'No text'],
};

export default function ReaderHeader({
  material,
  status,
  source,
  target,
  onClose,
  onDownloadOriginal,
  onDownloadTranslation,
  canDownloadTranslation,
}) {
  const [tone, label] = TONE[status] || TONE.pending;

  return (
    <header className="border-b border-line bg-white">
      <div className="flex items-center justify-between gap-2 border-b border-line/70 px-3 py-1.5 sm:px-5">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1.5 rounded-lg px-1.5 py-1 text-[13px] font-medium text-mutedink transition-colors hover:bg-canvas hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
        >
          <ArrowLeft className="h-4 w-4 dir-icon" />
          Back to course workspace
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close reader"
          className="icon-btn h-8 w-8"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-col gap-2 px-3 py-2.5 sm:flex-row sm:items-start sm:justify-between sm:px-5">
        <div className="min-w-0">
          <p className="eyebrow">
            {material?.course_code} · {String(material?.type || 'resource').replace(/_/g, ' ')}
            {material?.scope === 'professor' ? ' · professor preview' : ''}
          </p>
          <h1 className="mt-1 truncate text-[length:var(--type-section)] font-semibold leading-tight text-ink">
            {material?.resource_title}
          </h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <StatusChip tone="neutral">{languageLabel(source)}</StatusChip>
            <span className="text-[13px] text-mutedink">→</span>
            <StatusChip tone="brand">{languageLabel(target)}</StatusChip>
            <StatusChip tone={tone}>{label}</StatusChip>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-1.5">
          <button type="button" onClick={onDownloadOriginal} className="btn-quiet btn-sm">
            <Download className="h-3.5 w-3.5" />
            Original
          </button>
          <button
            type="button"
            onClick={onDownloadTranslation}
            disabled={!canDownloadTranslation}
            className="btn-quiet btn-sm disabled:cursor-not-allowed disabled:opacity-50"
            title={canDownloadTranslation ? 'Download the aligned translation as text' : 'Available once translated'}
          >
            <FileDown className="h-3.5 w-3.5" />
            Translation
          </button>
        </div>
      </div>
    </header>
  );
}