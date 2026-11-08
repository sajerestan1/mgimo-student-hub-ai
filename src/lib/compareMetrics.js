import { pct } from '@/lib/professorData';

// One row per student, aggregated across every enrolment in the chosen scope, so
// two students taking different courses can still be compared on the same scale.
export function buildComparisonRows({ data, students, courses, courseFilter = 'all' }) {
  if (!data) return [];
  const byId = new Map(students.map((student) => [student.id, student]));
  const scoped = courseFilter === 'all' ? data.enrollments : data.enrollments.filter((e) => e.course_id === courseFilter);
  const map = new Map();

  scoped.forEach((enrolment) => {
    const student = byId.get(enrolment.student_id);
    if (!student) return;
    const entry =
      map.get(student.id) ||
      { key: student.id, name: student.full_name, studentId: student.student_id, group: student.group_name, courses: [], marks: [], submitted: 0, expected: 0, present: 0, sessions: 0, quiz: [] };
    map.set(student.id, entry);

    const course = courses.find((item) => item.id === enrolment.course_id);
    if (course && !entry.courses.includes(course.code)) entry.courses.push(course.code);

    const subs = data.submissions.filter((s) => s.course_id === enrolment.course_id && s.student_id === student.id);
    subs.forEach((submission) => {
      if (typeof submission.score !== 'number') return;
      const max = data.assignments.find((a) => a.id === submission.assignment_id)?.max_score || 100;
      entry.marks.push((submission.score / max) * 100);
    });
    entry.submitted += subs.length;
    entry.expected += data.assignments.filter((a) => a.course_id === enrolment.course_id && a.status === 'published').length;

    const att = data.attendance.filter((r) => r.course_id === enrolment.course_id && r.student_id === student.id);
    entry.sessions += att.length;
    entry.present += att.filter((r) => r.status === 'present' || r.status === 'late').length;

    data.attempts
      .filter((a) => a.course_id === enrolment.course_id && a.student_id === student.id)
      .forEach((attempt) => entry.quiz.push(attempt.score || 0));
  });

  const mean = (list) => (list.length ? Math.round(list.reduce((sum, n) => sum + n, 0) / list.length) : null);

  return [...map.values()]
    .map((entry) => {
      const avg = mean(entry.marks);
      const attendance = entry.sessions ? pct(entry.present, entry.sessions) : null;
      const completion = entry.expected ? pct(entry.submitted, entry.expected) : null;
      const quiz = mean(entry.quiz);
      const atRisk = (avg !== null && avg < 60) || (attendance !== null && attendance < 70);
      const watch = (avg !== null && avg < 70) || (attendance !== null && attendance < 80) || (completion !== null && completion < 60);
      const fallback = (value, neutral) => (value === null ? neutral : value);
      return {
        ...entry,
        courses: entry.courses.join(', ') || '—',
        avg,
        attendance,
        completion,
        quiz,
        status: atRisk ? 'at_risk' : watch ? 'watch' : 'stable',
        riskScore: Math.round(
          (100 - fallback(avg, 70)) + (100 - fallback(attendance, 75)) * 0.6 + (100 - fallback(completion, 75)) * 0.4
        ),
      };
    })
    .sort((a, b) => b.riskScore - a.riskScore);
}

export const STATUS_TONE = { at_risk: 'critical', watch: 'warning', stable: 'positive' };
export const STATUS_LABEL = { at_risk: 'Falling behind', watch: 'Watch', stable: 'On track' };