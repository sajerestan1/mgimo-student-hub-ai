import { base44 } from '@/api/base44Client';
import { buildGradebook, courseProgress, completionStatus, letterFor } from '@/lib/lms';

const list = (page) => (Array.isArray(page) ? page : page?.items || []);
const ACTIVE_ASSIGNMENT = { $in: ['published', 'closed'] };
const round1 = (value) => Math.round(value * 10) / 10;

// Resolves the signed-in account to its Student record.
export async function resolveStudent(userId) {
  if (!userId) return null;
  const rows = list(await base44.entities.Student.filter({ user_id: userId }, { limit: 5 }));
  return rows[0] || null;
}

export function emptySummary() {
  return {
    courseCount: 0,
    credits: 0,
    average: null,
    averageLetter: '—',
    assessmentsRecorded: 0,
    awaiting: 0,
    missing: 0,
    modulePercent: 0,
    modulesCompleted: 0,
    modulesTotal: 0,
    quizTotal: 0,
    quizAttempted: 0,
    quizCompletion: 0,
    quizAverage: null,
    openAssignments: [],
    recentGrades: [],
  };
}

// Every academic figure the student workspace shows, built from the student's
// own LMS records: enrolments, published courses, modules, assignments,
// submissions, quizzes, attempts and module progress.
export async function loadStudentAcademics(userId) {
  const student = await resolveStudent(userId);
  if (!student) return { student: null, courses: [], summary: emptySummary() };

  const enrolments = list(await base44.entities.CourseEnrollment.filter({ student_id: student.id }, { limit: 100 }));
  const courseIds = [...new Set(enrolments.map((row) => row.course_id).filter(Boolean))];
  if (!courseIds.length) return { student, courses: [], summary: emptySummary() };

  const courseRows = list(
    await base44.entities.Course.filter({ id: { $in: courseIds }, status: 'published' }, { sort: 'code', limit: 100 })
  );
  const ids = courseRows.map((c) => c.id);
  if (!ids.length) return { student, courses: [], summary: emptySummary() };

  const [assignmentPage, submissionPage, quizPage, attemptPage, modulePage, progressPage, professorPage] = await Promise.all([
    base44.entities.Assignment.filter({ course_id: { $in: ids }, status: ACTIVE_ASSIGNMENT }, { sort: 'due_date', limit: 200 }),
    base44.entities.Submission.filter({ student_user_id: userId }, { limit: 200 }),
    base44.entities.Quiz.filter({ course_id: { $in: ids }, status: 'published' }, { limit: 60 }),
    base44.entities.QuizAttempt.filter({ student_user_id: userId }, { limit: 200 }),
    base44.entities.CourseModule.filter({ course_id: { $in: ids }, status: { $ne: 'draft' } }, { sort: 'module_number', limit: 300 }),
    base44.entities.ModuleProgress.filter({ student_user_id: userId }, { limit: 200 }),
    base44.entities.Professor.list('-created_date', 80),
  ]);

  const assignments = list(assignmentPage);
  const submissions = list(submissionPage);
  const quizzes = list(quizPage);
  const attempts = list(attemptPage);
  const modules = list(modulePage);
  const progress = list(progressPage);
  const professors = list(professorPage);

  const courses = courseRows.map((course) => {
    const courseAssignments = assignments.filter((a) => a.course_id === course.id);
    const courseQuizzes = quizzes.filter((q) => q.course_id === course.id);
    const courseSubs = submissions.filter((s) => s.course_id === course.id);
    const courseAttempts = attempts.filter((a) => a.course_id === course.id);
    const courseModules = modules.filter((m) => m.course_id === course.id);
    const courseProgressRows = progress.filter((p) => p.course_id === course.id);

    const gradebook = buildGradebook({
      course,
      assignments: courseAssignments,
      submissions: courseSubs,
      quizzes: courseQuizzes,
      attempts: courseAttempts,
    });
    const modulesDone = courseProgress(courseModules, courseProgressRows);
    const professor = professors.find((p) => p.id === course.professor_id);

    return {
      course,
      professor: professor ? professor.full_name : 'Course instructor',
      credits: course.credits || 0,
      gradebook,
      modules: courseModules,
      moduleProgress: modulesDone,
      completion: completionStatus(modulesDone.percent, courseSubs.length > 0 || courseAttempts.length > 0),
      assignments: courseAssignments,
      submissions: courseSubs,
      quizzes: courseQuizzes,
      attempts: courseAttempts,
    };
  });

  const gradedRows = courses.flatMap((entry) =>
    entry.gradebook.rows
      .filter((row) => row.status === 'graded')
      .map((row) => ({ ...row, courseCode: entry.course.code, courseTitle: entry.course.title }))
  );
  const openAssignments = courses
    .flatMap((entry) =>
      entry.assignments
        .filter((a) => {
          const row = entry.gradebook.rows.find((r) => r.id === a.id);
          return row && (row.status === 'not_submitted' || row.status === 'missing');
        })
        .map((a) => ({
          id: a.id,
          title: a.title,
          courseId: entry.course.code,
          courseTitle: entry.course.title,
          dueDate: a.due_date,
          submitted: false,
          missed: a.due_date < new Date().toISOString().slice(0, 10),
        }))
    )
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  const scored = courses.filter((entry) => entry.gradebook.weighted !== null);
  const creditTotal = scored.reduce((sum, entry) => sum + (entry.credits || 0), 0);
  const average = creditTotal
    ? round1(scored.reduce((sum, entry) => sum + entry.gradebook.weighted * (entry.credits || 0), 0) / creditTotal)
    : scored.length
      ? round1(scored.reduce((sum, entry) => sum + entry.gradebook.weighted, 0) / scored.length)
      : null;

  const quizAttempted = courses.filter((entry) => entry.attempts.length > 0).length;
  const attemptScores = courses.flatMap((entry) => entry.attempts.map((a) => a.score).filter((v) => typeof v === 'number'));

  const summary = {
    courseCount: courses.length,
    credits: courses.reduce((sum, entry) => sum + entry.credits, 0),
    average,
    averageLetter: letterFor(average),
    assessmentsRecorded: gradedRows.length,
    awaiting: courses.reduce((sum, entry) => sum + entry.gradebook.awaiting, 0),
    missing: courses.reduce((sum, entry) => sum + entry.gradebook.missing, 0),
    modulePercent: courses.length
      ? Math.round(courses.reduce((sum, entry) => sum + entry.moduleProgress.percent, 0) / courses.length)
      : 0,
    modulesCompleted: courses.reduce((sum, entry) => sum + entry.moduleProgress.completed, 0),
    modulesTotal: courses.reduce((sum, entry) => sum + entry.moduleProgress.total, 0),
    quizTotal: courses.reduce((sum, entry) => sum + entry.quizzes.length, 0),
    quizAttempted,
    quizCompletion: courses.length ? Math.round((quizAttempted / courses.length) * 100) : 0,
    quizAverage: attemptScores.length
      ? Math.round(attemptScores.reduce((sum, value) => sum + value, 0) / attemptScores.length)
      : null,
    openAssignments,
    recentGrades: gradedRows
      .sort((a, b) => new Date(b.gradedAt || 0) - new Date(a.gradedAt || 0))
      .slice(0, 5),
    gradedRows,
  };

  return { student, courses, summary };
}

