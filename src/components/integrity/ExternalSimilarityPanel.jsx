import { useEffect, useState } from 'react';
import { ExternalLink, Globe, Loader2, RefreshCw, ShieldAlert } from 'lucide-react';
import StatusChip from '@/components/shell/StatusChip';

const STATUS_CHIP = {
  skipped: { tone: 'neutral', label: 'Not run' },
  pending: { tone: 'neutral', label: 'Submitted' },
  processing: { tone: 'brand', label: 'Processing at provider' },
  completed: { tone: 'positive', label: 'Report received' },
  failed: { tone: 'critical', label: 'Scan failed' },
  unavailable: { tone: 'warning', label: 'Engine not configured' },
};

const percent = (value) => (typeof value === 'number' ? `${value.toFixed(1)}%` : 'not reported');

const SOURCE_TYPES = {
  internet: 'Internet',
  database: 'Provider database',
  repositories: 'Repositories',
  batch: 'Batch submission',
  custom: 'Custom',
};

function SourceRow({ source }) {
  return (
    <li className="px-3 py-2.5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="break-words text-[13.5px] font-medium text-ink">
            {source.url ? (
              <a
                href={source.url}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1 text-brand hover:text-[#3B5AE0]"
              >
                {source.title || source.url}
                <ExternalLink className="h-3 w-3 shrink-0" strokeWidth={2} />
              </a>
            ) : (
              source.title || 'Source not named by the provider'
            )}
          </p>
          {source.introduction && (
            <p className="mt-1 border-s-2 border-line ps-2 text-[12.5px] leading-[1.55] text-mutedink">
              {source.introduction}
            </p>
          )}
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-1.5">
          <StatusChip tone="neutral">{SOURCE_TYPES[source.type] || source.type}</StatusChip>
          {typeof source.matched_words === 'number' && (
            <StatusChip tone="brand">{source.matched_words.toLocaleString()} matched words</StatusChip>
          )}
        </div>
      </div>
    </li>
  );
}

/**
 * External similarity, exactly as the provider reported it. When the engine is
 * not configured nothing is estimated: the capability is shown as unavailable.
 */
export default function ExternalSimilarityPanel({ record, onRefresh, busy }) {
  const [polling, setPolling] = useState(false);
  const status = record?.external_status || 'skipped';
  const chip = STATUS_CHIP[status] || STATUS_CHIP.skipped;
  const sources = Array.isArray(record?.external_sources) ? record.external_sources : [];
  const inFlight = status === 'pending' || status === 'processing';

  useEffect(() => {
    setPolling(false);
  }, [record?.id, status]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EDF1FE] text-brand">
          <Globe className="h-4 w-4" strokeWidth={1.9} />
        </span>
        <StatusChip tone={chip.tone}>{chip.label}</StatusChip>
        {record?.external_provider_label && <StatusChip tone="neutral">{record.external_provider_label}</StatusChip>}
        {record?.external_mode === 'sandbox' && <StatusChip tone="warning">Sandbox — simulated provider result</StatusChip>}
      </div>

      {status === 'skipped' && (
        <p className="text-[13.5px] leading-[1.6] text-mutedink">
          No external similarity scan was requested for this submission. The internal check below compares the text only
          with submissions already analysed in this workspace.
        </p>
      )}

      {status === 'unavailable' && (
        <div className="rounded-lg border border-[#EBD9B4] bg-[#FCF7EA] px-3 py-2.5">
          <p className="text-[13px] font-semibold text-[#8E6018]">DETECTION ENGINE NOT CONFIGURED</p>
          <p className="mt-1 text-[13px] leading-[1.6] text-ink">
            {record?.external_error ||
              'No external similarity provider is configured, so no internet, publisher or repository search was performed.'}
          </p>
          <p className="mt-1 text-[12.5px] leading-[1.55] text-mutedink">
            This report therefore contains an internal comparison only. It is not a plagiarism check of published work.
          </p>
        </div>
      )}

      {status === 'failed' && (
        <p className="rounded-lg border border-[#F3D6D6] bg-[#FBECEC] px-3 py-2 text-[13.5px] text-[#A23B3B]">
          {record?.external_error || 'The provider scan failed.'}
        </p>
      )}

      {inFlight && (
        <div className="rounded-lg border border-line bg-canvas px-3 py-2.5">
          <p className="flex items-center gap-1.5 text-[13.5px] font-medium text-ink">
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
            The provider is analysing this submission.
          </p>
          <p className="mt-1 text-[12.5px] leading-[1.55] text-mutedink">
            Similarity scans run asynchronously. The report updates when the provider posts its completed result back to
            this app — usually within a minute or two.
          </p>
          {record?.external_error && (
            <p className="mt-1.5 rounded-md bg-[#FCF7EA] px-2 py-1 text-[12.5px] text-[#8E6018]">{record.external_error}</p>
          )}
          {onRefresh && (
            <button
              type="button"
              className="btn-quiet btn-sm mt-2"
              disabled={busy || polling}
              onClick={async () => {
                setPolling(true);
                try {
                  await onRefresh();
                } finally {
                  setPolling(false);
                }
              }}
            >
              <RefreshCw className={`h-4 w-4 ${polling ? 'animate-spin' : ''}`} strokeWidth={1.9} />
              Check for the provider report
            </button>
          )}
        </div>
      )}

      {status === 'completed' && (
        <>
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="rounded-lg border border-line bg-white px-3 py-2.5">
              <p className="text-[12px] uppercase tracking-[0.05em] text-mutedink">Provider similarity score</p>
              <p className="mt-0.5 text-[19px] font-semibold text-ink">
                {percent(record?.external_similarity_percent)}
              </p>
            </div>
            <div className="rounded-lg border border-line bg-white px-3 py-2.5">
              <p className="text-[12px] uppercase tracking-[0.05em] text-mutedink">Sources reported</p>
              <p className="mt-0.5 text-[19px] font-semibold text-ink">{sources.length}</p>
            </div>
            <div className="rounded-lg border border-line bg-white px-3 py-2.5">
              <p className="text-[12px] uppercase tracking-[0.05em] text-mutedink">Words / credits</p>
              <p className="mt-0.5 text-[19px] font-semibold text-ink">
                {typeof record?.external_words === 'number' ? record.external_words.toLocaleString() : '—'}
                <span className="text-[13px] font-normal text-mutedink">
                  {' / '}
                  {typeof record?.external_credits === 'number' ? record.external_credits : '—'}
                </span>
              </p>
            </div>
          </div>

          <p className="text-[12.5px] leading-[1.55] text-mutedink">
            Score returned by {record?.external_provider_label || 'the provider'} for this document. It counts matching
            words, including correctly quoted and cited material, so it measures similarity — not misconduct. Read the
            matched sources before drawing any conclusion.
          </p>

          {sources.length > 0 ? (
            <div>
              <h3 className="mb-2 text-[13px] font-semibold uppercase tracking-[0.06em] text-mutedink">
                Matched sources reported by the provider
              </h3>
              <ul className="divide-y divide-line rounded-lg border border-line">
                {sources.map((source, index) => (
                  <SourceRow key={`${source.result_id || source.url || index}`} source={source} />
                ))}
              </ul>
              <p className="mt-2 text-[12.5px] leading-[1.55] text-mutedink">
                Passage-level highlighting of external matches lives in the provider’s own report: open the source, or
                the provider dashboard, with the scan identifier{' '}
                <code className="rounded bg-canvas px-1 py-0.5 font-mono text-[11.5px] text-ink">
                  {record?.external_scan_id || 'not recorded'}
                </code>
                .
              </p>
            </div>
          ) : (
            <p className="text-[13px] text-mutedink">
              The provider returned a score but no source list, so no matched source can be shown here.
            </p>
          )}
        </>
      )}

      <div className="rounded-lg border border-line bg-white px-3 py-2.5">
        <p className="flex items-center gap-1.5 text-[13px] font-semibold text-ink">
          <ShieldAlert className="h-4 w-4 text-warning" strokeWidth={1.9} />
          How to read an external similarity score
        </p>
        <ul className="mt-1.5 space-y-1 text-[12.5px] leading-[1.55] text-mutedink">
          <li>Similarity is not plagiarism. A high score can come from correct quotations, a shared bibliography or standard method wording.</li>
          <li>Coverage depends on the provider’s index: paywalled books, closed repositories and unpublished work may not be searched.</li>
          <li>Every score needs a human reading of the matched passages before it means anything.</li>
        </ul>
      </div>
    </div>
  );
}