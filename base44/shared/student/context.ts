// One authorised academic context for the signed-in student.
//
// Identity is always resolved here, server-side, from the authenticated account:
// the browser never supplies a student id. Every read is scoped to the records
// that belong to that student, so one student can never retrieve another's work.

import { buildGradebook, courseProgress, completionStatus, letterFor, round1 } from './gradebook.ts';

const list = (page) => (Array.isArray(page) ? page : page?.items || []);
const isoDay = () => new Date().toISOString().slice(0, 10);
const round0 = (value) => Math.round(value);

export function emptySummary() {
  return {
    average: null,
    averageLetter: '—',
    courseCount: 0,
    credits: 0,
    pending: 0,
    overdue: 0,
    awaiting: 0,
    graded: 0,
    attendanceRate: null,
    modulesCompleted: 0,
    modulesTotal: 0,
    quizTotal: 0,
    quizAttempted: 0,
    materialCount: 0,
    creditNote: '',
  };
}

export function emptyContext() {
  return {
    linked: false,
    profile: null,
    summary: emptySummary(),
    courses: [],
    assignments: [],
    quizzes: [],
    sessions: [],
    announcements: [],
    materials: [],
    recentGrades: [],
    attendance: { overall: null, held: 0, byCourse: [] },
    recommendations: [],
    today: isoDay(),
    scopeNote: '',
  };
}

// Attendance uses only the register rows recorded against this student.
function attendanceFor(records, courseId) {
  const rows = records.filter((row) => row.course_id === courseId);
  const count = (status) => rows.filter((row) => String(row.status || '').toLowerCase() === status).length;
  const present = count('present');
  const late = count('late');
  const excused = count('excused');
  const absent = count('absent');
  const total = rows.length;
  return {
    present,
    late,
    excused,
    absent,
    total,
    rate: total ? round0(((present + late + excused) / total) * 100) : null,
  };
}

function announcementVisible(announcement, profile, courseIds) {
  const audience = announcement.audience_type || 'university';
  if (audience === 'university' || audience === 'students') return true;
  if (audience === 'faculty') return Boolean(profile.faculty_id) && announcement.faculty_id === profile.faculty_id;
  if (audience === 'department') {
    return Boolean(profile.department_id) && announcement.department_id === profile.department_id;
  }
  if (audience === 'student_group') {
    return Boolean(profile.group_name) && announcement.group_name === profile.group_name;
  }
  if (audience === 'academic_staff') return false;
  if (announcement.course_id) return courseIds.includes(announcement.course_id);
  return true;
}

