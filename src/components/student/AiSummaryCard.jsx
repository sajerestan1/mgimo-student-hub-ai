import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { SUMMARY, TODAY_SESSIONS, formatDate, daysUntil } from '@/lib/studentWorkspace';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';

/**
 * Rule-based academic summary. Every sentence is computed from the student's own
 * records; the live model is not connected yet, so the panel is labelled as
 * demonstration and its shape is ready for the assistant response.
 */
export default function AiSummaryCard() {
  const next = SUMMARY.nextDeadline;
  const assessment = SUMMARY.nextAssessment;

  const lines = [
    TODAY_SESSIONS.length
      ? `${TODAY_SESSIONS.length} ${TODAY_SESSIONS.length === 1 ? 'class' : 'classes'} today, starting at ${
          TODAY_SESSIONS[0].start
        } with ${TODAY_SESSIONS[0].course.code} ${TODAY_SESSIONS[0].course.title}.`
      : 'No classes scheduled today — your timetable resumes on the next teaching day.',
    next
      ? `${SUMMARY.assignmentsDue} open ${SUMMARY.assignmentsDue === 1 ? 'assignment' : 'assignments'}; the closest is “${
          next.title
        }” (${next.courseId}), due in ${daysUntil(next.dueDate)} ${daysUntil(next.dueDate) === 1 ? 'day' : 'days'}.`
      : 'Nothing is outstanding — every assignment has been submitted.',
    `Weighted average ${SUMMARY.averageMark.toFixed(1)}/100 (${SUMMARY.averageLetter}) across ${
      SUMMARY.activeCourses
    } courses, attendance ${SUMMARY.attendanceRate}%.`,
    assessment
      ? `Next assessment: ${assessment.title} (${assessment.courseId}) on ${formatDate(assessment.date)} — preparation at ${
          assessment.preparation
        }%.`
      : 'No assessments are scheduled in the next three weeks.',
  ];

  return (
    <section className="relative overflow-hidden rounded-2xl border border-royal/25 bg-royal text-white">
      <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-24 left-1/3 h-44 w-44 rounded-full bg-[#8B80FF]/25 blur-2xl" />
      <div className="relative px-5 py-5 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15">
            <Sparkles className="h-4 w-4" />
          </span>
          <p className="text-[13px] font-semibold tracking-[-0.01em]">AI academic summary</p>
          <span className="rounded-md bg-white/15 px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.08em] text-white/90">
            Demo
          </span>
        </div>

        <ul className="mt-3 space-y-1.5">
          {lines.map((line) => (
            <li key={line} className="flex gap-2 text-[12.5px] leading-relaxed text-white/90">
              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-white/60" />
              <span>{line}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/15 pt-3">
          <p className="text-[10.5px] text-white/65">
            Generated from your own academic records in this prototype · live model not connected
          </p>
          <Link
            to={P.student.ai}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-[11.5px] font-medium text-royal transition-colors hover:bg-white/90"
          >
            Ask the study companion <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}