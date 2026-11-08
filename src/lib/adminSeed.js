import { base44 } from '@/api/base44Client';

export const CURRENT_TERM = '2026/2027 · Fall';
export const PREVIOUS_TERM = '2025/2026 · Spring';

const FACULTY_SEED = [
  { code: 'IR', name: 'School of International Relations', dean: 'Prof. Elena V. Sokolova', established: 1944, description: 'Diplomacy, regional studies and international security.' },
  { code: 'IER', name: 'School of International Economic Relations', dean: 'Prof. Andrei N. Volkov', established: 1946, description: 'World economy, finance and foreign trade policy.' },
  { code: 'LAW', name: 'School of International Law', dean: 'Prof. Marina I. Kravtsova', established: 1949, description: 'International public and private law.' },
  { code: 'JRN', name: 'School of International Journalism', dean: 'Prof. Dmitry A. Lebedev', established: 1968, description: 'International media, communications and public diplomacy.' },
  { code: 'IBG', name: 'School of International Business & Governance', dean: 'Prof. Olga P. Timofeeva', established: 1991, description: 'Business strategy, energy policy and corporate governance.' },
  { code: 'GP', name: 'School of Governance & Politics', dean: 'Prof. Sergey M. Antonov', established: 1994, description: 'Comparative politics, public administration and analytics.' },
];

const DEPARTMENT_SEED = {
  IR: ['International Relations & Foreign Policy', 'Regional Studies', 'Diplomacy & Consular Affairs'],
  IER: ['World Economy', 'International Finance', 'Trade Policy'],
  LAW: ['International Public Law', 'International Private Law', 'European Law'],
  JRN: ['International Journalism', 'Media & Communications', 'Public Diplomacy'],
  IBG: ['International Business', 'Energy Policy', 'Corporate Governance'],
  GP: ['Political Science', 'Public Administration', 'Applied Analytics'],
};

const PROGRAM_SEED = {
  IR: 'International Relations',
  IER: 'International Economic Relations',
  LAW: 'International Law',
  JRN: 'International Journalism',
  IBG: 'International Business & Governance',
  GP: 'Governance & Politics',
};

const COURSE_SEED = {
  IR: [['IR-201', 'Theory of International Relations', 6], ['IR-204', 'Regional Security Studies', 4], ['IR-310', 'Diplomatic Practice', 4], ['IR-320', 'Conflict Analysis', 4]],
  IER: [['IE-201', 'World Economy', 6], ['IE-215', 'International Finance', 4], ['IE-301', 'Trade Policy Analysis', 4], ['IE-318', 'Economic Forecasting', 4]],
  LAW: [['LW-201', 'Public International Law', 6], ['LW-214', 'Law of International Organisations', 4], ['LW-305', 'Private International Law', 4], ['LW-322', 'European Union Law', 4]],
  JRN: [['JN-201', 'International Reporting', 6], ['JN-212', 'Media & Foreign Policy', 4], ['JN-308', 'Digital Diplomacy', 4], ['JN-315', 'Crisis Communication', 4]],
  IBG: [['IB-201', 'International Business Strategy', 6], ['IB-217', 'Energy Markets & Policy', 4], ['IB-303', 'Corporate Governance', 4], ['IB-319', 'Global Supply Chains', 4]],
  GP: [['GP-201', 'Comparative Politics', 6], ['GP-213', 'Public Administration', 4], ['GP-307', 'Political Analytics', 4], ['GP-316', 'Institutional Design', 4]],
};

const REQUEST_SEED = [
  ['Certificate of Enrollment', 'submitted', 'normal'],
  ['Academic Transcript', 'under_review', 'high'],
  ['Academic Leave', 'under_review', 'high'],
  ['Grade Appeal', 'awaiting_information', 'high'],
  ['Transfer Request', 'submitted', 'normal'],
  ['Duplicate Student ID', 'approved', 'low'],
  ['Scholarship Application', 'under_review', 'normal'],
  ['Schedule Conflict Resolution', 'completed', 'normal'],
  ['Certificate of Enrollment', 'approved', 'normal'],
  ['Academic Transcript', 'rejected', 'normal'],
  ['Exam Retake Permission', 'submitted', 'high'],
  ['Dormitory Reference Letter', 'completed', 'low'],
  ['Academic Leave', 'awaiting_information', 'normal'],
  ['Grade Appeal', 'submitted', 'normal'],
  ['Graduation Certificate', 'under_review', 'normal'],
  ['Course Withdrawal', 'approved', 'low'],
];

