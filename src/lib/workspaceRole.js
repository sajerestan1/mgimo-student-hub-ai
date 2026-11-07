import { useAuth } from '@/lib/AuthContext';
import { MODULE_PATHS, modulePath } from '@/lib/moduleRoutes';

export const WORKSPACES = {
  student: { role: 'student', label: 'Student', home: MODULE_PATHS.student.dashboard, title: 'Student Workspace' },
  professor: {
    role: 'professor',
    label: 'Professor',
    home: MODULE_PATHS.professor.dashboard,
    title: 'Professor Workspace',
  },
  dean: { role: 'dean', label: 'Dean', home: MODULE_PATHS.dean.dashboard, title: "Dean's Command Center" },
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

export function useWorkspace() {
  const { user } = useAuth();
  const role = normalizeRole(user);
  const displayName = user?.full_name || user?.email?.split('@')[0] || 'Guest';

  return {
    user,
    role,
    displayName,
    workspace: WORKSPACES[role],
    // A workspace is visible only to accounts assigned that role: there is no
    // cross-role preview, and the dean cannot open a personal dashboard.
    canView: (target) => target === role,
    modulePath: (key) => modulePath(role, key),
  };
}

export function useModulePath() {
  const { modulePath: resolve } = useWorkspace();
  return resolve;
}