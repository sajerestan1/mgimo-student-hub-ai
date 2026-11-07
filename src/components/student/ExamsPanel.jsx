import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Surface from '@/components/shell/Surface';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';
import { DEMO_STUDENT } from '@/lib/demoUniversity';

export default function ExamsPanel() {
  return (
    <Surface
      title="Upcoming examinations"
      subtitle="Confirmed assessment dates for your courses"
      action={
        <Link to={P.student.exams} className="link-quiet">
          All <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      }
      bodyClassName="px-5 pb-2 pt-1"
    >
      <ul>
        {DEMO_STUDENT.exams.map((exam) => (
          <li key={exam.id} className="flex items-center gap-3 border-t border-line py-2.5 first:border-0">
            <div className="w-11 shrink-0">
              <p className="text-[12px] font-semibold leading-none text-ink">{exam.date.split(' ')[0]}</p>
              <p className="mt-1 text-[10px] uppercase leading-none tracking-[0.06em] text-mutedink">
                {exam.date.split(' ')[1]}
              </p>
            </div>
            <span className="h-7 w-px shrink-0 bg-line" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12.5px] font-medium text-ink">{exam.title}</p>
              <p className="mt-0.5 truncate text-[11px] text-mutedink">
                {exam.course} · {exam.time} · {exam.room}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </Surface>
  );
}