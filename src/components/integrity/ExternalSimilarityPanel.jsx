import { useEffect, useState } from 'react';
import { ExternalLink, Globe, Loader2, RefreshCw, ShieldAlert } from 'lucide-react';
import StatusChip from '@/components/shell/StatusChip';
import { useI18n } from '@/i18n/I18nProvider';

const STATUS_LABEL = {
  skipped: 'integrity.status.skipped',
  pending: 'integrity.status.pending',
  processing: 'integrity.status.processing',
  completed: 'integrity.status.completed',
  failed: 'integrity.status.failed',
  unavailable: 'integrity.status.unavailable',
};

const STATUS_TONE = {
  skipped: 'neutral',
  pending: 'neutral',
  processing: 'brand',
  completed: 'positive',
  failed: 'critical',
  unavailable: 'warning',
};

const SOURCE_TYPE_LABEL = {
  internet: 'integrity.external.sourceInternet',
  database: 'integrity.external.sourceDatabase',
  repositories: 'integrity.external.sourceRepositories',
  batch: 'integrity.external.sourceBatch',
  custom: 'integrity.external.sourceCustom',
};

function SourceRow({ source }) {
  const { t } = useI18n();
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
              source.title || t('integrity.external.sourceUnnamed')
            )}
          </p>
          {source.introduction && (
            <p className="mt-1 border-s-2 border-line ps-2 text-[12.5px] leading-[1.55] text-mutedink">
              {source.introduction}
            </p>
          )}
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-1.5">
          <StatusChip tone="neutral">
            {SOURCE_TYPE_LABEL[source.type] ? t(SOURCE_TYPE_LABEL[source.type]) : source.type}
          </StatusChip>
          {typeof source.matched_words === 'number' && (
            <StatusChip tone="brand">
              {t('integrity.external.matchedWords', { count: source.matched_words.toLocaleString() })}
            </StatusChip>
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
  const { t } = useI18n();
  const [polling, setPolling] = useState(false);
  const status = record?.external_status || 'skipped';
  const label = STATUS_LABEL[status] ? t(STATUS_LABEL[status]) : t('integrity.status.skipped');
  const tone = STATUS_TONE[status] || 'neutral';
  const sources = Array.isArray(record?.external_sources) ? record.external_sources : [];
  const inFlight = status === 'pending' || status === 'processing';
  const percent = (value) =>
    typeof value === 'number' ? `${value.toFixed(1)}%` : t('integrity.notReported');

  useEffect(() => {
    setPolling(false);
  }, [record?.id, status]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EDF1FE] text-brand">
          <Globe className="h-4 w-4" strokeWidth={1.9} />
        </span>
        <StatusChip tone={tone}>{label}</StatusChip>
        {record?.external_provider_label && <StatusChip tone="neutral">{record.external_provider_label}</StatusChip>}
        {record?.external_mode === 'sandbox' && (
          <StatusChip tone="warning">{t('integrity.sandbox.provider')}</StatusChip>
        )}
      </div>

      {status === 'skipped' && (
        <p className="text-[13.5px] leading-[1.6] text-mutedink">{t('integrity.external.skippedBody')}</p>
      )}

      {status === 'unavailable' && (
        <div className="rounded-lg border border-[#EBD9B4] bg-[#FCF7EA] px-3 py-2.5">
          <p className="text-[13px] font-semibold text-[#8E6018]">{t('integrity.engines.notConfigured')}</p>
          <p className="mt-1 text-[13px] leading-[1.6] text-ink">
            {record?.external_error || t('integrity.external.unavailableFallback')}
          </p>
          <p className="mt-1 text-[12.5px] leading-[1.55] text-mutedink">{t('integrity.external.unavailableNote')}</p>
        </div>
      )}

      {status === 'failed' && (
        <p className="rounded-lg border border-[#F3D6D6] bg-[#FBECEC] px-3 py-2 text-[13.5px] text-[#A23B3B]">
          {record?.external_error || t('integrity.external.failedFallback')}
        </p>
      )}

      {inFlight && (
        <div className="rounded-lg border border-line bg-canvas px-3 py-2.5">
          <p className="flex items-center gap-1.5 text-[13.5px] font-medium text-ink">
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
            {t('integrity.external.inFlightTitle')}
          </p>
          <p className="mt-1 text-[12.5px] leading-[1.55] text-mutedink">{t('integrity.external.inFlightBody')}</p>
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
              {t('integrity.external.check')}
            </button>
          )}
        </div>
      )}

      {status === 'completed' && (
        <>
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="rounded-lg border border-line bg-white px-3 py-2.5">
              <p className="text-[12px] uppercase tracking-[0.05em] text-mutedink">{t('integrity.external.tileScore')}</p>
              <p className="mt-0.5 text-[19px] font-semibold text-ink">
                {percent(record?.external_similarity_percent)}
              </p>
            </div>
            <div className="rounded-lg border border-line bg-white px-3 py-2.5">
              <p className="text-[12px] uppercase tracking-[0.05em] text-mutedink">{t('integrity.external.tileSources')}</p>
              <p className="mt-0.5 text-[19px] font-semibold text-ink">{sources.length}</p>
            </div>
            <div className="rounded-lg border border-line bg-white px-3 py-2.5">
              <p className="text-[12px] uppercase tracking-[0.05em] text-mutedink">{t('integrity.external.tileWords')}</p>
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
            {t('integrity.external.scoreNote', {
              provider: record?.external_provider_label || t('integrity.report.providerFallback'),
            })}
          </p>

          {sources.length > 0 ? (
            <div>
              <h3 className="mb-2 text-[13px] font-semibold uppercase tracking-[0.06em] text-mutedink">
                {t('integrity.external.sourcesTitle')}
              </h3>
              <ul className="divide-y divide-line rounded-lg border border-line">
                {sources.map((source, index) => (
                  <SourceRow key={`${source.result_id || source.url || index}`} source={source} />
                ))}
              </ul>
              <p className="mt-2 text-[12.5px] leading-[1.55] text-mutedink">
                {t('integrity.external.passageNoteBefore')}{' '}
                <code className="rounded bg-canvas px-1 py-0.5 font-mono text-[11.5px] text-ink">
                  {record?.external_scan_id || t('integrity.notReported')}
                </code>
                {t('integrity.external.passageNoteAfter')}
              </p>
            </div>
          ) : (
            <p className="text-[13px] text-mutedink">{t('integrity.external.noSources')}</p>
          )}
        </>
      )}

      <div className="rounded-lg border border-line bg-white px-3 py-2.5">
        <p className="flex items-center gap-1.5 text-[13px] font-semibold text-ink">
          <ShieldAlert className="h-4 w-4 text-warning" strokeWidth={1.9} />
          {t('integrity.external.howToTitle')}
        </p>
        <ul className="mt-1.5 space-y-1 text-[12.5px] leading-[1.55] text-mutedink">
          <li>{t('integrity.external.howTo1')}</li>
          <li>{t('integrity.external.howTo2')}</li>
          <li>{t('integrity.external.howTo3')}</li>
        </ul>
      </div>
    </div>
  );
}