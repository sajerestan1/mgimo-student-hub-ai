import { base44 } from '@/api/base44Client';
import { withRetry } from '@/lib/apiRetry';

export const DEFAULT_THRESHOLD = 60;

const keyOf = (studentId, courseId) => `${studentId}|${courseId}`;
const rowsOf = (page) => (Array.isArray(page) ? page : page?.items || []);

export async function loadAlertRule(professorId) {
  const page = await withRetry(() =>
    base44.entities.GradeAlertRule.filter({ professor_id: professorId }, { limit: 1 })
  );
  return page.items?.[0] || null;
}

export async function loadAlerts(professorId) {
  const page = await withRetry(() =>
    base44.entities.GradeAlert.filter(
      { professor_id: professorId },
      { sort: '-detected_at', limit: 200 }
    )
  );
  return page.items || [];
}

export async function saveAlertRule({ rule, professor, user, threshold, courseScope, isActive }) {
  const payload = {
    professor_id: professor.id,
    professor_name: professor.full_name,
    professor_user_id: user?.id,
    threshold,
    course_scope: courseScope,
    is_active: isActive,
  };
  if (rule?.id) return base44.entities.GradeAlertRule.update(rule.id, payload);
  return base44.entities.GradeAlertRule.create(payload);
}

// Every recorded mark for a student in a course collapses into one average.
function averageByStudentCourse(records) {
  const buckets = new Map();
  records.forEach((record) => {
    if (typeof record.grade !== 'number') return;
    const key = keyOf(record.student_id, record.course_id);
    const bucket = buckets.get(key) || { total: 0, count: 0 };
    bucket.total += record.grade;
    bucket.count += 1;
    buckets.set(key, bucket);
  });
  const averages = new Map();
  buckets.forEach((bucket, key) => {
    averages.set(key, Math.round((bucket.total / bucket.count) * 10) / 10);
  });
  return averages;
}

/**
 * Compares every mark in the professor's courses with the rule's threshold and
 * keeps the alert queue in step: raises new breaches, refreshes ones whose mark
 * moved, and closes the alerts of students who are back above the line.
 */
export async function runAlertScan({ rule, professor, user, courses }) {
  const empty = { checked: 0, raised: 0, refreshed: 0, cleared: 0 };
  if (!rule?.is_active) return empty;
  const watched =
    rule.course_scope && rule.course_scope !== 'all'
      ? courses.filter((course) => course.id === rule.course_scope)
      : courses;
  const ids = watched.map((course) => course.id);
  if (!ids.length) return empty;

  const [recordsPage, existing, studentPage] = await Promise.all([
    withRetry(() => base44.entities.AcademicRecord.filter({ course_id: { $in: ids } }, { limit: 500 })),
    loadAlerts(professor.id),
    withRetry(() => base44.entities.Student.list('-created_date', 300)),
  ]);

  const students = new Map(rowsOf(studentPage).map((student) => [student.id, student]));
  const coursesById = new Map(watched.map((course) => [course.id, course]));
  const averages = averageByStudentCourse(rowsOf(recordsPage));
  const open = new Map(
    existing.filter((alert) => alert.status !== 'resolved').map((alert) => [keyOf(alert.student_id, alert.course_id), alert])
  );

  const creates = [];
  const updates = [];
  let cleared = 0;
  const threshold = rule.threshold;

  averages.forEach((grade, key) => {
    const [studentId, courseId] = key.split('|');
    const student = students.get(studentId);
    const course = coursesById.get(courseId);
    if (!student || !course) return;
    const current = open.get(key);

    // Back above the line: the alert closes itself.
    if (grade >= threshold) {
      if (current) {
        updates.push({ id: current.id, status: 'resolved', grade });
        cleared += 1;
      }
      return;
    }

    const shortfall = Math.round((threshold - grade) * 10) / 10;
    const severity = shortfall >= 10 ? 'critical' : 'warning';

    if (current) {
      if (current.grade !== grade || current.threshold !== threshold) {
        updates.push({ id: current.id, grade, threshold, shortfall, severity });
      }
      return;
    }

    creates.push({
      rule_id: rule.id,
      professor_id: professor.id,
      professor_user_id: user?.id,
      student_id: student.id,
      student_name: student.full_name,
      student_group: student.group_name,
      course_id: course.id,
      course_code: course.code,
      course_title: course.title,
      grade,
      threshold,
      shortfall,
      severity,
      status: 'open',
      detected_at: new Date().toISOString(),
    });
  });

  if (creates.length) await base44.entities.GradeAlert.bulkCreate(creates);
  if (updates.length) await base44.entities.GradeAlert.bulkUpdate(updates);
  await base44.entities.GradeAlertRule.update(rule.id, { last_checked_at: new Date().toISOString() });

  return {
    checked: averages.size,
    raised: creates.length,
    refreshed: updates.length - cleared,
    cleared,
  };
}