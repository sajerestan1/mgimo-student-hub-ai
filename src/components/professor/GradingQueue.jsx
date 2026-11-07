import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Surface from '@/components/shell/Surface';
import ProgressBar from '@/components/shell/ProgressBar';
import { DEMO_PROFESSOR } from '@/lib/demoUniversity';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';

export default function GradingQueue() {
  const queue = DEMO_PROFESSOR.gradingQueue;
  const awaiting = DEMO_PROFESSOR.metrics.find((metric) => metric.key === 'grading');

  return (
    <Surface
      title="Grading queue"
      subtitle={`${awaiting?.value || 0} submissions awaiting feedback · oldest 4 days`}
      action={
        <Link to={P.professor.grading} className="link-quiet">
          Open grading <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      }
      bodyClassName="px-5 pb-2 pt-1"
    >
      <ul>
        {queue.map((item) => {
          const graded = Math.round((item.submitted / item.total) * 100);
          const overdue = item.due === 'Yesterday' || item.due === 'Today';
          return (
            <li key={item.id} className="border-t border-line py-3 first:border-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-[13px] font-medium text-ink">{item.title}</p>
                    <span className="chip bg-[#F2F4F8] px-1.5 py-0 text-[10px] text-[#5A6779]">{item.course}</span>
                  </div>
                  <p className="mt-1 text-[11.5px] text-mutedink">
                    {item.submitted} of {item.total} submitted ·{' '}
                    <span className={overdue ? 'font-medium text-warning' : ''}>due {item.due}</span>
                  </p>
                </div>
                <Link to={P.professor.grading} className="btn-quiet btn-sm shrink-0">
                  Grade
                </Link>
              </div>
              <div className="mt-2 flex items-center gap-2.5">
                <ProgressBar value={graded} tone={graded >= 70 ? 'brand' : 'warning'} />
                <span className="w-9 shrink-0 text-right text-[10.5px] tabular-nums text-mutedink">{graded}%</span>
              </div>
            </li>
          );
        })}
      </ul>
    </Surface>
  );
}