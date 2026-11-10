// Fictional demonstration dataset for Academic Intelligence (Stage 1).
// All people, records and metrics below are synthetic and exist only for the
// Digital Dean demonstration environment.

export const UNIVERSITY = {
  name: 'Digital Dean',
  platform: 'Academic Intelligence',
  tagline: 'Your Academic Journey. One Intelligent Platform.',
  shortName: 'DD',
  academicYear: '2026 / 2027',
  semester: 'Fall Semester',
  updated: 'Updated 7 Nov, 08:40',
  disclaimer:
    'Digital Dean is a fictional institution. All people, records and metrics shown are synthetic demonstration data.',
};

export const FACULTIES = [
  {
    id: 'eco',
    code: 'ECO',
    name: 'Faculty of Economics',
    dean: 'Prof. Helena Marsh',
    students: 1240,
    professors: 86,
    gpa: 4.18,
    attendance: 93.1,
    support: 41,
    trend: 2.4,
  },
  {
    id: 'ir',
    code: 'IR',
    name: 'Faculty of International Relations',
    dean: 'Prof. Daniel Ríos',
    students: 1364,
    professors: 104,
    gpa: 4.02,
    attendance: 90.2,
    support: 58,
    trend: -1.2,
  },
  {
    id: 'mgt',
    code: 'MGT',
    name: 'Faculty of Management and Technology',
    dean: 'Prof. Aisha Rahman',
    students: 1082,
    professors: 78,
    gpa: 3.94,
    attendance: 87.9,
    support: 66,
    trend: -2.8,
  },
];

export const DEPARTMENTS = [
  { id: 'eco-we', faculty: 'eco', name: 'Department of World Economy', head: 'Prof. Ivan Petrov', professors: 31, students: 428 },
  { id: 'eco-fin', faculty: 'eco', name: 'Department of Finance & Markets', head: 'Prof. Clara Nunes', professors: 28, students: 397 },
  { id: 'eco-pub', faculty: 'eco', name: 'Department of Economic Policy', head: 'Prof. Erik Lindqvist', professors: 27, students: 415 },
  { id: 'ir-dip', faculty: 'ir', name: 'Department of Diplomacy', head: 'Prof. Sofia Karimova', professors: 36, students: 462 },
  { id: 'ir-reg', faculty: 'ir', name: 'Department of Regional Studies', head: 'Prof. Tomás Oliveira', professors: 34, students: 447 },
  { id: 'ir-sec', faculty: 'ir', name: 'Department of Security Studies', head: 'Prof. Miriam Adler', professors: 34, students: 455 },
  { id: 'mgt-bus', faculty: 'mgt', name: 'Department of Business Strategy', head: 'Prof. Jonas Weber', professors: 27, students: 372 },
  { id: 'mgt-tech', faculty: 'mgt', name: 'Department of Digital Technology', head: 'Prof. Liya Chen', professors: 26, students: 361 },
  { id: 'mgt-ops', faculty: 'mgt', name: 'Department of Operations', head: 'Prof. Ravi Menon', professors: 25, students: 349 },
];

export const METRICS = {
  students: 3686,
  professors: 268,
  faculties: 3,
  departments: 9,
  averageGpa: 4.05,
  attendance: 90.4,
  completion: 87,
  studentsAtRisk: 165,
};

export const PERFORMANCE_TREND = [
  { period: 'Fall 24', gpa: 3.86, attendance: 86.9, completion: 78 },
  { period: 'Spring 25', gpa: 3.94, attendance: 88.4, completion: 81 },
  { period: 'Fall 25', gpa: 3.99, attendance: 89.2, completion: 83 },
  { period: 'Spring 26', gpa: 4.03, attendance: 90.1, completion: 85 },
  { period: 'Fall 26', gpa: 4.05, attendance: 90.4, completion: 87 },
];

export const STUDENT_DISTRIBUTION = [
  { year: 'Year 1', students: 1024 },
  { year: 'Year 2', students: 951 },
  { year: 'Year 3', students: 884 },
  { year: 'Year 4', students: 827 },
];

