import StatusChip from '@/components/shell/StatusChip';
import { useI18n } from '@/i18n/I18nProvider';

function Stat({ label, value }) {
  return (
    <div className="rounded-lg border border-line bg-canvas px-3 py-2.5">
      <p className="text-[12px] font-medium uppercase tracking-[0.06em] text-mutedink">{label}</p>
      <p className="mt-0.5 text-[17px] font-semibold leading-tight text-ink">{value}</p>
    </div>
  );
}

export default function SimilarityPanel({ record, passages }) {
  const { t } = useI18n();
  const flagged = (passages || []).filter((passage) => passage.flagged);
  const score = Number(record?.similarity_percent || 0);
  const scoreTone = score >= 30 ? 'critical' : score >= 10 ? 'warning' : 'positive';
  const percent = (value) => `${Number(value || 0).toFixed(1)}%`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-mutedink">
            {t('integrity.internal.overall')}
          </p>
          <p className="mt-0.5 text-[2.25rem] font-bold leading-none tracking-[-0.02em] text-ink">{percent(score)}</p>
        </div>
        <StatusChip tone={scoreTone}>
          {flagged.length
            ? t(flagged.length === 1 ? 'integrity.internal.flaggedOne' : 'integrity.internal.flaggedMany', {
                count: flagged.length,
              })
            : t('integrity.internal.none')}
        </StatusChip>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-[#EDF1FE]">
        <div
          className="h-full rounded-full bg-brand"
          style={{ width: `${Math.max(0, Math.min(100, score))}%` }}
          aria-hidden="true"
        />
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label={t('integrity.internal.statMatching')} value={record?.matched_passage_count || 0} />
        <Stat label={t('integrity.internal.statRepeated')} value={record?.repeated_passage_count || 0} />
        <Stat
          label={t('integrity.internal.statCompared')}
          value={t('integrity.internal.comparedValue', { count: record?.corpus_documents || 0 })}
        />
        <Stat
          label={t('integrity.internal.statWords')}
          value={Number(record?.corpus_words || 0).toLocaleString()}
        />
      </div>

      <div className="rounded-lg border border-line bg-white px-3 py-2.5">
        <p className="text-[13px] font-semibold text-ink">{t('integrity.internal.explainTitle')}</p>
        <p className="mt-1 text-[13px] leading-[1.6] text-mutedink">{t('integrity.internal.explainFirst')}</p>
        <p className="mt-2 text-[13px] leading-[1.6] text-mutedink">
          {t('integrity.internal.explainSecond', { zero: percent(0) })}
        </p>
      </div>

      {flagged.length > 0 && (
        <div>
          <h3 className="mb-2 text-[13px] font-semibold uppercase tracking-[0.06em] text-mutedink">
            {t('integrity.internal.flaggedTitle')}
          </h3>
          <ul className="divide-y divide-line rounded-lg border border-line">
            {flagged.slice(0, 20).map((passage) => (
              <li key={passage.index} className="px-3 py-2.5">
                <p className="text-[13.5px] leading-[1.6] text-ink">“{passage.text}”</p>
                <ul className="mt-1.5 space-y-1">
                  {passage.sources.map((source, sourceIndex) => (
                    <li key={`${passage.index}-${sourceIndex}`} className="text-[12.5px] text-mutedink">
                      <span className="font-medium text-ink">
                        {source.type === 'internal_submission'
                          ? t('integrity.internal.sourceInternal')
                          : t('integrity.internal.sourceSame')}
                        :
                      </span>{' '}
                      {source.title}
                      {source.reference ? ` · ${source.reference}` : ''} ·{' '}
                      {t('integrity.internal.overlap', { percent: percent(source.overlap) })}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
          {flagged.length > 20 && (
            <p className="mt-2 text-[12.5px] text-mutedink">{t('integrity.internal.first20')}</p>
          )}
        </div>
      )}
    </div>
  );
}