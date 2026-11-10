import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { buildStudentContext } from '../../shared/student/context.ts';
import { academicAlertRows, buildAcademicIntelligence, syncAcademicAlerts } from '../../shared/student/intelligence.ts';
import {
  MAX_ATTEMPTS,
  MAX_EMAILS_PER_RUN,
  alertDispatchKey,
  currentSlot,
  digestText,
  dispatchKey,
  dispatchedKeys,
  isMondayInSlotZone,
  isoDay,
  isoWeekKey,
  reminderCandidates,
  reminderMessage,
  retryAt,
  sendReminderEmail,
} from '../../shared/student/reminders.ts';

const list = (page) => (Array.isArray(page) ? page : page?.items || []);
const MAX_STUDENTS = 300;

// One email, recorded against every alert it carries, so each alert is emailed
// exactly once even though the messages arrive together.
async function deliverAlertEmail(svc, recipient, entries) {
  const result = await sendReminderEmail(svc, {
    to: recipient.email,
    firstName: recipient.first_name,
    headline: entries.length === 1 ? entries[0].title : 'Attendance and performance alerts',
    summary: entries.map((entry) => `${entry.title}\n${entry.summary}`).join('\n\n'),
    actionPath: '/student/intelligence',
  });
  const attempts = 1;
  for (const entry of entries) {
    await svc.entities.ReminderDispatch.update(entry.id, {
      status: result.ok ? 'sent' : result.blocked ? 'blocked' : attempts >= MAX_ATTEMPTS ? 'retry_exhausted' : 'failed',
      attempts,
      last_error: result.ok ? '' : result.error,
      next_attempt_at: result.ok || result.blocked ? '' : retryAt(attempts),
      sent_at: result.ok ? new Date().toISOString() : '',
    });
  }
  return result.ok ? 'sent' : 'failed';
}

async function deliverSingleEmail(svc, row, recipient, summary) {
  const result = await sendReminderEmail(svc, {
    to: recipient.email,
    firstName: recipient.first_name,
    headline: row.title,
    summary,
    actionPath: row.action_path,
  });
  const attempts = (Number(row.attempts) || 0) + 1;
  const exhausted = attempts >= MAX_ATTEMPTS;
  const status = result.ok ? 'sent' : result.blocked ? 'blocked' : exhausted ? 'retry_exhausted' : 'failed';
  await svc.entities.ReminderDispatch.update(row.id, {
    status,
    attempts,
    last_error: result.ok ? '' : result.error,
    next_attempt_at: status === 'failed' ? retryAt(attempts) : '',
    sent_at: result.ok ? new Date().toISOString() : '',
  });
  return status;
}

// A short personalised summary for the digest, written only from this student's
// own figures. If the model is unavailable the deterministic text is used.
async function digestSummary(base44, intel, fallback) {
  try {
    const answer = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: [
        'Write a short academic digest for one Digital Dean student, using only the figures below. Digital Dean is a fictional institution; never name another institution.',
        'Never invent a course, task, date, grade or policy, and never mention another student.',
        'Do not predict or guarantee grades. Three short sentences maximum, plain text, no headings.',
        '',
        `STUDENT: ${intel.profile.full_name}, group ${intel.profile.group_name || 'not recorded'}.`,
        fallback,
      ].join('\n'),
    });
    const text = String(answer || '').trim();
    return text || fallback;
  } catch (error) {
    console.error(`digest summary fell back to deterministic text: ${error?.message}`);
    return fallback;
  }
}

