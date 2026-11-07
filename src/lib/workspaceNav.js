import { MODULE_PATHS as P } from '@/lib/moduleRoutes';

// Navigation is a role contract: the three lists share no module wording and
// each entry resolves inside that role's own route space.
export const NAV_BY_ROLE = {
  student: [
    {
      label: '',
      items: [
        { to: P.student.dashboard, label: 'Dashboard', icon: 'LayoutDashboard' },
        { to: P.student.courses, label: 'My Courses', icon: 'BookOpen' },
        { to: P.student.timetable, label: 'Timetable', icon: 'CalendarDays' },
        { to: P.student.assignments, label: 'Assignments', icon: 'ClipboardList' },
        { to: P.student.quizzes, label: 'Quizzes & Exams', icon: 'ClipboardCheck' },
        { to: P.student.grades, label: 'Grades & Transcript', icon: 'GraduationCap' },
        { to: P.student.attendance, label: 'Attendance', icon: 'CalendarCheck' },
        { to: P.student.applications, label: 'Applications & Certificates', icon: 'FileText' },
        { to: P.student.library, label: 'Library', icon: 'BookMarked' },
        { to: P.student.notifications, label: 'Notifications', icon: 'Bell' },
        { to: P.student.ai, label: 'AI Study Companion', icon: 'Sparkles' },
        { to: P.student.profile, label: 'Profile & Settings', icon: 'UserRound' },
      ],
    },
    {
      label: 'Support',
      items: [
        { to: '/help', label: 'Help & Support', icon: 'LifeBuoy' },
        { label: 'Logout', icon: 'LogOut', action: 'logout' },
      ],
    },
  ],
  professor: [
    {
      label: 'Teaching',
      items: [
        { to: P.professor.dashboard, label: 'Dashboard', icon: 'LayoutDashboard' },
        { to: P.professor.teaching, label: 'My Teaching', icon: 'Presentation' },
        { to: P.professor.courses, label: 'My Courses', icon: 'BookOpen' },
        { to: P.professor.materials, label: 'Course Materials', icon: 'FolderOpen' },
      ],
    },
    {
      label: 'Assessment',
      items: [
        { to: P.professor.assignments, label: 'Assignments', icon: 'ClipboardList' },
        { to: P.professor.quizzes, label: 'Quizzes & Exams', icon: 'ClipboardCheck' },
        { to: P.professor.grading, label: 'Submissions & Grading', icon: 'GraduationCap' },
        { to: P.professor.bulkGrading, label: 'Bulk Grading', icon: 'FileSpreadsheet' },
        { to: P.professor.gradeEntry, label: 'Grade Entry', icon: 'PenLine' },
        { to: P.professor.attendance, label: 'Attendance Management', icon: 'CalendarCheck' },
      ],
    },
    {
      label: 'Cohort & support',
      items: [
        { to: P.professor.students, label: 'Student Performance', icon: 'TrendingUp' },
        { to: P.professor.discussions, label: 'Discussions', icon: 'MessagesSquare' },
        { to: P.professor.ai, label: 'AI Teaching Assistant', icon: 'Sparkles' },
        { to: P.professor.profile, label: 'Profile & Settings', icon: 'UserRound' },
      ],
    },
    {
      label: 'Support',
      items: [{ to: '/help', label: 'Help & Support', icon: 'LifeBuoy' }],
    },
  ],
  dean: [
    {
      label: 'Command center',
      items: [
        { to: P.dean.dashboard, label: 'Command Center', icon: 'LayoutDashboard' },
        { to: P.dean.faculties, label: 'Faculties', icon: 'Building2', soon: true },
        { to: P.dean.departments, label: 'Departments', icon: 'Network', soon: true },
        { to: P.dean.programmes, label: 'Academic Programmes', icon: 'BookOpen', soon: true },
      ],
    },
    {
      label: 'People',
      items: [
        { to: P.dean.students, label: 'Students', icon: 'Users', soon: true },
        { to: P.dean.professors, label: 'Professors', icon: 'Presentation', soon: true },
        { to: P.dean.courses, label: 'Courses', icon: 'GraduationCap', soon: true },
      ],
    },
    {
      label: 'Intelligence',
      items: [
        { to: P.dean.performance, label: 'Academic Performance', icon: 'TrendingUp', soon: true },
        { to: P.dean.attendance, label: 'Attendance Analytics', icon: 'CalendarCheck', soon: true },
        { to: P.dean.risk, label: 'Academic Risk Radar', icon: 'Radar', soon: true },
        { to: P.dean.reports, label: 'Reports & Insights', icon: 'BarChart3', soon: true },
        { to: P.dean.profile, label: 'Profile & Settings', icon: 'UserRound' },
      ],
    },
    {
      label: 'Support',
      items: [
        { to: P.student.dashboard, label: 'Student workspace', icon: 'Users' },
        { to: '/help', label: 'Help & Support', icon: 'LifeBuoy' },
      ],
    },
  ],
};

export const ACCOUNT_NAV = [{ to: '/help', label: 'Help & Support', icon: 'LifeBuoy' }];