export const ATTENDANCE_TREND = [
  { week: 'W1', eco: 94, ir: 92, mgt: 90 },
  { week: 'W2', eco: 93, ir: 91, mgt: 89 },
  { week: 'W3', eco: 95, ir: 90, mgt: 87 },
  { week: 'W4', eco: 94, ir: 91, mgt: 86 },
  { week: 'W5', eco: 92, ir: 89, mgt: 85 },
  { week: 'W6', eco: 93, ir: 90, mgt: 88 },
];

export const FACULTY_PERFORMANCE = FACULTIES.map((faculty) => ({
  name: faculty.code,
  gpa: faculty.gpa,
  attendance: faculty.attendance,
}));

export const ASSIGNMENT_COMPLETION = [
  { faculty: 'Economics', submitted: 91, pending: 9 },
  { faculty: 'International Relations', submitted: 87, pending: 13 },
  { faculty: 'Management & Technology', submitted: 83, pending: 17 },
];

export const ALERTS = [
  {
    id: 'a1',
    severity: 'critical',
    title: 'Attendance anomaly in MGT-214',
    detail: 'Attendance fell 11 points over three weeks in one Management & Technology cohort.',
    meta: 'Management & Technology · 42 students',
  },
  {
    id: 'a2',
    severity: 'critical',
    title: '66 students need academic support',
    detail: 'Management & Technology carries the highest share of flagged students this term.',
    meta: 'Faculty-level risk indicator',
  },
  {
    id: 'a3',
    severity: 'warning',
    title: 'Grading backlog in Economics',
    detail: '318 submissions remain ungraded with the mid-term review in nine days.',
    meta: 'Economics · 12 courses',
  },
  {
    id: 'a4',
    severity: 'warning',
    title: 'Declining performance trend',
    detail: 'International Relations average dropped 1.2 points versus the previous term.',
    meta: 'International Relations · term over term',
  },
  {
    id: 'a5',
    severity: 'warning',
    title: 'Assignment submission delays',
    detail: '17% of course assignments are overdue across the university.',
    meta: 'All faculties · current term',
  },
  {
    id: 'a6',
    severity: 'info',
    title: 'Mid-term review opens in 9 days',
    detail: 'Grade sheets are due from all departments before the review window.',
    meta: 'Academic calendar · 16 November',
  },
];

export const RISK_FLAGS = [
  { id: 'AIU-2023-0417', name: 'Sofia Ivanova', faculty: 'Faculty of Economics', year: 3, gpa: 3.12, attendance: 74, signals: ['GPA −0.8', '4 absences'] },
  { id: 'AIU-2024-0912', name: 'Timur Aliyev', faculty: 'Management & Technology', year: 2, gpa: 2.74, attendance: 68, signals: ['2 failed courses', '6 absences'] },
  { id: 'AIU-2022-0188', name: 'Nina Kovalenko', faculty: 'International Relations', year: 4, gpa: 3.34, attendance: 79, signals: ['3 overdue assignments'] },
  { id: 'AIU-2024-0533', name: 'Pavel Sorokin', faculty: 'Management & Technology', year: 2, gpa: 2.95, attendance: 71, signals: ['GPA −1.1', 'Late submissions'] },
  { id: 'AIU-2023-0761', name: 'Alina Yusupova', faculty: 'Faculty of Economics', year: 3, gpa: 3.41, attendance: 81, signals: ['Attendance −8 pts'] },
];

export const RISK_SUMMARY = [
  { label: 'Students flagged', value: '165', hint: 'of 3,686 enrolled' },
  { label: 'Attendance anomalies', value: '7', hint: 'across 4 departments' },
  { label: 'Faculty risk index', value: 'MGT 0.42', hint: 'highest of three faculties' },
];