async function processStudent(base44, svc, studentUser, { slot, today, dryRun }) {
  const context = await buildStudentContext(base44, studentUser);
  if (!context.linked) return { skipped: 'no_student_record', planned: [], sent: 0, failed: 0 };

  const intel = await buildAcademicIntelligence(base44, studentUser, { context });
  const preferences = intel.preferences;
  const studentId = intel.profile.id;
  const identity = { userId: studentUser.id, studentId };
  const dueSlot = preferences.reminder_timing === slot;
  const recipient = {
    email: studentUser.email || '',
    first_name: String(intel.profile.full_name || studentUser.full_name || '').trim().split(' ')[0] || 'there',
  };

  // In-app academic alerts reuse the verified writer: same thresholds, same
  // dedupe keys, and it stays silent when the student switched in-app off.
  if (!dryRun) await syncAcademicAlerts(svc, identity, intel, preferences);
  const alerts = academicAlertRows(identity, intel, preferences);

  const planned = [];
  // The same authorised context the figures came from, so a reminder can only
  // name work that belongs to this student.
  const tasks = reminderCandidates({ ...intel, context }, preferences, today);
  tasks.forEach((item) => {
    const title = `${item.courseCode || item.courseTitle} · ${item.title}`;
    const summary = reminderMessage(item);
    const shared = {
      category: item.category,
      taskType: item.taskType,
      taskId: item.taskId,
      courseCode: item.courseCode,
      stage: item.stage,
      title,
      summary,
      actionPath: item.actionPath,
    };
    if (preferences.in_app_delivery) {
      planned.push({
        ...shared,
        channel: 'in_app',
        key: dispatchKey({ channel: 'in_app', studentId, category: item.category, taskId: item.taskId, stage: item.stage }),
      });
    }
    if (preferences.email_delivery && dueSlot) {
      planned.push({
        ...shared,
        channel: 'email',
        key: dispatchKey({ channel: 'email', studentId, category: item.category, taskId: item.taskId, stage: item.stage }),
      });
    }
  });

  const alertEntries = alerts.map((alert) => ({
    channel: 'email',
    category: String(alert.notification_type || '').includes('attendance') ? 'attendance' : 'performance',
    stage: 'alert',
    taskId: '',
    title: alert.title,
    summary: alert.body || '',
    actionPath: '/student/intelligence',
    key: alertDispatchKey({ studentId, title: alert.title }),
  }));

  if (preferences.email_delivery && dueSlot) {
    if (preferences.daily_digest) {
      planned.push({
        channel: 'email',
        category: 'digest',
        stage: 'digest',
        taskId: '',
        title: 'Your academic summary for today',
        summary: digestText({ ...intel, context }, today),
        actionPath: '/student/intelligence',
        digest: 'daily',
        key: `r:email:${studentId}:digest:daily:${today}`,
      });
    }
    if (preferences.weekly_digest && isMondayInSlotZone()) {
      planned.push({
        channel: 'email',
        category: 'digest',
        stage: 'digest',
        taskId: '',
        title: 'Your academic summary for this week',
        summary: digestText({ ...intel, context }, today),
        actionPath: '/student/intelligence',
        digest: 'weekly',
        key: `r:email:${studentId}:digest:weekly:${isoWeekKey()}`,
      });
    }
  }

  const known = await dispatchedKeys(svc, [...planned.map((row) => row.key), ...alertEntries.map((row) => row.key)]);
  const freshTasks = planned.filter((row) => !known.has(row.key));
  const freshAlerts = alertEntries.filter((row) => !known.has(row.key));

  if (dryRun) {
    return {
      skipped: '',
      planned: [...freshTasks, ...freshAlerts].map((row) => ({ channel: row.channel, category: row.category, stage: row.stage, key: row.key, title: row.title })),
      sent: 0,
      failed: 0,
    };
  }

  let sent = 0;
  let failed = 0;
  const inApp = freshTasks.filter((row) => row.channel === 'in_app');
  const emails = freshTasks.filter((row) => row.channel === 'email').slice(0, MAX_EMAILS_PER_RUN);

  // A dispatch row is written before any delivery, so a crash can never produce
  // a second copy of the same reminder.
  if (inApp.length) {
    const dispatches = [];
    for (const row of inApp) {
      dispatches.push(
        await svc.entities.ReminderDispatch.create({
          user_id: studentUser.id,
          student_id: studentId,
          channel: 'in_app',
          category: row.category,
          task_type: row.taskType || '',
          task_id: row.taskId || '',
          course_code: row.courseCode || '',
          stage: row.stage,
          dedupe_key: row.key,
          title: row.title,
          summary: row.summary,
          action_path: row.actionPath,
          status: 'pending',
          attempts: 0,
        }),
      );
    }
    await svc.entities.Notification.bulkCreate(
      inApp.map((row, index) => ({
        user_id: studentUser.id,
        title: row.title,
        body: row.summary,
        category: row.category === 'overdue' ? 'deadline' : 'reminder',
        notification_type: `reminder_${row.category}`,
        link: row.actionPath,
        dedupe_key: row.key,
        is_read: false,
      })),
    );
    for (const row of dispatches) {
      await svc.entities.ReminderDispatch.update(row.id, { status: 'sent', sent_at: new Date().toISOString(), attempts: 1 });
      sent += 1;
    }
  }

  for (const row of emails) {
    const created = await svc.entities.ReminderDispatch.create({
      user_id: studentUser.id,
      student_id: studentId,
      channel: 'email',
      category: row.category,
      task_type: row.taskType || '',
      task_id: row.taskId || '',
      course_code: row.courseCode || '',
      stage: row.stage,
      dedupe_key: row.key,
      title: row.title,
      summary: row.summary,
      action_path: row.actionPath,
      status: 'pending',
      attempts: 0,
    });
    const summary = row.digest ? await digestSummary(base44, intel, row.summary) : row.summary;
    if (row.digest) await svc.entities.ReminderDispatch.update(created.id, { summary });
    const status = await deliverSingleEmail(svc, { ...created, summary }, recipient, summary);
    if (status === 'sent') sent += 1;
    else failed += 1;
  }

  if (freshAlerts.length) {
    const rows = [];
    for (const entry of freshAlerts) {
      rows.push(
        await svc.entities.ReminderDispatch.create({
          user_id: studentUser.id,
          student_id: studentId,
          channel: 'email',
          category: entry.category,
          stage: entry.stage,
          dedupe_key: entry.key,
          title: entry.title,
          summary: entry.summary,
          action_path: entry.actionPath,
          status: 'pending',
          attempts: 0,
        }),
      );
    }
    const status = await deliverAlertEmail(svc, recipient, freshAlerts.map((entry, index) => ({ ...entry, id: rows[index].id })));
    if (status === 'sent') sent += 1;
    else failed += 1;
  }

  return { skipped: '', planned: [], sent, failed };
}

