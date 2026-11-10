/**
 * Provider catalogue for the Academic Integrity detection engines.
 *
 * Everything here is descriptive metadata: which providers exist, what access
 * they actually require, and what evidence they return. No provider is marked
 * available unless a documented, self-serve authenticated API exists, and an
 * adapter is shipped only for those.
 */

export class ProviderError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'ProviderError';
    this.code = code;
  }
}

export const ENGINES = [
  {
    id: 'plagiarism',
    label: 'External similarity (plagiarism)',
    short: 'External similarity',
    description:
      'Sends the submission to a licensed similarity provider and reports that provider’s own score, sources and matched passages.',
  },
  {
    id: 'ai_detection',
    label: 'AI-writing detection',
    short: 'AI detection',
    description:
      'Sends the submission to a dedicated AI-text detector and reports that detector’s own classification and probability.',
  },
];

export const PROVIDERS = {
  copyleaks: {
    id: 'copyleaks',
    label: 'Copyleaks',
    capabilities: ['plagiarism', 'ai_detection'],
    credentials: [
      {
        name: 'COPYLEAKS_EMAIL',
        description: 'The email address of your Copyleaks API account.',
      },
      {
        name: 'COPYLEAKS_API_KEY',
        description: 'Copyleaks API key, from the Copyleaks API dashboard.',
      },
    ],
    docsUrl: 'https://docs.copyleaks.com/',
    accessModel:
      'Self-serve API account. Production scans consume purchased credits; sandbox mode returns simulated results free of charge.',
    evidence:
      'Similarity: aggregated score, per-source matches with matched-word counts, and an exportable per-passage report. AI detection: per-section classification with a probability and an overall AI share.',
    available: true,
  },
  gptzero: {
    id: 'gptzero',
    label: 'GPTZero',
    capabilities: ['ai_detection'],
    credentials: [
      {
        name: 'GPTZERO_API_KEY',
        description: 'GPTZero API key, created on the API page of your GPTZero account.',
      },
    ],
    docsUrl: 'https://docs.gptzero.me/',
    accessModel:
      'Self-serve API plans. Request text is capped by plan (150,000 characters on API plans); over-limit requests are rejected.',
    evidence:
      'Predicted class (human / AI / mixed), class probabilities, a confidence category and a per-sentence breakdown.',
    available: true,
  },
  turnitin: {
    id: 'turnitin',
    label: 'Turnitin / iThenticate',
    capabilities: ['plagiarism'],
    credentials: [],
    docsUrl: 'https://developers.turnitin.com/turnitin-core-api/',
    accessModel:
      'Institutional licence only. Turnitin exposes its Core API to licensed institutions and approved integrators; there is no self-serve developer sign-up.',
    evidence:
      'Similarity score plus source list and a similarity report, for the licence features the institution has enabled.',
    available: false,
    unavailableReason:
      'An institutional Turnitin or iThenticate licence and a provisioned integration instance are required before an adapter can be written against a real endpoint.',
  },
  ouriginal: {
    id: 'ouriginal',
    label: 'Ouriginal (formerly Urkund / PlagScan)',
    capabilities: ['plagiarism'],
    credentials: [],
    docsUrl: 'https://www.ouriginal.com/',
    accessModel:
      'Issued only to subscribed institutions; Ouriginal is part of Turnitin and has no self-serve API tier.',
    evidence: 'Institution-level similarity reports.',
    available: false,
    unavailableReason:
      'No self-serve API. An institution must supply access, and the platform has none, so no adapter is shipped.',
  },
};

export const PROVIDER_LIST = Object.values(PROVIDERS);

export const CREDENTIAL_SECRETS = [
  ...new Map(
    PROVIDER_LIST.flatMap((provider) =>
      (provider.credentials || []).map((credential) => [credential.name, credential]),
    ),
  ).values(),
];