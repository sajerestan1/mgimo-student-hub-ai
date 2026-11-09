// Client-side account vocabulary shared by the administrative screens, the
// profile screens and the access gate. Authorisation itself lives on the
// server (adminUsers / accountSession); nothing here grants access.

export const ROLE_LABELS = {
  admin: 'Administrator',
  dean: 'Dean',
  deputy_dean: 'Deputy Dean',
  faculty_admin: 'Faculty administrator',
  department_head: 'Department head',
  professor: 'Professor',
  academic_staff: 'Academic staff',
  student: 'Student',
  user: 'Unassigned',
};

export const STATUS_LABELS = {
  active: 'Active',
  suspended: 'Suspended',
  deactivated: 'Deactivated',
};

export const STATUS_TONES = {
  active: 'positive',
  suspended: 'warning',
  deactivated: 'critical',
};

export const ROLE_TONES = {
  admin: 'critical',
  professor: 'brand',
  student: 'neutral',
  user: 'warning',
};

export const ADMIN_ROLES = ['admin'];

// Student provisioning vocabulary. The server decides the status; these only
// label it for the administration screens.
export const PROVISION_STATUS_LABELS = {
  pending_invitation: 'Pending invitation',
  provisioning: 'Provisioning',
  provisioned: 'Provisioned',
  linked: 'Linked',
  conflict: 'Conflict',
  failed: 'Failed',
};

export const PROVISION_STATUS_TONES = {
  pending_invitation: 'warning',
  provisioning: 'brand',
  provisioned: 'positive',
  linked: 'positive',
  conflict: 'critical',
  failed: 'critical',
};

export const LINK_LABELS = {
  linked: 'Linked',
  pending: 'Awaiting first sign-in',
};

export const INVITATION_LABELS = {
  sent: 'Invitation sent',
  already_registered: 'Account already registered',
  not_required: 'Not required — account exists',
};

export function accountRoleLabel(account) {
  if (!account) return 'Unassigned';
  if (account.role === 'admin') {
    return account.admin_level === 'super' ? 'Super Administrator' : 'Administrator';
  }
  return ROLE_LABELS[account.role] || 'Unassigned';
}

export function isAdministrator(account) {
  return account?.role === 'admin';
}

// Compulsory profile data, and who is allowed to supply it. The signed-in user
// can supply the first group; the rest is assigned by the administration.
const PROFILE_REQUIREMENTS = {
  student: [
    { key: 'phone', label: 'Phone number', owner: 'self' },
    { key: 'contact_email', label: 'Email address', owner: 'admin' },
    { key: 'photo_uri', label: 'Profile photo', owner: 'self' },
    { key: 'group_name', label: 'Class / group', owner: 'admin' },
    { key: 'faculty_id', label: 'Faculty', owner: 'admin' },
  ],
  professor: [
    { key: 'phone', label: 'Phone number', owner: 'self' },
    { key: 'contact_email', label: 'Email address', owner: 'admin' },
    { key: 'photo_uri', label: 'Profile photo', owner: 'self' },
    { key: 'faculty_id', label: 'Faculty', owner: 'admin' },
  ],
  default: [
    { key: 'phone', label: 'Phone number', owner: 'self' },
    { key: 'contact_email', label: 'Email address', owner: 'admin' },
    { key: 'photo_uri', label: 'Profile photo', owner: 'self' },
  ],
};

export function missingProfileFields(account) {
  const requirements = PROFILE_REQUIREMENTS[account?.role] || PROFILE_REQUIREMENTS.default;
  const merged = { ...account, contact_email: account?.contact_email || account?.email };
  return requirements.filter((item) => {
    const value = merged?.[item.key];
    return !value || String(value).trim() === '';
  });
}

export function selfFixableFields(account) {
  return missingProfileFields(account).filter((item) => item.owner === 'self');
}

export const dateLabel = (value) =>
  value ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export const initialsOf = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();