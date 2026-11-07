import { useEffect, useRef, useState } from 'react';
import { ArrowUp, BookOpen, Sparkles } from 'lucide-react';
import PageTitle from '@/components/shell/PageTitle';
import Surface from '@/components/shell/Surface';
import { base44 } from '@/api/base44Client';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';
import { Link } from 'react-router-dom';
import {
  ASSIGNMENTS,
  COURSES,
  STUDENT,
  SUMMARY,
  courseAverage,
  courseAttendance,
  daysUntil,
  formatDate,
  recentGrades,
  upcomingAssessments,
  letterFor,
} from '@/lib/studentWorkspace';

const PROMPTS = [
  'What should I revise first for the ECO-301 mid-term?',
  'Plan my study week around my two nearest deadlines.',
  'Explain where my average mark is weakest and why.',
  'How many credits do I still need for my degree?',
];

function buildContext() {
  const courseLines = COURSES.map(
    (course) =>
      `- ${course.code} ${course.title} (${course.credits} credits, ${course.lecturer}): average ${courseAverage(
        course.id
      ).toFixed(1)}/100 (${letterFor(courseAverage(course.id))}), attendance ${courseAttendance(course.id)}%.`
  ).join('\n');

  const deadlineLines = ASSIGNMENTS.filter((item) => item.status !== 'graded')
    .map(
      (item) =>
        `- ${item.courseId} "${item.title}" — due in ${daysUntil(item.dueDate)} days (${formatDate(item.dueDate)}), ${
          item.weight
        }, status ${item.status.replace('_', ' ')}.`
    )
    .join('\n');

  const assessmentLines = upcomingAssessments
    .map(
      (item) =>
        `- ${item.courseId} ${item.title} (${item.kind}) on ${formatDate(item.date)} at ${item.start}, ${item.room}, ${item.format}, preparation ${item.preparation}%.`
    )
    .join('\n');

  const gradeLines = recentGrades
    .map((grade) => `- ${grade.courseId} ${grade.title}: ${grade.score}/100 (${letterFor(grade.score)}), ${formatDate(grade.date)}.`)
    .join('\n');

  return [
    `Student: ${STUDENT.fullName}, ${STUDENT.programme}, Year ${STUDENT.year}, group ${STUDENT.group}, ${STUDENT.semester}.`,
    `Weighted average ${SUMMARY.averageMark.toFixed(1)}/100 (${SUMMARY.averageLetter}); attendance ${SUMMARY.attendanceRate}%; credits earned ${STUDENT.creditsEarned} of ${STUDENT.creditsRequired}.`,
    '',
    'Courses:',
    courseLines,
    '',
    'Open assignments:',
    deadlineLines || '- none',
    '',
    'Upcoming assessments:',
    assessmentLines || '- none scheduled',
    '',
    'Recent grades:',
    gradeLines,
  ].join('\n');
}

