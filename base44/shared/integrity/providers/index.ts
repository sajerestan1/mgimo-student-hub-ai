import { secrets } from 'base44:runtime';
import { ENGINES, PROVIDERS, PROVIDER_LIST, ProviderError } from './catalog.ts';
import * as copyleaks from './copyleaks.ts';
import * as gptzero from './gptzero.ts';

/**
 * Engine resolution and normalisation.
 *
 * An engine is "configured" only when a provider that actually supports it has
 * every credential it needs present as a server-side secret. Otherwise the
 * engine reports itself unavailable, with the credentials it is waiting for —
 * it never falls back to a language model, a guess or a placeholder score.
 */

const ADAPTERS = {
  copyleaks,
  gptzero,
};

function secretPresent(name) {
  try {
    const value = secrets.get(name);
    return typeof value === 'string' && value.trim().length > 0;
  } catch {
    return false;
  }
}

function providerView(provider) {
  const credentials = (provider.credentials || []).map((credential) => ({
    name: credential.name,
    description: credential.description,
    present: secretPresent(credential.name),
  }));
  const configured =
    provider.available !== false && credentials.length > 0 && credentials.every((credential) => credential.present);
  return {
    id: provider.id,
    label: provider.label,
    capabilities: provider.capabilities,
    docsUrl: provider.docsUrl,
    accessModel: provider.accessModel,
    evidence: provider.evidence,
    available: provider.available !== false,
    unavailableReason: provider.unavailableReason || '',
    credentials,
    configured,
  };
}

/** The full provider picture, safe to send to the browser (no secret values). */
export function providerStatus() {
  const providers = PROVIDER_LIST.map(providerView);
  const engines = ENGINES.map((engine) => {
    const candidates = providers.filter(
      (provider) => provider.capabilities.includes(engine.id) && provider.available,
    );
    const selected = candidates.find((provider) => provider.configured) || null;
    const missing = candidates
      .flatMap((provider) => provider.credentials.filter((credential) => !credential.present))
      .map((credential) => credential.name);
    return {
      id: engine.id,
      label: engine.label,
      short: engine.short,
      description: engine.description,
      configured: Boolean(selected),
      selectedProvider: selected,
      candidates,
      waitingFor: selected ? [] : [...new Set(missing)],
      unavailableProviders: providers.filter(
        (provider) => provider.capabilities.includes(engine.id) && !provider.available,
      ),
    };
  });

  return {
    engines,
    providers,
    sandboxAvailable: secretPresent('COPYLEAKS_SANDBOX'),
    webhookSecretPresent: secretPresent('INTEGRITY_WEBHOOK_SECRET'),
  };
}

export function engineConfigured(engineId) {
  return providerStatus().engines.find((engine) => engine.id === engineId)?.configured === true;
}

function failureFields(error, prefix) {
  const code = error instanceof ProviderError ? error.code : 'provider_error';
  const message = error && error.message ? error.message : 'The provider call failed.';
  if (prefix === 'detector') {
    return {
      detector_status: code === 'not_configured' ? 'unavailable' : 'failed',
      detector_error: message,
      detector_checked_at: new Date().toISOString(),
    };
  }
  return {
    external_status: code === 'not_configured' ? 'unavailable' : 'failed',
    external_error: message,
    external_checked_at: new Date().toISOString(),
  };
}

/**
 * Submits a similarity scan. Asynchronous: the record stays in `processing`
 * until the provider posts its completion to the webhook.
 */
