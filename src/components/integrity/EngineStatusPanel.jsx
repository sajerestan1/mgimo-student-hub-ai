import { ExternalLink, KeyRound, ShieldAlert, ShieldCheck } from 'lucide-react';
import StatusChip from '@/components/shell/StatusChip';
import { useI18n } from '@/i18n/I18nProvider';

const ENGINE_KEYS = {
  plagiarism: { title: 'integrity.engines.plagiarismTitle', detail: 'integrity.engines.plagiarismBody' },
  ai_detection: { title: 'integrity.engines.detectionTitle', detail: 'integrity.engines.detectionBody' },
};

function EngineTile({ engine }) {
  const { t } = useI18n();
  const keys = ENGINE_KEYS[engine.id];
  const title = keys ? t(keys.title) : engine.label;
  const detail = keys ? t(keys.detail) : engine.description;
  const provider = engine.selectedProvider;

  return (
    <div className="rounded-xl border border-line bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold uppercase tracking-[0.06em] text-mutedink">{title}</p>
          <p className="mt-1 text-[13px] leading-[1.55] text-mutedink">{detail}</p>
        </div>
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
            engine.configured ? 'bg-[#E9F5EF] text-[#1D7A50]' : 'bg-[#FCF3E4] text-[#8E6018]'
          }`}
        >
          {engine.configured ? (
            <ShieldCheck className="h-4 w-4" strokeWidth={1.9} />
          ) : (
            <ShieldAlert className="h-4 w-4" strokeWidth={1.9} />
          )}
        </span>
      </div>

      {engine.configured ? (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <StatusChip tone="positive">{t('integrity.engines.configured')}</StatusChip>
          <StatusChip tone="brand">{provider.label}</StatusChip>
          {provider.credentials.length > 0 && (
            <span className="text-[12.5px] text-mutedink">{t('integrity.engines.credentials')}</span>
          )}
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          <p className="inline-flex items-center gap-1.5 rounded-md bg-[#FCF3E4] px-2 py-1 text-[13px] font-semibold text-[#8E6018]">
            <ShieldAlert className="h-4 w-4" strokeWidth={2} />
            {t('integrity.engines.notConfigured')}
          </p>
          {engine.waitingFor.length > 0 ? (
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[12.5px] text-mutedink">
              <KeyRound className="h-3.5 w-3.5" strokeWidth={1.9} />
              {t('integrity.engines.awaiting')}
              {engine.waitingFor.map((name) => (
                <code key={name} className="rounded bg-canvas px-1.5 py-0.5 font-mono text-[11.5px] text-ink">
                  {name}
                </code>
              ))}
            </div>
          ) : (
            <p className="text-[12.5px] text-mutedink">{t('integrity.engines.noProvider')}</p>
          )}
          {engine.candidates.length > 0 && (
            <p className="text-[12.5px] leading-[1.55] text-mutedink">
              {t('integrity.engines.supported', {
                providers: engine.candidates.map((row) => row.label).join(', '),
                model: engine.candidates[0].accessModel,
              })}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Reports which detection engines are wired to a real provider and which are
 * waiting for credentials. It never implies a capability the app does not have.
 */
export default function EngineStatusPanel({ status, error }) {
  const { t } = useI18n();

  if (error) {
    return (
      <p className="rounded-lg border border-[#F3D6D6] bg-[#FBECEC] px-3 py-2 text-[13.5px] text-[#A23B3B]">
        {t('integrity.engines.error', { error })}
      </p>
    );
  }
  if (!status) {
    return <p className="text-[13.5px] text-mutedink">{t('integrity.engines.loading')}</p>;
  }

  const unavailable = (status.engines || []).flatMap((engine) => engine.unavailableProviders || []);

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        {(status.engines || []).map((engine) => (
          <EngineTile key={engine.id} engine={engine} />
        ))}
      </div>

      {status.sandboxAvailable && (
        <p className="rounded-lg border border-[#EBD9B4] bg-[#FCF7EA] px-3 py-2 text-[12.5px] text-[#8E6018]">
          {t('integrity.engines.sandbox')}
        </p>
      )}

      {unavailable.length > 0 && (
        <div className="rounded-lg border border-line bg-canvas px-3 py-2.5">
          <p className="text-[13px] font-semibold text-ink">{t('integrity.engines.unavailableTitle')}</p>
          <ul className="mt-1.5 space-y-1.5">
            {unavailable.map((provider) => (
              <li key={`${provider.id}-${provider.label}`} className="text-[12.5px] leading-[1.55] text-mutedink">
                <span className="font-medium text-ink">{provider.label}:</span> {provider.unavailableReason}{' '}
                <a
                  href={provider.docsUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-0.5 text-brand hover:text-[#3B5AE0]"
                >
                  {t('integrity.engines.documentation')}
                  <ExternalLink className="h-3 w-3" strokeWidth={2} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}