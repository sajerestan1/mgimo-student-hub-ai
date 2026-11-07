import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Surface from '@/components/shell/Surface';
import ProgressBar from '@/components/shell/ProgressBar';
import StatusChip from '@/components/shell/StatusChip';
import { DEMO_PROFESSOR } from '@/lib/demoUniversity';

export default function CourseList() {
  return (
    <Surface
      title="My courses"
      subtitle="Fall Semester 2026 · 186 students"
      action={
        <Link to="/courses" className="link-quiet">
          All <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      }
      bodyClassName="px-5 pb-2 pt-1"
    >
      <ul>
        {DEMO_PROFESSOR.courses.map((course) => (
          <li key={course.id} className="border-t border-line py-3 first:border-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-[13px] font-medium text-ink">{course.title}</p>
                <p className="mt-0.5 text-[11.5px] text-mutedink">
                  {course.code} · {course.students} students
                </p>
              </div>
              <StatusChip tone={course.status === 'On track' ? 'positive' : 'warning'}>
                {course.status === 'On track' ? 'On track' : 'Attention'}
              </StatusChip>
            </div>
            <div className="mt-2 flex items-center gap-2.5">
              <ProgressBar value={course.progress} tone={course.status === 'On track' ? 'brand' : 'warning'} />
              <span className="w-9 shrink-0 text-right text-[10.5px] tabular-nums text-mutedink">{course.progress}%</span>
            </div>
          </li>
        ))}
      </ul>
    </Surface>
  );
}