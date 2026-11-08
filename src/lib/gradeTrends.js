const percent = (score, max) => (max ? (score / max) * 100 : score);

const shortDate = (value) =>
  value ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—';

// Builds the chronological grade-trend picture for a professor's teaching data:
// the class average on each graded assessment, and each student's trajectory so
// a falling mark can be caught before the end of term.
export function buildGradeTrend(data, courses = []) {
  const assignments = data.assignments || [];
  const submissions = data.submissions || [];
  const quizzes = data.quizzes || [];
  const attempts = data.attempts || [];
  const courseCode = new Map(courses.map((course) => [course.id, course.code]));

  const points = [];

  assignments.forEach((assignment) => {
    const graded = submissions.filter(
      (row) => row.assignment_id === assignment.id && typeof row.score === 'number'
    );
    const date = assignment.due_date || assignment.published_date;
    if (!graded.length || !date) return;
    const max = assignment.max_score || 100;
    points.push({
      key: assignment.id,
      date,
      short: shortDate(date),
      label: assignment.title,
      course: assignment.course_code,
      kind: 'Assignment',
      avg: Math.round(graded.reduce((sum, row) => sum + percent(row.score, max), 0) / graded.length),
      count: graded.length,
    });
  });

  quizzes.forEach((quiz) => {
    const rows = attempts.filter((row) => row.quiz_id === quiz.id && typeof row.score === 'number');
    const date = quiz.available_until || quiz.available_from;
    if (!rows.length || !date) return;
    points.push({
      key: quiz.id,
      date,
      short: shortDate(date),
      label: quiz.title,
      course: quiz.course_code || courseCode.get(quiz.course_id),
      kind: 'Quiz',
      avg: Math.round(rows.reduce((sum, row) => sum + percent(row.score, row.max_score || 100), 0) / rows.length),
      count: rows.length,
    });
  });

  points.sort((a, b) => new Date(a.date) - new Date(b.date));

  const assignmentDate = new Map(assignments.map((a) => [a.id, a.due_date || a.published_date]));
  const quizDate = new Map(quizzes.map((q) => [q.id, q.available_until || q.available_from]));
  const perStudent = new Map();

  const track = (studentId, name, group, course, date, value) => {
    if (!name || !date) return;
    const key = studentId || name;
    if (!perStudent.has(key)) perStudent.set(key, { name, group, courses: new Set(), marks: [] });
    const entry = perStudent.get(key);
    if (group && !entry.group) entry.group = group;
    if (course) entry.courses.add(course);
    entry.marks.push({ date, value });
  };

  submissions.forEach((row) => {
    if (typeof row.score !== 'number') return;
    const assignment = assignments.find((a) => a.id === row.assignment_id);
    track(
      row.student_id || row.student_name,
      row.student_name,
      row.student_group,
      row.course_code,
      assignmentDate.get(row.assignment_id),
      percent(row.score, assignment?.max_score || 100)
    );
  });

  attempts.forEach((row) => {
    if (typeof row.score !== 'number') return;
    track(
      row.student_id || row.student_name,
      row.student_name,
      row.student_group,
      courseCode.get(row.course_id),
      quizDate.get(row.quiz_id),
      percent(row.score, row.max_score || 100)
    );
  });

  const mean = (marks) => marks.reduce((sum, mark) => sum + mark.value, 0) / marks.length;
  const watchlist = [];

  perStudent.forEach((entry, key) => {
    const marks = entry.marks.slice().sort((a, b) => new Date(a.date) - new Date(b.date));
    if (!marks.length) return;

    let delta = null;
    if (marks.length >= 2) {
      const half = Math.ceil(marks.length / 2);
      delta = Math.round(mean(marks.slice(half)) - mean(marks.slice(0, half)));
    }

    const latest = Math.round(marks[marks.length - 1].value);
    const declining = delta !== null && delta <= -8;
    if (!declining && latest >= 60) return;

    watchlist.push({
      key,
      name: entry.name,
      group: entry.group,
      course: [...entry.courses].join(', '),
      average: Math.round(mean(marks)),
      latest,
      delta,
      graded: marks.length,
      severity: latest < 50 || (delta !== null && delta <= -15) ? 'critical' : 'warning',
    });
  });

  watchlist.sort((a, b) => (a.delta ?? 0) - (b.delta ?? 0) || a.latest - b.latest);

  const latestPoint = points[points.length - 1] || null;
  const previousPoint = points[points.length - 2] || null;

  return {
    points,
    watchlist,
    latest: latestPoint,
    change: latestPoint && previousPoint ? latestPoint.avg - previousPoint.avg : null,
  };
}