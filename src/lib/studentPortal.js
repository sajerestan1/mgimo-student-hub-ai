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

// The interface language is passed in rather than assumed, so a date reads
// "12 окт." for a Russian interface and "12 oct." for a French one.
export const shortDate = (value, options, language = 'en-GB') =>
  value
    ? new Date(`${String(value).slice(0, 10)}T00:00:00`).toLocaleDateString(
        language,
        options || { day: 'numeric', month: 'short' }
      )
    : '—';

export const clock = (value) => (value ? String(value).slice(0, 5) : '');

// Every label produced here is a translation key plus its values; the English
// text is only the fallback for a caller that has no translator at hand.
export const dueLabel = (value, t) => {
  const days = daysUntil(value);
  const label = (key, vars, english) => (t ? t(key, vars) : english);
  if (days === null) return label('student.assignments.due.noDate', null, 'No due date');
  if (days < 0) {
    const count = Math.abs(days);
    return label(
      count === 1 ? 'student.assignments.due.one' : 'student.assignments.due.many',
      { count },
      count === 1 ? '1 day overdue' : `${count} days overdue`
    );
  }
  if (days === 0) return label('student.assignments.due.today', null, 'Due today');
  if (days === 1) return label('student.assignments.due.tomorrow', null, 'Due tomorrow');
  return label('student.assignments.due.inDays', { count: days }, `Due in ${days} days`);
};

export const ASSIGNMENT_STATE = {
  pending: { label: 'To do', labelKey: 'student.assignments.states.pending', tone: 'brand' },
  submitted: { label: 'Submitted', labelKey: 'student.assignments.states.submitted', tone: 'warning' },
  overdue: { label: 'Overdue', labelKey: 'student.assignments.states.overdue', tone: 'critical' },
  graded: { label: 'Graded', labelKey: 'student.assignments.states.graded', tone: 'positive' },
};

export const coursePath = (courseId) => (courseId ? `${P.student.courses}/${courseId}` : P.student.courses);

export const firstName = (profile, t) =>
  (profile?.full_name || '').split(' ')[0] || (t ? t('student.dashboard.greetingFallback') : 'there');

export const greeting = (t) => {
  const hour = new Date().getHours();
  const name = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  if (!t) return name;
  const key =
    hour < 12
      ? 'student.dashboard.goodMorning'
      : hour < 18
        ? 'student.dashboard.goodAfternoon'
        : 'student.dashboard.goodEvening';
  return t(key);
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

/**
 * Up to three short priorities, each derived from a real record. The text is
 * built from translation keys with the record's own values interpolated, so a
 * course title or code stays exactly as recorded while the sentence around it
 * follows the interface language.
 */
export function buildBriefing(context, t) {
  const say = (key, vars, english) => (t ? t(key, vars) : english);
  const items = [];
  const open = (context.assignments || []).filter((row) => row.state !== 'graded');
  const overdue = open.filter((row) => row.state === 'overdue');

  if (overdue.length) {
    const first = overdue[0];
    const count = overdue.length;
    items.push({
      key: 'overdue',
      tone: 'critical',
      text: say(
        count === 1 ? 'student.dashboard.briefing.overdueOne' : 'student.dashboard.briefing.overdueMany',
        { count, title: first.title, code: first.courseCode },
        `${count} overdue item${count === 1 ? '' : 's'} — start with “${first.title}” (${first.courseCode}).`
      ),
      to: P.student.assignments,
      cta: say('student.dashboard.briefing.cta.assignments', null, 'Open assignments'),
    });
  }

  const soonest = open
    .filter((row) => row.state === 'pending' && daysUntil(row.dueDate) !== null && daysUntil(row.dueDate) >= 0)
    .sort((a, b) => daysUntil(a.dueDate) - daysUntil(b.dueDate))[0];
  if (soonest && items.length < 3) {
    const due = dueLabel(soonest.dueDate, t);
    items.push({
      key: 'due',
      tone: 'warning',
      text: say(
        'student.dashboard.briefing.due',
        { code: soonest.courseCode, title: soonest.title, due },
        `${soonest.courseCode} · “${soonest.title}” — ${due}.`
      ),
      to: P.student.assignments,
      cta: say('student.dashboard.briefing.cta.submit', null, 'Submit work'),
    });
  }

  const closingQuiz = (context.quizzes || [])
    .filter((quiz) => quiz.state !== 'graded' && daysUntil(quiz.availableUntil) !== null && daysUntil(quiz.availableUntil) >= 0)
    .sort((a, b) => daysUntil(a.availableUntil) - daysUntil(b.availableUntil))[0];
  if (closingQuiz && items.length < 3) {
    const due = dueLabel(closingQuiz.availableUntil, t);
    items.push({
      key: 'quiz',
      tone: 'brand',
      text: say(
        'student.dashboard.briefing.quiz',
        {
          code: closingQuiz.courseCode,
          title: closingQuiz.title,
          due,
          used: closingQuiz.attempts,
          limit: closingQuiz.attemptLimit,
        },
        `${closingQuiz.courseCode} quiz “${closingQuiz.title}” — ${due}, ${closingQuiz.attempts}/${closingQuiz.attemptLimit} attempts used.`
      ),
      to: P.student.quizzes,
      cta: say('student.dashboard.briefing.cta.quizzes', null, 'Open quizzes'),
    });
  }

  const weakest = (context.courses || [])
    .filter((course) => course.weighted !== null)
    .sort((a, b) => a.weighted - b.weighted)[0];
  if (weakest && items.length < 3) {
    const score = weakest.weighted.toFixed(1);
    items.push({
      key: 'weakest',
      tone: 'neutral',
      text: say(
        'student.dashboard.briefing.weakest',
        { code: weakest.code, score },
        `${weakest.code} is your lowest recorded result at ${score}/100 — review its published materials.`
      ),
      to: coursePath(weakest.id),
      cta: say('student.dashboard.briefing.cta.course', null, 'Open course'),
    });
  }

  if (!items.length) {
    items.push({
      key: 'clear',
      tone: 'positive',
      text: say(
        'student.dashboard.briefing.clear',
        null,
        'Nothing overdue and nothing due in the next few days. Use the time to work ahead on your next assessment.'
      ),
      to: P.student.assignments,
      cta: say('student.dashboard.briefing.cta.allWork', null, 'See all work'),
    });
  }

  return items.slice(0, 3);
}

/** Grades, new materials and announcements in one short list. */
export function recentActivity(context, t, language) {
  const say = (key, english) => (t ? t(key) : english);
  const courseIdByCode = new Map((context.courses || []).map((course) => [course.code, course.id]));
  const entries = [];

  (context.recentGrades || []).slice(0, 4).forEach((grade) => {
    entries.push({
      id: `grade-${grade.courseCode}-${grade.title}`,
      kind: 'grade',
      label: say(
        grade.feedback ? 'student.dashboard.activityKinds.gradeFeedback' : 'student.dashboard.activityKinds.newGrade',
        grade.feedback ? 'Grade & feedback' : 'New grade'
      ),
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
      label: say('student.dashboard.activityKinds.newMaterial', 'New material'),
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
      label: say('student.dashboard.activityKinds.announcement', 'Announcement'),
      title: announcement.title,
      detail: announcement.body,
      meta: `${announcement.author} · ${shortDate(announcement.date, { day: 'numeric', month: 'short' }, language)}`,
      date: announcement.date,
      to: null,
    });
  });

  return entries
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
    .slice(0, 5);
}