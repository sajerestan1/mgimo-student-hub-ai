import { MODULE_PATHS as P } from '@/lib/moduleRoutes';

// Navigation is a role contract: the three lists share no module wording and
// each entry resolves inside that role's own route space. Every label is a
// translation key, resolved by the component that renders it, so one language
// switch relabels the whole navigation.
export const NAV_BY_ROLE = {
  student: [
    {
      label: '',
      items: [
        { to: P.student.dashboard, label: 'nav.items.dashboard', icon: 'LayoutDashboard' },
        { to: P.student.courses, label: 'nav.items.courses', icon: 'BookOpen' },
        { to: P.student.timetable, label: 'nav.items.timetable', icon: 'CalendarDays' },
        { to: P.student.assignments, label: 'nav.items.assignments', icon: 'ClipboardList' },
        { to: P.student.quizzes, label: 'nav.items.quizzes', icon: 'ClipboardCheck' },
        { to: P.student.grades, label: 'nav.items.grades', icon: 'GraduationCap' },
        { to: P.student.attendance, label: 'nav.items.attendance', icon: 'CalendarCheck' },
        { to: P.student.intelligence, label: 'nav.items.intelligence', icon: 'BrainCircuit' },
        { to: P.student.applications, label: 'nav.items.applications', icon: 'FileText' },
        { to: P.student.library, label: 'nav.items.library', icon: 'BookMarked' },
        { to: P.student.studyGroups, label: 'nav.items.studyGroups', icon: 'Users' },
        { to: P.student.notifications, label: 'nav.items.notifications', icon: 'Bell' },
        { to: P.student.ai, label: 'nav.items.aiStudy', icon: 'Sparkles' },
        { to: P.student.recommendations, label: 'nav.items.recommendations', icon: 'Lightbulb' },
        { to: P.student.profile, label: 'nav.items.profileSettings', icon: 'UserRound' },
      ],
    },
    {
      label: 'nav.groups.communication',
      items: [
        { to: '/communication', label: 'nav.items.inbox', icon: 'Inbox' },
        { to: '/communication/groups', label: 'nav.items.myGroups', icon: 'MessagesSquare' },
        { to: '/communication/directory', label: 'nav.items.directory', icon: 'Users' },
        { to: '/communication/notifications', label: 'nav.items.notifications', icon: 'Bell' },
      ],
    },
    {
      label: 'nav.groups.support',
      items: [
        { to: '/help', label: 'nav.items.helpSupport', icon: 'LifeBuoy' },
        { label: 'nav.items.logout', icon: 'LogOut', action: 'logout' },
      ],
    },
  ],
  professor: [
    {
      label: 'nav.groups.teaching',
      items: [
        { to: P.professor.dashboard, label: 'nav.items.dashboard', icon: 'LayoutDashboard' },
        { to: P.professor.teaching, label: 'nav.items.myTeaching', icon: 'Presentation' },
        { to: P.professor.courses, label: 'nav.items.courses', icon: 'BookOpen' },
        { to: P.professor.materials, label: 'nav.items.content', icon: 'FolderOpen' },
        { to: P.professor.announcements, label: 'nav.items.announcements', icon: 'Megaphone' },
      ],
    },
    {
      label: 'nav.groups.assessment',
      items: [
        { to: P.professor.assignments, label: 'nav.items.assignments', icon: 'ClipboardList' },
        { to: P.professor.quizzes, label: 'nav.items.quizzes', icon: 'ClipboardCheck' },
        { to: P.professor.grading, label: 'nav.items.grading', icon: 'GraduationCap' },
        { to: P.professor.bulkGrading, label: 'nav.items.bulkGrading', icon: 'FileSpreadsheet' },
        { to: P.professor.gradeEntry, label: 'nav.items.gradeEntry', icon: 'PenLine' },
        { to: P.professor.attendance, label: 'nav.items.attendanceManagement', icon: 'CalendarCheck' },
        { to: P.professor.alerts, label: 'nav.items.gradeAlerts', icon: 'BellRing' },
      ],
    },
    {
      label: 'nav.groups.cohort',
      items: [
        { to: P.professor.students, label: 'nav.items.studentPerformance', icon: 'TrendingUp' },
        { to: P.professor.compare, label: 'nav.items.comparative', icon: 'Scale' },
        { to: P.professor.discussions, label: 'nav.items.discussions', icon: 'MessagesSquare' },
        { to: P.professor.ai, label: 'nav.items.aiTeaching', icon: 'Sparkles' },
        { to: P.professor.profile, label: 'nav.items.profileSettings', icon: 'UserRound' },
      ],
    },
    {
      label: 'nav.groups.communication',
      items: [
        { to: '/communication', label: 'nav.items.inbox', icon: 'Inbox' },
        { to: '/communication/groups', label: 'nav.items.courseGroups', icon: 'MessagesSquare' },
        { to: '/communication/directory', label: 'nav.items.directory', icon: 'Users' },
        { to: '/communication/notifications', label: 'nav.items.notifications', icon: 'Bell' },
      ],
    },
    {
      label: 'nav.groups.support',
      items: [{ to: '/help', label: 'nav.items.helpSupport', icon: 'LifeBuoy' }],
    },
  ],
  dean: [
    {
      label: 'nav.groups.commandCenter',
      items: [
        { to: P.dean.dashboard, label: 'nav.items.commandCenter', icon: 'LayoutDashboard' },
        { to: P.dean.faculties, label: 'nav.items.faculties', icon: 'Building2' },
        { to: P.dean.departments, label: 'nav.items.departments', icon: 'Network' },
        { to: P.dean.programmes, label: 'nav.items.programmes', icon: 'BookOpen' },
        { to: P.dean.timetable, label: 'nav.items.timetable', icon: 'CalendarDays' },
      ],
    },
    {
      label: 'nav.groups.people',
      items: [
        { to: P.dean.students, label: 'nav.items.students', icon: 'Users' },
        { to: P.dean.professors, label: 'nav.items.professors', icon: 'Presentation' },
        { to: P.dean.courses, label: 'nav.items.courseCatalogue', icon: 'GraduationCap' },
      ],
    },
    {
      label: 'nav.groups.intelligence',
      items: [
        { to: P.dean.ai, label: 'nav.items.aiAssistant', icon: 'Sparkles' },
        { to: P.dean.performance, label: 'nav.items.performance', icon: 'TrendingUp' },
        { to: P.dean.attendance, label: 'nav.items.attendanceAnalytics', icon: 'CalendarCheck' },
        { to: P.dean.risk, label: 'nav.items.riskRadar', icon: 'Radar' },
        { to: P.dean.reports, label: 'nav.items.reports', icon: 'BarChart3' },
        { to: P.dean.profile, label: 'nav.items.profileSettings', icon: 'UserRound' },
      ],
    },
    {
      label: 'nav.groups.administration',
      items: [
        { to: '/admin/users', label: 'nav.items.userManagement', icon: 'ShieldCheck', adminOnly: true },
      ],
    },
    {
      label: 'nav.groups.communication',
      items: [
        { to: '/communication', label: 'nav.items.officialMail', icon: 'Inbox' },
        { to: '/communication/groups', label: 'nav.items.classGroups', icon: 'MessagesSquare' },
        { to: '/communication/directory', label: 'nav.items.directory', icon: 'Users' },
        { to: '/communication/moderation', label: 'nav.items.moderation', icon: 'ShieldAlert', roles: ['admin', 'dean', 'deputy_dean'] },
        { to: '/communication/coordinators', label: 'nav.items.coordinators', icon: 'ShieldCheck', roles: ['admin', 'dean'] },
        { to: '/communication/notifications', label: 'nav.items.notifications', icon: 'Bell' },
      ],
    },
    {
      label: 'nav.groups.support',
      items: [
        { to: P.student.dashboard, label: 'nav.items.studentWorkspace', icon: 'Users' },
        { to: '/help', label: 'nav.items.helpSupport', icon: 'LifeBuoy' },
      ],
    },
  ],
};

export const ACCOUNT_NAV = [{ to: '/help', label: 'nav.items.helpSupport', icon: 'LifeBuoy' }];