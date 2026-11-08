import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';

const dateLabel = (value) =>
  value ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—';

/**
 * Rule-based academic summary. Every sentence is computed from the student's own
 * enrolled-course records; no figure is hardcoded.
 */
export default function AiSummaryCard({ summary }) {
  const next = summary.openAssignments[0];
  const days = next ? Math.round((new Date(next.dueDate) - new Date()) / 86400000) : 0;

  const lines = [
    summary.courseCount
      ? `You are enrolled in ${summary.courseCount} published course${summary.courseCount === 1 ? '' : 's'} this semester, worth ${summary.credits} credits.`
      : 'You have no published course enrolment this semester.',
    next
      ? `${summary.openAssignments.length} open assignment${summary.openAssignments.length === 1 ? '' : 's'}; the closest is “${next.title}” (${next.courseId}), due ${dateLabel(next.dueDate)}${days < 0 ? ' — overdue' : ` in ${days} day${days === 1 ? '' : 's'}`}.`
      : 'Nothing is outstanding — every recorded assignment has been submitted.',
    summary.average === null
      ? 'No assessment has been marked yet, so no course average is available.'
      : `Weighted average ${summary.average.toFixed(1)}/100 (${summary.averageLetter}) across your graded work, with ${summary.modulePercent}% of modules completed.`,
    summary.awaiting
      ? `${summary.awaiting} item${summary.awaiting === 1 ? '' : 's'} awaiting a grade and ${summary.missing} missing — neither is counted as zero.`
      : `${summary.missing} missing item${summary.missing === 1 ? '' : 's'} on record.`,
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
          <p className="text-[13px] font-semibold tracking-[-0.01em]">Academic summary</p>
          <span className="rounded-md bg-white/15 px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.08em] text-white/90">
            Live records
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
          <p className="text-[10.5px] text-white/65">Computed from your enrolled courses, submissions and quiz attempts</p>
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