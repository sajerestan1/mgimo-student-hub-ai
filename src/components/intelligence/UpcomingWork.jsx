import { Link } from 'react-router-dom';
import { Clock, FileWarning } from 'lucide-react';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';
import { dueLabel } from '@/lib/studentPortal';

function Row({ label, meta, to }) {
  return (
    <li className="flex items-start justify-between gap-3 py-2">
      <div className="min-w-0">
        <p className="truncate text-[13.5px] font-medium text-ink">{label}</p>
        <p className="mt-0.5 text-[12.5px] text-mutedink">{meta}</p>
      </div>
      <Link to={to} className="shrink-0 text-[12.5px] font-medium text-brand hover:underline">Open</Link>
    </li>
  );
}

export default function UpcomingWork({ work }) {
  return (
    <div className="space-y-4">
      <div>
        <p className="flex items-center gap-1.5 text-[12.5px] font-semibold uppercase tracking-[0.08em] text-critical">
          <FileWarning className="h-3.5 w-3.5" /> Overdue ({work.overdue.length})
        </p>
        {work.overdue.length ? (
          <ul className="mt-1 divide-y divide-line">
            {work.overdue.slice(0, 4).map((row) => (
              <Row key={row.id} label={`${row.courseCode} · ${row.title}`} meta={dueLabel(row.dueDate)} to={P.student.assignments} />
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-[13px] text-mutedink">Nothing overdue.</p>
        )}
      </div>

      <div>
        <p className="flex items-center gap-1.5 text-[12.5px] font-semibold uppercase tracking-[0.08em] text-mutedink">
          <Clock className="h-3.5 w-3.5" /> Upcoming assignments ({work.upcomingAssignments.length})
        </p>
        {work.upcomingAssignments.length ? (
          <ul className="mt-1 divide-y divide-line">
            {work.upcomingAssignments.slice(0, 4).map((row) => (
              <Row key={row.id} label={`${row.courseCode} · ${row.title}`} meta={`${row.type} · ${dueLabel(row.dueDate)}`} to={P.student.assignments} />
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-[13px] text-mutedink">No assignment is currently due ahead.</p>
        )}
      </div>

      <div>
        <p className="flex items-center gap-1.5 text-[12.5px] font-semibold uppercase tracking-[0.08em] text-mutedink">
          <Clock className="h-3.5 w-3.5" /> Upcoming assessments ({work.upcomingAssessments.length})
        </p>
        {work.upcomingAssessments.length ? (
          <ul className="mt-1 divide-y divide-line">
            {work.upcomingAssessments.slice(0, 4).map((quiz) => (
              <Row
                key={quiz.id}
                label={`${quiz.courseCode} · ${quiz.title}`}
                meta={`${quiz.attempts}/${quiz.attemptLimit} attempts · ${quiz.availableUntil ? dueLabel(quiz.availableUntil) : 'no closing date'}`}
                to={P.student.quizzes}
              />
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-[13px] text-mutedink">No published assessment is open ahead.</p>
        )}
      </div>
    </div>
  );
}