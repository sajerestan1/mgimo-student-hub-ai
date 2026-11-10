import { useState } from 'react';
import { Check, Copy, Download } from 'lucide-react';
import Surface from '@/components/shell/Surface';
import StatusChip from '@/components/shell/StatusChip';
import SimilarityPanel from './SimilarityPanel';
import ExternalSimilarityPanel from './ExternalSimilarityPanel';
import AiDetectorPanel from './AiDetectorPanel';
import DocumentView from './DocumentView';
import { buildReportText, copyReport, downloadReport, formatAnalysisStamp } from '@/lib/integrity/report';

const EXTERNAL_LABEL = {
  skipped: 'not run',
  pending: 'submitted',
  processing: 'processing',
  completed: 'report received',
  failed: 'failed',
  unavailable: 'engine not configured',
};

const DETECTOR_LABEL = {
  skipped: 'not run',
  completed: 'report received',
  failed: 'failed',
  unavailable: 'engine not configured',
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
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState('');

  if (!record) return null;

  const externalStatus = record.external_status || 'skipped';
  const detectorStatus = record.detector_status || 'skipped';

  const externalTone =
    externalStatus === 'completed' ? 'positive' : externalStatus === 'failed' ? 'critical' : externalStatus === 'unavailable' ? 'warning' : 'neutral';
  const detectorTone =
    detectorStatus === 'completed' ? 'positive' : detectorStatus === 'failed' ? 'critical' : detectorStatus === 'unavailable' ? 'warning' : 'neutral';

  const handleCopy = async () => {
    setCopyError('');
    try {
      await copyReport(buildReportText(record));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopyError('Your browser blocked clipboard access. Use Download report instead.');
    }
  };

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-mutedink">Combined academic integrity report</p>
          <h2 className="mt-0.5 break-words text-[19px] font-semibold leading-tight text-ink">{record.title}</h2>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {record.student_reference && <StatusChip tone="neutral">{record.student_reference}</StatusChip>}
            <StatusChip tone="neutral">{Number(record.word_count || 0).toLocaleString()} words</StatusChip>
            <StatusChip tone="brand">{formatAnalysisStamp(record.analyzed_at)}</StatusChip>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={handleCopy} className="btn-quiet btn-sm">
            {copied ? <Check className="h-4 w-4" strokeWidth={2} /> : <Copy className="h-4 w-4" strokeWidth={1.9} />}
            {copied ? 'Copied' : 'Copy report'}
          </button>
          <button
            type="button"
            onClick={() => downloadReport(buildReportText(record), record.title)}
            className="btn-quiet btn-sm"
          >
            <Download className="h-4 w-4" strokeWidth={1.9} />
            Download report
          </button>
        </div>
      </div>

      {copyError && <p className="mb-3 text-[13px] text-critical">{copyError}</p>}

      <div className="mb-4 grid gap-2 md:grid-cols-3">
        <SummaryTile
          code="A"
          title="External similarity"
          value={EXTERNAL_LABEL[externalStatus] || externalStatus}
          tone={externalTone}
          note={
            externalStatus === 'completed'
              ? `${record.external_provider_label || 'Provider'} score ${Number(record.external_similarity_percent || 0).toFixed(1)}% · ${(record.external_sources || []).length} source(s)`
              : externalStatus === 'unavailable'
                ? 'No internet or publisher search was performed.'
                : record.external_error || 'Not requested for this submission.'
          }
        />
        <SummaryTile
          code="B"
          title="Internal similarity"
          value={`${Number(record.similarity_percent || 0).toFixed(1)}%`}
          tone="brand"
          note={`Against ${record.corpus_documents || 0} submission(s) already analysed here — supplementary only.`}
        />
        <SummaryTile
          code="C"
          title="AI-writing detection"
          value={DETECTOR_LABEL[detectorStatus] || detectorStatus}
          tone={detectorTone}
          note={
            detectorStatus === 'completed'
              ? `${record.detector_provider_label || 'Detector'} classified the text as ${record.detector_class || 'unclear'}.`
              : detectorStatus === 'unavailable'
                ? 'No detector is configured, so no score exists.'
                : record.detector_error || 'Not requested for this submission.'
          }
        />
      </div>

      <Surface
        title="A · External similarity (plagiarism)"
        subtitle="Score, sources and status exactly as the external similarity provider returned them"
      >
        <ExternalSimilarityPanel record={record} onRefresh={onRefresh} busy={busy} />
      </Surface>

      <Surface
        className="mt-4"
        title="B · Internal similarity (supplementary)"
        subtitle="Compares this text only with submissions already analysed in this workspace — not an internet search"
      >
        <SimilarityPanel record={record} passages={passages} />
      </Surface>

      <Surface className="mt-4" title="Submitted document" subtitle="Original text preserved, internal matches highlighted">
        <DocumentView passages={passages} />
      </Surface>

      <Surface
        className="mt-4"
        title="C · AI-writing detection"
        subtitle="Classification and probability exactly as the AI-text detector returned them"
      >
        <AiDetectorPanel record={record} />
      </Surface>

      <div className="mt-4 rounded-xl border border-line bg-canvas px-3 py-2.5">
        <p className="text-[13px] font-semibold text-ink">Human review recommendation</p>
        <p className="mt-1 text-[12.5px] leading-[1.6] text-mutedink">
          This report records measurements, not findings. Similarity requires interpretation — correctly cited quotation,
          a shared bibliography or standard method wording all produce matches — and AI detectors produce both false
          positives and false negatives. No academic record, grade or student status was read or changed, no automatic
          accusation was made, and nothing was sent to any member of staff.
        </p>
      </div>
    </div>
  );
}