async function runSweep(base44, svc, { dryRun, onlyUserId, dateOverride }) {
  const slot = currentSlot();
  // An administrator may evaluate the same rules for another calendar day, which
  // is how each reminder stage is verified without editing any academic record.
  const today = /^\d{4}-\d{2}-\d{2}$/.test(String(dateOverride || '')) ? String(dateOverride) : isoDay();
  // The User entity does not accept query filters, so the roster is read and
  // narrowed in code. Suspended and deactivated accounts are never reminded.
  const blocked = (row) => ['suspended', 'deactivated'].includes(String(row.account_status || 'active'));
  const roster = list(await svc.entities.User.list('-created_date', MAX_STUDENTS));
  const students = roster.filter((row) => String(row.role || '') === 'student' && !blocked(row));
  // An administrator may name one account (a verification aid); a sweep of the
  // whole institution covers every active student account.
  const targets = onlyUserId ? roster.filter((row) => row.id === onlyUserId && !blocked(row)) : students;

  const summary = { slot, today, dryRun, students: targets.length, sent: 0, failed: 0, skipped: 0, details: [] };
  for (const studentUser of targets) {
    try {
      const result = await processStudent(base44, svc, studentUser, { slot, today, dryRun });
      summary.sent += result.sent;
      summary.failed += result.failed;
      if (result.skipped) summary.skipped += 1;
      if (result.planned.length || result.sent || result.failed) {
        summary.details.push({
          user_id: studentUser.id,
          sent: result.sent,
          failed: result.failed,
          skipped: result.skipped,
          planned: result.planned,
        });
      }
    } catch (error) {
      // One student's data must never stop everyone else's reminders.
      summary.failed += 1;
      summary.details.push({ user_id: studentUser.id, error: String(error?.message || 'failed') });
      console.error(`reminders for ${studentUser.id} failed: ${error?.message}`, error?.stack || '');
    }
  }
  return summary;
}

