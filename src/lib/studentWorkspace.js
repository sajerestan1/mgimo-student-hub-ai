// Canonical student record for the Student Workspace.
// Every figure shown in the dashboard and the module pages is derived from the
// records below (grades, attendance registers, timetable, assessments), so the
// same student can never show contradictory grades, attendance or deadlines.

const DAY = 86400000;

const startOfToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

const TODAY = startOfToday();

export const isoIn = (days) => new Date(TODAY.getTime() + days * DAY).toISOString().slice(0, 10);

export const formatDate = (value, options) =>
  new Date(value).toLocaleDateString('en-GB', options || { day: 'numeric', month: 'short' });

export const daysUntil = (value) => Math.round((new Date(value).getTime() - TODAY.getTime()) / DAY);

export const STUDENT = {
  firstName: 'Alex',
  fullName: 'Alex Morozov',
  initials: 'AM',
  email: 'a.morozov@student.digitaldean.example',
  studentId: 'IE-23-0417',
  programme: 'International Economic Relations',
  degree: 'BSc, 4 years',
  faculty: 'Faculty of International Economic Relations',
  department: 'Department of World Economy',
  group: 'IE-31',
  year: 3,
  advisor: 'Dr Elena Sokolova',
  semester: 'Fall Semester 2026',
  standing: 'Good standing',
  creditsEarned: 96,
  creditsRequired: 160,
  semesterLoad: 19,
  campus: 'Moscow campus · Building 2',
};

export const COURSES = [
  {
    id: 'ECO-301',
    code: 'ECO-301',
    title: 'World Economy',
    lecturer: 'Dr Elena Sokolova',
    credits: 6,
    type: 'Core',
    room: 'Room 214',
    semester: STUDENT.semester,
    week: 'Week 10 of 16',
    summary: 'Trade theory, global value chains and the political economy of economic integration.',
  },
  {
    id: 'ECO-215',
    code: 'ECO-215',
    title: 'International Finance',
    lecturer: 'Prof. Dmitry Volkov',
    credits: 5,
    type: 'Core',
    room: 'Room 210',
    semester: STUDENT.semester,
    week: 'Week 10 of 16',
    summary: 'Exchange-rate regimes, balance-of-payments adjustment and sovereign debt markets.',
  },
  {
    id: 'ECO-340',
    code: 'ECO-340',
    title: 'Economic Forecasting',
    lecturer: 'Dr Anna Kuznetsova',
    credits: 5,
    type: 'Specialisation',
    room: 'Room 305',
    semester: STUDENT.semester,
    week: 'Week 10 of 16',
    summary: 'Time-series methods for macroeconomic projections, from ARIMA to scenario design.',
  },
  {
    id: 'LAN-110',
    code: 'LAN-110',
    title: 'Academic English (C1)',
    lecturer: 'Ms Claire Bennett',
    credits: 3,
    type: 'Language',
    room: 'Room 118',
    semester: STUDENT.semester,
    week: 'Week 10 of 16',
    summary: 'Argumentation, academic writing and presentation skills for degree-level work.',
  },
];

// weekday: 1 = Monday … 6 = Saturday (0 = Sunday has no classes).
export const TIMETABLE = [
  { id: 's1', weekday: 1, start: '09:00', end: '10:30', courseId: 'ECO-301', kind: 'Lecture', room: 'Room 214' },
  { id: 's2', weekday: 1, start: '11:00', end: '12:30', courseId: 'LAN-110', kind: 'Seminar', room: 'Room 118' },
  { id: 's3', weekday: 1, start: '14:00', end: '15:30', courseId: 'ECO-340', kind: 'Computer lab', room: 'Lab 3' },
  { id: 's4', weekday: 2, start: '10:00', end: '11:30', courseId: 'ECO-215', kind: 'Lecture', room: 'Room 210' },
  { id: 's5', weekday: 2, start: '13:00', end: '14:30', courseId: 'ECO-301', kind: 'Seminar', room: 'Room 214' },
  { id: 's6', weekday: 3, start: '09:00', end: '10:30', courseId: 'ECO-340', kind: 'Lecture', room: 'Room 305' },
  { id: 's7', weekday: 3, start: '15:00', end: '16:30', courseId: 'LAN-110', kind: 'Tutorial', room: 'Room 118' },
  { id: 's8', weekday: 4, start: '11:00', end: '12:30', courseId: 'ECO-215', kind: 'Seminar', room: 'Room 210' },
  { id: 's9', weekday: 4, start: '14:00', end: '15:30', courseId: 'ECO-301', kind: 'Tutorial', room: 'Room 214' },
  { id: 's10', weekday: 5, start: '10:00', end: '11:30', courseId: 'ECO-340', kind: 'Seminar', room: 'Room 305' },
  { id: 's11', weekday: 5, start: '13:00', end: '14:30', courseId: 'ECO-215', kind: 'Computer lab', room: 'Lab 1' },
  { id: 's12', weekday: 6, start: '10:00', end: '11:30', courseId: 'LAN-110', kind: 'Workshop', room: 'Room 118' },
];

