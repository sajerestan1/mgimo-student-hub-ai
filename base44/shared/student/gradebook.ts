// Shared academic calculations for the student portal.
// A port of the gradebook the course workspace and the Grades page use, so the
// dashboard, the assignment list and the AI assistant can never disagree with
// the transcript about a student's result.

export const round1 = (value) => Math.round(value * 10) / 10;

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

const daysBetween = (a, b) => Math.round((new Date(a) - new Date(b)) / 86400000);

export const bestAttempt = (attempts, quizId) =>
  attempts
    .filter((a) => a.quiz_id === quizId)
    .reduce((best, a) => (best === null || a.score > best.score ? a : best), null);

export function buildGradebook({ course, assignments, submissions, quizzes, attempts }) {
  const today = new Date().toISOString().slice(0, 10);
  const submissionFor = (assignmentId) => submissions.find((s) => s.assignment_id === assignmentId);

  const assignmentRow = (assignment) => {
    const submission = submissionFor(assignment.id);
    const graded = submission && typeof submission.score === 'number';
    const max = assignment.max_score || 100;
    const overdue = assignment.due_date && assignment.due_date < today;
    return {
      id: assignment.id,
      kind: 'assignment',
      title: assignment.title,
      categoryLabel: ASSESSMENT_LABELS[assignment.assessment_type] || 'Assignment',
      max,
      score: graded ? submission.score : null,
      percent: graded ? round1((submission.score / max) * 100) : null,
      status: graded ? 'graded' : submission ? 'awaiting_grading' : overdue ? 'missing' : 'not_submitted',
      feedback: (submission && submission.feedback) || '',
      gradedAt: (submission && submission.graded_at) || null,
      dueDate: assignment.due_date,
      submittedAt: (submission && submission.submitted_at) || null,
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
      status: pending ? 'awaiting_grading' : attempt ? 'graded' : overdue ? 'missing' : 'not_submitted',
      feedback: (attempt && attempt.feedback) || '',
      gradedAt: (attempt && attempt.submitted_at) || null,
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
    { key: 'quizzes', label: 'Quizzes', weight: course.weight_quizzes ?? 20, items: quizzes.map(quizRow) },
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

  const allItems = categories.flatMap((category) => category.items);

  return {
    categories,
    rows: allItems,
    weighted,
    letter: letterFor(weighted),
    weightScored,
    missing: allItems.filter((item) => item.status === 'missing').length,
    awaiting: allItems.filter((item) => item.status === 'awaiting_grading').length,
    graded: allItems.filter((item) => item.status === 'graded').length,
  };
}

export function courseProgress(modules, progress) {
  const done = new Set(progress.filter((p) => p.completed).map((p) => p.module_id));
  const completed = modules.filter((m) => done.has(m.id)).length;
  return {
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