export const NAV_BY_ROLE = {
  student: [
    {
      label: 'Workspace',
      items: [
        { to: '/student', label: 'My dashboard', icon: 'LayoutDashboard' },
        { to: '/schedule', label: 'Schedule', icon: 'CalendarDays', soon: true },
        { to: '/assignments', label: 'Assignments', icon: 'ClipboardList', soon: true },
        { to: '/grades', label: 'Grades', icon: 'GraduationCap', soon: true },
      ],
    },
    {
      label: 'Learning',
      items: [
        { to: '/courses', label: 'Courses', icon: 'BookOpen', soon: true },
        { to: '/lms', label: 'Learning platform', icon: 'MonitorPlay', soon: true },
        { to: '/attendance', label: 'Attendance', icon: 'CalendarCheck', soon: true },
        { to: '/applications', label: 'Applications', icon: 'FileText', soon: true },
      ],
    },
    {
      label: 'Communication',
      items: [
        { to: '/announcements', label: 'Announcements', icon: 'Megaphone', soon: true },
        { to: '/ai-assistant', label: 'AI study companion', icon: 'Sparkles', soon: true },
      ],
    },
  ],
  professor: [
    {
      label: 'Teaching',
      items: [
        { to: '/professor', label: 'My dashboard', icon: 'LayoutDashboard' },
        { to: '/courses', label: 'My courses', icon: 'BookOpen', soon: true },
        { to: '/assignments', label: 'Assignments & grading', icon: 'ClipboardList', soon: true },
        { to: '/attendance', label: 'Attendance', icon: 'CalendarCheck', soon: true },
        { to: '/schedule', label: 'Teaching schedule', icon: 'CalendarDays', soon: true },
      ],
    },
    {
      label: 'Cohorts',
      items: [
        { to: '/students', label: 'My students', icon: 'Users', soon: true },
        { to: '/grades', label: 'Grade book', icon: 'GraduationCap', soon: true },
        { to: '/announcements', label: 'Course announcements', icon: 'Megaphone', soon: true },
      ],
    },
    {
      label: 'Intelligence',
      items: [{ to: '/ai-assistant', label: 'AI teaching assistant', icon: 'Sparkles', soon: true }],
    },
  ],
  dean: [
    {
      label: 'Command',
      items: [
        { to: '/dean', label: 'Command center', icon: 'LayoutDashboard' },
        { to: '/faculty', label: 'Faculties', icon: 'Building2', soon: true },
        { to: '/departments', label: 'Departments', icon: 'Network', soon: true },
      ],
    },
    {
      label: 'People',
      items: [
        { to: '/students', label: 'Students', icon: 'Users', soon: true },
        { to: '/professors', label: 'Professors', icon: 'Presentation', soon: true },
      ],
    },
    {
      label: 'Insight',
      items: [
        { to: '/analytics', label: 'Academic analytics', icon: 'BarChart3', soon: true },
        { to: '/attendance', label: 'Attendance reports', icon: 'CalendarCheck', soon: true },
        { to: '/lms', label: 'Learning platform', icon: 'MonitorPlay', soon: true },
        { to: '/ai-assistant', label: 'AI academic assistant', icon: 'Sparkles', soon: true },
      ],
    },
    {
      label: 'Communication',
      items: [{ to: '/announcements', label: 'Announcements', icon: 'Megaphone', soon: true }],
    },
  ],
};

export const ACCOUNT_NAV = [
  { to: '/notifications', label: 'Notifications', icon: 'Bell' },
  { to: '/profile', label: 'Profile', icon: 'UserRound' },
  { to: '/settings', label: 'Settings', icon: 'Settings' },
  { to: '/help', label: 'Help & support', icon: 'LifeBuoy' },
];

export const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/student': 'Student Workspace',
  '/professor': 'Professor Workspace',
  '/dean': "Dean's Command Center",
  '/profile': 'Profile',
  '/settings': 'Settings',
  '/notifications': 'Notifications',
  '/help': 'Help & support',
  '/courses': 'Courses',
  '/lms': 'Learning platform',
  '/assignments': 'Assignments',
  '/grades': 'Grades',
  '/attendance': 'Attendance',
  '/schedule': 'Schedule',
  '/announcements': 'Announcements',
  '/applications': 'Applications',
  '/faculty': 'Faculties',
  '/departments': 'Departments',
  '/students': 'Students',
  '/professors': 'Professors',
  '/analytics': 'Academic analytics',
  '/ai-assistant': 'AI assistant',
};