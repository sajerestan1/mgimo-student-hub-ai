import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import {
  buildAcademicIntelligence,
  intelligenceBrief,
  normalisePreferences,
  saveStudentPreferences,
  loadPolicy,
  syncAcademicAlerts,
} from '../../shared/student/intelligence.ts';

const clean = (value, limit = 500) => (typeof value === 'string' ? value.slice(0, limit) : '');
const STAFF_ROLES = ['admin', 'dean', 'deputy_dean'];

// Academic performance and attendance intelligence for the signed-in student.
// The student is resolved from the authenticated session, never from the body,
// and the attendance policy can only be changed by administrative staff.
export default async function (req) {
  // Declared outside the try so a failure can still name the branch in the logs.
  let action = '';
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    action = clean(body.action, 40);
    const svc = base44.asServiceRole;

    if (action === 'overview') {
      const intel = await buildAcademicIntelligence(base44, user);
      const alerts = intel.linked
        ? await syncAcademicAlerts(svc, { userId: user.id, studentId: intel.profile.id }, intel, intel.preferences)
        : [];
      return Response.json({ ...intel, alerts });
    }

    if (action === 'savePreferences') {
      const saved = await saveStudentPreferences(svc, user.id, {
        preferences: body.preferences,
        institution: clean(body.institution, 120),
      });
      return Response.json({ ok: true, ...saved, preferences: normalisePreferences(saved.preferences) });
    }

    if (action === 'policy') {
      return Response.json({ policy: await loadPolicy(svc) });
    }

    if (action === 'savePolicy') {
      if (!STAFF_ROLES.includes(user.role)) {
        return Response.json({ error: 'Only administrative staff can change the attendance policy' }, { status: 403 });
      }
      const limit = Number(body.absenceLimit);
      if (!Number.isFinite(limit) || limit < 1 || limit > 200) {
        return Response.json({ error: 'The permitted number of missed classes must be between 1 and 200' }, { status: 400 });
      }
      const institution = clean(body.institution, 120);
      const rows = await svc.entities.AppSetting.filter(
        { key: { $in: ['attendance_absence_limit', 'institution_name'] } },
        { limit: 5 },
      );
      const existing = new Map((rows?.items || rows || []).map((row) => [row.key, row]));
      const upsert = async (key, value) => {
        const row = existing.get(key);
        if (row) await svc.entities.AppSetting.update(row.id, { value: String(value) });
        else await svc.entities.AppSetting.create({ key, value: String(value) });
      };
      await upsert('attendance_absence_limit', Math.round(limit));
      if (institution) await upsert('institution_name', institution);
      return Response.json({ ok: true, policy: await loadPolicy(svc) });
    }

    if (action === 'advisor') {
      const intel = await buildAcademicIntelligence(base44, user);
      if (!intel.linked) {
        return Response.json({
          answer:
            'Your account is not linked to a student record yet, so I cannot see any results. The student office links accounts to the academic register.',
        });
      }

      const mode = clean(body.mode, 40) || 'explain';
      const question = clean(body.question, 500).trim();
      const focus = intel.performance.courses.find((course) => course.id === clean(body.courseId, 60));

      const tasks = {
        explain: 'Explain this performance record course by course, and name which assessments moved each average.',
        improve: 'Identify where performance is improving or declining and explain which assessments caused it.',
        prepare: 'Help the student prepare for the upcoming examinations and assessments listed in the record.',
        priorities: 'Recommend the study priorities that follow from this record, most urgent first.',
      };
      if (!tasks[mode] && !question) {
        return Response.json({ error: 'Ask a question or choose a suggestion' }, { status: 400 });
      }

      const prompt = [
        'You are the AI academic performance advisor inside a university student portal.',
        'Use only the record below. Never invent courses, assessments, grades, dates or policies, and never mention another student.',
        'Distinguish clearly between: recorded results (from grades and the register), calculated averages you can compute from them, and anything you are unsure about.',
        'Never predict or guarantee a future grade. Never present an estimate as an achieved result.',
        'If the record does not support an answer, say what is missing and who to ask (course instructor or student office).',
        `TASK: ${tasks[mode] || 'Answer the student question about their own performance.'}`,
        focus ? `The student is asking about ${focus.code} ${focus.title}.` : '',
        question ? `STUDENT QUESTION: ${question}` : '',
        'Format the answer as Markdown, because the interface renders it: one short introductory sentence, then clearly separated bold section labels such as **Weakest course**, each followed by "- " bullets.',
        'Never use tables, code blocks or horizontal rules, and put exactly one blank line between sections.',
        'Be concise: at most 200 words. Practical, neutral, no medical, legal or financial advice.',
        '',
        'STUDENT ACADEMIC RECORD',
        intelligenceBrief(intel),
      ]
        .filter(Boolean)
        .join('\n');

      const answer = await base44.integrations.Core.InvokeLLM({ prompt });
      return Response.json({
        answer: String(answer || '').trim(),
        grounded: true,
        mode,
        courseId: focus?.id || '',
      });
    }

    return Response.json({ error: 'Unsupported action' }, { status: 400 });
  } catch (error) {
    console.error(`academicIntelligence ${action || 'request'} failed: ${error?.message}`, error?.stack || '');
    return Response.json({ error: error.message }, { status: 500 });
  }
}