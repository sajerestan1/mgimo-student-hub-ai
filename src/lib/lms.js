import { base44 } from '@/api/base44Client';

const list = (page) => (Array.isArray(page) ? page : page?.items || []);

// One workspace load per course: modules, resources, assignments, quizzes,
// discussions and the signed-in student's own submissions, attempts and progress.
export async function loadCourseWorkspace(courseId, userId) {
  const course = await base44.entities.Course.get(courseId);

  const [modulePage, resourcePage, assignmentPage, quizPage] = await Promise.all([
    base44.entities.CourseModule.filter({ course_id: courseId, status: { $ne: 'draft' } }, { sort: 'module_number', limit: 40 }),
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
const round1 = (value) => Math.round(value * 10) / 10;

export const ASSESSMENT_LABELS = {
  coursework: 'Coursework',
  essay: 'Essay',
  project: 'Project',
  presentation: 'Presentation',
  problem_set: 'Problem set',
  exam: 'Examination',
  case_analysis: 'Case analysis',
  policy_brief: 'Policy brief',
  research_paper: 'Research paper',
  comparative_analysis: 'Comparative analysis',
  seminar_prep: 'Seminar preparation',
};

// Single source of truth for course grades: the student course page, the
// Grades & Transcript page, the student dashboard and the professor gradebook
// all read the result of this function.
//
// A category is only counted once it has an actual result. Missing work is
// displayed as missing and never averaged in as zero, and a quiz attempt that
// still needs manual marking counts as awaiting grading, not as a result.
export function buildGradebook({ course, assignments, submissions, quizzes, attempts }) {
  const today = new Date().toISOString().slice(0, 10);
  const submissionFor = (assignmentId) => submissions.find((s) => s.assignment_id === assignmentId);

  const assignmentRow = (assignment) => {
    const submission = submissionFor(assignment.id);
    const graded = submission && typeof submission.score === 'number';
    const max = assignment.max_score || 100;
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
      kind: 'assignment',
      title: assignment.title,
      categoryLabel: ASSESSMENT_LABELS[assignment.assessment_type] || 'Assignment',
      max,
      score: graded ? submission.score : null,
      percent: graded ? round1((submission.score / max) * 100) : null,
      status,
      feedback: submission?.feedback || '',
      gradedAt: submission?.graded_at || null,
      dueDate: assignment.due_date,
      submittedAt: submission?.submitted_at || null,
      late: submission && assignment.due_date ? daysBetween(submission.submitted_at, assignment.due_date) > 0 : false,
    };
  };

  const quizRow = (quiz) => {
    const attempt = bestAttempt(attempts, quiz.id);
    const pending = Boolean(attempt && attempt.review_status === 'pending_review');
    const overdue = quiz.available_until && quiz.available_until < today;
    return {
      id: quiz.id,
      kind: 'quiz',
      title: quiz.title,
      categoryLabel: 'Quiz',
      max: 100,
      score: attempt ? attempt.score : null,
      percent: attempt && !pending ? attempt.score : null,
      status: pending
        ? 'awaiting_grading'
        : attempt
          ? 'graded'
          : overdue
            ? 'missing'
            : 'not_submitted',
      feedback: attempt?.feedback || (attempt ? `${attempt.score}% on ${attempt.submitted_at}` : ''),
      gradedAt: attempt?.submitted_at || null,
      dueDate: quiz.available_until,
      pendingReview: pending,
    };
  };

  const examAssignments = assignments.filter((a) => a.assessment_type === 'exam');
  const courseworkAssignments = assignments.filter((a) => a.assessment_type !== 'exam');

  const categories = [
    {
      key: 'assignments',
      label: 'Assignments',
      weight: course.weight_assignments ?? 30,
      items: courseworkAssignments.map(assignmentRow),
    },
    {
      key: 'quizzes',
      label: 'Quizzes',
      weight: course.weight_quizzes ?? 20,
      items: quizzes.map(quizRow),
    },
    {
      key: 'exams',
      label: 'Examinations',
      weight: (course.weight_midterm ?? 20) + (course.weight_final ?? 30),
      items: examAssignments.map(assignmentRow),
    },
  ];

  categories.forEach((category) => {
    const counted = category.items.filter((item) => item.status === 'graded' && item.percent !== null);
    category.counted = counted.length;
    category.score = counted.length
      ? round1(counted.reduce((sum, item) => sum + item.percent, 0) / counted.length)
      : null;
    category.average = category.score;
  });

  const scored = categories.filter((category) => category.score !== null);
  const weightScored = scored.reduce((sum, category) => sum + category.weight, 0);
  const weighted = weightScored
    ? round1(scored.reduce((sum, category) => sum + category.score * category.weight, 0) / weightScored)
    : null;

  categories.forEach((category) => {
    category.items.forEach((item) => {
      item.contribution =
        item.status === 'graded' && item.percent !== null && weightScored
          ? round1((item.percent * (category.weight / Math.max(1, category.counted))) / weightScored)
          : null;
    });
  });

  const allItems = categories.flatMap((category) => category.items);
  const totalWeight = categories.reduce((sum, category) => sum + category.weight, 0);

  return {
    categories,
    rows: allItems,
    weighted,
    letter: letterFor(weighted),
    weightScored,
    totalWeight,
    missing: allItems.filter((item) => item.status === 'missing').length,
    awaiting: allItems.filter((item) => item.status === 'awaiting_grading').length,
    graded: allItems.filter((item) => item.status === 'graded').length,
    pendingReview: allItems.filter((item) => item.pendingReview).length,
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

export const completionStatus = (modulePercent, hasActivity) => {
  if (modulePercent >= 100) return 'completed';
  if (modulePercent > 0 || hasActivity) return 'in_progress';
  return 'not_started';
};