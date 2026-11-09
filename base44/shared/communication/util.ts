// Small shared helpers for the communication layer.
export const list = (page) => (Array.isArray(page) ? page : page?.items || []);

export const nowIso = () => new Date().toISOString();

export const clean = (value, max) =>
  String(value ?? '')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, ' ')
    .trim()
    .slice(0, max);

// Messages are stored and rendered as plain text; every HTML-ish character is
// neutralised here so no message can ever be interpreted as markup.
export const plainText = (value, max = 4000) =>
  clean(value, max).replace(/[<>]/g, (char) => (char === '<' ? '\u003c' : '\u003e'));

export const preview = (value, max = 120) => {
  const text = plainText(value, max + 40);
  return text.length > max ? `${text.slice(0, max)}…` : text;
};

export const pairKey = (a, b) => [a, b].sort().join('|');

// Counts rows created after a timestamp — used for server-side rate limits that
// hold across devices and cannot be reset from the browser.
export async function countSince(svc, entityName, query, windowMs) {
  const since = new Date(Date.now() - windowMs).toISOString();
  return svc.entities[entityName].count({ ...query, created_date: { $gte: since } });
}

export async function sha256Hex(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function randomToken(bytes = 32) {
  const buffer = new Uint8Array(bytes);
  crypto.getRandomValues(buffer);
  return [...buffer].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}