const FIRST_NAMES = ['Aleksandra', 'Dmitry', 'Maria', 'Ivan', 'Ekaterina', 'Nikita', 'Sofia', 'Artem', 'Anastasia', 'Pavel', 'Vera', 'Timur', 'Polina', 'Mikhail', 'Daria', 'Kirill', 'Alina', 'Roman', 'Yulia', 'Egor', 'Ksenia', 'Vladimir', 'Nina', 'Maxim', 'Lidia', 'Anton', 'Galina', 'Ruslan', 'Tatiana', 'Fedor'];
const LAST_NAMES = ['Volkova', 'Sokolov', 'Kuznetsova', 'Morozov', 'Lebedeva', 'Novikov', 'Semenova', 'Petrov', 'Fedorova', 'Ivanov', 'Orlova', 'Kozlov', 'Zaitseva', 'Baranov', 'Grigorieva', 'Belov', 'Mironova', 'Karpov', 'Solovyova', 'Tikhomirov', 'Yakovleva', 'Gusev', 'Vinogradova', 'Komarova', 'Rodionov', 'Safonova', 'Medvedev', 'Ershova', 'Danilov', 'Krylova'];

const TITLES = ['Professor', 'Associate Professor', 'Senior Lecturer', 'Lecturer'];

function makeRandom(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function iso(date) {
  return date.toISOString().slice(0, 10);
}

function shiftDays(days) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date;
}

async function chunkCreate(entity, rows, size = 200) {
  const created = [];
  for (let i = 0; i < rows.length; i += size) {
    const batch = await entity.bulkCreate(rows.slice(i, i + size));
    if (Array.isArray(batch)) created.push(...batch);
  }
  return created;
}

let seedTask = null;

export function seedAdminData(me) {
  if (!seedTask) {
    seedTask = runSeed(me).catch((error) => {
      seedTask = null;
      throw error;
    });
  }
  return seedTask;
}

