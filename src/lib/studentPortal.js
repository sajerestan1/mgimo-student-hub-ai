import { base44 } from '@/api/base44Client';
import { getDemoUser } from '@/lib/demoAuth';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';

/**
 * The student portal reads one authorised academic context, resolved on the
 * server from the signed-in account. Nothing here sends a student id.
 */
let cache = null;
const demoSubmissions = [];
export function addDemoSubmission(record) { demoSubmissions.push(record); }
const CACHE_MS = 15000;

/**
 * One shared read of the student context so the page and the app chrome never
 * fetch the record twice. Pass { fresh: true } after writing a record.
 */
export function loadStudentPortal({ fresh = false } = {}) {
  if (!fresh && cache && Date.now() - cache.at < CACHE_MS) return cache.promise;

  if (import.meta.env.VITE_DEMO_MODE === 'true') {
    const user = getDemoUser();
    if (!user || user.role !== 'student') return Promise.resolve({ linked: false, profile: null, courses: [], sessions: [], assignments: [], quizzes: [], materials: [], announcements: [], recentGrades: [], summary: {} });
    const second = user.id === 'demo-student-b';
    const profile = {
      id: user.id, full_name: user.full_name, email: user.email,
      student_number: second ? 'AI26-0002' : 'AI26-0001',
      faculty: user.faculty,
      program: second ? 'International Economics' : 'International Relations',
      year: 2, group: second ? 'IE-22' : 'IR-21'
    };
    const courses = [
      { id: 'course-ir201', code: 'IR-201', title: 'Theory of International Relations', weighted: second ? 84 : 76, progress: 72, professor: 'Dr. Elena Petrova' },
      { id: 'course-ie201', code: 'IE-201', title: 'World Economy', weighted: second ? 78 : 89, progress: 64, professor: 'Dr. Andrei Volkov' },
      { id: 'course-law201', code: 'LW-201', title: 'Public International Law', weighted: second ? 91 : 82, progress: 81, professor: 'Dr. Marina Kravtsova' },
    ];
    // Demo KPIs are calculated from the same records rendered by each page.
    const average = courses.reduce((sum, course) => sum + course.weighted, 0) / courses.length;
    const assignments = [
      { id: 'as-1', title: 'Comparative foreign policy analysis', courseCode: 'IR-201', dueDate: '2026-11-20', state: 'pending' },
      { id: 'as-2', title: 'Global trade indicators report', courseCode: 'IE-201', dueDate: '2026-11-12', state: 'overdue' },
      { id: 'as-3', title: 'Case brief: treaty interpretation', courseCode: 'LW-201', dueDate: '2026-11-25', state: 'pending' },
    ];
    const visibleAssignments = assignments.map((a) => demoSubmissions.some((s) => s.assignment_id === a.id && s.student_id === profile.id) ? { ...a, state: 'submitted' } : a);
    return Promise.resolve({
      linked: true, profile, courses, assignments: visibleAssignments,
      quizzes: [{ id: 'quiz-1', title: 'IR Theory — Module 4', courseCode: 'IR-201', state: 'pending', availableUntil: '2026-11-22', attempts: 1, attemptLimit: 3 }],
      materials: [{ id: 'mat-1', title: 'Lecture 8: International institutions', courseCode: 'IR-201', courseId: 'course-ir201', type: 'lecture', publishedDate: '2026-11-14' }],
      announcements: [{ id: 'ann-1', title: 'Fall semester examination schedule', body: 'The examination timetable is available in the student portal.', author: 'Academic Affairs', date: '2026-11-14' }],
      recentGrades: [{ courseCode: 'LW-201', title: 'Midterm examination', score: second ? 91 : 82, max: 100, feedback: 'Good analysis. Strengthen your use of primary sources.', gradedAt: '2026-11-13' }],
      sessions: [
        { id: 's1', date: '2026-11-16', start: '10:00', end: '11:30', courseCode: 'IR-201', courseTitle: 'Theory of International Relations', room: 'Room 304' },
        { id: 's2', date: '2026-11-16', start: '14:00', end: '15:30', courseCode: 'IE-201', courseTitle: 'World Economy', room: 'Room 218' },
      ],
      summary: {
        average: Number(average.toFixed(1)),
        gpa: second ? 4.3 : 4.1,
        attendance: second ? 93 : 88,
        pendingAssignments: visibleAssignments.filter((assignment) => !['submitted', 'graded'].includes(assignment.state)).length,
        upcomingClasses: 2,
        credits: 18,
      },
      scopeNote: 'Synthetic records for competition demonstration.'
    });
  }

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