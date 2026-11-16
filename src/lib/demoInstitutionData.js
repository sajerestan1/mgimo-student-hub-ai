// Synthetic institutional records for the competition demo. No real MGIMO records.
const faculties = [
  { id: 'fac-ir', code: 'IR', name: 'School of International Relations', dean: 'Prof. Elena Sokolova', established: 1944 },
  { id: 'fac-ier', code: 'IER', name: 'School of International Economic Relations', dean: 'Prof. Andrei Volkov', established: 1946 },
  { id: 'fac-law', code: 'LAW', name: 'School of International Law', dean: 'Prof. Marina Kravtsova', established: 1949 },
  { id: 'fac-jrn', code: 'JRN', name: 'School of International Journalism', dean: 'Prof. Dmitry Lebedev', established: 1968 },
  { id: 'fac-ibg', code: 'IBG', name: 'School of International Business & Governance', dean: 'Prof. Olga Timofeeva', established: 1991 },
  { id: 'fac-gp', code: 'GP', name: 'School of Governance & Politics', dean: 'Prof. Sergey Antonov', established: 1994 },
];
const departments = faculties.map((f, i) => ({ id: 'dep-' + i, faculty_id: f.id, name: ['International Relations & Foreign Policy','World Economy & Finance','International Public Law','Media & Communications','International Business','Political Science'][i] }));
const professors = [
  { id: 'prof-demo', full_name: 'Dr. Elena Petrova', email: 'professor.demo@mgimo.example', faculty_id: 'fac-ir', department_id: 'dep-0', title: 'Associate Professor' },
  { id: 'prof-2', full_name: 'Dr. Andrei Volkov', email: 'a.volkov@mgimo.example', faculty_id: 'fac-ier', department_id: 'dep-1', title: 'Professor' },
  { id: 'prof-3', full_name: 'Dr. Marina Kravtsova', email: 'm.kravtsova@mgimo.example', faculty_id: 'fac-law', department_id: 'dep-2', title: 'Professor' },
];
const students = Array.from({ length: 24 }, (_, i) => ({
  id: 'student-' + (i + 1), student_number: 'AI26-' + String(i + 1).padStart(4, '0'),
  full_name: ['Alex Morgan','Sofia Ivanova','Daniel Kim','Amina Hassan','Lucas Martin','Nina Petrova'][i % 6] + (i > 5 ? ' ' + (i + 1) : ''),
  email: 'student' + (i + 1) + '@mgimo.example', faculty_id: faculties[i % faculties.length].id,
  department_id: departments[i % departments.length].id, program: faculties[i % faculties.length].name,
  year: 1 + (i % 4), status: 'active', gpa: +(2.7 + (i % 13) * 0.1).toFixed(1),
  attendance_rate: 78 + (i % 22), intervention_status: i % 9 === 0 ? 'monitor' : 'none',
}));
const courses = [
  { id: 'course-ir201', code: 'IR-201', title: 'Theory of International Relations', name: 'Theory of International Relations', faculty_id: 'fac-ir', professor_id: 'prof-demo', credits: 6, semester: 'Fall 2026', status: 'active', enrolled_count: 42 },
  { id: 'course-ie201', code: 'IE-201', title: 'World Economy', name: 'World Economy', faculty_id: 'fac-ier', professor_id: 'prof-2', credits: 6, semester: 'Fall 2026', status: 'active', enrolled_count: 38 },
  { id: 'course-law201', code: 'LW-201', title: 'Public International Law', name: 'Public International Law', faculty_id: 'fac-law', professor_id: 'prof-3', credits: 6, semester: 'Fall 2026', status: 'active', enrolled_count: 31 },
  { id: 'course-ir204', code: 'IR-204', title: 'Regional Security Studies', name: 'Regional Security Studies', faculty_id: 'fac-ir', professor_id: 'prof-demo', credits: 4, semester: 'Fall 2026', status: 'active', enrolled_count: 28 },
  { id: 'course-jrn210', code: 'JR-210', title: 'Global Media & Diplomacy', name: 'Global Media & Diplomacy', faculty_id: 'fac-jrn', professor_id: 'prof-demo', credits: 4, semester: 'Fall 2026', status: 'active', enrolled_count: 24 },
  { id: 'course-gp220', code: 'GP-220', title: 'Policy Analysis', name: 'Policy Analysis', faculty_id: 'fac-gp', professor_id: 'prof-2', credits: 4, semester: 'Fall 2026', status: 'active', enrolled_count: 26 },
];
const academicRecords = students.flatMap((s, i) => Array.from({ length: 4 }, (_, j) => {
  const course = courses[(i + j) % courses.length];
  const grade = 52 + ((i * 7 + j * 11) % 46);
  return { id: `grade-${i}-${j}`, student_id: s.id, student_name: s.full_name, course_id: course.id, course_code: course.code, grade, letter_grade: grade >= 90 ? 'A' : grade >= 80 ? 'B+' : grade >= 70 ? 'B' : grade >= 60 ? 'C' : 'F', recorded_date: `2026-10-${String(10 + j).padStart(2, '0')}` };
}));
const attendanceRecords = students.flatMap((s, i) => Array.from({ length: 4 }, (_, j) => {
  const course = courses[(i + j) % courses.length];
  const status = (i * 3 + j * 2) % 13 === 0 ? 'absent' : (i + j) % 17 === 0 ? 'late' : (i + j) % 19 === 0 ? 'excused' : 'present';
  return { id: `att-${i}-${j}`, student_id: s.id, student_name: s.full_name, course_id: course.id, course_code: course.code, session_date: `2026-11-${String(1 + j).padStart(2, '0')}`, status };
}));
const requests = [
  { id: 'req-1', student_id: students[0].id, student_name: students[0].full_name, subject: 'Transcript request', category: 'documents', status: 'submitted', submitted_date: '2026-11-12', assigned_to: 'Dean’s Office', description: 'Request for an official academic transcript.' },
  { id: 'req-2', student_id: students[1].id, student_name: students[1].full_name, subject: 'Course registration correction', category: 'academic', status: 'in_review', submitted_date: '2026-11-10', assigned_to: 'Academic Affairs', description: 'Correction to the current semester registration.' },
  { id: 'req-3', student_id: students[2].id, student_name: students[2].full_name, subject: 'Dormitory support', category: 'student_support', status: 'resolved', submitted_date: '2026-11-08', assigned_to: 'Student Services', description: 'Student support inquiry.' },
];
const requestEvents = requests.map((r, i) => ({ id: 'event-' + i, request_id: r.id, type: 'status_change', status: r.status, note: 'Demo workflow event', actor_name: 'Demo Administrator', actor_role: 'admin', event_date: r.submitted_date }));
const announcements = [
  { id: 'ann-1', title: 'Fall semester examination schedule', body: 'The examination timetable is available in the student portal.', audience: 'all', publish_date: '2026-11-14', status: 'published', category: 'academic' },
  { id: 'ann-2', title: 'International Student Support Desk', body: 'Office hours and support resources for international students.', audience: 'students', publish_date: '2026-11-11', status: 'published', category: 'student_services' },
];
const events = [
  { id: 'evt-1', title: 'Midterm assessment period', start_date: '2026-11-23', end_date: '2026-11-27', type: 'academic' },
  { id: 'evt-2', title: 'International Student Forum', start_date: '2026-12-03', end_date: '2026-12-03', type: 'event' },
];
const tasks = [
  { id: 'task-1', title: 'Review pending transcript requests', due_date: '2026-11-18', status: 'in_progress', priority: 'high' },
  { id: 'task-2', title: 'Publish examination timetable', due_date: '2026-11-20', status: 'pending', priority: 'medium' },
];
const settings = [
  { id: 'setting-1', key: 'attendance_alert_threshold', label: 'Attendance alert threshold', value: '75' },
  { id: 'setting-2', key: 'academic_risk_threshold', label: 'Academic risk threshold', value: '2.5' },
];
const auditLogs = [{ id: 'audit-1', actor_name: 'Demo Administrator', actor_role: 'admin', action: 'Demo session opened', target: 'Academic Intelligence', logged_at: new Date().toISOString(), details: 'Synthetic demo data' }];
export const DEMO_INSTITUTION = { faculties, departments, students, professors, courses, academicRecords, attendanceRecords, requests, requestEvents, announcements, events, tasks, settings, auditLogs };
