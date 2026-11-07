import { base44 } from '@/api/base44Client';

const SEMESTER = '2026/2027 · Autumn';

/* Fictional demonstration records. Two variants so different accounts hold different academic data. */
const VARIANTS = [
  {
    name: 'Alexandra Volkova',
    student_id: 'MG-2025-0148',
    program: 'International Relations',
    faculty: 'Faculty of International Relations',
    year: 2,
    advisor: 'Dr. M. Karimova',
    courses: [
      { code: 'IR201', title: 'International Political Economy', instructor: 'Prof. E. Sokolova', credits: 4 },
      { code: 'IR204', title: 'Diplomatic Protocol & Etiquette', instructor: 'Dr. M. Karimova', credits: 3 },
      { code: 'LNG110', title: 'Chinese Language (Advanced)', instructor: 'Liu Wen', credits: 4 },
      { code: 'IR208', title: 'International Law', instructor: 'Prof. A. Belov', credits: 4 },
      { code: 'ECO105', title: 'Macroeconomics', instructor: 'Dr. N. Orlova', credits: 4 },
      { code: 'HIS130', title: 'History of International Relations', instructor: 'Prof. S. Gromov', credits: 3 },
    ],
    schedule: [
      { course_code: 'IR201', title: 'International Political Economy', instructor: 'Prof. E. Sokolova', room: 'Room 314', weekday: 1, start_time: '09:30', end_time: '11:00', type: 'seminar' },
      { course_code: 'IR204', title: 'Diplomatic Protocol & Etiquette', instructor: 'Dr. M. Karimova', room: 'Hall 2', weekday: 1, start_time: '11:20', end_time: '12:50', type: 'lecture' },
      { course_code: 'LNG110', title: 'Chinese Language (Advanced)', instructor: 'Liu Wen', room: 'Room 208', weekday: 1, start_time: '14:10', end_time: '15:40', type: 'practice' },
      { course_code: 'IR208', title: 'International Law', instructor: 'Prof. A. Belov', room: 'Room 401', weekday: 2, start_time: '10:00', end_time: '11:30', type: 'lecture' },
      { course_code: 'ECO105', title: 'Macroeconomics', instructor: 'Dr. N. Orlova', room: 'Room 112', weekday: 2, start_time: '12:10', end_time: '13:40', type: 'seminar' },
      { course_code: 'LNG110', title: 'Chinese Language (Advanced)', instructor: 'Liu Wen', room: 'Room 208', weekday: 3, start_time: '09:30', end_time: '11:00', type: 'practice' },
      { course_code: 'HIS130', title: 'History of International Relations', instructor: 'Prof. S. Gromov', room: 'Hall 1', weekday: 3, start_time: '11:20', end_time: '12:50', type: 'lecture' },
      { course_code: 'IR201', title: 'International Political Economy', instructor: 'Prof. E. Sokolova', room: 'Room 314', weekday: 3, start_time: '15:00', end_time: '16:30', type: 'lecture' },
      { course_code: 'ECO105', title: 'Macroeconomics', instructor: 'Dr. N. Orlova', room: 'Room 112', weekday: 4, start_time: '10:00', end_time: '11:30', type: 'lecture' },
      { course_code: 'IR204', title: 'Diplomatic Protocol & Etiquette', instructor: 'Dr. M. Karimova', room: 'Room 210', weekday: 4, start_time: '12:10', end_time: '13:40', type: 'seminar' },
      { course_code: 'IR208', title: 'International Law', instructor: 'Prof. A. Belov', room: 'Room 401', weekday: 5, start_time: '09:30', end_time: '11:00', type: 'seminar' },
      { course_code: 'LNG110', title: 'Chinese Language (Advanced)', instructor: 'Liu Wen', room: 'Room 208', weekday: 5, start_time: '11:20', end_time: '12:50', type: 'practice' },
      { course_code: 'HIS130', title: 'History of International Relations', instructor: 'Prof. S. Gromov', room: 'Room 305', weekday: 5, start_time: '14:10', end_time: '15:40', type: 'seminar' },
      { course_code: 'IR201', title: 'International Political Economy', instructor: 'Prof. E. Sokolova', room: 'Room 314', weekday: 6, start_time: '10:00', end_time: '11:30', type: 'consultation' },
    ],
    grades: [
      { course_code: 'IR201', title: 'International Political Economy', instructor: 'Prof. E. Sokolova', credits: 4, grade: '5', grade_points: 5, type: 'exam', date: '2026-10-28' },
      { course_code: 'IR204', title: 'Diplomatic Protocol & Etiquette', instructor: 'Dr. M. Karimova', credits: 3, grade: '5', grade_points: 5, type: 'exam', date: '2026-10-21' },
      { course_code: 'LNG110', title: 'Chinese Language (Advanced)', instructor: 'Liu Wen', credits: 4, grade: '4', grade_points: 4, type: 'exam', date: '2026-10-30' },
      { course_code: 'IR208', title: 'International Law', instructor: 'Prof. A. Belov', credits: 4, grade: '4', grade_points: 4, type: 'coursework', date: '2026-10-12' },
      { course_code: 'ECO105', title: 'Macroeconomics', instructor: 'Dr. N. Orlova', credits: 4, grade: '5', grade_points: 5, type: 'exam', date: '2026-10-24' },
      { course_code: 'HIS130', title: 'History of International Relations', instructor: 'Prof. S. Gromov', credits: 3, grade: '5', grade_points: 5, type: 'credit', date: '2026-10-08' },
      { course_code: 'PHI101', title: 'Philosophy', instructor: 'Dr. O. Ivanova', credits: 3, grade: '5', grade_points: 5, type: 'credit', date: '2026-06-18' },
      { course_code: 'MAT102', title: 'Quantitative Methods', instructor: 'Dr. R. Petrov', credits: 3, grade: '4', grade_points: 4, type: 'exam', date: '2026-06-15' },
    ],
    applications: [
      {
        certificate_type: 'Enrollment certificate',
        title: 'Enrollment certificate request',
        purpose: 'Required by the scholarship committee to confirm full-time enrollment.',
        status: 'approved',
        submitted_date: '2026-10-14',
        history: [
          { status: 'submitted', date: '2026-10-14', note: 'Submitted to the Dean’s Office' },
          { status: 'under_review', date: '2026-10-15', note: 'Documents verified by the Dean’s Office' },
          { status: 'approved', date: '2026-10-17', note: 'Ready for collection at room 118' },
        ],
      },
      {
        certificate_type: 'Academic transcript',
        title: 'Academic transcript request',
        purpose: 'Needed for an exchange programme application at a partner university.',
        status: 'under_review',
        submitted_date: '2026-11-03',
        history: [
          { status: 'submitted', date: '2026-11-03', note: 'Submitted to the Dean’s Office' },
          { status: 'under_review', date: '2026-11-04', note: 'Awaiting signature of the programme coordinator' },
        ],
      },
    ],
    notifications: [
      { title: 'Winter exam session timetable published', body: 'The timetable for the winter examination session is now available. Check your exam dates and rooms in Academic Performance before planning your revision.', category: 'deadline', is_read: false, due_date: '2026-11-20' },
      { title: 'Room change: Chinese Language (Advanced)', body: 'The Friday practice group has been moved from room 105 to room 208, effective this week.', category: 'schedule', is_read: false },
      { title: 'Application approved: Enrollment certificate', body: 'Your enrollment certificate request has been approved and can be collected at the Dean’s Office, room 118.', category: 'application', is_read: true },
      { title: 'Scholarship renewal documents due 12 November', body: 'Submit the renewed scholarship application and supporting documents to the Dean’s Office by 12 November.', category: 'reminder', is_read: false, due_date: '2026-11-12' },
      { title: 'Dean’s Office consultation hours in November', body: 'Student consultation hours: Monday and Thursday, 14:00–17:00, room 118.', category: 'announcement', is_read: true },
    ],
  },
  {
    name: 'Timur Aliyev',
    student_id: 'MG-2024-0932',
    program: 'International Economic Relations',
    faculty: 'Faculty of International Economic Relations',
    year: 3,
    advisor: 'Prof. I. Morozov',
    courses: [
      { code: 'IER301', title: 'Global Trade & WTO Law', instructor: 'Prof. I. Morozov', credits: 4 },
      { code: 'FIN210', title: 'Corporate Finance', instructor: 'Dr. K. Lebedeva', credits: 4 },
      { code: 'LNG220', title: 'Business Chinese', instructor: 'Chen Yu', credits: 3 },
      { code: 'STA202', title: 'Applied Statistics', instructor: 'Dr. R. Petrov', credits: 3 },
      { code: 'IER305', title: 'Digital Economy & Platforms', instructor: 'Prof. V. Zaitsev', credits: 3 },
    ],
    schedule: [
      { course_code: 'IER301', title: 'Global Trade & WTO Law', instructor: 'Prof. I. Morozov', room: 'Hall 3', weekday: 1, start_time: '10:00', end_time: '11:30', type: 'lecture' },
      { course_code: 'STA202', title: 'Applied Statistics', instructor: 'Dr. R. Petrov', room: 'Room 118', weekday: 1, start_time: '12:10', end_time: '13:40', type: 'seminar' },
      { course_code: 'FIN210', title: 'Corporate Finance', instructor: 'Dr. K. Lebedeva', room: 'Room 402', weekday: 2, start_time: '09:30', end_time: '11:00', type: 'lecture' },
      { course_code: 'LNG220', title: 'Business Chinese', instructor: 'Chen Yu', room: 'Room 206', weekday: 2, start_time: '11:20', end_time: '12:50', type: 'practice' },
      { course_code: 'IER305', title: 'Digital Economy & Platforms', instructor: 'Prof. V. Zaitsev', room: 'Room 311', weekday: 3, start_time: '10:00', end_time: '11:30', type: 'seminar' },
      { course_code: 'FIN210', title: 'Corporate Finance', instructor: 'Dr. K. Lebedeva', room: 'Room 402', weekday: 3, start_time: '14:10', end_time: '15:40', type: 'seminar' },
      { course_code: 'IER301', title: 'Global Trade & WTO Law', instructor: 'Prof. I. Morozov', room: 'Hall 3', weekday: 4, start_time: '11:20', end_time: '12:50', type: 'seminar' },
      { course_code: 'STA202', title: 'Applied Statistics', instructor: 'Dr. R. Petrov', room: 'Room 118', weekday: 4, start_time: '15:00', end_time: '16:30', type: 'lecture' },
      { course_code: 'LNG220', title: 'Business Chinese', instructor: 'Chen Yu', room: 'Room 206', weekday: 5, start_time: '09:30', end_time: '11:00', type: 'practice' },
      { course_code: 'IER305', title: 'Digital Economy & Platforms', instructor: 'Prof. V. Zaitsev', room: 'Room 311', weekday: 5, start_time: '12:10', end_time: '13:40', type: 'lecture' },
      { course_code: 'FIN210', title: 'Corporate Finance', instructor: 'Dr. K. Lebedeva', room: 'Room 402', weekday: 6, start_time: '10:00', end_time: '11:30', type: 'consultation' },
    ],
    grades: [
      { course_code: 'IER301', title: 'Global Trade & WTO Law', instructor: 'Prof. I. Morozov', credits: 4, grade: '4', grade_points: 4, type: 'exam', date: '2026-10-27' },
      { course_code: 'FIN210', title: 'Corporate Finance', instructor: 'Dr. K. Lebedeva', credits: 4, grade: '5', grade_points: 5, type: 'exam', date: '2026-10-22' },
      { course_code: 'LNG220', title: 'Business Chinese', instructor: 'Chen Yu', credits: 3, grade: '3', grade_points: 3, type: 'exam', date: '2026-10-29' },
      { course_code: 'STA202', title: 'Applied Statistics', instructor: 'Dr. R. Petrov', credits: 3, grade: '4', grade_points: 4, type: 'coursework', date: '2026-10-15' },
      { course_code: 'IER305', title: 'Digital Economy & Platforms', instructor: 'Prof. V. Zaitsev', credits: 3, grade: '4', grade_points: 4, type: 'credit', date: '2026-10-09' },
      { course_code: 'ECO110', title: 'Microeconomics', instructor: 'Dr. N. Orlova', credits: 4, grade: '4', grade_points: 4, type: 'exam', date: '2026-06-16' },
      { course_code: 'ACC101', title: 'Accounting Fundamentals', instructor: 'Dr. T. Volkova', credits: 3, grade: '3', grade_points: 3, type: 'credit', date: '2026-06-19' },
    ],
    applications: [
      {
        certificate_type: 'Certificate of study',
        title: 'Certificate of study request',
        purpose: 'Required by an internship provider to confirm student status.',
        status: 'completed',
        submitted_date: '2026-09-29',
        history: [
          { status: 'submitted', date: '2026-09-29', note: 'Submitted to the Dean’s Office' },
          { status: 'under_review', date: '2026-09-30', note: 'Student status verified' },
          { status: 'approved', date: '2026-10-01', note: 'Certificate prepared' },
          { status: 'completed', date: '2026-10-02', note: 'Collected at room 118' },
        ],
      },
      {
        certificate_type: 'Dean’s letter of recommendation',
        title: 'Dean’s letter of recommendation',
        purpose: 'For a summer school application.',
        status: 'draft',
        submitted_date: '',
        history: [{ status: 'draft', date: '2026-11-05', note: 'Saved as a draft' }],
      },
    ],
    notifications: [
      { title: 'Internship fair: 14 November, Hall 3', body: 'Twelve partner companies will meet students from 11:00 to 17:00. Bring printed copies of your transcript.', category: 'announcement', is_read: false },
      { title: 'Applied Statistics seminar moved to 16:30', body: 'This week only, the Thursday seminar starts at 16:30 in room 118.', category: 'schedule', is_read: false, due_date: '2026-11-12' },
      { title: 'Your certificate is ready for collection', body: 'The certificate of study you requested is ready at the Dean’s Office, room 118.', category: 'application', is_read: true },
      { title: 'Course paper submission closes 18 November', body: 'Upload the final version of your Global Trade course paper to the programme portal before 18 November, 23:59.', category: 'deadline', is_read: false, due_date: '2026-11-18' },
    ],
  },
];

