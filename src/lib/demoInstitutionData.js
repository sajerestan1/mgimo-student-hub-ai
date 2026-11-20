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
  {
    "id": "prof-demo",
    "full_name": "Dr. Elena Petrova",
    "email": "elena.petrova@mgimo.example",
    "faculty_id": "fac-ir",
    "department_id": "dep-0",
    "title": "Professor"
  },
  {
    "id": "prof-2",
    "full_name": "Dr. Andrei Volkov",
    "email": "a.volkov@mgimo.example",
    "faculty_id": "fac-ir",
    "department_id": "dep-0",
    "title": "Associate Professor"
  },
  {
    "id": "prof-3",
    "full_name": "Dr. Marina Kravtsova",
    "email": "m.kravtsova@mgimo.example",
    "faculty_id": "fac-ir",
    "department_id": "dep-0",
    "title": "Professor"
  },
  {
    "id": "prof-4",
    "full_name": "Prof. Dmitry Lebedev",
    "email": "d.lebedev@mgimo.example",
    "faculty_id": "fac-ir",
    "department_id": "dep-0",
    "title": "Professor"
  },
  {
    "id": "prof-5",
    "full_name": "Prof. Olga Timofeeva",
    "email": "o.timofeeva@mgimo.example",
    "faculty_id": "fac-ir",
    "department_id": "dep-0",
    "title": "Associate Professor"
  },
  {
    "id": "prof-7",
    "full_name": "Dr. Sofia Karimova",
    "email": "s.karimova@mgimo.example",
    "faculty_id": "fac-ir",
    "department_id": "dep-0",
    "title": "Associate Professor"
  },
  {
    "id": "prof-8",
    "full_name": "Dr. Ivan Petrov",
    "email": "i.petrov@mgimo.example",
    "faculty_id": "fac-ier",
    "department_id": "dep-1",
    "title": "Professor"
  },
  {
    "id": "prof-9",
    "full_name": "Dr. Alexei Orlov",
    "email": "a.orlov@mgimo.example",
    "faculty_id": "fac-ir",
    "department_id": "dep-0",
    "title": "Professor"
  },
  {
    "id": "prof-10",
    "full_name": "Dr. Vera Smirnova",
    "email": "v.smirnova@mgimo.example",
    "faculty_id": "fac-ir",
    "department_id": "dep-0",
    "title": "Associate Professor"
  }
];
const students = Array.from({ length: 2 }, (_, i) => {
  if (i === 0) return { id: 'demo-student-a', student_number: 'DEMO-STU-001', full_name: 'Stanley', email: 'stanley.demo@mgimo.example', faculty_id: 'fac-ir', department_id: 'dep-0', program: 'International Relations', year: 1, status: 'active', gpa: 4.1, attendance_rate: 88, intervention_status: 'none' };
  if (i === 1) return { id: 'demo-student-b', student_number: 'DEMO-STU-002', full_name: 'Patience', email: 'patience.demo@mgimo.example', faculty_id: 'fac-ier', department_id: 'dep-1', program: 'International Economic Relations', year: 1, status: 'active', gpa: 4.3, attendance_rate: 93, intervention_status: 'none' };
  const names = ['Aleksandra Volkova','Dmitry Sokolov','Maria Kuznetsova','Ivan Morozov','Ekaterina Lebedeva','Nikita Novikov','Sofia Semenova','Artem Petrov','Anastasia Fedorova','Pavel Ivanov','Vera Orlova','Timur Kozlov','Polina Zaitseva','Mikhail Baranov','Daria Grigorieva','Kirill Belov','Alina Mironova','Roman Karpov','Yulia Solovyova','Egor Tikhomirov','Ksenia Yakovleva','Vladimir Gusev'];
  const index = i - 2;
  return { id: 'student-' + (i + 1), student_number: 'AI26-' + String(i + 1).padStart(4, '0'), full_name: names[index], email: 'student' + (i + 1) + '@mgimo.example', faculty_id: faculties[i % faculties.length].id, department_id: departments[i % departments.length].id, program: faculties[i % faculties.length].name, year: 1 + (i % 4), status: 'active', gpa: +(2.7 + (i % 13) * 0.1).toFixed(1), attendance_rate: 78 + (i % 22), intervention_status: i % 9 === 0 ? 'monitor' : 'none' };
});
const courses = [
  { id: 'course-lng105', code: 'LNG-105', title: 'Academic English for International Studies', name: 'Academic English for International Studies', description: 'Academic reading, writing and speaking for students of international affairs, from argument structure and citation to seminar presentation in an academic register.', faculty_id: 'fac-ir', professor_id: 'prof-7', credits: 4, level: 'foundation', semester: 'Fall Semester 2026', status: 'active', enrolled_count: 36 },
  { id: 'course-dip325', code: 'DIP-325', title: 'Multilateral Diplomacy and Conference Craft', name: 'Multilateral Diplomacy and Conference Craft', description: 'How multilateral conferences produce texts: agenda setting, drafting groups, coalitions, chairing and the management of diplomacy inside institutional settings.', faculty_id: 'fac-ir', professor_id: 'prof-demo', credits: 4, level: 'advanced', semester: 'Fall Semester 2026', status: 'active', enrolled_count: 39 },
  { id: 'course-dip210', code: 'DIP-210', title: 'Diplomatic Practice and Negotiation', name: 'Diplomatic Practice and Negotiation', description: 'The craft of diplomacy: how missions work, how negotiators build and close agreements, and how protocol and communication shape outcomes.', faculty_id: 'fac-ir', professor_id: 'prof-2', credits: 4, level: 'intermediate', semester: 'Fall Semester 2026', status: 'active', enrolled_count: 42 },
  { id: 'course-his330', code: 'HIS-330', title: 'Empires, Trade and the Making of the Global Economy', name: 'Empires, Trade and the Making of the Global Economy', description: 'The economic history of empire from 1500 to 1900, tracing how coercion, finance and industrial production produced an interconnected but deeply unequal world economy.', faculty_id: 'fac-ier', professor_id: 'prof-8', credits: 4, level: 'intermediate', semester: 'Fall Semester 2026', status: 'active', enrolled_count: 45 },
  { id: 'course-his205', code: 'HIS-205', title: 'The World in the Twentieth Century', name: 'The World in the Twentieth Century', description: 'A global history of the twentieth century from the collapse of old empires to the end of the Cold War, with attention to war, ideology and decolonisation.', faculty_id: 'fac-ir', professor_id: 'prof-3', credits: 4, level: 'foundation', semester: 'Fall Semester 2026', status: 'active', enrolled_count: 48 },
  { id: 'course-sec350', code: 'SEC-350', title: 'Arms Control and Non-Proliferation', name: 'Arms Control and Non-Proliferation', description: 'The nuclear non-proliferation regime and its instruments: IAEA safeguards, test bans, chemical and biological conventions, verification and treaty negotiation.', faculty_id: 'fac-ir', professor_id: 'prof-9', credits: 6, level: 'advanced', semester: 'Fall Semester 2026', status: 'active', enrolled_count: 51 },
  { id: 'course-sec240', code: 'SEC-240', title: 'International Security Studies', name: 'International Security Studies', description: 'Core concepts of security from deterrence and alliances to terrorism, cyber and energy security, with a focus on how threats are constructed and securitised.', faculty_id: 'fac-ir', professor_id: 'prof-4', credits: 6, level: 'intermediate', semester: 'Fall Semester 2026', status: 'active', enrolled_count: 54 },
  { id: 'course-lng230', code: 'LNG-230', title: 'Russian for Professional Diplomacy', name: 'Russian for Professional Diplomacy', description: 'Applied Russian for diplomatic work: formal register, correspondence, meeting note-taking, treaty vocabulary and interpreting practice at intermediate level.', faculty_id: 'fac-ir', professor_id: 'prof-10', credits: 6, level: 'intermediate', semester: 'Fall Semester 2026', status: 'active', enrolled_count: 57 },
  { id: 'course-ir315', code: 'IR-315', title: 'Eurasia and the Post-Soviet Space', name: 'Eurasia and the Post-Soviet Space', description: 'An advanced regional studies course on politics, security and political economy across the post-Soviet space, contested borders and energy geopolitics.', faculty_id: 'fac-ir', professor_id: 'prof-5', credits: 6, level: 'advanced', semester: 'Fall Semester 2026', status: 'active', enrolled_count: 60 },
  { id: 'course-ir305', code: 'IR-305', title: 'Theories of International Relations', name: 'Theories of International Relations', description: 'A systematic introduction to the competing theoretical traditions that structure the study of world politics, from realism and liberalism to constructivism and critical approaches.', faculty_id: 'fac-ir', professor_id: 'prof-demo', credits: 4, level: 'intermediate', semester: 'Fall Semester 2026', status: 'active', enrolled_count: 63 }
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
  { id: 'req-3', student_id: students[1].id, student_name: students[1].full_name, subject: 'Dormitory support', category: 'student_support', status: 'resolved', submitted_date: '2026-11-08', assigned_to: 'Student Services', description: 'Student support inquiry.' },
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