async function runSeed() {
  const existing = await base44.entities.Faculty.filter({}, { limit: 1 });
  const known = Array.isArray(existing) ? existing : existing?.items || [];
  if (known.length > 0) {
    const studentProbe = await base44.entities.Student.filter({}, { limit: 1 });
    const seededStudents = Array.isArray(studentProbe) ? studentProbe : studentProbe?.items || [];
    if (seededStudents.length > 0) return { seeded: false };
    // A previous attempt stopped part-way: clear the orphaned institutional records, then reseed.
    await Promise.all([
      base44.entities.Department.deleteMany({}),
      base44.entities.Professor.deleteMany({}),
      base44.entities.Course.deleteMany({}),
      base44.entities.CourseEnrollment.deleteMany({}),
      base44.entities.AcademicRecord.deleteMany({}),
      base44.entities.AttendanceRecord.deleteMany({}),
      base44.entities.AdminRequest.deleteMany({}),
      base44.entities.RequestEvent.deleteMany({}),
      base44.entities.Announcement.deleteMany({}),
      base44.entities.AcademicEvent.deleteMany({}),
      base44.entities.AdministrativeTask.deleteMany({}),
      base44.entities.Faculty.deleteMany({}),
    ]);
  }

  const rand = makeRandom(20261107);
  const name = () => `${FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)]} ${LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)]}`;
  const grade = (weak) => {
    const r = rand();
    if (weak) return r < 0.5 ? 2 : r < 0.85 ? 3 : 4;
    if (r < 0.05) return 2;
    if (r < 0.22) return 3;
    if (r < 0.72) return 4;
    return 5;
  };

  const faculties = await chunkCreate(
    base44.entities.Faculty,
    FACULTY_SEED.map((faculty) => ({
      name: faculty.name,
      code: faculty.code,
      dean_name: faculty.dean,
      established: faculty.established,
      description: faculty.description,
      is_demo: true,
    }))
  );
  const facultyIdByCode = Object.fromEntries(faculties.map((faculty) => [faculty.code, faculty.id]));

  const deptMeta = [];
  const deptRows = [];
  FACULTY_SEED.forEach((faculty) => {
    DEPARTMENT_SEED[faculty.code].forEach((deptName, index) => {
      deptMeta.push({ facultyCode: faculty.code, name: deptName });
      deptRows.push({
        faculty_id: facultyIdByCode[faculty.code],
        name: deptName,
        code: `${faculty.code}-D${index + 1}`,
        head_name: name(),
        is_demo: true,
      });
    });
  });
  const departments = await chunkCreate(base44.entities.Department, deptRows);
  const deptsByFaculty = {};
  departments.forEach((dept, index) => {
    const code = deptMeta[index].facultyCode;
    deptsByFaculty[code] = deptsByFaculty[code] || [];
    deptsByFaculty[code].push(dept);
  });

  const professorRows = [];
  const professorMeta = [];
  FACULTY_SEED.forEach((faculty) => {
    const depts = deptsByFaculty[faculty.code] || [];
    for (let i = 0; i < 5; i += 1) {
      const dept = depts[i % depts.length];
      const fullName = name();
      professorMeta.push({ facultyCode: faculty.code, departmentId: dept.id });
      professorRows.push({
        full_name: fullName,
        title: TITLES[i % TITLES.length],
        faculty_id: facultyIdByCode[faculty.code],
        department_id: dept.id,
        email: `${fullName.toLowerCase().replace(/[^a-z]+/g, '.')}@staff.mgimo-demo.edu`,
        employment_status: i === 4 ? 'part_time' : i === 3 ? 'visiting' : 'full_time',
        hire_date: iso(shiftDays(-365 * (4 + Math.floor(rand() * 18)))),
        weekly_hours: 12 + Math.floor(rand() * 10),
        is_demo: true,
      });
    }
  });
  const professors = await chunkCreate(base44.entities.Professor, professorRows);
  const profsByFaculty = {};
  professors.forEach((prof, index) => {
    const code = professorMeta[index].facultyCode;
    profsByFaculty[code] = profsByFaculty[code] || [];
    profsByFaculty[code].push(prof);
  });

  const studentRows = [];
  const studentMeta = [];
  FACULTY_SEED.forEach((faculty) => {
    const depts = deptsByFaculty[faculty.code] || [];
    for (let i = 0; i < 16; i += 1) {
      const year = (i % 4) + 1;
      const dept = depts[i % depts.length];
      const fullName = name();
      const weak = (studentRows.length + 1) % 9 === 0;
      studentMeta.push({ facultyCode: faculty.code, weak, year });
      studentRows.push({
        full_name: fullName,
        student_id: `MG-${2026 - year}-${String(1000 + studentRows.length)}`,
        faculty_id: facultyIdByCode[faculty.code],
        department_id: dept.id,
        program: PROGRAM_SEED[faculty.code],
        year,
        group_name: `${faculty.code}-${year}${i % 2 === 0 ? 'A' : 'B'}`,
        email: `st${1000 + studentRows.length}@student.mgimo-demo.edu`,
        enrollment_status: i === 15 ? 'academic_leave' : i === 14 && year === 4 ? 'graduated' : 'active',
        intervention_status: weak ? 'monitoring' : 'none',
        is_demo: true,
      });
    }
  });
  const students = await chunkCreate(base44.entities.Student, studentRows);

  const courseRows = [];
  const courseMeta = [];
  FACULTY_SEED.forEach((faculty) => {
    const depts = deptsByFaculty[faculty.code] || [];
    const profs = profsByFaculty[faculty.code] || [];
    COURSE_SEED[faculty.code].forEach(([code, title, credits], index) => {
      courseMeta.push({ facultyCode: faculty.code });
      courseRows.push({
        code,
        title,
        faculty_id: facultyIdByCode[faculty.code],
        department_id: depts[index % depts.length].id,
        professor_id: profs[index % profs.length].id,
        credits,
        semester: CURRENT_TERM,
        year_level: 2 + (index % 3),
        is_demo: true,
      });
    });
  });
  const courses = await chunkCreate(base44.entities.Course, courseRows);

  const enrollmentRows = [];
  const enrollmentMeta = [];
  students.forEach((student, studentIndex) => {
    const facultyCode = studentMeta[studentIndex].facultyCode;
    courses.forEach((course, courseIndex) => {
      if (courseMeta[courseIndex].facultyCode !== facultyCode) return;
      enrollmentMeta.push({ studentIndex, courseIndex });
      enrollmentRows.push({
        student_id: student.id,
        student_user_id: student.user_id || undefined,
        course_id: course.id,
        faculty_id: course.faculty_id,
        department_id: course.department_id,
        enrolled_date: iso(shiftDays(-75)),
        is_demo: true,
      });
    });
  });
  await chunkCreate(base44.entities.CourseEnrollment, enrollmentRows);

  const recordRows = [];
  enrollmentRows.forEach((enrollment) => {
    const course = courses.find((item) => item.id === enrollment.course_id);
    const studentIndex = students.findIndex((item) => item.id === enrollment.student_id);
    const weak = studentMeta[studentIndex]?.weak;
    recordRows.push({
      student_id: enrollment.student_id,
      course_id: enrollment.course_id,
      faculty_id: enrollment.faculty_id,
      department_id: enrollment.department_id,
      grade: grade(weak),
      assessment_type: 'exam',
      term: PREVIOUS_TERM,
      semester: PREVIOUS_TERM,
      recorded_date: iso(shiftDays(-190)),
      is_demo: true,
    });
    if (!weak || rand() > 0.2) {
      recordRows.push({
        student_id: enrollment.student_id,
        course_id: enrollment.course_id,
        faculty_id: enrollment.faculty_id,
        department_id: enrollment.department_id,
        grade: grade(weak),
        assessment_type: rand() > 0.75 ? 'coursework' : 'exam',
        term: CURRENT_TERM,
        semester: CURRENT_TERM,
        recorded_date: iso(shiftDays(-20 - Math.floor(rand() * 20))),
        is_demo: true,
      });
    }
    if (course && studentIndex === 0) {
      // keep course reference exercised in demo generation
      recordRows[recordRows.length - 1].assessment_type = recordRows[recordRows.length - 1].assessment_type || 'exam';
    }
  });
  await chunkCreate(base44.entities.AcademicRecord, recordRows);

  const attendanceRows = [];
  students.forEach((student, studentIndex) => {
    const weak = studentMeta[studentIndex]?.weak;
    const studentCourses = courses.filter((course) => courseMeta[courses.indexOf(course)].facultyCode === studentMeta[studentIndex].facultyCode);
    for (let session = 0; session < 6; session += 1) {
      const course = studentCourses[session % studentCourses.length];
      const roll = rand();
      let status = 'present';
      if (weak) status = roll < 0.45 ? 'absent' : roll < 0.6 ? 'late' : 'present';
      else if (roll < 0.08) status = 'absent';
      else if (roll < 0.14) status = 'late';
      else if (roll < 0.17) status = 'excused';
      attendanceRows.push({
        student_id: student.id,
        course_id: course.id,
        faculty_id: course.faculty_id,
        department_id: course.department_id,
        session_date: iso(shiftDays(-session * 7 - (session === 0 ? 0 : 1))),
        status,
        recorded_by: professors.find((prof) => prof.id === course.professor_id)?.full_name || 'Registrar',
        is_demo: true,
      });
    }
  });
  await chunkCreate(base44.entities.AttendanceRecord, attendanceRows);

  const requestRows = REQUEST_SEED.map(([category, status, priority], index) => {
    const student = students[(index * 7 + 3) % students.length];
    const submitted = shiftDays(-(index + 1));
    return {
      user_id: '',
      student_id: student.id,
      student_name: student.full_name,
      faculty_id: student.faculty_id,
      category,
      subject: `${category} — ${student.full_name}`,
      description: `${category} submitted through the Dean's Office portal for ${student.full_name}. Demonstration record.`,
      status,
      priority,
      assigned_to: index % 3 === 0 ? 'Registrar Office' : index % 3 === 1 ? 'Deputy Dean for Academic Affairs' : 'Faculty Administrator',
      submitted_date: iso(submitted),
      due_date: iso(shiftDays(14 - index)),
      is_demo: true,
    };
  });
  const requests = await chunkCreate(base44.entities.AdminRequest, requestRows);

  const eventRows = [];
  requests.forEach((request, index) => {
    eventRows.push({
      request_id: request.id,
      type: 'status_change',
      status: 'submitted',
      note: 'Request received by the Dean’s Office.',
      actor_name: request.student_name,
      actor_role: 'student',
      event_date: request.submitted_date,
    });
    if (['under_review', 'awaiting_information', 'approved', 'rejected', 'completed'].includes(request.status)) {
      eventRows.push({
        request_id: request.id,
        type: 'status_change',
        status: 'under_review',
        note: 'Assigned for administrative review.',
        actor_name: 'Registrar Office',
        actor_role: 'academic_staff',
        event_date: iso(shiftDays(-(index + 1) + 1)),
      });
    }
    if (['approved', 'rejected', 'completed'].includes(request.status)) {
      eventRows.push({
        request_id: request.id,
        type: 'status_change',
        status: request.status,
        note: request.status === 'rejected' ? 'Rejected: documentation incomplete.' : 'Decision recorded by the Dean’s Office.',
        actor_name: 'Deputy Dean for Academic Affairs',
        actor_role: 'deputy_dean',
        event_date: iso(shiftDays(-1)),
      });
    }
  });
  await chunkCreate(base44.entities.RequestEvent, eventRows);

  await chunkCreate(base44.entities.AcademicEvent, [
    { title: 'Midterm examination period', type: 'exam_period', start_date: iso(shiftDays(9)), end_date: iso(shiftDays(16)), faculty_id: '', location: 'Main campus', description: 'Midterm examinations for all schools.', is_demo: true },
    { title: 'Winter examination session begins', type: 'exam_period', start_date: iso(shiftDays(38)), end_date: iso(shiftDays(60)), faculty_id: '', location: 'Main campus', description: 'Winter session for undergraduate programmes.', is_demo: true },
    { title: 'Faculty board meeting — International Relations', type: 'faculty_meeting', start_date: iso(shiftDays(4)), end_date: iso(shiftDays(4)), faculty_id: facultyIdByCode.IR, location: 'Room 214', description: 'Review of academic performance indicators.', is_demo: true },
    { title: 'Department heads coordination meeting', type: 'department_meeting', start_date: iso(shiftDays(6)), end_date: iso(shiftDays(6)), faculty_id: '', location: 'Senate Hall', description: 'Monthly coordination between department heads.', is_demo: true },
    { title: 'Course selection deadline', type: 'deadline', start_date: iso(shiftDays(12)), end_date: iso(shiftDays(12)), faculty_id: '', location: 'Student portal', description: 'Final day for spring course selection.', is_demo: true },
    { title: 'Academic scholarship submission deadline', type: 'deadline', start_date: iso(shiftDays(21)), end_date: iso(shiftDays(21)), faculty_id: '', location: 'Dean’s Office', description: 'Applications for the academic scholarship close.', is_demo: true },
    { title: 'University Open Day', type: 'university_event', start_date: iso(shiftDays(27)), end_date: iso(shiftDays(27)), faculty_id: '', location: 'Main building', description: 'Prospective student open day.', is_demo: true },
    { title: 'Semester concludes', type: 'semester', start_date: iso(shiftDays(45)), end_date: iso(shiftDays(45)), faculty_id: '', location: '', description: 'End of the fall semester teaching period.', is_demo: true },
  ]);

  await chunkCreate(base44.entities.Announcement, [
    { title: 'Midterm examination schedule published', body: 'The midterm examination schedule for all schools is now available. Students should verify their individual timetables in the student portal.', audience_type: 'university', status: 'published', publish_date: iso(shiftDays(-2)), author_name: 'Dean’s Office', is_demo: true },
    { title: 'Attendance register audit — November', body: 'Faculty administrators are asked to complete the November attendance register audit by the end of the week.', audience_type: 'academic_staff', status: 'published', publish_date: iso(shiftDays(-4)), author_name: 'Deputy Dean for Academic Affairs', is_demo: true },
    { title: 'International Relations faculty board', body: 'The faculty board will review midterm performance indicators and risk cases.', audience_type: 'faculty', faculty_id: facultyIdByCode.IR, status: 'published', publish_date: iso(shiftDays(-1)), author_name: 'Faculty Administrator', is_demo: true },
    { title: 'Spring course selection opens soon', body: 'Course selection for the spring semester opens next week. Academic advisors should prepare programme recommendations.', audience_type: 'students', status: 'scheduled', publish_date: iso(shiftDays(7)), author_name: 'Registrar Office', is_demo: true },
    { title: 'Draft — revised academic integrity policy', body: 'Working draft of the revised academic integrity policy for review by the academic council.', audience_type: 'university', status: 'draft', publish_date: '', author_name: 'Dean’s Office', is_demo: true },
    { title: 'Examination invigilation rota', body: 'Invigilation assignments for the winter session will be circulated to departments next week.', audience_type: 'academic_staff', status: 'archived', publish_date: iso(shiftDays(-30)), author_name: 'Registrar Office', is_demo: true },
  ]);

  await chunkCreate(base44.entities.AdministrativeTask, [
    { title: 'Verify outstanding transcript requests', category: 'Requests', assigned_to: 'Registrar Office', due_date: iso(shiftDays(3)), status: 'in_progress', is_demo: true },
    { title: 'Compile faculty attendance audit', category: 'Attendance', assigned_to: 'Deputy Dean for Academic Affairs', due_date: iso(shiftDays(5)), status: 'open', is_demo: true },
    { title: 'Review academic risk cases for November', category: 'Academic risk', assigned_to: 'Dean’s Office', due_date: iso(shiftDays(8)), status: 'open', is_demo: true },
    { title: 'Confirm examination room allocation', category: 'Examinations', assigned_to: 'Academic Affairs', due_date: iso(shiftDays(11)), status: 'open', is_demo: true },
    { title: 'Publish spring course catalogue', category: 'Curriculum', assigned_to: 'Registrar Office', due_date: iso(shiftDays(15)), status: 'open', is_demo: true },
    { title: 'Archive summer session requests', category: 'Records', assigned_to: 'Faculty Administrator', due_date: iso(shiftDays(-2)), status: 'done', is_demo: true },
  ]);

  await chunkCreate(base44.entities.AppSetting, [
    { key: 'attendance_threshold', value: '85', label: 'Attendance threshold (%)', description: 'Attendance below this percentage is flagged for review.' },
    { key: 'risk_gpa_high', value: '3.0', label: 'High risk GPA', description: 'GPA below this value indicates high academic risk.' },
    { key: 'risk_gpa_medium', value: '3.6', label: 'Medium risk GPA', description: 'GPA below this value indicates medium academic risk.' },
    { key: 'risk_absence_medium', value: '20', label: 'Medium risk absence rate (%)', description: 'Absence rate above this value indicates medium risk.' },
    { key: 'risk_absence_high', value: '30', label: 'High risk absence rate (%)', description: 'Absence rate above this value indicates high risk.' },
    { key: 'risk_gpa_decline', value: '0.4', label: 'GPA decline threshold', description: 'A drop of this size between semesters indicates risk.' },
  ]);

  return { seeded: true };
}