// Score 0–100 with ECTS-style letters.
export const GRADES = [
  { id: 'g1', courseId: 'ECO-301', title: 'Reading response 3', type: 'Coursework', score: 94, weight: 1, date: isoIn(-12) },
  { id: 'g2', courseId: 'ECO-301', title: 'Seminar participation', type: 'Participation', score: 88, weight: 1, date: isoIn(-19) },
  { id: 'g3', courseId: 'ECO-301', title: 'Reading response 4', type: 'Coursework', score: 91, weight: 1, date: isoIn(-5) },
  { id: 'g4', courseId: 'ECO-215', title: 'Problem set 5: FX exposure', type: 'Coursework', score: 82, weight: 1, date: isoIn(-14) },
  { id: 'g5', courseId: 'ECO-215', title: 'Case study: sovereign debt', type: 'Case study', score: 79, weight: 1, date: isoIn(-4) },
  { id: 'g6', courseId: 'ECO-340', title: 'Forecasting workbook 2', type: 'Coursework', score: 74, weight: 1, date: isoIn(-16) },
  { id: 'g7', courseId: 'ECO-340', title: 'Quiz 2: stationarity', type: 'Quiz', score: 81, weight: 1, date: isoIn(-7) },
  { id: 'g8', courseId: 'LAN-110', title: 'Academic essay: argument', type: 'Coursework', score: 96, weight: 1, date: isoIn(-21) },
  { id: 'g9', courseId: 'LAN-110', title: 'Seminar presentation', type: 'Presentation', score: 92, weight: 1, date: isoIn(-9) },
];

// Attendance register: only the counters are stored; the rate is computed.
export const ATTENDANCE = {
  'ECO-301': { present: 26, late: 1, absent: 1, excused: 0 },
  'ECO-215': { present: 21, late: 2, absent: 2, excused: 1 },
  'ECO-340': { present: 18, late: 1, absent: 4, excused: 1 },
  'LAN-110': { present: 22, late: 0, absent: 1, excused: 0 },
};

export const ATTENDANCE_REQUIREMENT = 85;

export const ASSIGNMENTS = [
  {
    id: 'a1',
    courseId: 'ECO-301',
    title: 'Essay: EU trade policy after 2024',
    dueDate: isoIn(2),
    status: 'in_progress',
    weight: '15% of course grade',
    brief:
      '2,000 words on how the EU’s trade-defence instruments changed between 2022 and 2026. Argue one position using at least two case studies from the seminar readings.',
  },
  {
    id: 'a2',
    courseId: 'ECO-340',
    title: 'Forecasting model — ARIMA workbook',
    dueDate: isoIn(5),
    status: 'not_started',
    weight: '20% of course grade',
    brief:
      'Fit an ARIMA model to the provided macro series, justify the specification, and report out-of-sample error for the last four quarters.',
  },
  {
    id: 'a3',
    courseId: 'ECO-215',
    title: 'Problem set 6: FX exposure',
    dueDate: isoIn(8),
    status: 'not_started',
    weight: '10% of course grade',
    brief: 'Hedging problems 1–7 from chapter 9. Show the exposure calculation for each position before the hedge.',
  },
  {
    id: 'a4',
    courseId: 'LAN-110',
    title: 'Presentation: academic argument',
    dueDate: isoIn(12),
    status: 'in_progress',
    weight: '10% of course grade',
    brief: 'Eight-minute presentation defending a contested claim in your field, followed by five minutes of questions.',
  },
  {
    id: 'a5',
    courseId: 'ECO-215',
    title: 'Case study: sovereign debt',
    dueDate: isoIn(-4),
    status: 'graded',
    weight: '10% of course grade',
    brief: 'Assess the debt-sustainability position of one emerging market using the IMF framework.',
  },
  {
    id: 'a6',
    courseId: 'ECO-301',
    title: 'Reading response 4',
    dueDate: isoIn(-9),
    status: 'graded',
    weight: '5% of course grade',
    brief: 'One page responding to Rodrik’s argument on industrial policy.',
  },
  {
    id: 'a7',
    courseId: 'LAN-110',
    title: 'Academic essay: argument',
    dueDate: isoIn(-21),
    status: 'graded',
    weight: '15% of course grade',
    brief: '1,500-word argumentative essay with annotated bibliography.',
  },
];

