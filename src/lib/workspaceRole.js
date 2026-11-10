import { useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { MODULE_PATHS, modulePath } from '@/lib/moduleRoutes';

// `portalLabel` is the short identity shown above the signed-in user in the
// sidebar. It follows the workspace the account is actually working in, so a
// professor never sees student branding. Every human-readable value here is a
// translation key resolved where it is rendered.
export const WORKSPACES = {
  student: {
    role: 'student',
    label: 'workspace.student.label',
    home: MODULE_PATHS.student.dashboard,
    title: 'workspace.student.title',
    portalLabel: 'workspace.student.portal',
  },
  professor: {
    role: 'professor',
    label: 'workspace.professor.label',
    home: MODULE_PATHS.professor.dashboard,
    title: 'workspace.professor.title',
    portalLabel: 'workspace.professor.portal',
  },
  dean: {
    role: 'dean',
    label: 'workspace.dean.label',
    home: MODULE_PATHS.dean.dashboard,
    title: 'workspace.dean.title',
    portalLabel: 'workspace.dean.portal',
  },
};

// Roles that operate the institutional command centre. Professors keep the
// teaching workspace, students the personal one. Anything unrecognised falls
// back to the student workspace, which is the least privileged surface.
const DEAN_LEVEL_ROLES = [
  'admin',
  'dean',
  'deputy_dean',
  'academic_staff',
  'faculty_admin',
  'department_head',
];

export function normalizeRole(user) {
  const role = String(user?.role || '').toLowerCase();
  if (role === 'student') return 'student';
  if (role === 'professor') return 'professor';
  if (DEAN_LEVEL_ROLES.includes(role)) return 'dean';
  return 'student';
}

const PREFIXES = [
  ['/student', 'student'],
  ['/professor', 'professor'],
  ['/dean', 'dean'],
];

export function useWorkspace() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const role = normalizeRole(user);

  // A route prefix decides which workspace is being shown. Students and
  // professors are confined to their own prefix; the dean's office (including
  // administrators) may inspect the student workspace, which is the product
  // surface they operate, so its routes must open instead of bouncing back.
  const requested = PREFIXES.find(([prefix]) => pathname.startsWith(prefix))?.[1];
  const activeRole = requested && (requested === role || (role === 'dean' && requested === 'student'))
    ? requested
    : role;

  const displayName = user?.full_name || user?.email?.split('@')[0] || '';
  const workspace = WORKSPACES[activeRole];

  return {
    user,
    role,
    activeRole,
    displayName,
    workspace,
    preview: activeRole !== role,
    canView: (target) => target === role || (role === 'dean' && target === 'student'),
    modulePath: (key) => modulePath(activeRole, key),
  };
}

export function useModulePath() {
  const { modulePath: resolve } = useWorkspace();
  return resolve;
}