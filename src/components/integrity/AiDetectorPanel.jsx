import { Bot, ShieldAlert, Sparkles } from 'lucide-react';
import StatusChip from '@/components/shell/StatusChip';
import { useI18n } from '@/i18n/I18nProvider';

const CLASS_LABEL = {
  human: 'integrity.detector.classHuman',
  ai: 'integrity.detector.classAi',
  mixed: 'integrity.detector.classMixed',
  unknown: 'integrity.detector.classUnknown',
};

const CLASS_TONE = { human: 'positive', ai: 'critical', mixed: 'warning', unknown: 'neutral' };

const STATUS_LABEL = {
  skipped: 'integrity.status.skipped',
  completed: 'integrity.status.completed',
  failed: 'integrity.status.failed',
  unavailable: 'integrity.status.unavailable',
};

const STATUS_TONE = { skipped: 'neutral', completed: 'positive', failed: 'critical', unavailable: 'warning' };

const LIMITATION_KEYS = [
  'integrity.detector.limit1',
  'integrity.detector.limit2',
  'integrity.detector.limit3',
  'integrity.detector.limit4',
];

/**
 * AI-writing detection, reported exactly as the detector returned it. When no
 * detector is configured the capability is shown as unavailable — never
 * replaced by a language-model opinion or a made-up percentage.
 */
export default function AiDetectorPanel({ record }) {
  const { t } = useI18n();
  const status = record?.detector_status || 'skipped';
  const label = STATUS_LABEL[status] ? t(STATUS_LABEL[status]) : t('integrity.status.skipped');
  const tone = STATUS_TONE[status] || 'neutral';
  const classKey = CLASS_LABEL[record?.detector_class];
  const classLabel = classKey ? t(classKey) : '';
  const classTone = CLASS_TONE[record?.detector_class] || 'neutral';
  const sections = Array.isArray(record?.detector_sections) ? record.detector_sections : [];
  const scored = sections.filter((row) => typeof row.probability === 'number');
  const legacy = !record?.detector_status && record?.ai_status === 'completed';
  const percent = (value) =>
    typeof value === 'number' ? `${(value * 100).toFixed(1)}%` : t('integrity.notReported');

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EDF1FE] text-brand">
          <Bot className="h-4 w-4" strokeWidth={1.9} />
        </span>
        <StatusChip tone={tone}>{label}</StatusChip>
        {record?.detector_provider_label && <StatusChip tone="neutral">{record.detector_provider_label}</StatusChip>}
        {record?.detector_mode === 'sandbox' && (
          <StatusChip tone="warning">{t('integrity.sandbox.detector')}</StatusChip>
        )}
      </div>

      {legacy && (
        <div className="rounded-lg border border-line bg-canvas px-3 py-2.5">
          <p className="text-[13px] font-semibold text-ink">{t('integrity.detector.legacyTitle')}</p>
          <p className="mt-1 text-[13px] leading-[1.6] text-mutedink">{t('integrity.detector.legacyBody')}</p>
        </div>
      )}

      {status === 'skipped' && !legacy && (
        <p className="text-[13.5px] leading-[1.6] text-mutedink">{t('integrity.detector.skippedBody')}</p>
      )}

      {status === 'unavailable' && (
        <div className="rounded-lg border border-[#EBD9B4] bg-[#FCF7EA] px-3 py-2.5">
          <p className="text-[13px] font-semibold text-[#8E6018]">{t('integrity.engines.notConfigured')}</p>
          <p className="mt-1 text-[13px] leading-[1.6] text-ink">
            {record?.detector_error || t('integrity.detector.unavailableFallback')}
          </p>
          <p className="mt-1 text-[12.5px] leading-[1.55] text-mutedink">{t('integrity.detector.unavailableNote')}</p>
        </div>
      )}

      {status === 'failed' && (
        <p className="rounded-lg border border-[#F3D6D6] bg-[#FBECEC] px-3 py-2 text-[13.5px] text-[#A23B3B]">
          {record?.detector_error || t('integrity.detector.failedFallback')}
        </p>
      )}

      {status === 'completed' && (
        <>
          <div className="grid gap-2 sm:grid-cols-3">
            <div className="rounded-lg border border-line bg-white px-3 py-2.5">
              <p className="text-[12px] uppercase tracking-[0.05em] text-mutedink">{t('integrity.detector.tileClass')}</p>
              <div className="mt-1">
                {classLabel && <StatusChip tone={classTone}>{classLabel}</StatusChip>}
              </div>
            </div>
            <div className="rounded-lg border border-line bg-white px-3 py-2.5">
              <p className="text-[12px] uppercase tracking-[0.05em] text-mutedink">
                {t('integrity.detector.tileProbability')}
              </p>
              <p className="mt-0.5 text-[19px] font-semibold text-ink">{percent(record?.detector_ai_share)}</p>
            </div>
            <div className="rounded-lg border border-line bg-white px-3 py-2.5">
              <p className="text-[12px] uppercase tracking-[0.05em] text-mutedink">
                {t('integrity.detector.tileConfidence')}
              </p>
              <p className="mt-0.5 text-[15px] font-semibold capitalize text-ink">
                {record?.detector_confidence || t('integrity.notReported')}
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
                {t('integrity.detector.scoredTitle')}
              </h3>
              <ul className="max-h-72 divide-y divide-line overflow-y-auto rounded-lg border border-line scroll-thin">
                {scored.slice(0, 40).map((row) => (
                  <li key={row.index} className="px-3 py-2">
                    <div className="flex items-start justify-between gap-3">
                      <p className="min-w-0 text-[13px] leading-[1.55] text-ink">
                        {row.text || t('integrity.detector.section', { number: row.index + 1 })}
                      </p>
                      <span className="shrink-0 text-[12.5px] font-semibold text-ink">{percent(row.probability)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-[13px] text-mutedink">{t('integrity.detector.noSections')}</p>
          )}

          <p className="text-[12.5px] leading-[1.55] text-mutedink">
            {t('integrity.detector.footerProvider', {
              provider: record?.detector_provider_label || t('integrity.notReported'),
            })}
            {record?.detector_model ? t('integrity.detector.footerModel', { model: record.detector_model }) : ''}
            {record?.detector_characters
              ? t('integrity.detector.footerCharacters', { count: record.detector_characters.toLocaleString() })
              : ''}
            {t('integrity.detector.footerNote')}
          </p>
        </>
      )}

      <div className="rounded-lg border border-line bg-white px-3 py-2.5">
        <p className="flex items-center gap-1.5 text-[13px] font-semibold text-ink">
          <ShieldAlert className="h-4 w-4 text-warning" strokeWidth={1.9} />
          {t('integrity.detector.limitsTitle')}
        </p>
        <ul className="mt-1.5 space-y-1 text-[12.5px] leading-[1.55] text-mutedink">
          {LIMITATION_KEYS.map((key) => (
            <li key={key}>{t(key)}</li>
          ))}
        </ul>
      </div>

      <p className="flex items-start gap-1.5 text-[12.5px] leading-[1.55] text-mutedink">
        <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.9} />
        {t('integrity.detector.footnote')}
      </p>
    </div>
  );
}