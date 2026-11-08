import { Link } from 'react-router-dom';
import { CalendarClock } from 'lucide-react';
import Surface from '@/components/shell/Surface';
import StatusChip from '@/components/shell/StatusChip';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';

const dateLabel = (value) =>
  value ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—';

function dueText(item) {
  const days = Math.round((new Date(item.dueDate) - new Date()) / 86400000);
  if (days < 0) return `Overdue · ${dateLabel(item.dueDate)}`;
  if (days === 0) return 'Due today';
  if (days === 1) return `Due tomorrow · ${dateLabel(item.dueDate)}`;
  return `In ${days} days · ${dateLabel(item.dueDate)}`;
}

// Open assignments in the student's enrolled courses.
export default function DeadlinesCard({ items }) {
  return (
    <Surface
      title="Upcoming deadlines"
      subtitle="Open assignments in your courses"
      action={
        <Link to={P.student.assignments} className="link-quiet">
          All assignments
        </Link>
      }
      bodyClassName="px-5 pb-5 pt-1"
    >
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
          <CalendarClock className="h-5 w-5 text-mutedink/70" />
          <p className="text-[12.5px] font-medium text-ink">No upcoming deadlines</p>
          <p className="text-[11px] text-mutedink">Everything set so far has been submitted.</p>
        </div>
      ) : (
        <ul className="divide-y divide-line">
          {items.slice(0, 4).map((item) => (
            <li key={item.id} className="flex items-start justify-between gap-3 py-3">
              <div className="min-w-0">
                <Link
                  to={P.student.assignments}
                  className="truncate text-[12.5px] font-medium text-ink transition-colors hover:text-brand"
                >
                  {item.title}
                </Link>
                <p className="mt-0.5 truncate text-[11px] text-mutedink">{item.courseId} · {item.courseTitle}</p>
                <p className="mt-1 text-[11px] font-medium text-[#C77C14]">{dueText(item)}</p>
              </div>
              <StatusChip tone={item.missed ? 'critical' : 'warning'}>
                {item.missed ? 'Overdue' : 'Not submitted'}
              </StatusChip>
            </li>
          ))}
        </ul>
      )}
    </Surface>
  );
}