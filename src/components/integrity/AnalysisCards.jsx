import { Bot, Globe, Layers } from 'lucide-react';
import StatusChip from '@/components/shell/StatusChip';
import { useI18n } from '@/i18n/I18nProvider';

function Card({ icon: Icon, title, description, status }) {
  return (
    <div className="rounded-xl border border-line bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[14px] font-semibold text-ink">
            <Icon className="h-4 w-4 text-brand" strokeWidth={1.9} />
            {title}
          </p>
          <p className="mt-1 text-[12.5px] leading-[1.55] text-mutedink">{description}</p>
        </div>
      </div>
      <div className="mt-2.5">{status}</div>
    </div>
  );
}

/**
 * The three measurements this workspace reports. Each card states whether the
 * underlying engine is actually available, so nothing looks available that is not.
 */
export default function AnalysisCards({ engines }) {
  const { t } = useI18n();
  const list = Array.isArray(engines) ? engines : [];
  const external = list.find((row) => row.id === 'plagiarism');
  const detector = list.find((row) => row.id === 'ai_detection');

  return (
    <div className="mb-4 grid gap-3 md:grid-cols-3">
      <Card
        icon={Globe}
        title={t('integrity.cards.aTitle')}
        description={t('integrity.cards.aBody')}
        status={
          external?.configured ? (
            <StatusChip tone="positive">
              {t('integrity.cards.available', { provider: external.selectedProvider.label })}
            </StatusChip>
          ) : (
            <StatusChip tone="warning">{t('integrity.cards.unavailable')}</StatusChip>
          )
        }
      />
      <Card
        icon={Layers}
        title={t('integrity.cards.bTitle')}
        description={t('integrity.cards.bBody')}
        status={<StatusChip tone="brand">{t('integrity.cards.alwaysOn')}</StatusChip>}
      />
      <Card
        icon={Bot}
        title={t('integrity.cards.cTitle')}
        description={t('integrity.cards.cBody')}
        status={
          detector?.configured ? (
            <StatusChip tone="positive">
              {t('integrity.cards.available', { provider: detector.selectedProvider.label })}
            </StatusChip>
          ) : (
            <StatusChip tone="warning">{t('integrity.cards.unavailable')}</StatusChip>
          )
        }
      />
    </div>
  );
}