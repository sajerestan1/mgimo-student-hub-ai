// Role-scoped module routes. Every role owns its own path space, so a student
// link can never resolve to a professor module and vice versa.

export const MODULE_PATHS = {
  student: {
    dashboard: '/student/dashboard',
    courses: '/student/courses',
    timetable: '/student/timetable',
    assignments: '/student/assignments',
    quizzes: '/student/quizzes',
    grades: '/student/grades',
    attendance: '/student/attendance',
    applications: '/student/applications',
    library: '/student/library',
    notifications: '/student/notifications',
    ai: '/student/ai-study-companion',
    profile: '/student/profile',
  },
  professor: {
    dashboard: '/professor/dashboard',
    teaching: '/professor/teaching',
    courses: '/professor/courses',
    materials: '/professor/materials',
    assignments: '/professor/assignments',
    quizzes: '/professor/quizzes',
    grading: '/professor/grading',
    attendance: '/professor/attendance',
    students: '/professor/student-performance',
    discussions: '/professor/discussions',
    ai: '/professor/ai-assistant',
    profile: '/profile',
  },
  dean: {
    dashboard: '/dean/dashboard',
    faculties: '/dean/faculties',
    departments: '/dean/departments',
    programmes: '/dean/programmes',
    students: '/dean/students',
    professors: '/dean/professors',
    courses: '/dean/courses',
    performance: '/dean/performance',
    attendance: '/dean/attendance',
    risk: '/dean/risk-radar',
    reports: '/dean/reports',
    profile: '/profile',
  },
};

// Modules that are still design-stage placeholders. The student workspace is
// fully routed below, so none of its paths appear here.
export const MODULE_INFO = {
  '/professor/teaching': { title: 'My Teaching' },
  '/professor/courses': { title: 'Courses' },
  '/professor/materials': { title: 'Course Materials' },
  '/professor/assignments': { title: 'Assignments' },
  '/professor/quizzes': { title: 'Quizzes' },
  '/professor/grading': { title: 'Submissions & Grading' },
  '/professor/attendance': { title: 'Attendance Management' },
  '/professor/student-performance': { title: 'Student Performance' },
  '/professor/discussions': { title: 'Discussions' },
  '/professor/ai-assistant': { title: 'AI Teaching Assistant' },
  '/dean/faculties': { title: 'Faculties' },
  '/dean/departments': { title: 'Departments' },
  '/dean/programmes': { title: 'Academic Programmes' },
  '/dean/students': { title: 'Students' },
  '/dean/professors': { title: 'Professors' },
  '/dean/courses': { title: 'Courses' },
  '/dean/performance': { title: 'Academic Performance' },
  '/dean/attendance': { title: 'Attendance Analytics' },
  '/dean/risk-radar': { title: 'Academic Risk Radar' },
  '/dean/reports': { title: 'Reports & Insights' },
};

// Paths rendered by the "in design" placeholder, registered as real routes.
export const COMING_SOON_ROUTES = Object.keys(MODULE_INFO);

export function modulePath(role, key) {
  const paths = MODULE_PATHS[role] || MODULE_PATHS.student;
  return paths[key] || paths.dashboard;
}