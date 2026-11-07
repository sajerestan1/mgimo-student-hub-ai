import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Surface from '@/components/shell/Surface';
import { DEMO_PROFESSOR } from '@/lib/demoUniversity';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';

const initials = (name) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

export default function StudentActivity() {
  return (
    <Surface
      title="Student activity"
      subtitle="Latest submissions across your courses"
      action={
        <Link to={P.professor.students} className="link-quiet">
          Students <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      }
      bodyClassName="px-5 pb-2 pt-1"
    >
      <ul>
        {DEMO_PROFESSOR.submissions.map((item) => (
          <li key={item.id} className="flex items-center gap-3 border-t border-line py-2.5 first:border-0">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EDF1FE] text-[10px] font-semibold text-[#3B5AE0]">
              {initials(item.student)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12.5px] font-medium text-ink">{item.title}</p>
              <p className="mt-0.5 truncate text-[11px] text-mutedink">
                {item.student} · {item.course}
              </p>
            </div>
            <span className="shrink-0 text-[10.5px] tabular-nums text-mutedink">{item.when}</span>
          </li>
        ))}
      </ul>
    </Surface>
  );
}