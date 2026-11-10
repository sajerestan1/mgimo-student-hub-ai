import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { buildStudentContext, contextBrief } from '../../shared/student/context.ts';
import { buildAcademicIntelligence, intelligenceBrief } from '../../shared/student/intelligence.ts';

const clean = (value) => (typeof value === 'string' ? value.slice(0, 500) : '');

// Answer language is a presentation choice made in the interface. Only these
// identifiers are accepted, so the instruction cannot carry free text into the
// prompt.
const LANGUAGE_NAMES = {
  en: 'English',
  ru: 'Russian',
  fr: 'French',
  'zh-CN': 'Simplified Chinese',
  ar: 'Arabic',
};

// The AI study companion. The academic record is loaded server-side from the
// authenticated account, so a caller cannot ask about another student by
// sending a different id, and no unpublished or unauthorised record is exposed.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const question = clean(body.question).trim();
    if (!question) return Response.json({ error: 'question is required' }, { status: 400 });

    const answerLanguage = LANGUAGE_NAMES[body.language] || LANGUAGE_NAMES.en;

    const context = await buildStudentContext(base44, user);
    if (!context.linked) {
      // A code, not a sentence: the interface renders this in the student's
      // own language.
      return Response.json({ code: 'not_linked' });
    }

    // The performance and attendance figures are added from the same resolver
    // the Academic Intelligence page uses, so the assistant cannot quote a
    // different average from the one the student is looking at.
    const intel = await buildAcademicIntelligence(base44, user);

    const history = Array.isArray(body.history) ? body.history.slice(-6) : [];
    const historyLines = history
      .map((turn) => `${turn && turn.role === 'assistant' ? 'Assistant' : 'Student'}: ${clean(turn && turn.text)}`)
      .join('\n');

    const prompt = [
      'You are the AI Study Companion inside the student portal of Digital Dean, a fictional institution; the platform is called Academic Intelligence. Identify yourself as part of Digital Dean when it is relevant.',
      'Never name or imply any real-world institution: the university in this record is Digital Dean.',
      'Answer using only the student record below. Never invent courses, dates, grades, materials, people or policies.',
      'Never mention another student, and never claim to see anything outside this record.',
      'If the record does not contain the answer, say clearly what is missing and who to ask (course instructor or student office).',
      'Format every answer as Markdown, because the interface renders it: open with one short sentence, then clearly separated sections.',
      'Put each section label on its own line in bold, for example **Track Progress**, and list the points under it as "- " bullets of one short line each.',
      'Use a numbered list only where the order matters. Never use tables, code blocks or horizontal rules, and put exactly one blank line between sections.',
      'Be concise and practical: at most 160 words. No medical, legal or financial advice.',
      `Write the entire answer in ${answerLanguage}, including every section label and bullet, unless the student explicitly asks for a different language.`,
      'Never translate course codes, course titles, module numbers or personal names: reproduce them exactly as they appear in the record, because they are official identifiers.',
      '',
      'STUDENT RECORD',
      contextBrief(context),
      '',
      'ACADEMIC PERFORMANCE AND ATTENDANCE INTELLIGENCE',
      'Use these figures when the student asks about performance, trends, study priorities or attendance. Recorded results and calculated averages are separate; the register uses its own marking scale. Never predict or guarantee a future grade.',
      intelligenceBrief(intel),
      historyLines ? `\nRECENT CONVERSATION\n${historyLines}` : '',
      '',
      `STUDENT QUESTION: ${question}`,
    ]
      .filter(Boolean)
      .join('\n');

    const answer = await base44.integrations.Core.InvokeLLM({ prompt });
    return Response.json({ answer: String(answer || '').trim() });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}