// Professor side: one course with its roster, assessments and per-student
// gradebooks computed by the same function the students see.
export async function loadCourseGradebook(courseId) {
  const course = await base44.entities.Course.get(courseId);
  const [enrolmentPage, assignmentPage, submissionPage, quizPage, attemptPage, modulePage] = await Promise.all([
    base44.entities.CourseEnrollment.filter({ course_id: courseId }, { limit: 200 }),
    base44.entities.Assignment.filter({ course_id: courseId }, { sort: 'due_date', limit: 40 }),
    base44.entities.Submission.filter({ course_id: courseId }, { limit: 400 }),
    base44.entities.Quiz.filter({ course_id: courseId }, { sort: 'title', limit: 30 }),
    base44.entities.QuizAttempt.filter({ course_id: courseId }, { limit: 400 }),
    base44.entities.CourseModule.filter({ course_id: courseId }, { sort: 'module_number', limit: 40 }),
  ]);

  const enrolments = list(enrolmentPage);
  const assignments = list(assignmentPage);
  const submissions = list(submissionPage);
  const quizzes = list(quizPage);
  const attempts = list(attemptPage);
  const modules = list(modulePage);

  const studentIds = [...new Set(enrolments.map((row) => row.student_id).filter(Boolean))];
  const students = studentIds.length
    ? list(await base44.entities.Student.filter({ id: { $in: studentIds } }, { limit: 200 }))
    : [];
  const progress = studentIds.length
    ? list(await base44.entities.ModuleProgress.filter({ course_id: courseId, student_id: { $in: studentIds } }, { limit: 400 }))
    : [];

  const roster = students.map((student) => {
    const ownSubs = submissions.filter((s) => s.student_id === student.id || s.student_user_id === student.user_id);
    const ownAttempts = attempts.filter((a) => a.student_id === student.id || a.student_user_id === student.user_id);
    const gradebook = buildGradebook({ course, assignments, submissions: ownSubs, quizzes, attempts: ownAttempts });
    const ownProgress = progress.filter((p) => p.student_id === student.id);
    return {
      student,
      gradebook,
      progress: courseProgress(modules, ownProgress),
      submissions: ownSubs,
      attempts: ownAttempts,
    };
  });

  return { course, assignments, submissions, quizzes, attempts, modules, roster };
}