// Account aliases. A username is a directory attribute of an account, never an
// identity and never a permission: the platform account id and its role remain
// the only authority, so changing an alias can never widen access.

export const USERNAME_MIN = 3;
export const USERNAME_MAX = 32;

// Names that could be mistaken for a system or support identity.
const RESERVED = new Set([
  'admin',
  'administrator',
  'root',
  'system',
  'support',
  'security',
  'staff',
  'registrar',
  'dean',
  'professor',
  'student',
  'office',
  'helpdesk',
  'webmaster',
  'postmaster',
  'hostmaster',
  'abuse',
  'api',
  'www',
  'mail',
  'null',
  'undefined',
  'true',
  'false',
]);

export function normalizeUsername(value) {
  return String(value || '').trim().toLowerCase();
}

// Returns '' when the alias is acceptable, otherwise the reason to show.
export function usernameError(value) {
  const username = normalizeUsername(value);
  if (!username) return 'A username is required';
  if (username.length < USERNAME_MIN || username.length > USERNAME_MAX) {
    return `A username must be between ${USERNAME_MIN} and ${USERNAME_MAX} characters`;
  }
  if (!/^[a-z][a-z0-9._-]*$/.test(username)) {
    return 'A username starts with a letter and may contain letters, digits, full stops, hyphens and underscores';
  }
  if (/[._-]{2,}/.test(username)) return 'A username cannot contain two separators in a row';
  if (/[._-]$/.test(username)) return 'A username cannot end with a separator';
  if (RESERVED.has(username)) return 'That username is reserved';
  return '';
}

const rows = (page) => (Array.isArray(page) ? page : page?.items || []);

// Case-insensitive collision check across every account. The owner's own record
// is excluded so re-saving an unchanged alias is never treated as a conflict.
export async function usernameOwner(sr, value, exceptUserId = '') {
  const username = normalizeUsername(value);
  if (!username) return null;
  const users = rows(await sr.entities.User.list('-created_date', 500));
  return users.find((row) => row.id !== exceptUserId && normalizeUsername(row.username) === username) || null;
}

// Conflicts that already exist in stored data — reported, never silently merged.
export function duplicateUsernames(accounts) {
  const grouped = new Map();
  for (const row of accounts || []) {
    const username = normalizeUsername(row.username);
    if (!username) continue;
    const bucket = grouped.get(username) || [];
    bucket.push(row);
    grouped.set(username, bucket);
  }
  return [...grouped.entries()]
    .filter(([, bucket]) => bucket.length > 1)
    .map(([username, bucket]) => ({
      username,
      count: bucket.length,
      names: bucket.map((row) => row.full_name || row.email || row.id),
    }));
}