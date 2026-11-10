// Section-anchored synchronisation: the panels are aligned by document section
// id, never by assuming the original and translated paragraphs have the same
// height. Nothing here measures text, so a long translation cannot drag the
// other panel out of position.
const nearestSection = (container) => {
  const nodes = container.querySelectorAll('[data-section-id]');
  if (!nodes.length) return null;
  const top = container.getBoundingClientRect().top;
  let best = null;
  let bestDelta = Number.POSITIVE_INFINITY;
  nodes.forEach((node) => {
    const delta = Math.abs(node.getBoundingClientRect().top - top);
    if (delta < bestDelta) {
      bestDelta = delta;
      best = node;
    }
  });
  return best;
};

export function alignPanels(source, target) {
  if (!source || !target) return;
  const node = nearestSection(source);
  if (!node) return;
  const mirror = target.querySelector(`[data-section-id="${node.dataset.sectionId}"]`);
  if (!mirror) return;
  const offset = node.getBoundingClientRect().top - source.getBoundingClientRect().top;
  const delta = mirror.getBoundingClientRect().top - target.getBoundingClientRect().top - offset;
  if (Math.abs(delta) > 2) target.scrollTop += delta;
}

export function scrollToSection(container, id, offset = 12) {
  if (!container || !id) return;
  const node = container.querySelector(`[data-section-id="${id}"]`);
  if (!node) return;
  container.scrollTop += node.getBoundingClientRect().top - container.getBoundingClientRect().top - offset;
}

// Plain-text export of one side of the document, used for the translated
// download and for materials that have no attached file.
export function documentText(sections, side) {
  return sections
    .map((section) => {
      const heading = side === 'original' ? section.heading : section.translated_heading || section.heading;
      const body = side === 'original' ? section.original : section.translated;
      return [heading ? `## ${heading}` : '', body].filter(Boolean).join('\n\n');
    })
    .filter(Boolean)
    .join('\n\n');
}

export function downloadTextFile(filename, text) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}