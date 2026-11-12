import { useState } from 'react';
import { Check, Copy, Download } from 'lucide-react';
import Surface from '@/components/shell/Surface';
import StatusChip from '@/components/shell/StatusChip';
import SimilarityPanel from './SimilarityPanel';
import ExternalSimilarityPanel from './ExternalSimilarityPanel';
import AiDetectorPanel from './AiDetectorPanel';
import DocumentView from './DocumentView';
import { buildReportText, copyReport, downloadReport, formatAnalysisStamp } from '@/lib/integrity/report';
import { useI18n } from '@/i18n/I18nProvider';

const EXTERNAL_STATUS = {
  skipped: 'integrity.status.skipped',
  pending: 'integrity.status.pending',
  processing: 'integrity.status.processing',
  completed: 'integrity.status.completed',
  failed: 'integrity.status.failed',
  unavailable: 'integrity.status.unavailable',
};

const DETECTOR_STATUS = {
  skipped: 'integrity.status.skipped',
  completed: 'integrity.status.completed',
  failed: 'integrity.status.failed',
  unavailable: 'integrity.status.unavailable',
};

function SummaryTile({ code, title, value, tone, note }) {
  return (
    <div className="rounded-xl border border-line bg-white px-3 py-2.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-mutedink">
          {code} · {title}
        </p>
        <StatusChip tone={tone}>{value}</StatusChip>
      </div>
      <p className="mt-1 text-[12px] leading-[1.5] text-mutedink">{note}</p>
    </div>
  );
}

export default function IntegrityReport({ record, passages, onRefresh, busy }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState('');

  if (!record) return null;

  const externalStatus = record.external_status || 'skipped';
  const detectorStatus = record.detector_status || 'skipped';

  const externalTone =
    externalStatus === 'completed' ? 'positive' : externalStatus === 'failed' ? 'critical' : externalStatus === 'unavailable' ? 'warning' : 'neutral';
  const detectorTone =
    detectorStatus === 'completed' ? 'positive' : detectorStatus === 'failed' ? 'critical' : detectorStatus === 'unavailable' ? 'warning' : 'neutral';

  const externalLabel = EXTERNAL_STATUS[externalStatus] ? t(EXTERNAL_STATUS[externalStatus]) : externalStatus;
  const detectorLabel = DETECTOR_STATUS[detectorStatus] ? t(DETECTOR_STATUS[detectorStatus]) : detectorStatus;

  const handleCopy = async () => {
    setCopyError('');
    try {
      await copyReport(buildReportText(record));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopyError(t('integrity.report.copyError'));
    }
  };

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-mutedink">{t('integrity.report.eyebrow')}</p>
          <h2 className="mt-0.5 break-words text-[19px] font-semibold leading-tight text-ink">{record.title}</h2>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {record.student_reference && <StatusChip tone="neutral">{record.student_reference}</StatusChip>}
            <StatusChip tone="neutral">
              {t('integrity.words', { count: Number(record.word_count || 0).toLocaleString() })}
            </StatusChip>
            <StatusChip tone="brand">{formatAnalysisStamp(record.analyzed_at)}</StatusChip>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={handleCopy} className="btn-quiet btn-sm">
            {copied ? <Check className="h-4 w-4" strokeWidth={2} /> : <Copy className="h-4 w-4" strokeWidth={1.9} />}
            {copied ? t('integrity.report.copied') : t('integrity.report.copy')}
          </button>
          <button
            type="button"
            onClick={() => downloadReport(buildReportText(record), record.title)}
            className="btn-quiet btn-sm"
          >
            <Download className="h-4 w-4" strokeWidth={1.9} />
            {t('integrity.report.download')}
          </button>
        </div>
      </div>

      {copyError && <p className="mb-3 text-[13px] text-critical">{copyError}</p>}

      <div className="mb-4 grid gap-2 md:grid-cols-3">
        <SummaryTile
          code="A"
          title={t('integrity.report.aTitle')}
          value={externalLabel}
          tone={externalTone}
          note={
            externalStatus === 'completed'
              ? t('integrity.report.noteExternalCompleted', {
                  provider: record.external_provider_label || t('integrity.report.providerFallback'),
                  score: Number(record.external_similarity_percent || 0).toFixed(1),
                  count: (record.external_sources || []).length,
                })
              : externalStatus === 'unavailable'
                ? t('integrity.report.noteExternalUnavailable')
                : record.external_error || t('integrity.report.noteNotRequested')
          }
        />
        <SummaryTile
          code="B"
          title={t('integrity.report.bTitle')}
          value={`${Number(record.similarity_percent || 0).toFixed(1)}%`}
          tone="brand"
          note={t('integrity.report.noteInternal', { count: record.corpus_documents || 0 })}
        />
        <SummaryTile
          code="C"
          title={t('integrity.report.cTitle')}
          value={detectorLabel}
          tone={detectorTone}
          note={
            detectorStatus === 'completed'
              ? t('integrity.report.noteDetectorCompleted', {
                  provider: record.detector_provider_label || t('integrity.report.detectorFallback'),
                  class: record.detector_class || t('integrity.report.unclear'),
                })
              : detectorStatus === 'unavailable'
                ? t('integrity.report.noteDetectorUnavailable')
                : record.detector_error || t('integrity.report.noteNotRequested')
          }
        />
      </div>

      <Surface title={t('integrity.report.sectionA')} subtitle={t('integrity.report.sectionASubtitle')}>
        <ExternalSimilarityPanel record={record} onRefresh={onRefresh} busy={busy} />
      </Surface>

      <Surface className="mt-4" title={t('integrity.report.sectionB')} subtitle={t('integrity.report.sectionBSubtitle')}>
        <SimilarityPanel record={record} passages={passages} />
      </Surface>

      <Surface
        className="mt-4"
        title={t('integrity.report.sectionDocument')}
        subtitle={t('integrity.report.sectionDocumentSubtitle')}
      >
        <DocumentView passages={passages} />
      </Surface>

      <Surface className="mt-4" title={t('integrity.report.sectionC')} subtitle={t('integrity.report.sectionCSubtitle')}>
        <AiDetectorPanel record={record} />
      </Surface>

      <div className="mt-4 rounded-xl border border-line bg-canvas px-3 py-2.5">
        <p className="text-[13px] font-semibold text-ink">{t('integrity.report.reviewTitle')}</p>
        <p className="mt-1 text-[12.5px] leading-[1.6] text-mutedink">{t('integrity.report.reviewBody')}</p>
      </div>
    </div>
  );
}