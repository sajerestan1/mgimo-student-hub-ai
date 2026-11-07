import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Surface from '@/components/shell/Surface';
import StatusChip from '@/components/shell/StatusChip';
import { DEMO_STUDENT } from '@/lib/demoUniversity';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function daysUntil(due) {
  const [day, month] = due.split(' ');
  const monthIndex = MONTHS.indexOf(month);
  if (monthIndex === -1 || Number.isNaN(Number(day))) return null;
  const now = new Date();
  const target = new Date(now.getFullYear(), monthIndex, Number(day));
  return Math.round((target - new Date(now.getFullYear(), now.getMonth(), now.getDate())) / 86400000);
}

const PRIORITY_BAR = {
  high: 'bg-critical',
  normal: 'bg-brand',
  low: 'bg-[#CBD3E1]',
};

const STATUS = {
  not_started: { label: 'Not started', tone: 'neutral' },
  in_progress: { label: 'In progress', tone: 'warning' },
  submitted: { label: 'Submitted', tone: 'positive' },
};

export default function DeadlinesPanel() {
  const assignments = DEMO_STUDENT.assignments;
  const open = assignments.filter((item) => item.status !== 'submitted').length;

  return (
    <Surface
      title="Upcoming deadlines"
      subtitle={`${open} open · closest due in 2 days`}
      action={
        <Link to="/assignments" className="link-quiet">
          All assignments <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      }
      bodyClassName="px-5 pb-2 pt-1"
    >
      <ul>
        {assignments.map((assignment) => {
          const days = daysUntil(assignment.due);
          const urgent = days !== null && days <= 3 && assignment.status !== 'submitted';
          const status = STATUS[assignment.status];
          return (
            <li
              key={assignment.id}
              className="flex items-center gap-3 border-t border-line py-3 first:border-0"
            >
              <span className={cn('h-8 w-[3px] shrink-0 rounded-full', PRIORITY_BAR[assignment.priority])} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-ink">{assignment.title}</p>
                <p className="mt-0.5 truncate text-[11.5px] text-mutedink">{assignment.course}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={cn(
                    'chip tabular-nums',
                    urgent ? 'bg-[#FCF3E4] text-[#8E6018]' : 'bg-[#F2F4F8] text-[#5A6779]'
                  )}
                  title={`Due ${assignment.due}`}
                >
                  {days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `Due ${assignment.due}`}
                </span>
                <StatusChip tone={status.tone} className="hidden sm:inline-flex">
                  {status.label}
                </StatusChip>
              </div>
            </li>
          );
        })}
      </ul>
    </Surface>
  );
}