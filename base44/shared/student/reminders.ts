// Reminder rules for scheduled academic reminders.
//
// Everything here is derived from the student's own authorised academic context
// (published assignments, quizzes and the official register). A reminder always
// names the real course, task and date it came from; nothing is invented and no
// deadline is guessed. Delivery is recorded per user, task, stage and channel so
// the same reminder can never be sent twice.

export const APP_URL = 'https://nexus-mgimo-ai.base44.app';

// Days before the deadline, and the overdue days at which a reminder is sent.
export const DUE_STAGES = [7, 3, 1, 0];
export const OVERDUE_STAGES = [1, 3, 7, 14];

export const MAX_EMAILS_PER_RUN = 3;
export const MAX_ATTEMPTS = 3;

// The scheduled workflow runs at 08:00, 13:00 and 18:00 in this zone; the slot
// is derived from the clock so a student's chosen timing decides which run
// delivers their reminders.
export const SLOT_TIMEZONE = 'America/Los_Angeles';

const list = (page) => (Array.isArray(page) ? page : page?.items || []);

export const isoDay = (date = new Date()) => date.toISOString().slice(0, 10);

export function daysBetween(fromIso, toIso) {
  const from = Date.parse(`${String(fromIso).slice(0, 10)}T00:00:00Z`);
  const to = Date.parse(`${String(toIso).slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(from) || Number.isNaN(to)) return null;
  return Math.round((to - from) / 86400000);
}

export function currentSlot(now = new Date()) {
  const hour = Number(
    new Intl.DateTimeFormat('en-GB', { hour: '2-digit', hourCycle: 'h23', timeZone: SLOT_TIMEZONE }).format(now),
  );
  if (!Number.isFinite(hour)) return 'morning';
  if (hour <= 10) return 'morning';
  if (hour <= 15) return 'afternoon';
  return 'evening';
}

export function isMondayInSlotZone(now = new Date()) {
  const weekday = new Intl.DateTimeFormat('en-GB', { weekday: 'short', timeZone: SLOT_TIMEZONE }).format(now);
  return weekday === 'Mon';
}

export function isoWeekKey(now = new Date()) {
  const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

// Which stage, if any, today falls on for a deadline. A missed run simply means
// that stage is not sent; the next stage still applies.
export function stageFor(dueDate, today = isoDay()) {
  if (!dueDate) return null;
  const days = daysBetween(today, dueDate);
  if (days === null) return null;
  if (days === 0) return { kind: 'due', stage: 'd0', days: 0 };
  if (days > 0) {
    if (!DUE_STAGES.includes(days)) return null;
    return { kind: 'due', stage: `d${days}`, days };
  }
  const overdue = Math.abs(days);
  if (!OVERDUE_STAGES.includes(overdue)) return null;
  return { kind: 'overdue', stage: `overdue-${overdue}`, days };
}

const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`;

export function reminderMessage(item) {
  const course = item.courseCode || item.courseTitle || 'Your course';
  if (item.kind === 'overdue') {
    return `${course}: "${item.title}" was due on ${item.dueDate} and is ${plural(Math.abs(item.days), 'day')} overdue. Submit it if the course still accepts late work, or contact your instructor about how to proceed.`;
  }
  if (item.days === 0) {
    return `${course}: "${item.title}" is due today (${item.dueDate}).`;
  }
  return `${course}: "${item.title}" is due in ${plural(item.days, 'day')}, on ${item.dueDate}.`;
}

// Only work that is actually open and has a published deadline can produce a
// reminder. Submitted and graded work never does.
export function reminderCandidates(intel, preferences, today = isoDay()) {
  const context = intel.context || {};
  const items = [];

  (context.assignments || []).forEach((row) => {
    if (!row.dueDate) return;
    if (row.state === 'graded' || row.state === 'submitted') return;
    const stage = stageFor(row.dueDate, today);
    if (!stage) return;

    const isExam = /exam/i.test(String(row.type || ''));
    const overdue = stage.kind === 'overdue';
    if (overdue) {
      if (!preferences.overdue_alerts) return;
    } else if (isExam ? !preferences.exam_reminders : !preferences.assignment_reminders) {
      return;
    }

    items.push({
      category: overdue ? 'overdue' : isExam ? 'exam' : 'assignment',
      taskType: 'assignment',
      taskId: row.id,
      courseCode: row.courseCode || '',
      courseTitle: row.courseTitle || '',
      title: row.title || '',
      dueDate: String(row.dueDate).slice(0, 10),
      kind: stage.kind,
      stage: stage.stage,
      days: stage.days,
      actionPath: '/student/assignments',
    });
  });

  (context.quizzes || []).forEach((row) => {
    if (!row.availableUntil || row.state === 'graded') return;
    if (!preferences.quiz_reminders) return;
    const stage = stageFor(row.availableUntil, today);
    if (!stage) return;
    items.push({
      category: 'quiz',
      taskType: 'quiz',
      taskId: row.id,
      courseCode: row.courseCode || '',
      courseTitle: row.courseTitle || '',
      title: row.title || '',
      dueDate: String(row.availableUntil).slice(0, 10),
      kind: stage.kind,
      stage: stage.stage,
      days: stage.days,
      actionPath: '/student/quizzes',
    });
  });

  // Most urgent first: overdue work, then the nearest deadline.
  return items.sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === 'overdue' ? -1 : 1;
    return Math.abs(a.days) - Math.abs(b.days);
  });
}

