import { Link } from 'react-router-dom';
import Surface from '@/components/shell/Surface';
import ProgressBar from '@/components/shell/ProgressBar';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';
import { letterFor } from '@/lib/lms';

// Module completion and course results, both read from the LMS records.
export default function ProgressCard({ courses, summary }) {
  return (
    <Surface
      title="Academic progress"
      subtitle="Modules completed and results per course"
      action={
        <Link to={P.student.grades} className="link-quiet">
          Transcript
        </Link>
      }
      bodyClassName="px-5 pb-5 pt-1"
    >
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[10.5px] uppercase tracking-[0.1em] text-mutedink">Module completion</p>
          <p className="mt-1 text-[19px] font-semibold leading-none tabular-nums text-ink">
            {summary.modulesCompleted}
            <span className="text-[12px] font-medium text-mutedink"> / {summary.modulesTotal} modules</span>
          </p>
        </div>
        <span className="rounded-md bg-[#EEEBFE] px-2 py-1 text-[10.5px] font-medium text-royal">
          {summary.modulePercent}% complete
        </span>
      </div>
      <ProgressBar value={summary.modulePercent} tone="brand" className="mt-2.5" />

      <div className="mt-4">
        <p className="text-[11px] font-medium text-ink">Progress by course</p>
        <ul className="mt-2 space-y-3">
          {courses.map((entry) => (
            <li key={entry.course.id}>
              <div className="flex items-baseline justify-between gap-2 text-[11.5px]">
                <span className="truncate text-ink/80">
                  {entry.course.code} · {entry.course.title}
                </span>
                <span className="shrink-0 tabular-nums text-mutedink">
                  {entry.gradebook.weighted === null ? '—' : `${entry.gradebook.weighted.toFixed(1)} · ${letterFor(entry.gradebook.weighted)}`}
                </span>
              </div>
              <ProgressBar
                value={entry.moduleProgress.percent}
                tone={entry.moduleProgress.percent >= 100 ? 'positive' : 'brand'}
                className="mt-1 h-1"
              />
              <p className="mt-1 text-[10px] text-mutedink">
                {entry.moduleProgress.completed} of {entry.moduleProgress.total} modules · {entry.credits} credits
              </p>
            </li>
          ))}
          {!courses.length && <li className="text-[11.5px] text-mutedink">No enrolled courses yet.</li>}
        </ul>
      </div>
    </Surface>
  );
}