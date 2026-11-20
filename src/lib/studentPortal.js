import { base44 } from '@/api/base44Client';
import { getDemoUser } from '@/lib/demoAuth';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';
import { DEMO_INSTITUTION } from '@/lib/demoInstitutionData';

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
      student_number: second ? 'DEMO-STU-002' : 'DEMO-STU-001',
      faculty: 'School of International Relations',
      program: 'International Relations',
      year: second ? 2 : 1, group: second ? 'IR-2A' : 'IR-1A'
    };
    const courseSeeds = DEMO_INSTITUTION.courses;
    const courses = courseSeeds.map((course, index) => {
      const professor = DEMO_INSTITUTION.professors.find((item) => item.id === course.professor_id);
      const weighted = (second ? [86, 79, 88, 82, 91, 77, 84, 89, 81, 85] : [78, 84, 82, 75, 87, 80, 73, 88, 85, 81])[index];
      const progress = 52 + ((index * 7 + (second ? 9 : 3)) % 45);
      return {
        id: course.id, code: course.code, title: course.title, description: course.description,
        credits: course.credits, level: course.level, semester: course.semester,
        professor: professor?.full_name || 'Course instructor',
        professorId: professor?.id, professorEmail: professor?.email,
        weighted, progress, graded: 1, missing: 0, awaiting: 0, weightScored: 100,
        letter: weighted >= 90 ? 'A' : weighted >= 80 ? 'B' : weighted >= 70 ? 'C' : 'D',
        moduleProgress: { completed: Math.floor(progress / 25), total: 8, percent: progress },
        completion: 'in_progress',
        rows: [{ id: `demo-grade-${course.id}-1`, kind: 'exam', title: 'Midterm examination', categoryLabel: 'Exam', status: 'graded', score: weighted, max: 100, percent: weighted, feedback: 'Good analysis. Continue building your evidence.', gradedAt: '2026-11-13', late: false }],
      };
    });
    const assignmentTitles = [
      ['Comparative policy brief', 'Seminar presentation', 'Reading response'],
      ['Conference position paper', 'Draft resolution', 'Negotiation reflection'],
      ['Diplomatic case analysis', 'Protocol exercise', 'Mission briefing'],
      ['Trade history essay', 'Primary-source review', 'Comparative data note'],
      ['Decolonisation timeline', 'Historical argument essay', 'Archive source critique'],
      ['Treaty compliance memo', 'Verification case study', 'Arms-control presentation'],
      ['Security risk assessment', 'Alliance case brief', 'Threat analysis'],
      ['Diplomatic vocabulary portfolio', 'Russian correspondence exercise', 'Oral briefing'],
      ['Regional actor profile', 'Eurasia policy memo', 'Border dispute analysis'],
      ['Theory comparison essay', 'Concept map', 'Research question proposal'],
    ];
    const assignments = courses.flatMap((course, index) => assignmentTitles[index].map((title, itemIndex) => ({
      id: `as-${index + 1}-${itemIndex + 1}`, title, courseCode: course.code,
      dueDate: itemIndex === 0 ? '2026-11-23' : itemIndex === 1 ? '2026-11-24' : '2026-11-17',
      state: itemIndex === 2 ? 'overdue' : 'pending',
    })));
    const visibleAssignments = assignments.map((a) => demoSubmissions.some((s) => s.assignment_id === a.id && s.student_id === profile.id) ? { ...a, state: 'submitted' } : a);
    const materials = DEMO_INSTITUTION.courses.flatMap((course) => Array.from({ length: 28 }, (_, index) => ({
      id: `mat-${course.id}-${index + 1}`,
      title: [`Lecture ${index + 1}: ${course.title}`, `Seminar reading ${index + 1}`, `Case study ${index + 1}`, `Study guide ${index + 1}`][index % 4],
      courseCode: course.code, courseId: course.id, type: ['lecture', 'reading', 'case study', 'study guide'][index % 4],
      publishedDate: `2026-11-${String(1 + (index % 19)).padStart(2, '0')}`,
    })));
    const modules = DEMO_INSTITUTION.courses.flatMap((course) => Array.from({ length: 8 }, (_, index) => ({
      id: `mod-${course.id}-${index + 1}`, courseId: course.id, courseCode: course.code,
      title: ['Foundations and key concepts', 'Historical background', 'Core frameworks', 'Comparative cases', 'Research methods', 'Applied analysis', 'Seminar and discussion', 'Review and assessment'][index],
      order: index + 1,
    })));
    const quizzes = DEMO_INSTITUTION.courses.map((course, index) => ({
      id: `quiz-${course.id}`, title: `${course.code} — Module ${index + 4}`, courseCode: course.code,
      state: 'pending', availableUntil: '2026-11-28', attempts: 1, attemptLimit: 3,
    }));
    return Promise.resolve({
      linked: true, profile, courses, assignments: visibleAssignments, quizzes, materials, modules,
      announcements: [
        { id: 'ann-1', title: 'Fall semester examination schedule', body: 'The examination timetable is available in the student portal.', author: 'Academic Affairs', date: '2026-11-14' },
        { id: 'ann-2', title: 'Seminar presentation sign-up', body: 'Students should confirm their seminar presentation slot with the course instructor.', author: 'Academic Affairs', date: '2026-11-16' },
        { id: 'ann-3', title: 'Library research support', body: 'Subject librarians are available for help with academic databases and citation styles.', author: 'Library Services', date: '2026-11-18' },
      ],
      recentGrades: courses.map((course) => ({ courseCode: course.code, title: 'Midterm examination', score: course.weighted, max: 100, feedback: 'Good analysis. Strengthen your use of primary sources.', gradedAt: '2026-11-13' })),
      attendance: {
        overall: second ? 93 : 88,
        held: 80,
        byCourse: courses.map((course, index) => ({ code: course.code, present: 8 + ((index + (second ? 1 : 0)) % 3), late: index % 4 === 0 ? 1 : 0, excused: 0, absent: 1, total: 10, rate: 80 + ((index * 3 + (second ? 7 : 2)) % 20) })),
      },
      sessions: courses.slice(0, 5).map((course, index) => ({
        id: `session-${course.id}`, date: index < 3 ? todayISO() : tomorrowISO(),
        start: ['09:00', '11:00', '13:00', '14:00', '16:00'][index], end: ['10:30', '12:30', '14:30', '15:30', '17:30'][index],
        courseCode: course.code, courseTitle: course.title, room: `Room ${210 + index}`, kind: index % 2 ? 'seminar' : 'lecture',
      })),
      summary: {
        average: +(courses.reduce((sum, course) => sum + course.weighted, 0) / courses.length).toFixed(1),
        averageLetter: second ? 'B+' : 'B',
        courseCount: courses.length,
        credits: courses.reduce((sum, course) => sum + course.credits, 0),
        pending: visibleAssignments.filter((row) => row.state === 'pending').length,
        overdue: visibleAssignments.filter((row) => row.state === 'overdue').length,
        awaiting: 0,
        graded: courses.length,
        attendanceRate: second ? 93 : 88,
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

export const tomorrowISO = () => { const date = new Date(); date.setDate(date.getDate() + 1); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; };

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