export const DEMO_STUDENT = {
  name: 'Sofia Ivanova',
  preferredName: 'Sofia',
  studentId: 'AIU-2023-0417',
  programme: 'BSc International Economics',
  faculty: 'Faculty of Economics',
  department: 'Department of World Economy',
  group: 'ECO-23-3',
  year: 3,
  gpa: 4.42,
  cumulativeGpa: 4.36,
  standing: 'Good standing',
  creditsEarned: 128,
  creditsRequired: 180,
  creditsRemaining: 52,
  attendance: 94,
  overview: [
    { key: 'gpa', label: 'Current GPA', value: '4.42', hint: 'Top 12% of the cohort', tone: 'positive' },
    { key: 'credits', label: 'Credits earned', value: '128', hint: 'of 180 required', tone: 'neutral' },
    { key: 'attendance', label: 'Attendance', value: '94%', hint: 'Above 85% requirement', tone: 'positive' },
    { key: 'assignments', label: 'Upcoming assignments', value: '3', hint: 'Next due in 2 days', tone: 'warning' },
  ],
  schedule: [
    { id: 's1', time: '09:00 – 10:30', course: 'World Economy', code: 'ECO-301', room: 'Room 214', professor: 'Prof. Ivan Petrov', state: 'now' },
    { id: 's2', time: '11:00 – 12:30', course: 'Econometrics II', code: 'ECO-318', room: 'Lab 3B', professor: 'Dr. Clara Nunes', state: 'next' },
    { id: 's3', time: '14:00 – 15:30', course: 'Trade Policy Seminar', code: 'ECO-322', room: 'Room 108', professor: 'Prof. Erik Lindqvist', state: 'later' },
    { id: 's4', time: '16:00 – 17:30', course: 'Academic Writing', code: 'GEN-204', room: 'Online', professor: 'Dr. Miriam Adler', state: 'later' },
  ],
  assignments: [
    { id: 'as1', title: 'Trade policy brief: EU–ASEAN', course: 'Trade Policy Seminar', due: '9 Nov', status: 'not_started', priority: 'high' },
    { id: 'as2', title: 'Econometrics problem set 5', course: 'Econometrics II', due: '12 Nov', status: 'in_progress', priority: 'normal' },
    { id: 'as3', title: 'World Economy reading response', course: 'World Economy', due: '15 Nov', status: 'not_started', priority: 'low' },
    { id: 'as4', title: 'Monetary policy essay', course: 'Macroeconomic Policy', due: '24 Nov', status: 'submitted', priority: 'normal' },
  ],
  exams: [
    { id: 'x1', title: 'Mid-term exam', course: 'ECO-301 World Economy', date: '16 Nov', time: '10:00', room: 'Room 214' },
    { id: 'x2', title: 'Quiz 3', course: 'ECO-318 Econometrics II', date: '20 Nov', time: '14:00', room: 'Lab 3B' },
    { id: 'x3', title: 'Oral defence', course: 'ECO-322 Trade Policy Seminar', date: '27 Nov', time: '09:30', room: 'Room 108' },
  ],
  grades: [
    { course: 'World Economy', code: 'ECO-301', credits: 6, grade: 'A', points: 4.0 },
    { course: 'Econometrics II', code: 'ECO-318', credits: 4, grade: 'A−', points: 3.7 },
    { course: 'Trade Policy Seminar', code: 'ECO-322', credits: 4, grade: 'B+', points: 3.3 },
    { course: 'International Finance', code: 'ECO-215', credits: 6, grade: 'A', points: 4.0 },
  ],
  progress: [
    { semester: 'Fall 24', gpa: 4.1 },
    { semester: 'Spring 25', gpa: 4.25 },
    { semester: 'Fall 25', gpa: 4.32 },
    { semester: 'Spring 26', gpa: 4.38 },
    { semester: 'Fall 26', gpa: 4.42 },
  ],
  announcements: [
    { id: 'n1', scope: 'University', title: 'Mid-term review schedule published', date: '6 Nov', body: 'The mid-term review window opens 16 November. Check your personal schedule for room assignments.' },
    { id: 'n2', scope: 'Faculty of Economics', title: 'Guest lecture: central bank policy', date: '4 Nov', body: 'A guest lecture on monetary policy transmission will be held in the main auditorium on 11 November.' },
    { id: 'n3', scope: 'ECO-301', title: 'Seminar group reassignment', date: '2 Nov', body: 'Seminar groups for World Economy have been rebalanced. Your new group meets on Thursdays.' },
  ],
};

