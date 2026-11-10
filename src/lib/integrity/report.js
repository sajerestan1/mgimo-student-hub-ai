const STAMP = (value) => {
  if (!value) return 'not recorded';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const percent = (value) => `${Number(value || 0).toFixed(1)}%`;
const share = (value) => (typeof value === 'number' ? `${(value * 100).toFixed(1)}%` : 'not reported');

const EXTERNAL_STATUS = {
  skipped: 'Not run',
  pending: 'Submitted to the provider',
  processing: 'Processing at the provider',
  completed: 'Report received',
  failed: 'Failed',
  unavailable: 'Detection engine not configured',
};

const DETECTOR_STATUS = {
  skipped: 'Not run',
  completed: 'Report received',
  failed: 'Failed',
  unavailable: 'Detection engine not configured',
};

function externalLines(record) {
  const status = record.external_status || 'skipped';
  const lines = ['SECTION A — EXTERNAL SIMILARITY (PLAGIARISM)', '----------------------------------------'];
  lines.push(`Status: ${EXTERNAL_STATUS[status] || status}`);
  if (record.external_provider_label) lines.push(`Provider: ${record.external_provider_label}`);
  if (record.external_mode) lines.push(`Mode: ${record.external_mode}`);

  if (status === 'completed') {
    lines.push(
      `Provider similarity score: ${
        typeof record.external_similarity_percent === 'number' ? percent(record.external_similarity_percent) : 'not reported'
      }`,
      `Sources reported: ${(record.external_sources || []).length}`,
    );
    if (typeof record.external_words === 'number') lines.push(`Words reported by the provider: ${record.external_words}`);
    (record.external_sources || []).forEach((source) => {
      lines.push(
        `- ${source.title || source.url || 'source not named'}${source.url ? ` (${source.url})` : ''}` +
          `${typeof source.matched_words === 'number' ? ` — ${source.matched_words} matched words` : ''}`,
      );
    });
    lines.push('The score counts matching words, including properly quoted and cited material. Similarity is not plagiarism.');
  } else if (status === 'unavailable') {
    lines.push(
      'NOT CONFIGURED: no external similarity provider is available, so no internet, publisher or repository',
      'search was performed. This section contains no similarity data.',
      record.external_error || '',
    );
  } else if (status === 'failed') {
    lines.push(record.external_error || 'The provider scan failed.');
  } else if (status === 'pending' || status === 'processing') {
    lines.push('The provider has not returned its completed report yet.');
  } else {
    lines.push('No external similarity scan was requested for this submission.');
  }

  if (record.external_scan_id) lines.push(`Provider scan identifier: ${record.external_scan_id}`);
  lines.push('');
  return lines;
}

function internalLines(record) {
  const lines = [
    'SECTION B — INTERNAL SIMILARITY (SUPPLEMENTARY)',
    '----------------------------------------------',
    `Internal similarity: ${percent(record.similarity_percent)}`,
    `Matched passages: ${record.matched_passage_count || 0}`,
    `Repeated passages within the document: ${record.repeated_passage_count || 0}`,
    `Compared against ${record.corpus_documents || 0} previously analysed submission(s)`
      + ` (${record.corpus_words || 0} words) from this workspace.`,
    'This compares the text only with submissions already analysed here. It is not an internet search and must not',
    'be presented as plagiarism detection.',
    '',
  ];
  const matches = Array.isArray(record.match_summary) ? record.match_summary : [];
  if (matches.length) {
    lines.push('Matching passages:');
    matches.forEach((match) => {
      lines.push(
        `- Passage ${Number(match.index) + 1} matches "${match.source_title}"`
          + `${match.source_reference ? ` (${match.source_reference})` : ''} at ${percent(match.overlap_percent)} overlap.`,
      );
      if (match.excerpt) lines.push(`  ${match.excerpt}`);
    });
  } else {
    lines.push('No matching passages were found in this workspace.');
  }
  lines.push('');
  return lines;
}

function detectorLines(record) {
  const status = record.detector_status || 'skipped';
  const lines = ['SECTION C — AI-WRITING DETECTION', '---------------------------------'];
  lines.push(`Status: ${DETECTOR_STATUS[status] || status}`);
  if (record.detector_provider_label) lines.push(`Detector: ${record.detector_provider_label}`);
  if (record.detector_model) lines.push(`Model: ${record.detector_model}`);
  if (record.detector_mode) lines.push(`Mode: ${record.detector_mode}`);

  if (status === 'completed') {
    lines.push(
      `Classification: ${record.detector_class || 'not reported'}`,
      `AI probability (provider): ${share(record.detector_ai_share)}`,
    );
    if (record.detector_confidence) lines.push(`Provider confidence: ${record.detector_confidence}`);
    if (record.detector_message) lines.push('', record.detector_message);
    const scored = (record.detector_sections || []).filter((row) => typeof row.probability === 'number');
    if (scored.length) {
      lines.push('', 'Sentence-level indicators returned by the detector:');
      scored.slice(0, 20).forEach((row) => {
        lines.push(`- ${share(row.probability)} — ${row.text || `section ${row.index + 1}`}`);
      });
    }
    if (record.detector_characters) lines.push('', `Characters submitted: ${record.detector_characters}`);
  } else if (status === 'unavailable') {
    lines.push(
      'NOT CONFIGURED: no AI-writing detector is available, so no detection was performed and no score exists.',
      record.detector_error || '',
    );
  } else if (status === 'failed') {
    lines.push(record.detector_error || 'The detector did not return a result.');
  } else {
    lines.push('AI-writing detection was not requested for this submission.');
  }

  if (!record.detector_status && record.ai_status === 'completed') {
    lines.push(
      '',
      'This record predates the detector integration and holds a retired language-model screening note,',
      'which is not a detector output and is not comparable with a detector result.',
    );
  }
  lines.push('');
  return lines;
}

/**
 * The report as plain text, built only from values stored on the record, so a
 * copied or downloaded file says exactly what the screen says.
 */
export function buildReportText(record) {
  if (!record) return '';
  const lines = [
    'ACADEMIC INTEGRITY REPORT',
    '========================',
    '',
    `Submission: ${record.title}`,
    `Student or submission reference: ${record.student_reference || 'not given'}`,
    `Word count: ${record.word_count || 0}`,
    `Analysed: ${STAMP(record.analyzed_at)}`,
    '',
    ...externalLines(record),
    ...internalLines(record),
    ...detectorLines(record),
    'INTERPRETATION',
    '--------------',
    'Similarity is not plagiarism: quotations, citations, bibliographies and standard method wording produce',
    'matches. AI-writing likelihood is not proof of AI use: detectors produce false positives on human writing',
    'and false negatives on edited machine text. Both are indicators for qualified human review only. No',
    'accusation, grade deduction or sanction follows from this report.',
    '',
  ];
  return lines.filter((line) => line !== undefined && line !== null).join('\n');
}

export async function copyReport(text) {
  await navigator.clipboard.writeText(text);
}

export function downloadReport(text, title) {
  const safeName = String(title || 'academic-integrity-report')
    .replace(/[^a-z0-9\-_ ]/gi, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase() || 'academic-integrity-report';
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${safeName}.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export { STAMP as formatAnalysisStamp };