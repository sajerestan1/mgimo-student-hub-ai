// Reads a pasted or uploaded marks file: each line pairs a student identifier
// with a numeric mark, in either order, separated by comma, semicolon or tab.
export function parseGradeCsv(text) {
  const rows = [];
  String(text || '')
    .split(/\r?\n/)
    .filter((line) => line.trim())
    .forEach((line) => {
      const cells = line
        .split(/[,;\t]/)
        .map((cell) => cell.replace(/^"|"$/g, '').trim())
        .filter(Boolean);
      if (cells.length < 2) return;
      const scoreIndex = cells.findIndex((cell) => /^\d{1,3}([.,]\d+)?$/.test(cell));
      if (scoreIndex === -1) return;
      const score = Number(cells[scoreIndex].replace(',', '.'));
      const label = cells.find((cell, index) => index !== scoreIndex) || '';
      if (label && Number.isFinite(score)) rows.push({ label, score });
    });
  return rows;
}