export const DEMO_PROFESSOR = {
  name: 'Dr. Marcus Feld',
  title: 'Associate Professor',
  faculty: 'Faculty of Economics',
  department: 'Department of World Economy',
  semester: 'Fall Semester 2026',
  metrics: [
    { key: 'courses', label: 'Courses taught', value: '4', hint: '2 lecture, 2 seminar' },
    { key: 'students', label: 'Students', value: '186', hint: 'across assigned courses' },
    { key: 'grading', label: 'Assignment grading', value: '27', hint: 'oldest 4 days ago', tone: 'warning' },
    { key: 'quizzes', label: 'Quiz grading', value: '12', hint: 'ECO-215 · Quiz 3', tone: 'warning' },
    { key: 'attendance', label: 'Attendance to review', value: '3', hint: 'sessions flagged this week', tone: 'warning' },
  ],
  schedule: [
    { id: 'p1', time: '09:00 – 10:30', course: 'World Economy', code: 'ECO-301', room: 'Room 214', group: 'ECO-23-3', state: 'now' },
    { id: 'p2', time: '12:00 – 13:30', course: 'International Finance', code: 'ECO-215', room: 'Room 402', group: 'ECO-22-1', state: 'next' },
    { id: 'p3', time: '15:00 – 16:30', course: 'Economic Forecasting', code: 'ECO-340', room: 'Lab 3B', group: 'ECO-24-2', state: 'later' },
  ],
  courses: [
    { id: 'c1', code: 'ECO-301', title: 'World Economy', students: 62, progress: 64, average: 4.1, engagement: 88, term: 'Fall 2026', status: 'On track' },
    { id: 'c2', code: 'ECO-215', title: 'International Finance', students: 48, progress: 58, average: 3.8, engagement: 81, term: 'Fall 2026', status: 'On track' },
    { id: 'c3', code: 'ECO-340', title: 'Economic Forecasting', students: 41, progress: 41, average: 3.4, engagement: 69, term: 'Fall 2026', status: 'Needs attention' },
    { id: 'c4', code: 'ECO-122', title: 'Principles of Economics', students: 35, progress: 72, average: 3.9, engagement: 84, term: 'Fall 2026', status: 'On track' },
  ],
  gradingQueue: [
    { id: 'g1', title: 'Trade policy brief', course: 'ECO-301', submitted: 18, total: 22, due: 'Yesterday' },
    { id: 'g2', title: 'Problem set 5', course: 'ECO-215', submitted: 9, total: 16, due: 'Today' },
    { id: 'g3', title: 'Forecasting project draft', course: 'ECO-340', submitted: 4, total: 12, due: 'in 2 days' },
  ],
  submissions: [
    { id: 'sub1', student: 'Sofia Ivanova', course: 'ECO-215', title: 'Monetary policy essay', when: '2 hours ago' },
    { id: 'sub2', student: 'Timur Aliyev', course: 'ECO-301', title: 'Trade policy brief', when: '5 hours ago' },
    { id: 'sub3', student: 'Nina Kovalenko', course: 'ECO-340', title: 'Forecasting draft', when: 'Yesterday' },
    { id: 'sub4', student: 'Pavel Sorokin', course: 'ECO-301', title: 'Reading response 4', when: 'Yesterday' },
  ],
  assessments: [
    { id: 'e1', title: 'Mid-term exam', course: 'ECO-301', date: '16 Nov', type: 'Exam' },
    { id: 'e2', title: 'Forecasting project defence', course: 'ECO-340', date: '21 Nov', type: 'Project' },
    { id: 'e3', title: 'Quiz 3', course: 'ECO-215', date: '12 Nov', type: 'Quiz' },
  ],
  attendanceFlags: [
    { id: 'af1', course: 'ECO-301', group: 'ECO-23-3', detail: '4 students below 75% attendance' },
    { id: 'af2', course: 'ECO-340', group: 'ECO-24-2', detail: 'Session of 3 Nov unrecorded' },
  ],
};

export const NOTIFICATIONS = [
  { id: 'no1', title: 'Mid-term review opens 16 November', detail: 'Grade sheets are due from all departments.', time: '2h ago', tone: 'info' },
  { id: 'no2', title: '3 attendance sessions need review', detail: 'Lecturer submissions flagged by the system.', time: '4h ago', tone: 'warning' },
  { id: 'no3', title: 'Faculty performance report ready', detail: 'September–October comparison has been generated.', time: 'Yesterday', tone: 'info' },
  { id: 'no4', title: '17 assignments overdue', detail: 'Submission delays recorded across three faculties.', time: '2 days ago', tone: 'critical' },
];