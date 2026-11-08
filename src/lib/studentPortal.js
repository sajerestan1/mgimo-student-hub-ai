import { base44 } from '@/api/base44Client';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';

/**
 * The student portal reads one authorised academic context, resolved on the
 * server from the signed-in account. Nothing here sends a student id.
 */
let cache = null;
const CACHE_MS = 15000;

/**
 * One shared read of the student context so the page and the app chrome never
 * fetch the record twice. Pass { fresh: true } after writing a record.
 */
export function loadStudentPortal({ fresh = false } = {}) {
  if (!fresh && cache && Date.now() - cache.at < CACHE_MS) return cache.promise;

  const promise = base44.functions
    .invoke('studentContext', {})
    .then((response) => {
      const data = response?.data || {};
      if (data.error) throw new Error(data.error);
      return data;
    })
    .catch((error) => {
      cache = null;
      throw error;
    });

  cache = { at: Date.now(), promise };
  return promise;
}

export const todayISO = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

export function daysUntil(value) {
  if (!value) return null;
  const target = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target - today) / 86400000);
}

export const shortDate = (value, options) =>
  value
    ? new Date(`${String(value).slice(0, 10)}T00:00:00`).toLocaleDateString(
        'en-GB',
        options || { day: 'numeric', month: 'short' }
      )
    : '—';

export const clock = (value) => (value ? String(value).slice(0, 5) : '');

export const dueLabel = (value) => {
  const days = daysUntil(value);
  if (days === null) return 'No due date';
  if (days < 0) return `${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} overdue`;
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  return `Due in ${days} days`;
};

export const ASSIGNMENT_STATE = {
  pending: { label: 'To do', tone: 'brand' },
  submitted: { label: 'Submitted', tone: 'warning' },
  overdue: { label: 'Overdue', tone: 'critical' },
  graded: { label: 'Graded', tone: 'positive' },
};

export const coursePath = (courseId) => (courseId ? `${P.student.courses}/${courseId}` : P.student.courses);

export const firstName = (profile) => (profile?.full_name || '').split(' ')[0] || 'there';

export const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const byStart = (a, b) => clock(a.start).localeCompare(clock(b.start));

export const sessionsOn = (context, iso) =>
  (context?.sessions || []).filter((session) => session.date === iso).sort(byStart);

export const upcomingSessions = (context) => {
  const today = todayISO();
  return (context?.sessions || [])
    .filter((session) => session.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date) || byStart(a, b));
};

/** Up to three short priorities, each derived from a real record. */
export function buildBriefing(context) {
  const items = [];
  const open = (context.assignments || []).filter((row) => row.state !== 'graded');
  const overdue = open.filter((row) => row.state === 'overdue');

  if (overdue.length) {
    const first = overdue[0];
    items.push({
      key: 'overdue',
      tone: 'critical',
      text: `${overdue.length} overdue item${overdue.length === 1 ? '' : 's'} — start with “${first.title}” (${first.courseCode}).`,
      to: P.student.assignments,
      cta: 'Open assignments',
    });
  }

  const soonest = open
    .filter((row) => row.state === 'pending' && daysUntil(row.dueDate) !== null && daysUntil(row.dueDate) >= 0)
    .sort((a, b) => daysUntil(a.dueDate) - daysUntil(b.dueDate))[0];
  if (soonest && items.length < 3) {
    items.push({
      key: 'due',
      tone: 'warning',
      text: `${soonest.courseCode} · “${soonest.title}” — ${dueLabel(soonest.dueDate).toLowerCase()}.`,
      to: P.student.assignments,
      cta: 'Submit work',
    });
  }

  const closingQuiz = (context.quizzes || [])
    .filter((quiz) => quiz.state !== 'graded' && daysUntil(quiz.availableUntil) !== null && daysUntil(quiz.availableUntil) >= 0)
    .sort((a, b) => daysUntil(a.availableUntil) - daysUntil(b.availableUntil))[0];
  if (closingQuiz && items.length < 3) {
    items.push({
      key: 'quiz',
      tone: 'brand',
      text: `${closingQuiz.courseCode} quiz “${closingQuiz.title}” — ${dueLabel(closingQuiz.availableUntil).toLowerCase()}, ${closingQuiz.attempts}/${closingQuiz.attemptLimit} attempts used.`,
      to: P.student.quizzes,
      cta: 'Open quizzes',
    });
  }

  const weakest = (context.courses || [])
    .filter((course) => course.weighted !== null)
    .sort((a, b) => a.weighted - b.weighted)[0];
  if (weakest && items.length < 3) {
    items.push({
      key: 'weakest',
      tone: 'neutral',
      text: `${weakest.code} is your lowest recorded result at ${weakest.weighted.toFixed(1)}/100 — review its published materials.`,
      to: coursePath(weakest.id),
      cta: 'Open course',
    });
  }

  if (!items.length) {
    items.push({
      key: 'clear',
      tone: 'positive',
      text: 'Nothing overdue and nothing due in the next few days. Use the time to work ahead on your next assessment.',
      to: P.student.assignments,
      cta: 'See all work',
    });
  }

  return items.slice(0, 3);
}

/** Grades, new materials and announcements in one short list. */
export function recentActivity(context) {
  const courseIdByCode = new Map((context.courses || []).map((course) => [course.code, course.id]));
  const entries = [];

  (context.recentGrades || []).slice(0, 4).forEach((grade) => {
    entries.push({
      id: `grade-${grade.courseCode}-${grade.title}`,
      kind: 'grade',
      label: grade.feedback ? 'Grade & feedback' : 'New grade',
      title: grade.title,
      detail: grade.feedback ? grade.feedback.slice(0, 140) : '',
      meta: `${grade.courseCode} · ${grade.score}/${grade.max}`,
      date: grade.gradedAt,
      to: coursePath(courseIdByCode.get(grade.courseCode)),
    });
  });

  (context.materials || []).slice(0, 4).forEach((material) => {
    entries.push({
      id: `material-${material.id}`,
      kind: 'material',
      label: 'New material',
      title: material.title,
      detail: '',
      meta: `${material.courseCode} · ${String(material.type).replace(/_/g, ' ')}`,
      date: material.publishedDate,
      to: coursePath(material.courseId),
    });
  });

  (context.announcements || []).slice(0, 4).forEach((announcement) => {
    entries.push({
      id: `announcement-${announcement.id}`,
      kind: 'announcement',
      label: 'Announcement',
      title: announcement.title,
      detail: announcement.body,
      meta: `${announcement.author} · ${shortDate(announcement.date, { day: 'numeric', month: 'short' })}`,
      date: announcement.date,
      to: null,
    });
  });

  return entries
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
    .slice(0, 5);
}