export async function buildStudentContext(base44, user) {
  const svc = base44.asServiceRole;
  const context = emptyContext();

  const students = list(await svc.entities.Student.filter({ user_id: user.id }, { limit: 2 }));
  const student = students[0];
  if (!student) {
    context.scopeNote = 'Your account is not linked to a student record yet.';
    return context;
  }

  const enrolments = list(await svc.entities.CourseEnrollment.filter({ student_id: student.id }, { limit: 200 }));
  const courseIds = [...new Set(enrolments.map((row) => row.course_id).filter(Boolean))];

  const courseRows = courseIds.length
    ? list(await svc.entities.Course.filter({ id: { $in: courseIds }, status: 'published' }, { sort: 'code', limit: 50 }))
    : [];
  const ids = courseRows.map((course) => course.id);

  const [facultyPage, departmentPage] = await Promise.all([
    student.faculty_id
      ? svc.entities.Faculty.filter({ id: { $in: [student.faculty_id] } }, { limit: 1 }).catch(() => [])
      : [],
    student.department_id
      ? svc.entities.Department.filter({ id: { $in: [student.department_id] } }, { limit: 1 }).catch(() => [])
      : [],
  ]);
  const faculty = list(facultyPage)[0];
  const department = list(departmentPage)[0];

  context.linked = true;
  context.profile = {
    id: student.id,
    full_name: student.full_name || user.full_name || '',
    student_id: student.student_id || '',
    program: student.program || '',
    year: student.year || null,
    group_name: student.group_name || '',
    email: student.email || user.email || '',
    enrollment_status: student.enrollment_status || 'active',
    faculty: faculty ? faculty.name : '',
    department: department ? department.name : '',
  };

  if (!ids.length) {
    context.scopeNote = 'You are not enrolled in a published course yet.';
    return context;
  }

  const [assignmentPage, submissionPage, quizPage, attemptPage, modulePage] = await Promise.all([
    svc.entities.Assignment.filter({ course_id: { $in: ids }, status: { $in: ['published', 'closed'] } }, { sort: 'due_date', limit: 200 }),
    svc.entities.Submission.filter({ $or: [{ student_user_id: user.id }, { student_id: student.id }] }, { limit: 300 }),
    svc.entities.Quiz.filter({ course_id: { $in: ids }, status: 'published' }, { limit: 60 }),
    svc.entities.QuizAttempt.filter({ $or: [{ student_user_id: user.id }, { student_id: student.id }] }, { limit: 200 }),
    svc.entities.CourseModule.filter({ course_id: { $in: ids }, status: { $ne: 'draft' } }, { sort: 'module_number', limit: 300 }),
  ]);
  const [progressPage, attendancePage, sessionPage, announcementPage] = await Promise.all([
    svc.entities.ModuleProgress.filter({ $or: [{ student_user_id: user.id }, { student_id: student.id }] }, { limit: 300 }),
    svc.entities.AttendanceRecord.filter({ student_id: student.id }, { limit: 2000 }),
    svc.entities.ClassSession.filter({ course_id: { $in: ids } }, { sort: 'session_date', limit: 300 }),
    svc.entities.Announcement.filter({ status: 'published' }, { sort: '-publish_date', limit: 100 }),
  ]);
  const [materialPage, professorPage, recommendationPage] = await Promise.all([
    svc.entities.LearningResource.filter(
      { course_id: { $in: ids }, visible_to_students: true },
      { sort: '-created_date', limit: 80 }
    ),
    svc.entities.Professor.list('-created_date', 200),
    svc.entities.StudyRecommendation.filter({ student_user_id: user.id }, { sort: '-generated_at', limit: 20 }),
  ]);

  const assignments = list(assignmentPage);
  const submissions = list(submissionPage);
  const quizzes = list(quizPage);
  const attempts = list(attemptPage);
  const modules = list(modulePage);
  const progress = list(progressPage);
  const attendance = list(attendancePage);
  const sessions = list(sessionPage);
  const announcements = list(announcementPage);
  const materials = list(materialPage);
  const professors = list(professorPage);

  const courses = courseRows.map((course) => {
    const courseProgressRows = progress.filter((row) => row.course_id === course.id);
    const courseModules = modules.filter((module) => module.course_id === course.id);
    const gradebook = buildGradebook({
      course,
      assignments: assignments.filter((a) => a.course_id === course.id),
      submissions: submissions.filter((s) => s.course_id === course.id),
      quizzes: quizzes.filter((q) => q.course_id === course.id),
      attempts: attempts.filter((a) => a.course_id === course.id),
    });
    const moduleProgress = courseProgress(courseModules, courseProgressRows);
    const professor = professors.find((p) => p.id === course.professor_id);
    return {
      id: course.id,
      code: course.code || '',
      title: course.title || '',
      credits: course.credits || 0,
      professor: professor ? professor.full_name : 'Course instructor',
      semester: course.semester || '',
      weighted: gradebook.weighted,
      letter: gradebook.letter,
      weightScored: gradebook.weightScored,
      awaiting: gradebook.awaiting,
      missing: gradebook.missing,
      graded: gradebook.graded,
      moduleProgress,
      completion: completionStatus(moduleProgress.percent, gradebook.graded > 0),
      attendance: attendanceFor(attendance, course.id),
      rows: gradebook.rows,
    };
  });

  const courseById = new Map(courses.map((course) => [course.id, course]));
  const courseForRow = (courseId) => courseById.get(courseId) || {};

  const assignmentRows = assignments
    .map((assignment) => {
      const course = courseForRow(assignment.course_id);
      const gradebookRow = (course.rows || []).find((row) => row.id === assignment.id && row.kind === 'assignment');
      if (!gradebookRow) return null;
      const overdue = assignment.due_date && assignment.due_date < isoDay();
      const state = gradebookRow.status === 'graded'
        ? 'graded'
        : gradebookRow.status === 'awaiting_grading'
          ? 'submitted'
          : overdue
            ? 'overdue'
            : 'pending';
      return {
        id: assignment.id,
        courseId: assignment.course_id,
        courseCode: course.code || assignment.course_code || '',
        courseTitle: course.title || assignment.course_title || '',
        title: assignment.title || '',
        type: gradebookRow.categoryLabel,
        instructions: assignment.instructions || '',
        maxScore: gradebookRow.max,
        dueDate: assignment.due_date || null,
        state,
        score: gradebookRow.score,
        feedback: gradebookRow.feedback,
        submittedAt: gradebookRow.submittedAt,
        gradedAt: gradebookRow.gradedAt,
        late: gradebookRow.late,
      };
    })
    .filter(Boolean)
    .sort((a, b) => new Date(a.dueDate || 0) - new Date(b.dueDate || 0));

  const quizRows = quizzes
    .map((quiz) => {
      const course = courseForRow(quiz.course_id);
      const gradebookRow = (course.rows || []).find((row) => row.id === quiz.id && row.kind === 'quiz');
      const own = attempts.filter((attempt) => attempt.quiz_id === quiz.id);
      const scored = gradebookRow ? gradebookRow.score : null;
      return {
        id: quiz.id,
        courseId: quiz.course_id,
        courseCode: course.code || quiz.course_code || '',
        courseTitle: course.title || quiz.course_title || '',
        title: quiz.title || '',
        availableFrom: quiz.available_from || null,
        availableUntil: quiz.available_until || null,
        attemptLimit: quiz.attempt_limit || 1,
        attempts: own.length,
        passMark: quiz.pass_mark || 60,
        score: scored,
        pendingReview: Boolean(gradebookRow && gradebookRow.pendingReview),
        state: scored !== null ? 'graded' : own.length ? 'submitted' : 'not_attempted',
      };
    })
    .sort((a, b) => new Date(a.availableUntil || 0) - new Date(b.availableUntil || 0));

  const recentGrades = courses
    .flatMap((course) =>
      course.rows
        .filter((row) => row.status === 'graded')
        .map((row) => ({
          courseCode: course.code,
          courseTitle: course.title,
          title: row.title,
          kind: row.kind,
          score: row.score,
          max: row.max,
          percent: row.percent,
          feedback: row.feedback,
          gradedAt: row.gradedAt,
        }))
    )
    .sort((a, b) => new Date(b.gradedAt || 0) - new Date(a.gradedAt || 0))
    .slice(0, 8);

  const attendanceByCourse = courses.map((course) => ({
    code: course.code,
    title: course.title,
    ...course.attendance,
  }));
  const held = attendance.length;
  const attended = attendance.filter((row) => ['present', 'late', 'excused'].includes(String(row.status || '').toLowerCase())).length;

  const scoredCourses = courses.filter((course) => course.weighted !== null);
  const creditTotal = scoredCourses.reduce((sum, course) => sum + (course.credits || 0), 0);
  const average = creditTotal
    ? round1(scoredCourses.reduce((sum, course) => sum + course.weighted * (course.credits || 0), 0) / creditTotal)
    : scoredCourses.length
      ? round1(scoredCourses.reduce((sum, course) => sum + course.weighted, 0) / scoredCourses.length)
      : null;

  context.courses = courses.map((course) => ({
    ...course,
    gradedItems: course.rows
      .filter((row) => row.status === 'graded')
      .map((row) => ({ title: row.title, score: row.score, max: row.max })),
  }));
  context.assignments = assignmentRows;
  context.quizzes = quizRows;
  context.recentGrades = recentGrades;
  context.attendance = { overall: held ? round0((attended / held) * 100) : null, held, byCourse: attendanceByCourse };
  context.materials = materials.slice(0, 40).map((material) => ({
    id: material.id,
    courseId: material.course_id,
    courseCode: material.course_code || '',
    title: material.title || '',
    type: material.type || 'reading',
    moduleNumber: material.module_number || null,
    publishedDate: material.published_date || material.created_date || null,
  }));
  context.sessions = sessions
    .filter((session) => session.session_date)
    .map((session) => {
      const course = courseForRow(session.course_id);
      return {
        id: session.id,
        courseId: session.course_id,
        courseCode: course.code || session.course_code || '',
        courseTitle: course.title || session.course_title || '',
        date: session.session_date,
        start: session.start_time || '',
        end: session.end_time || '',
        room: session.room || '',
        kind: session.kind || 'lecture',
        topic: session.topic || '',
      };
    });
  context.announcements = announcements
    .filter((announcement) => announcementVisible(announcement, student, ids))
    .slice(0, 12)
    .map((announcement) => ({
      id: announcement.id,
      title: announcement.title || '',
      body: announcement.body || '',
      date: announcement.publish_date || announcement.created_date || null,
      author: announcement.author_name || 'Student office',
      audience: announcement.audience_type || 'university',
    }));
  context.recommendations = list(recommendationPage).map((item) => ({
    id: item.id,
    courseCode: item.course_code || '',
    courseTitle: item.course_title || '',
    kind: item.kind || 'remedial_task',
    title: item.title || '',
    why: item.why || '',
    action: item.action || '',
    priority: item.priority || 'medium',
    status: item.status || 'suggested',
    materialId: item.material_id || '',
    materialTitle: item.material_title || '',
  }));

  context.summary = {
    average,
    averageLetter: letterFor(average),
    courseCount: courses.length,
    credits: courses.reduce((sum, course) => sum + (course.credits || 0), 0),
    pending: assignmentRows.filter((row) => row.state === 'pending').length,
    overdue: assignmentRows.filter((row) => row.state === 'overdue').length,
    awaiting: courses.reduce((sum, course) => sum + course.awaiting, 0),
    graded: courses.reduce((sum, course) => sum + course.graded, 0),
    attendanceRate: context.attendance.overall,
    modulesCompleted: courses.reduce((sum, course) => sum + course.moduleProgress.completed, 0),
    modulesTotal: courses.reduce((sum, course) => sum + course.moduleProgress.total, 0),
    quizTotal: quizRows.length,
    quizAttempted: quizRows.filter((quiz) => quiz.attempts > 0).length,
    materialCount: context.materials.length,
  };
  context.scopeNote = '';

  return context;
}