export const ASSESSMENTS = [
  {
    id: 'q1',
    courseId: 'ECO-215',
    title: 'Quiz 3 — exchange-rate regimes',
    kind: 'Quiz',
    date: isoIn(6),
    start: '11:00',
    room: 'Room 210',
    weight: '10% of course grade',
    preparation: 30,
    format: '30 minutes, in class, closed book',
  },
  {
    id: 'q2',
    courseId: 'ECO-301',
    title: 'Mid-term examination',
    kind: 'Exam',
    date: isoIn(14),
    start: '09:00',
    room: 'Hall 2',
    weight: '30% of course grade',
    preparation: 55,
    format: '90 minutes, written, two essay questions from four',
  },
  {
    id: 'q3',
    courseId: 'ECO-340',
    title: 'Mid-term examination',
    kind: 'Exam',
    date: isoIn(18),
    start: '14:00',
    room: 'Hall 1',
    weight: '30% of course grade',
    preparation: 20,
    format: '120 minutes, written, includes a practical modelling task',
  },
  {
    id: 'q4',
    courseId: 'LAN-110',
    title: 'Oral assessment',
    kind: 'Oral assessment',
    date: isoIn(21),
    start: '10:00',
    room: 'Room 118',
    weight: '20% of course grade',
    preparation: 65,
    format: '15-minute individual interview with two examiners',
  },
];

export const ANNOUNCEMENTS = [
  {
    id: 'n1',
    title: 'Mid-term examination schedule published',
    body: 'The Fall 2026 mid-term timetable is final. Check your examination rooms in Quizzes & Exams — clashes must be reported to the student office within five working days.',
    priority: 'high',
    date: isoIn(-2),
    author: 'Student Office',
  },
  {
    id: 'n2',
    title: 'ECO-340 computer lab moved to Lab 3',
    body: 'Monday’s forecasting lab moves from Room 305 to Lab 3 for the rest of the semester.',
    priority: 'normal',
    date: isoIn(-3),
    author: 'Department of World Economy',
  },
  {
    id: 'n3',
    title: 'Library extended hours during assessment weeks',
    body: 'The main library stays open until 23:00 from 9 November. Group rooms can be booked at the ground-floor desk.',
    priority: 'info',
    date: isoIn(-5),
    author: 'Library services',
  },
];

export const MENTORS = [
  {
    id: 'm1',
    name: 'Sofia Ivanova',
    programme: 'International Economics, year 4',
    subjects: 'Econometrics · Forecasting',
    topics: ['ARIMA modelling in R', 'Exam revision planning', 'Lab report structure'],
    matches: 'Same programme · took ECO-340 last year',
  },
  {
    id: 'm2',
    name: 'Daniel Okafor',
    programme: 'International Finance, year 4',
    subjects: 'International Finance · Risk',
    topics: ['FX hedging problems', 'Case-study writing', 'Internship applications'],
    matches: 'Top-10% in ECO-215 · peer tutor since 2025',
  },
  {
    id: 'm3',
    name: 'Marta Kowalska',
    programme: 'World Economy, year 4',
    subjects: 'Trade policy · Academic writing',
    topics: ['Essay argumentation', 'Source evaluation', 'Presentation delivery'],
    matches: 'Writing centre mentor · English C2',
  },
  {
    id: 'm4',
    name: 'Timur Aliyev',
    programme: 'Economic Forecasting, year 3',
    subjects: 'Statistics · Python',
    topics: ['Time-series diagnostics', 'Python for coursework', 'Study routines'],
    matches: 'Same study group · available weekday evenings',
  },
];

export const LIBRARY_LOANS = [
  {
    id: 'l1',
    title: 'International Economics: Theory and Policy',
    author: 'Krugman, Obstfeld & Melitz',
    dueDate: isoIn(4),
    shelf: 'HB 74 · Floor 3',
    renewals: 1,
  },
  {
    id: 'l2',
    title: 'Time Series Analysis',
    author: 'Hamilton, J.',
    dueDate: isoIn(11),
    shelf: 'QA 280 · Floor 5',
    renewals: 0,
  },
  {
    id: 'l3',
    title: 'The Economist’s Guide to Financial Markets',
    author: 'Levinson, M.',
    dueDate: isoIn(-2),
    shelf: 'HG 45 · Floor 4',
    renewals: 2,
  },
];

export const LIBRARY_CATALOG = [
  { id: 'c1', title: 'Global Value Chains in a Changing World', author: 'WTO Secretariat', availability: '2 copies available', shelf: 'HF 1379' },
  { id: 'c2', title: 'Forecasting: Principles and Practice', author: 'Hyndman & Athanasopoulos', availability: 'Available online', shelf: 'Digital' },
  { id: 'c3', title: 'Sovereign Debt: A Guide for Economists', author: 'Abbas, Pienkowski & Rogoff', availability: 'On loan · due 12 Nov', shelf: 'HJ 8015' },
  { id: 'c4', title: 'Academic Writing for International Students', author: 'Bailey, S.', availability: '1 copy available', shelf: 'PE 1478' },
];

