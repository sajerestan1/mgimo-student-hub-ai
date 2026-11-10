import { useState } from 'react';
import { Check, Copy, Download } from 'lucide-react';
import Surface from '@/components/shell/Surface';
import StatusChip from '@/components/shell/StatusChip';
import SimilarityPanel from './SimilarityPanel';
import AiScreeningPanel from './AiScreeningPanel';
import DocumentView from './DocumentView';
import { buildReportText, copyReport, downloadReport, formatAnalysisStamp } from '@/lib/integrity/report';

export default function IntegrityReport({ record, passages }) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState('');

  if (!record) return null;

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
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-mutedink">Report</p>
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

      <Surface
        title="Plagiarism & similarity"
        subtitle="Internal text similarity check against submissions already analysed in this workspace"
      >
        <SimilarityPanel record={record} passages={passages} />
      </Surface>

      <Surface className="mt-4" title="Submitted document" subtitle="Original text preserved, matching passages highlighted">
        <DocumentView passages={passages} />
      </Surface>

      <Surface className="mt-4" title="AI-writing detection" subtitle="Model screening for reviewer attention, not a verdict">
        <AiScreeningPanel record={record} />
      </Surface>

      <p className="mt-3 text-[12.5px] leading-[1.55] text-mutedink">
        This report records observations only. No academic record, grade or student status was read or changed, and
        nothing was sent to any member of staff.
      </p>
    </div>
  );
}