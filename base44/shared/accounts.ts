// Shared account rules for the administrative functions: who may administer,
// which profile fields are compulsory, and how sensitive actions are audited.

export const ASSIGNABLE_ROLES = ['student', 'professor', 'admin'];

const REQUIRED_FIELDS = {
  student: [
    ['phone', 'Phone number'],
    ['contact_email', 'Email address'],
    ['photo_uri', 'Profile photo'],
    ['group_name', 'Class / group'],
    ['faculty_id', 'Faculty'],
  ],
  professor: [
    ['phone', 'Phone number'],
    ['contact_email', 'Email address'],
    ['photo_uri', 'Profile photo'],
    ['faculty_id', 'Faculty'],
  ],
  default: [
    ['phone', 'Phone number'],
    ['contact_email', 'Email address'],
    ['photo_uri', 'Profile photo'],
  ],
};

export function isAdmin(user) {
  return user?.role === 'admin';
}

export function isSuperAdmin(user) {
  return user?.role === 'admin' && user?.admin_level === 'super';
}

export function requiredFieldsFor(user) {
  return REQUIRED_FIELDS[String(user?.role || '')] || REQUIRED_FIELDS.default;
}

// A missing compulsory field is reported by its human label so the profile
// screens can list exactly what the account still owes.
export function missingFields(user) {
  const merged = { ...user, contact_email: user?.contact_email || user?.email };
  return requiredFieldsFor(merged)
    .filter(([key]) => {
      const value = merged?.[key];
      return !value || String(value).trim() === '';
    })
    .map(([, label]) => label);
}

export function isBlockedStatus(status) {
  return status === 'suspended' || status === 'deactivated';
}

export async function writeAudit(base44, { actor, action, targetId, target, details, outcome = 'success' }) {
  await base44.asServiceRole.entities.AuditLog.create({
    actor_name: actor?.full_name || actor?.email || 'Institutional system',
    actor_role: actor?.role || 'system',
    actor_user_id: actor?.id || '',
    action,
    target: target || '',
    target_user_id: targetId || '',
    details: details || '',
    outcome,
    logged_at: new Date().toISOString(),
  });
}