// Deterministic digest text, used as-is when the language model is unavailable.
export function digestText(intel, today = isoDay()) {
  const lines = [];
  const open = (intel.context?.assignments || []).filter(
    (row) => row.dueDate && row.state !== 'graded' && row.state !== 'submitted',
  );
  const overdue = open.filter((row) => {
    const days = daysBetween(today, row.dueDate);
    return days !== null && days < 0;
  });
  const dueSoon = open
    .filter((row) => {
      const days = daysBetween(today, row.dueDate);
      return days !== null && days >= 0 && days <= 7;
    })
    .sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1));

  if (overdue.length) {
    lines.push(`Overdue (${overdue.length}):`);
    overdue.slice(0, 5).forEach((row) => {
      lines.push(`- ${row.courseCode || row.courseTitle}: ${row.title} — was due ${row.dueDate}`);
    });
  }
  if (dueSoon.length) {
    lines.push(`Due in the next 7 days (${dueSoon.length}):`);
    dueSoon.slice(0, 6).forEach((row) => {
      lines.push(`- ${row.courseCode || row.courseTitle}: ${row.title} — due ${row.dueDate}`);
    });
  }
  const allowance = intel.attendance?.allowance;
  if (allowance) {
    lines.push(
      `Attendance: ${intel.attendance.missed} of ${allowance.limit} permitted absences recorded, ${allowance.remaining} remaining.`,
    );
  }
  const attention = (intel.performance?.courses || []).filter((course) => course.status === 'attention');
  if (attention.length) {
    lines.push('Courses needing attention:');
    attention.slice(0, 4).forEach((course) => {
      lines.push(`- ${course.code || course.title}: ${course.reasons[0] || 'recorded results below target'}`);
    });
  }
  if (!lines.length) lines.push('Nothing is overdue and no deadline falls in the next 7 days.');
  return lines.join('\n');
}

export function dispatchKey({ channel, studentId, category, taskId, stage }) {
  return ['r', channel, studentId, category, taskId || 'none', stage].join(':');
}

export function alertDispatchKey({ studentId, title }) {
  const slug = String(title || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
  return `r:email:${studentId}:alert:${slug}`;
}

// Keys already used, in one query per batch rather than one per reminder.
export async function dispatchedKeys(svc, keys) {
  const unique = [...new Set(keys.filter(Boolean))];
  const found = new Set();
  const batches = unique.reduce((acc, key, position) => {
    const slot = Math.floor(position / 40);
    if (!acc[slot]) acc[slot] = [];
    acc[slot].push(key);
    return acc;
  }, []);
  for (const chunk of batches) {
    const rows = list(await svc.entities.ReminderDispatch.filter({ dedupe_key: { $in: chunk } }, { limit: 200 }));
    rows.forEach((row) => found.add(row.dedupe_key));
  }
  return found;
}

export function retryAt(attempts) {
  const minutes = 15 * Math.max(1, attempts);
  return new Date(Date.now() + minutes * 60000).toISOString();
}

// A send counts as "sent" only when the provider accepts the message. It is
// never marked delivered: the provider does not confirm that here.
export async function sendReminderEmail(svc, { to, firstName, headline, summary, actionPath }) {
  if (!to) return { ok: false, blocked: false, error: 'The account has no registered email address' };
  try {
    const result = await svc.integrations.Core.SendEmail({
      to,
      template_name: 'AcademicReminder',
      category: 'transactional',
      variables: {
        first_name: firstName || 'there',
        headline,
        summary,
        action_url: `${APP_URL}${actionPath || '/student/intelligence'}`,
      },
    });
    if (result && result.success === false) {
      return { ok: false, blocked: true, error: String(result.reason || result.message || 'not accepted') };
    }
    return { ok: true };
  } catch (error) {
    return { ok: false, blocked: false, error: String(error?.message || 'The email could not be sent') };
  }
}