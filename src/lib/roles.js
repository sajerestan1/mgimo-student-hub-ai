export const ROLE_LABELS = {
  admin: 'Administrator',
  dean: 'Dean',
  deputy_dean: 'Deputy Dean',
  faculty_admin: 'Faculty Administrator',
  department_head: 'Department Head',
  professor: 'Professor',
  academic_staff: 'Academic Staff',
  student: 'Student',
  user: 'Staff Member',
};

export const ADMIN_ROLES = ['admin', 'dean', 'deputy_dean', 'academic_staff'];
export const LEADERSHIP_ROLES = ['admin', 'dean', 'deputy_dean'];
export const STAFF_ROLES = [
  'admin',
  'dean',
  'deputy_dean',
  'academic_staff',
  'faculty_admin',
  'department_head',
  'professor',
];

export const NAV_ITEMS = [
  { to: '/', label: 'Executive Dashboard', icon: 'LayoutDashboard', end: true, roles: STAFF_ROLES },
  { to: '/faculties', label: 'Faculties & Departments', icon: 'Building2', roles: STAFF_ROLES },
  { to: '/students', label: 'Student Management', icon: 'Users', roles: STAFF_ROLES },
  { to: '/staff', label: 'Professors & Staff', icon: 'GraduationCap', roles: STAFF_ROLES },
  { to: '/attendance', label: 'Attendance Management', icon: 'CalendarCheck', roles: STAFF_ROLES },
  { to: '/performance', label: 'Academic Performance', icon: 'TrendingUp', roles: STAFF_ROLES },
  { to: '/requests', label: 'Applications & Requests', icon: 'FileText', badge: 'requests', roles: STAFF_ROLES },
  { to: '/calendar', label: 'Academic Calendar', icon: 'CalendarDays', roles: STAFF_ROLES },
  { to: '/announcements', label: 'Announcements', icon: 'Megaphone', roles: STAFF_ROLES },
  { to: '/intelligence', label: 'University Intelligence', icon: 'Radar', roles: STAFF_ROLES },
  { to: '/assistant', label: 'AI Dean Assistant', icon: 'Sparkles', roles: STAFF_ROLES },
  { to: '/reports', label: 'Reports & Analytics', icon: 'BarChart3', roles: STAFF_ROLES },
  { to: '/settings', label: 'Administration & Settings', icon: 'Settings', roles: STAFF_ROLES },
];

export function roleLabel(role) {
  return ROLE_LABELS[role] || 'Staff Member';
}

export function canSeeAllFaculties(role) {
  return LEADERSHIP_ROLES.includes(role) || role === 'academic_staff' || role === 'professor';
}