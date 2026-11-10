import { Bot, ShieldAlert, Sparkles } from 'lucide-react';
import StatusChip from '@/components/shell/StatusChip';

const CLASS_CHIP = {
  human: { tone: 'positive', label: 'Classified human' },
  ai: { tone: 'critical', label: 'Classified AI' },
  mixed: { tone: 'warning', label: 'Classified mixed' },
  unknown: { tone: 'neutral', label: 'No class returned' },
};

const STATUS_CHIP = {
  skipped: { tone: 'neutral', label: 'Not run' },
  completed: { tone: 'positive', label: 'Detector report received' },
  failed: { tone: 'critical', label: 'Detection failed' },
  unavailable: { tone: 'warning', label: 'Engine not configured' },
};

const percent = (value) => (typeof value === 'number' ? `${(value * 100).toFixed(1)}%` : 'not reported');

const LIMITATIONS = [
  'AI detectors are probabilistic classifiers, not proof. Human-written text — especially by non-native writers, from heavily edited drafts, or in formulaic genres — is regularly scored as machine-written (false positive).',
  'AI-written text that has been edited, translated or produced with a lightly prompted model is regularly scored as human (false negative).',
  'A detector result says nothing about plagiarism, and a plagiarism score says nothing about authorship. They are different measurements and are reported separately here.',
  'No grade, sanction or disciplinary decision may rest on this output. It is a prompt for a conversation with the author.',
];

/**
 * AI-writing detection, reported exactly as the detector returned it. When no
 * detector is configured the capability is shown as unavailable — never
 * replaced by a language-model opinion or a made-up percentage.
 */
export default function AiDetectorPanel({ record }) {
  const status = record?.detector_status || 'skipped';
  const chip = STATUS_CHIP[status] || STATUS_CHIP.skipped;
  const classChip = CLASS_CHIP[record?.detector_class] || null;
  const sections = Array.isArray(record?.detector_sections) ? record.detector_sections : [];
  const scored = sections.filter((row) => typeof row.probability === 'number');
  const legacy = !record?.detector_status && record?.ai_status === 'completed';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EDF1FE] text-brand">
          <Bot className="h-4 w-4" strokeWidth={1.9} />
        </span>
        <StatusChip tone={chip.tone}>{chip.label}</StatusChip>
        {record?.detector_provider_label && <StatusChip tone="neutral">{record.detector_provider_label}</StatusChip>}
        {record?.detector_mode === 'sandbox' && <StatusChip tone="warning">Sandbox — simulated detector result</StatusChip>}
      </div>

      {legacy && (
        <div className="rounded-lg border border-line bg-canvas px-3 py-2.5">
          <p className="text-[13px] font-semibold text-ink">Retired prototype screening</p>
          <p className="mt-1 text-[13px] leading-[1.6] text-mutedink">
            This record predates the detector integration and contains a language-model screening note, not a detector
            output. It is kept for history only and is not comparable with the results below. Re-run the submission with
            AI detection selected to obtain a real result.
          </p>
        </div>
      )}

      {status === 'skipped' && !legacy && (
        <p className="text-[13.5px] leading-[1.6] text-mutedink">
          AI-writing detection was not selected for this submission, so no text was sent to any detector.
        </p>
      )}

      {status === 'unavailable' && (
        <div className="rounded-lg border border-[#EBD9B4] bg-[#FCF7EA] px-3 py-2.5">
          <p className="text-[13px] font-semibold text-[#8E6018]">DETECTION ENGINE NOT CONFIGURED</p>
          <p className="mt-1 text-[13px] leading-[1.6] text-ink">
            {record?.detector_error ||
              'No AI-writing detector is configured for this app, so no detection was performed and no score exists.'}
          </p>
          <p className="mt-1 text-[12.5px] leading-[1.55] text-mutedink">
            Waiting for credentials for GPTZero or Copyleaks AI detection. Nothing here is an approximation of a
            detector result.
          </p>
        </div>
      )}

      {status === 'failed' && (
        <p className="rounded-lg border border-[#F3D6D6] bg-[#FBECEC] px-3 py-2 text-[13.5px] text-[#A23B3B]">
          {record?.detector_error || 'The detector did not return a result.'}
        </p>
      )}

      {status === 'completed' && (
        <>
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="rounded-lg border border-line bg-white px-3 py-2.5">
              <p className="text-[12px] uppercase tracking-[0.05em] text-mutedink">Detector classification</p>
              <div className="mt-1">{classChip && <StatusChip tone={classChip.tone}>{classChip.label}</StatusChip>}</div>
            </div>
            <div className="rounded-lg border border-line bg-white px-3 py-2.5">
              <p className="text-[12px] uppercase tracking-[0.05em] text-mutedink">AI probability (provider)</p>
              <p className="mt-0.5 text-[19px] font-semibold text-ink">{percent(record?.detector_ai_share)}</p>
            </div>
            <div className="rounded-lg border border-line bg-white px-3 py-2.5">
              <p className="text-[12px] uppercase tracking-[0.05em] text-mutedink">Provider confidence</p>
              <p className="mt-0.5 text-[15px] font-semibold capitalize text-ink">
                {record?.detector_confidence || 'not reported'}
              </p>
            </div>
          </div>

          {record?.detector_message && (
            <p className="rounded-lg border border-line bg-canvas px-3 py-2 text-[13px] leading-[1.6] text-ink">
              {record.detector_message}
            </p>
          )}

          {scored.length > 0 ? (
            <div>
              <h3 className="mb-2 text-[13px] font-semibold uppercase tracking-[0.06em] text-mutedink">
                Sentence-level indicators returned by the detector
              </h3>
              <ul className="max-h-72 divide-y divide-line overflow-y-auto rounded-lg border border-line scroll-thin">
                {scored.slice(0, 40).map((row) => (
                  <li key={row.index} className="px-3 py-2">
                    <div className="flex items-start justify-between gap-3">
                      <p className="min-w-0 text-[13px] leading-[1.55] text-ink">{row.text || `Section ${row.index + 1}`}</p>
                      <span className="shrink-0 text-[12.5px] font-semibold text-ink">{percent(row.probability)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-[13px] text-mutedink">
              The detector returned a document-level result only; no sentence-level indicators were supplied, so none are
              shown.
            </p>
          )}

          <p className="text-[12.5px] leading-[1.55] text-mutedink">
            Detector: {record?.detector_provider_label || 'not recorded'}
            {record?.detector_model ? ` · model ${record.detector_model}` : ''}
            {record?.detector_characters
              ? ` · ${record.detector_characters.toLocaleString()} characters submitted`
              : ''}
            . Percentages are the provider’s own output and are reproduced unmodified.
          </p>
        </>
      )}

      <div className="rounded-lg border border-line bg-white px-3 py-2.5">
        <p className="flex items-center gap-1.5 text-[13px] font-semibold text-ink">
          <ShieldAlert className="h-4 w-4 text-warning" strokeWidth={1.9} />
          False positives and false negatives
        </p>
        <ul className="mt-1.5 space-y-1 text-[12.5px] leading-[1.55] text-mutedink">
          {LIMITATIONS.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>

      <p className="flex items-start gap-1.5 text-[12.5px] leading-[1.55] text-mutedink">
        <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.9} />
        AI-likelihood and similarity are separate measurements. Neither one establishes misconduct.
      </p>
    </div>
  );
}