export default function AiStudyCompanion() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
  }, [messages, busy]);

  const ask = async (question) => {
    const text = (question ?? input).trim();
    if (!text || busy) return;
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInput('');
    setBusy(true);
    setError('');
    try {
      const answer = await base44.integrations.Core.InvokeLLM({
        prompt: [
          'You are the AI Study Companion inside a university student portal.',
          'Answer using only the student record below. Never invent courses, dates, grades or policies.',
          'If the record does not contain the answer, say clearly what is missing and where the student should ask.',
          'Be concise and practical (at most 140 words), use short paragraphs or dashes, and no medical, legal or financial advice.',
          '',
          'STUDENT RECORD',
          buildContext(),
          '',
          `STUDENT QUESTION: ${text}`,
        ].join('\n'),
      });
      setMessages((prev) => [...prev, { role: 'assistant', text: String(answer) }]);
    } catch {
      setError('The study companion could not answer just now. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageTitle
        eyebrow="Student workspace"
        title="AI study companion"
        description="Ask about your own courses, deadlines and results. Answers are generated from the record summarised below — nothing is invented about the rest of the university."
        meta={[`${COURSES.length} courses in scope`, 'Fall Semester 2026', 'Answers are not stored']}
      />

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <section className="card-surface flex min-h-[460px] flex-col overflow-hidden">
          <header className="flex items-center gap-2 border-b border-line px-5 py-3.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-royal/10 text-royal">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[12.5px] font-semibold text-ink">Study companion</p>
              <p className="text-[10.5px] text-mutedink">Connected to your academic record</p>
            </div>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
            {messages.length === 0 && (
              <div className="py-4">
                <p className="text-[12.5px] font-medium text-ink">Hello {STUDENT.firstName} — what are we working on?</p>
                <p className="mt-1 text-[11.5px] leading-relaxed text-mutedink">
                  I can see your courses, averages, attendance, open assignments and assessment dates. Ask me to plan
                  revision, explain a result, or summarise what is due.
                </p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => ask(prompt)}
                      className="rounded-lg border border-line bg-canvas/60 px-3 py-2 text-left text-[11.5px] leading-snug text-ink transition-colors hover:border-royal/30 hover:bg-royal/5"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[88%] whitespace-pre-line rounded-xl px-3.5 py-2.5 text-[12px] leading-relaxed ${
                    message.role === 'user'
                      ? 'bg-royal text-white'
                      : 'border border-line bg-canvas/60 text-ink'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}

            {busy && (
              <div className="flex items-center gap-2 text-[11.5px] text-mutedink">
                <span className="flex gap-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-royal/60" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-royal/60 [animation-delay:120ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-royal/60 [animation-delay:240ms]" />
                </span>
                Reading your record…
              </div>
            )}

            {error && <p className="text-[11.5px] text-critical">{error}</p>}
            <div ref={endRef} />
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              ask();
            }}
            className="border-t border-line px-5 py-3"
          >
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    ask();
                  }
                }}
                rows={1}
                placeholder="Ask about your courses, deadlines or results…"
                className="max-h-32 min-h-[38px] flex-1 resize-none rounded-lg border border-line bg-white px-3 py-2 text-[12px] text-ink placeholder:text-mutedink/70 focus:border-royal/40 focus:outline-none focus:ring-2 focus:ring-royal/10"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                className="flex h-[38px] w-[38px] items-center justify-center rounded-lg bg-royal text-white transition-colors hover:bg-royal-deep disabled:opacity-40"
                aria-label="Send question"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1.5 text-[10px] text-mutedink">
              Generated by the app’s AI model from your record. Conversations are not saved and are not visible to
              lecturers.
            </p>
          </form>
        </section>

        <div className="space-y-4">
          <Surface title="What the companion can see" subtitle="Scope of this conversation">
            <ul className="space-y-1.5 text-[11.5px] leading-relaxed text-ink/80">
              <li>· {COURSES.length} enrolled courses with averages and attendance</li>
              <li>· {SUMMARY.assignmentsDue} open assignments and their deadlines</li>
              <li>· {upcomingAssessments.length} upcoming quizzes and examinations</li>
              <li>· Recent grades and your weighted average ({SUMMARY.averageMark.toFixed(1)})</li>
            </ul>
            <p className="mt-3 border-t border-line pt-3 text-[10.5px] leading-relaxed text-mutedink">
              It cannot change records, submit work, or see another student’s data.
            </p>
          </Surface>

          <Surface title="Related pages">
            <div className="space-y-2 text-[11.5px]">
              <Link to={P.student.assignments} className="link-quiet flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" /> Open assignments
              </Link>
              <Link to={P.student.quizzes} className="link-quiet flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" /> Quizzes &amp; exams
              </Link>
              <Link to={P.student.grades} className="link-quiet flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" /> Grades &amp; transcript
              </Link>
            </div>
            <p className="mt-3 border-t border-line pt-3 text-[10.5px] leading-relaxed text-mutedink">
              Answers use the demonstration academic record. Connecting the live institutional record and course
              materials is the next integration step.
            </p>
          </Surface>
        </div>
      </div>
    </div>
  );
}