async function retryFailures(svc, limit = 40) {
  const now = new Date().toISOString();
  const rows = list(
    await svc.entities.ReminderDispatch.filter({ status: 'failed', channel: 'email' }, { sort: 'created_date', limit: 100 }),
  ).filter((row) => !row.next_attempt_at || row.next_attempt_at <= now || Number(row.attempts) === 0);

  const targets = rows.slice(0, limit);
  if (!targets.length) return { retried: 0, sent: 0, failed: 0 };

  const ids = new Set(targets.map((row) => row.user_id));
  const users = list(await svc.entities.User.list('-created_date', 300)).filter((row) => ids.has(row.id));
  const byId = new Map(users.map((row) => [row.id, row]));

  let sent = 0;
  let failed = 0;
  for (const row of targets) {
    const user = byId.get(row.user_id);
    if (!user) continue;
    const status = await deliverSingleEmail(
      svc,
      row,
      { email: user.email || '', first_name: String(user.full_name || '').split(' ')[0] || 'there' },
      row.summary || '',
    );
    if (status === 'sent') sent += 1;
    else failed += 1;
  }
  return { retried: targets.length, sent, failed };
}

export default async function (req) {
  let action = '';
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    // The scheduled workflow runs as an administrator; a student can never
    // trigger a sweep or read another student's delivery log.
    if (user.role !== 'admin') return Response.json({ error: 'Administrator access required' }, { status: 403 });

    const svc = base44.asServiceRole;
    const body = await req.json().catch(() => ({}));
    action = String(body.action || 'run');

    if (action === 'run') {
      const summary = await runSweep(base44, svc, {
        dryRun: Boolean(body.dryRun),
        onlyUserId: String(body.onlyUserId || ''),
        dateOverride: String(body.date || ''),
      });
      return Response.json(summary);
    }

    if (action === 'retry') {
      return Response.json(await retryFailures(svc, Math.min(Number(body.limit) || 40, 100)));
    }

    if (action === 'status') {
      const rows = list(await svc.entities.ReminderDispatch.list('-created_date', 400));
      const counts = {};
      rows.forEach((row) => {
        const key = `${row.channel || 'unknown'}:${row.status || 'unknown'}`;
        counts[key] = (counts[key] || 0) + 1;
      });
      return Response.json({
        total: rows.length,
        counts,
        failures: rows
          .filter((row) => ['failed', 'retry_exhausted', 'blocked'].includes(row.status))
          .slice(0, 20)
          .map((row) => ({
            id: row.id,
            channel: row.channel,
            category: row.category,
            title: row.title,
            status: row.status,
            attempts: row.attempts || 0,
            error: row.last_error || '',
            next_attempt_at: row.next_attempt_at || '',
            created_date: row.created_date,
          })),
        // Delivery is never claimed: only provider acceptance is recorded.
        note: 'sent means the email provider accepted the message. Delivery confirmation is not available.',
      });
    }

    return Response.json({ error: 'Unsupported action' }, { status: 400 });
  } catch (error) {
    console.error(`academicReminders ${action || 'run'} failed: ${error?.message}`, error?.stack || '');
    return Response.json({ error: error.message }, { status: 500 });
  }
}