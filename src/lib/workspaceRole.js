import { useAuth } from '@/lib/AuthContext';

export const WORKSPACES = {
  student: { role: 'student', label: 'Student', home: '/student', title: 'Student Workspace' },
  professor: { role: 'professor', label: 'Professor', home: '/professor', title: 'Professor Workspace' },
  dean: { role: 'dean', label: 'Dean', home: '/dean', title: "Dean's Command Center" },
};

// The workspace comes from the account's assigned role. Administrator accounts
// operate the dean's view; unknown roles fall back to the student workspace.
export function normalizeRole(user) {
  const role = String(user?.role || '').toLowerCase();
  if (role === 'student' || role === 'professor' || role === 'dean') return role;
  if (role === 'admin' || role === 'deputy_dean' || role === 'academic_staff') return 'dean';
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
    // The dean oversees every workspace; student and professor records are
    // fictional demonstration data, so previewing them is safe.
    canView: (target) => role === 'dean' || role === 'student' && target === 'student' || role === target,
  };
}