import { Search } from 'lucide-react';
import { READER_LANGUAGES, languageLabel } from '@/lib/materialTranslation';

const MODES = [
  ['both', 'Both'],
  ['original', 'Original'],
  ['translation', 'Translation'],
];

export default function ReaderToolbar({
  mode,
  onMode,
  target,
  onTarget,
  source,
  sync,
  onSync,
  search,
  onSearch,
  matchCount,
  onClose,
  translateBusy,
}) {
  return (
    <div className="flex flex-col gap-2 border-b border-line bg-white px-3 py-2 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-lg border border-line p-0.5" role="group" aria-label="Reader view">
          {MODES.map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => onMode(value)}
              aria-pressed={mode === value}
              className={`rounded-md px-2.5 py-1 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${
                mode === value ? 'bg-navy text-white' : 'text-mutedink hover:bg-canvas hover:text-ink'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-1.5 text-[13px] text-mutedink">
          <span className="hidden sm:inline">Translate into</span>
          <select
            value={target}
            onChange={(event) => onTarget(event.target.value)}
            disabled={translateBusy}
            className="rounded-lg border border-line bg-white px-2 py-1 text-[13px] text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 disabled:opacity-60"
            aria-label="Translation language"
          >
            {READER_LANGUAGES.map((language) => (
              <option key={language.code} value={language.code}>
                {language.native} · {language.label}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={onSync}
          aria-pressed={sync}
          className={`hidden items-center gap-1 rounded-lg border px-2.5 py-1 text-[13px] font-medium transition-colors lg:inline-flex ${
            sync ? 'border-brand/30 bg-brand-soft text-brand-deep' : 'border-line text-mutedink hover:bg-canvas'
          }`}
          title="Keep both panels aligned on the same section"
        >
          Synced scroll: {sync ? 'on' : 'off'}
        </button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 sm:w-64 sm:flex-none">
          <Search className="pointer-events-none absolute start-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-mutedink" />
          <input
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Search in document"
            aria-label="Search in document"
            className="w-full rounded-lg border border-line bg-white py-1.5 pe-2 ps-8 text-[13px] text-ink placeholder:text-mutedink/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25"
          />
        </div>
        {search ? (
          <span className="whitespace-nowrap text-[13px] text-mutedink">{matchCount} matching</span>
        ) : (
          <span className="hidden shrink-0 text-[13px] text-mutedink lg:inline">
            {source ? `Source: ${languageLabel(source)}` : ''}
          </span>
        )}
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-line px-2.5 py-1 text-[13px] font-medium text-ink hover:bg-canvas lg:hidden"
        >
          Close
        </button>
      </div>
    </div>
  );
}