import { AlertTriangle, Info, Sparkles } from 'lucide-react';
import StatusChip from '@/components/shell/StatusChip';

const LEVELS = {
  low: { tone: 'positive', label: 'Low indicator level' },
  moderate: { tone: 'warning', label: 'Moderate indicator level' },
  elevated: { tone: 'critical', label: 'Elevated indicator level' },
};

const LIMITATION = [
  'This is a screening prototype built on a general-purpose language model. It is not a validated AI-text detector and produces no probability, confidence score or “per cent AI”.',
  'Language models cannot reliably separate machine-written from human-written academic prose, and non-native writers, heavily edited drafts and formulaic genres are commonly misread.',
  'A result is a prompt for a conversation or a closer reading by a person. It is never evidence of misconduct, and no student is classified as dishonest here.',
];

export default function AiScreeningPanel({ record }) {
  const status = record?.ai_status || 'skipped';
  const level = LEVELS[record?.ai_indicator_level] || null;
  const observations = Array.isArray(record?.ai_observations) ? record.ai_observations : [];
  const flagged = Array.isArray(record?.ai_flagged) ? record.ai_flagged : [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EDF1FE] text-brand">
          <Sparkles className="h-4 w-4" strokeWidth={1.9} />
        </span>
        {status === 'completed' && level && <StatusChip tone={level.tone}>{level.label}</StatusChip>}
        {status === 'skipped' && <StatusChip tone="neutral">Not run for this analysis</StatusChip>}
        {status === 'failed' && <StatusChip tone="critical">Screening unavailable</StatusChip>}
        <span className="text-[12.5px] text-mutedink">Screening prototype — not a detector</span>
      </div>

      {status === 'skipped' && (
        <p className="text-[13.5px] leading-[1.6] text-mutedink">
          AI-writing screening was not selected for this submission, so no text was sent to any language-model
          service. Run the analysis again with the screening box ticked to include it.
        </p>
      )}

      {status === 'failed' && (
        <p className="rounded-lg border border-[#F3D6D6] bg-[#FBECEC] px-3 py-2 text-[13.5px] text-[#A23B3B]">
          {record?.ai_note || 'The screening service did not return a result.'}
        </p>
      )}

      {status === 'completed' && (
        <>
          {record?.ai_summary && (
            <p className="text-[14px] leading-[1.65] text-ink">{record.ai_summary}</p>
          )}

          {observations.length > 0 && (
            <div>
              <h3 className="mb-2 text-[13px] font-semibold uppercase tracking-[0.06em] text-mutedink">
                What the screening observed
              </h3>
              <ul className="divide-y divide-line rounded-lg border border-line">
                {observations.map((row, index) => (
                  <li key={index} className="px-3 py-2.5">
                    <p className="text-[13.5px] font-medium text-ink">{row.signal}</p>
                    <p className="mt-0.5 text-[13px] leading-[1.6] text-mutedink">{row.detail}</p>
                    {row.quote && (
                      <p className="mt-1 border-s-2 border-[#EBD9B4] ps-2 text-[12.5px] italic leading-[1.55] text-mutedink">
                        “{row.quote}”
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {flagged.length > 0 && (
            <div>
              <h3 className="mb-2 text-[13px] font-semibold uppercase tracking-[0.06em] text-mutedink">
                Passages worth a human look
              </h3>
              <ul className="divide-y divide-line rounded-lg border border-line">
                {flagged.map((row, index) => (
                  <li key={index} className="px-3 py-2.5">
                    {row.excerpt && (
                      <p className="text-[13.5px] leading-[1.6] text-ink">“{row.excerpt}”</p>
                    )}
                    <p className="mt-1 text-[12.5px] leading-[1.55] text-mutedink">{row.reason}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-line bg-canvas px-3 py-2.5">
            <AlertTriangle className="h-4 w-4 shrink-0 text-warning" strokeWidth={1.9} />
            <p className="text-[13px] text-ink">
              {record?.ai_human_review
                ? 'The screening recommends human review of this submission.'
                : 'The screening does not call for additional review on its own.'}
            </p>
          </div>

          <p className="text-[12.5px] leading-[1.55] text-mutedink">
            Service used: {record?.ai_provider || 'not recorded'}
            {record?.ai_model ? ` · ${record.ai_model}` : ''}
            {record?.ai_truncated ? ' · the screening covered the first part of this document only' : ''}.
          </p>
        </>
      )}

      <div className="rounded-lg border border-line bg-white px-3 py-2.5">
        <p className="flex items-center gap-1.5 text-[13px] font-semibold text-ink">
          <Info className="h-4 w-4 text-mutedink" strokeWidth={1.9} />
          Limitations
        </p>
        <ul className="mt-1.5 space-y-1">
          {LIMITATION.map((line) => (
            <li key={line} className="text-[12.5px] leading-[1.55] text-mutedink">
              {line}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}