export const APPLICATIONS = [
  {
    id: 'ap1',
    kind: 'Enrolment certificate',
    purpose: 'Bank account opening',
    submitted: isoIn(-6),
    status: 'ready',
    note: 'Ready for collection at the student office, window 4.',
  },
  {
    id: 'ap2',
    kind: 'Transcript (English)',
    purpose: 'Exchange programme application',
    submitted: isoIn(-11),
    status: 'in_review',
    note: 'Awaiting signature from the department.',
  },
  {
    id: 'ap3',
    kind: 'Academic leave request',
    purpose: 'Medical leave, Spring 2027',
    submitted: isoIn(-25),
    status: 'rejected',
    note: 'Missing the clinic’s supporting document. You may resubmit with the attachment.',
  },
];

export const PERFORMANCE_TREND = [
  { term: 'Fall 25', average: 76 },
  { term: 'Spring 26', average: 79 },
  { term: 'Fall 26', average: 85 },
];

// ---- derivations -----------------------------------------------------------

export const letterFor = (score) => {
  if (score >= 90) return 'A';
  if (score >= 85) return 'A-';
  if (score >= 80) return 'B+';
  if (score >= 75) return 'B';
  if (score >= 70) return 'C+';
  if (score >= 65) return 'C';
  if (score >= 60) return 'D';
  return 'F';
};

export const courseById = (id) => COURSES.find((course) => course.id === id);

export function courseAverage(courseId) {
  const rows = GRADES.filter((grade) => grade.courseId === courseId);
  if (!rows.length) return null;
  const weight = rows.reduce((total, grade) => total + grade.weight, 0);
  return rows.reduce((total, grade) => total + grade.score * grade.weight, 0) / weight;
}

export function courseAttendance(courseId) {
  const record = ATTENDANCE[courseId];
  if (!record) return null;
  const total = record.present + record.late + record.absent + record.excused;
  if (!total) return null;
  return Math.round(((record.present + record.late + record.excused) / total) * 100);
}

export function courseSessions(courseId) {
  return TIMETABLE.filter((session) => session.courseId === courseId).sort(
    (a, b) => a.weekday - b.weekday || a.start.localeCompare(b.start)
  );
}

export const averageMark = (() => {
  const credits = COURSES.reduce((total, course) => total + course.credits, 0);
  const weighted = COURSES.reduce((total, course) => total + courseAverage(course.id) * course.credits, 0);
  return weighted / credits;
})();

export const attendanceRate = (() => {
  const totals = Object.values(ATTENDANCE).reduce(
    (acc, record) => ({
      attended: acc.attended + record.present + record.late + record.excused,
      sessions: acc.sessions + record.present + record.late + record.absent + record.excused,
    }),
    { attended: 0, sessions: 0 }
  );
  return Math.round((totals.attended / totals.sessions) * 100);
})();

export const openAssignments = ASSIGNMENTS.filter(
  (item) => item.status === 'not_started' || item.status === 'in_progress'
).sort((a, b) => daysUntil(a.dueDate) - daysUntil(b.dueDate));

export const gradedAssignments = ASSIGNMENTS.filter((item) => item.status === 'graded');

export const recentGrades = [...GRADES].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 4);

export const upcomingAssessments = [...ASSESSMENTS].sort((a, b) => daysUntil(a.date) - daysUntil(b.date));

export const creditsProgress = Math.round((STUDENT.creditsEarned / STUDENT.creditsRequired) * 100);

export function sessionsForWeekday(weekday) {
  return TIMETABLE.filter((session) => session.weekday === weekday).sort((a, b) => a.start.localeCompare(b.start));
}

const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const weekdayName = (index) => WEEKDAY_NAMES[index];

export const TODAY_INDEX = new Date().getDay();
export const TODAY_SESSIONS = sessionsForWeekday(TODAY_INDEX).map((session) => ({
  ...session,
  course: courseById(session.courseId),
}));

export const NEXT_SESSION = (() => {
  for (let offset = 1; offset <= 7; offset += 1) {
    const index = (TODAY_INDEX + offset) % 7;
    const sessions = sessionsForWeekday(index);
    if (sessions.length) return { ...sessions[0], course: courseById(sessions[0].courseId), weekday: index };
  }
  return null;
})();

export const SUMMARY = {
  averageMark,
  averageLetter: letterFor(averageMark),
  activeCourses: COURSES.length,
  assignmentsDue: openAssignments.length,
  nextDeadline: openAssignments[0] || null,
  attendanceRate,
  creditsEarned: STUDENT.creditsEarned,
  creditsRequired: STUDENT.creditsRequired,
  creditsProgress,
  nextAssessment: upcomingAssessments[0] || null,
};