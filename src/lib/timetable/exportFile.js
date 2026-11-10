// Exports are produced from the rendered sheet and never touch the records
// they display: the file is a snapshot, the register stays the source of truth.
// The two heavy libraries are loaded on first use so the workspace stays light.
const SCALE = 3;
// The sheet paints its own canvas, so a capture that starts from the same
// colour has no white seams around the rounded masthead.
const SHEET_BACKGROUND = '#F6F8FC';

const capture = async (node) => {
  const { default: html2canvas } = await import('html2canvas');
  return html2canvas(node, {
    scale: SCALE,
    backgroundColor: SHEET_BACKGROUND,
    logging: false,
    useCORS: true,
    windowWidth: node.scrollWidth,
    windowHeight: node.scrollHeight,
  });
};

const baseName = (slug, weekStart) => `academic-intelligence-${slug}-${weekStart}`;

function download(href, filename) {
  const link = document.createElement('a');
  link.href = href;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export async function exportPng(node, { slug, weekStart }) {
  const canvas = await capture(node);
  download(canvas.toDataURL('image/png'), `${baseName(slug, weekStart)}.png`);
}

export async function exportPdf(node, { slug, weekStart }) {
  const canvas = await capture(node);
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 9;
  const ratio = Math.min(
    (pageWidth - margin * 2) / canvas.width,
    (pageHeight - margin * 2) / canvas.height,
  );
  const width = canvas.width * ratio;
  const height = canvas.height * ratio;
  pdf.addImage(
    canvas.toDataURL('image/png'),
    'PNG',
    (pageWidth - width) / 2,
    (pageHeight - height) / 2,
    width,
    height,
    undefined,
    'FAST',
  );
  pdf.save(`${baseName(slug, weekStart)}.pdf`);
}

// Printing goes through a throwaway frame: no navigation, no interface, and
// the whole week on one A4 landscape sheet.
export async function printSheet(node) {
  const canvas = await capture(node);
  const image = canvas.toDataURL('image/png');
  const frame = document.createElement('iframe');
  frame.setAttribute('aria-hidden', 'true');
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
  document.body.appendChild(frame);
  const doc = frame.contentDocument;
  doc.open();
  doc.write(
    `<!doctype html><html><head><title>Weekly timetable</title><style>@page{size:A4 landscape;margin:8mm}html,body{margin:0;padding:0;background:#fff}img{display:block;width:100%;height:auto}</style></head><body><img src="${image}" alt="Weekly timetable"></body></html>`,
  );
  doc.close();
  setTimeout(() => {
    frame.contentWindow.focus();
    frame.contentWindow.print();
    setTimeout(() => frame.remove(), 60000);
  }, 180);
}

export async function shareSheet(node, { slug, weekStart, title }) {
  const canvas = await capture(node);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  const filename = `${baseName(slug, weekStart)}.png`;
  const file = new File([blob], filename, { type: 'image/png' });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    await navigator.share({ files: [file], title });
    return 'shared';
  }
  download(URL.createObjectURL(blob), filename);
  return 'downloaded';
}