export async function submitSimilarity({ text, title, recordId, origin }) {
  if (!copyleaks.isConfigured()) {
    return {
      fields: {
        external_provider: 'copyleaks',
        external_provider_label: 'Copyleaks',
        external_status: 'unavailable',
        external_error:
          'Copyleaks credentials are not configured for this app, so no external similarity scan was submitted.',
        external_checked_at: new Date().toISOString(),
      },
    };
  }

  const scanId = `${recordId}-${Date.now().toString(36)}`;
  const webhookSecret = (() => {
    try {
      return String(secrets.get('INTEGRITY_WEBHOOK_SECRET') || '').trim();
    } catch {
      return '';
    }
  })();

  try {
    const submission = await copyleaks.submitSimilarity({
      text,
      title,
      scanId,
      webhookUrl: copyleaks.webhookUrlFor(origin, webhookSecret),
    });
    return {
      fields: {
        external_provider: 'copyleaks',
        external_provider_label: 'Copyleaks',
        external_status: submission.webhookConfigured ? 'processing' : 'pending',
        external_scan_id: scanId,
        external_submitted_at: submission.submittedAt,
        external_mode: submission.sandbox ? 'sandbox' : 'live',
        external_error: submission.webhookConfigured
          ? ''
          : 'Submitted without a completion webhook: set INTEGRITY_WEBHOOK_SECRET so Copyleaks can report the result back to this app.',
        external_checked_at: new Date().toISOString(),
      },
    };
  } catch (error) {
    return { fields: failureFields(error, 'external') };
  }
}

/** Runs AI-text detection with the first configured detector. */
export async function detectAi({ text }) {
  const chain = [];
  if (gptzero.isConfigured()) chain.push({ id: 'gptzero', run: () => gptzero.detectAi({ text }) });
  if (copyleaks.isConfigured()) {
    chain.push({
      id: 'copyleaks',
      run: () =>
        copyleaks.detectAi({ text, scanId: `ai-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}` }),
    });
  }

  if (!chain.length) {
    return {
      fields: {
        detector_status: 'unavailable',
        detector_error:
          'No AI-writing detector is configured. Add GPTZero or Copyleaks credentials to run a real AI detection.',
        detector_checked_at: new Date().toISOString(),
      },
    };
  }

  let lastError = null;
  for (const entry of chain) {
    try {
      const result = await entry.run();
      return {
        fields: {
          detector_provider: result.provider,
          detector_provider_label: result.providerLabel,
          detector_status: 'completed',
          detector_class: result.classification,
          detector_ai_share: result.aiShare ?? null,
          detector_human_share: result.humanShare ?? null,
          detector_confidence: result.confidenceCategory || '',
          detector_message: result.message || '',
          detector_sections: result.sections || [],
          detector_model: result.model || '',
          detector_mode: result.sandbox ? 'sandbox' : 'live',
          detector_characters: result.charactersChecked || 0,
          detector_error: '',
          detector_checked_at: new Date().toISOString(),
        },
      };
    } catch (error) {
      lastError = error;
      // A rejected credential or an exhausted plan will not improve on another
      // provider, but a different provider may still answer — try the next one.
    }
  }

  return { fields: failureFields(lastError, 'detector') };
}

/** Normalises a provider webhook body into stored similarity fields. */
export function webhookFields(payload, statusToken) {
  const normalised = copyleaks.normalizeWebhook(payload);
  const state = String(statusToken || '').toLowerCase();
  const failed = state.includes('error') || state.includes('fail');

  if (failed) {
    return {
      external_status: 'failed',
      external_error: 'Copyleaks reported that the scan failed.',
      external_checked_at: new Date().toISOString(),
      scanId: normalised.scanId,
    };
  }

  if (normalised.aggregatedScore === null && !normalised.sources.length) {
    return {
      external_status: 'failed',
      external_error: 'Copyleaks reported completion but the payload contained no score.',
      external_checked_at: new Date().toISOString(),
      scanId: normalised.scanId,
    };
  }

  return {
    external_status: 'completed',
    external_similarity_percent: normalised.aggregatedScore,
    external_sources: normalised.sources,
    external_words: normalised.totalWords,
    external_credits: normalised.credits,
    external_error: '',
    external_checked_at: new Date().toISOString(),
    scanId: normalised.scanId,
  };
}

export { ProviderError, PROVIDERS, ENGINES };