// Compact text record handed to the language model. It contains only the
// authenticated student's own rows and never a different student's data.
export function contextBrief(context) {
  const { profile, summary } = context;
  if (!context.linked || !profile) {
    return 'The signed-in account has no linked student record, so no academic record is available.';
  }
  const lines = [
    `Student: ${profile.full_name} (${profile.student_id || 'no id'}), ${profile.program || 'programme not recorded'}, year ${
      profile.year || '—'
    }, group ${profile.group_name || '—'}, ${profile.faculty || 'faculty not recorded'}.`,
    `Weighted average ${summary.average === null ? 'not available (no graded work yet)' : `${summary.average.toFixed(1)}/100 (${summary.averageLetter})`}. Attendance ${
      summary.attendanceRate === null ? 'not recorded' : `${summary.attendanceRate}%`
    }. ${summary.courseCount} enrolled courses, ${summary.credits} credits. Modules completed ${summary.modulesCompleted} of ${summary.modulesTotal}.`,
  ];

  lines.push('', 'COURSES');
  if (!context.courses.length) lines.push('- none published');
  context.courses.forEach((course) => {
    lines.push(
      `- ${course.code} ${course.title} (${course.credits} credits, ${course.professor}): result ${
        course.weighted === null ? 'not graded yet' : `${course.weighted.toFixed(1)}/100 (${course.letter})`
      }, attendance ${course.attendance.rate === null ? 'not recorded' : `${course.attendance.rate}%`}, modules ${
        course.moduleProgress.completed
      }/${course.moduleProgress.total}.`
    );
  });

  const open = context.assignments.filter((row) => row.state !== 'graded');
  lines.push('', 'OPEN AND OVERDUE WORK');
  if (!open.length) lines.push('- none');
  open.slice(0, 12).forEach((row) => {
    lines.push(
      `- ${row.courseCode} "${row.title}" (${row.type}) due ${row.dueDate || 'no date'}, state ${row.state}${
        row.score === null ? '' : `, score ${row.score}/${row.maxScore}`
      }.`
    );
  });

  lines.push('', 'QUIZZES');
  if (!context.quizzes.length) lines.push('- none published');
  context.quizzes.slice(0, 10).forEach((quiz) => {
    lines.push(
      `- ${quiz.courseCode} "${quiz.title}" available until ${quiz.availableUntil || 'no closing date'}, attempts ${quiz.attempts}/${
        quiz.attemptLimit
      }, ${quiz.score === null ? 'no result recorded' : `best ${quiz.score}%`}.`
    );
  });

  lines.push('', 'RECENT GRADES AND FEEDBACK');
  if (!context.recentGrades.length) lines.push('- none recorded');
  context.recentGrades.slice(0, 8).forEach((grade) => {
    lines.push(
      `- ${grade.courseCode} "${grade.title}": ${grade.score}/${grade.max}${
        grade.feedback ? ` — feedback: ${grade.feedback}` : ''
      }`
    );
  });

  lines.push('', 'PUBLISHED COURSE MATERIALS THE STUDENT CAN OPEN');
  if (!context.materials.length) lines.push('- none published');
  context.materials.slice(0, 14).forEach((material) => {
    lines.push(`- ${material.courseCode} "${material.title}" (${String(material.type).replace(/_/g, ' ')})`);
  });

  lines.push('', 'ANNOUNCEMENTS VISIBLE TO THE STUDENT');
  if (!context.announcements.length) lines.push('- none');
  context.announcements.slice(0, 6).forEach((item) => {
    lines.push(`- ${item.title} (${item.date || 'no date'}, ${item.author})`);
  });

  if (context.recommendations.length) {
    lines.push('', 'EXISTING STUDY RECOMMENDATIONS');
    context.recommendations.slice(0, 6).forEach((item) => {
      lines.push(`- ${item.courseCode} ${item.title} [${item.priority}] ${item.status}`);
    });
  }

  return lines.join('\n');
}