function pickVariant(userId) {
  let hash = 7;
  for (const char of String(userId)) {
    hash = (hash * 31 + char.charCodeAt(0)) % 100000;
  }
  return VARIANTS[hash % VARIANTS.length];
}

/**
 * Creates the fictional demonstration record set for a new student account once.
 * Each record carries user_id, and the access rules keep every student's data isolated.
 */
const seedingTasks = new Map();

export function seedStudentData(user) {
  if (seedingTasks.has(user.id)) return seedingTasks.get(user.id);
  const task = runSeed(user).catch((error) => {
    seedingTasks.delete(user.id);
    throw error;
  });
  seedingTasks.set(user.id, task);
  return task;
}

async function runSeed(user) {
  const existing = await base44.entities.StudentProfile.filter({ user_id: user.id });
  const list = Array.isArray(existing) ? existing : existing?.items || [];
  if (list.length > 0) return list[0];

  const variant = pickVariant(user.id);
  const base = { user_id: user.id };

  const existingCourses = await base44.entities.Course.filter({ user_id: user.id });
  const seededBefore = (Array.isArray(existingCourses) ? existingCourses : existingCourses?.items || []).length > 0;

  if (!seededBefore) {
    await base44.entities.Course.bulkCreate(
      variant.courses.map((course) => ({ ...course, ...base, semester: SEMESTER }))
    );
    await base44.entities.ScheduleEntry.bulkCreate(
      variant.schedule.map((entry) => ({ ...entry, ...base }))
    );
    await base44.entities.Grade.bulkCreate(
      variant.grades.map((grade) => ({ ...grade, ...base, semester: SEMESTER }))
    );
    await base44.entities.Application.bulkCreate(
      variant.applications.map((application) => ({ ...application, ...base }))
    );
    await base44.entities.Notification.bulkCreate(
      variant.notifications.map((notification) => ({ ...notification, ...base }))
    );
  }

  // The profile is written last: it marks the demonstration record set as complete.
  return base44.entities.StudentProfile.create({
    ...base,
    full_name: user.full_name || variant.name,
    student_id: variant.student_id,
    program: variant.program,
    faculty: variant.faculty,
    year: variant.year,
    university: 'MGIMO University',
    email: user.email,
    advisor: variant.advisor,
  });
}

export { VARIANTS };