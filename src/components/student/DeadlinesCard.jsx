import { Link } from 'react-router-dom';
import { CalendarClock } from 'lucide-react';
import Surface from '@/components/shell/Surface';
import StatusChip from '@/components/shell/StatusChip';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';
import { openAssignments, formatDate, daysUntil } from '@/lib/studentWorkspace';

const STATUS = {
  in_progress: { label: 'In progress', tone: 'brand' },
  not_started: { label: 'Not started', tone: 'warning' },
};

function dueText(dueDate) {
  const days = daysUntil(dueDate);
  if (days < 0) return `Overdue · ${formatDate(dueDate)}`;
  if (days === 0) return 'Due today';
  if (days === 1) return `Due tomorrow · ${formatDate(dueDate)}`;
  return `In ${days} days · ${formatDate(dueDate)}`;
}

export default function DeadlinesCard() {
  return (
    <Surface
      title="Upcoming deadlines"
      subtitle="Open assignments, nearest first"
      action={
        <Link to={P.student.assignments} className="link-quiet">
          All assignments
        </Link>
      }
      bodyClassName="px-5 pb-5 pt-1"
    >
      {openAssignments.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
          <CalendarClock className="h-5 w-5 text-mutedink/70" />
          <p className="text-[12.5px] font-medium text-ink">No upcoming deadlines</p>
          <p className="text-[11px] text-mutedink">Everything set so far has been submitted.</p>
        </div>
      ) : (
        <ul className="divide-y divide-line">
          {openAssignments.slice(0, 4).map((item) => {
            const status = STATUS[item.status];
            return (
              <li key={item.id} className="flex items-start justify-between gap-3 py-3">
                <div className="min-w-0">
                  <Link
                    to={P.student.assignments}
                    className="truncate text-[12.5px] font-medium text-ink transition-colors hover:text-brand"
                  >
                    {item.title}
                  </Link>
                  <p className="mt-0.5 text-[11px] text-mutedink">
                    {item.courseId} · {item.weight}
                  </p>
                  <p className="mt-1 text-[11px] font-medium text-[#C77C14]">{dueText(item.dueDate)}</p>
                </div>
                <StatusChip tone={status.tone}>{status.label}</StatusChip>
              </li>
            );
          })}
        </ul>
      )}
    </Surface>
  );
}