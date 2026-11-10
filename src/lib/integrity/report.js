const stamp = (value) => {
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

const LEVELS = { low: 'Low indicator level', moderate: 'Moderate indicator level', elevated: 'Elevated indicator level' };

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
    `Analysed: ${stamp(record.analyzed_at)}`,
    '',
    'SIMILARITY — INTERNAL TEXT SIMILARITY CHECK',
    '-------------------------------------------',
    `Overall similarity: ${percent(record.similarity_percent)}`,
    `Matched passages: ${record.matched_passage_count || 0}`,
    `Repeated passages within the document: ${record.repeated_passage_count || 0}`,
    `Compared against ${record.corpus_documents || 0} previously analysed submission(s)`
      + ` (${record.corpus_words || 0} words) from this workspace.`,
    'No external plagiarism database, citation index or institutional archive was queried.',
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
    lines.push('');
  } else {
    lines.push('No matching passages were found in the available comparison set.', '');
  }

  lines.push('AI-WRITING DETECTION — SCREENING PROTOTYPE', '------------------------------------------');
  if (record.ai_status === 'completed') {
    lines.push(`Indicator level: ${LEVELS[record.ai_indicator_level] || 'not recorded'}`);
    if (record.ai_summary) lines.push('', record.ai_summary);
    const observations = Array.isArray(record.ai_observations) ? record.ai_observations : [];
    if (observations.length) {
      lines.push('', 'Observations:');
      observations.forEach((row) => lines.push(`- ${row.signal}: ${row.detail}`));
    }
    const flaggedPassages = Array.isArray(record.ai_flagged) ? record.ai_flagged : [];
    if (flaggedPassages.length) {
      lines.push('', 'Passages worth a human look:');
      flaggedPassages.forEach((row) => lines.push(`- ${row.reason}${row.excerpt ? ` — "${row.excerpt}"` : ''}`));
    }
    lines.push('', `Human review recommended: ${record.ai_human_review ? 'yes' : 'no'}`);
    if (record.ai_truncated) lines.push('The screening covered the first part of the document only.');
  } else if (record.ai_status === 'failed') {
    lines.push(record.ai_note || 'The screening service did not return a result.');
  } else {
    lines.push('Not run: AI-writing screening was not selected for this analysis.');
  }
  lines.push(
    '',
    'This screening uses a general-purpose language model. It is not a validated AI-text detector,',
    'it produces no probability, and it cannot establish misconduct. Every result is a prompt for',
    'human review, never a finding.',
    '',
  );

  return lines.join('\n');
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

export { stamp as formatAnalysisStamp };