// Resolves the signed-in account to its one institutional Student record.
//
// Identity is established server-side only. Two things are accepted:
//   1. a Student record already linked to this account (user_id), or
//   2. a Student record the student office prepared whose verified sign-in
//      email matches and which no other account has claimed.
//
// A record belonging to another account is never taken over, an ambiguous
// match (two unlinked records on the same address) is never guessed, and the
// browser never supplies a student id. Adopting the prepared record instead of
// duplicating it keeps one student, one record.

const list = (page) => (Array.isArray(page) ? page : page?.items || []);
const norm = (value) => String(value || '').toLowerCase().trim();

// Only a student-facing account may claim a student record.
const STUDENT_ACCOUNT_ROLES = ['student', 'user', ''];

export async function resolveStudentAccount(base44, user) {
  if (!user?.id) return null;
  const svc = base44.asServiceRole;

  const linked = list(await svc.entities.Student.filter({ user_id: user.id }, { limit: 2 }));
  if (linked.length) return linked[0];

  const role = norm(user.role);
  if (!STUDENT_ACCOUNT_ROLES.includes(role)) return null;

  const address = norm(user.email);
  if (!address) return null;

  const direct = list(await svc.entities.Student.filter({ email: address }, { limit: 5 }));
  const scanned = direct.length
    ? direct
    : list(await svc.entities.Student.list('-created_date', 300)).filter((row) => norm(row.email) === address);
  const matches = scanned.filter((row) => norm(row.email) === address);

  // A record that already belongs to somebody else blocks adoption outright.
  if (matches.some((row) => row.user_id && row.user_id !== user.id)) return null;

  const adoptable = matches.filter((row) => !row.user_id);
  if (adoptable.length !== 1) return null;

  return await svc.entities.Student.update(adoptable[0].id, { user_id: user.id });
}