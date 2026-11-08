import { base44 } from '@/api/base44Client';

const list = (page) => (Array.isArray(page) ? page : page?.items || []);

// One workspace load per course: modules, resources, assignments, quizzes,
// discussions and the signed-in student's own submissions, attempts and progress.
export async function loadCourseWorkspace(courseId, userId) {
  const course = await base44.entities.Course.get(courseId);

  const [modulePage, resourcePage, assignmentPage, quizPage] = await Promise.all([
    base44.entities.CourseModule.filter({ course_id: courseId }, { sort: 'module_number', limit: 40 }),
    base44.entities.LearningResource.filter({ course_id: courseId, visible_to_students: true }, { sort: 'module_number', limit: 100 }),
    base44.entities.Assignment.filter({ course_id: courseId }, { sort: 'due_date', limit: 20 }),
    base44.entities.Quiz.filter({ course_id: courseId, status: 'published' }, { limit: 10 }),
  ]);

  const quizzes = list(quizPage);
  const quizIds = quizzes.map((q) => q.id);

  const [questionPage, attemptPage, submissionPage, discussionPage, progressPage] = await Promise.all([
    quizIds.length ? base44.entities.QuizQuestion.filter({ quiz_id: { $in: quizIds } }, { sort: 'order', limit: 300 }) : [],
    userId ? base44.entities.QuizAttempt.filter({ student_user_id: userId, course_id: courseId }, { limit: 50 }) : [],
    userId ? base44.entities.Submission.filter({ student_user_id: userId, course_id: courseId }, { limit: 50 }) : [],
    base44.entities.Discussion.filter({ course_id: courseId }, { sort: '-created_date', limit: 200 }),
    userId ? base44.entities.ModuleProgress.filter({ student_user_id: userId, course_id: courseId }, { limit: 100 }) : [],
  ]);

  return {
    course,
    modules: list(modulePage),
    resources: list(resourcePage),
    assignments: list(assignmentPage),
    quizzes,
    questions: list(questionPage),
    attempts: list(attemptPage),
    submissions: list(submissionPage),
    discussions: list(discussionPage),
    progress: list(progressPage),
  };
}

export const bestAttempt = (attempts, quizId) =>
  attempts
    .filter((a) => a.quiz_id === quizId)
    .reduce((best, a) => (best === null || a.score > best.score ? a : best), null);

export const letterFor = (score) => {
  if (score === null || score === undefined) return '—';
  if (score >= 90) return 'A';
  if (score >= 85) return 'A-';
  if (score >= 80) return 'B+';
  if (score >= 75) return 'B';
  if (score >= 70) return 'B-';
  if (score >= 65) return 'C+';
  if (score >= 60) return 'C';
  if (score >= 50) return 'D';
  return 'F';
};

const daysBetween = (a, b) => Math.round((new Date(a) - new Date(b)) / 86400000);

// Weighted gradebook. A category is only counted once it has an actual result:
// missing work is displayed as missing and never averaged in as zero.
export function buildGradebook({ course, assignments, submissions, quizzes, attempts }) {
  const today = new Date().toISOString().slice(0, 10);
  const ordered = [...assignments].sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
  const midterm = ordered[1];
  const finalWork = ordered[2];
  const coursework = ordered[0];

  const submissionFor = (assignmentId) => submissions.find((s) => s.assignment_id === assignmentId);

  const assignmentRow = (assignment, category) => {
    if (!assignment) return null;
    const submission = submissionFor(assignment.id);
    const graded = submission && typeof submission.score === 'number';
    const overdue = assignment.due_date && assignment.due_date < today;
    const status = graded
      ? 'graded'
      : submission
        ? 'awaiting_grading'
        : overdue
          ? 'missing'
          : 'not_submitted';
    return {
      id: assignment.id,
      title: assignment.title,
      category,
      max: assignment.max_score || 100,
      score: graded ? submission.score : null,
      status,
      feedback: submission?.feedback || '',
      dueDate: assignment.due_date,
      submittedAt: submission?.submitted_at || null,
      late: submission && assignment.due_date ? daysBetween(submission.submitted_at, assignment.due_date) > 0 : false,
    };
  };

  const quizRows = quizzes.map((quiz) => {
    const attempt = bestAttempt(attempts, quiz.id);
    return {
      id: quiz.id,
      title: quiz.title,
      category: 'Quizzes',
      max: 100,
      score: attempt ? attempt.score : null,
      status: attempt ? 'graded' : quiz.available_until && quiz.available_until < today ? 'missing' : 'not_submitted',
      feedback: attempt ? `Best attempt: ${attempt.score}% on ${attempt.submitted_at}` : '',
      dueDate: quiz.available_until,
    };
  });

  const quizAverage = quizRows.filter((r) => r.score !== null);
  const quizScore = quizAverage.length
    ? quizAverage.reduce((sum, r) => sum + r.score, 0) / quizAverage.length
    : null;

  const categories = [
    {
      key: 'assignments',
      label: 'Assignments',
      weight: course.weight_assignments ?? 30,
      items: [assignmentRow(coursework, 'Assignments')].filter(Boolean),
      score: assignmentRow(coursework, 'Assignments')?.score ?? null,
    },
    {
      key: 'quizzes',
      label: 'Quizzes',
      weight: course.weight_quizzes ?? 20,
      items: quizRows,
      score: quizScore,
    },
    {
      key: 'midterm',
      label: 'Midterm assessment',
      weight: course.weight_midterm ?? 20,
      items: [assignmentRow(midterm, 'Midterm assessment')].filter(Boolean),
      score: assignmentRow(midterm, 'Midterm assessment')?.score ?? null,
    },
    {
      key: 'final',
      label: 'Final examination',
      weight: course.weight_final ?? 30,
      items: [assignmentRow(finalWork, 'Final examination')].filter(Boolean),
      score: assignmentRow(finalWork, 'Final examination')?.score ?? null,
    },
  ];

  const scored = categories.filter((c) => c.score !== null);
  const weightScored = scored.reduce((sum, c) => sum + c.weight, 0);
  const weighted = weightScored
    ? scored.reduce((sum, c) => sum + c.score * c.weight, 0) / weightScored
    : null;

  return {
    categories,
    weighted,
    letter: letterFor(weighted),
    weightScored,
    missing: categories.flatMap((c) => c.items).filter((i) => i.status === 'missing').length,
    awaiting: categories.flatMap((c) => c.items).filter((i) => i.status === 'awaiting_grading').length,
    totalWeight: categories.reduce((sum, c) => sum + c.weight, 0),
  };
}

export function courseProgress(modules, progress) {
  const done = new Set(progress.filter((p) => p.completed).map((p) => p.module_id));
  const completed = modules.filter((m) => done.has(m.id)).length;
  return {
    done,
    completed,
    total: modules.length,
    percent: modules.length ? Math.round((completed / modules.length) * 100) : 0,
  };
}