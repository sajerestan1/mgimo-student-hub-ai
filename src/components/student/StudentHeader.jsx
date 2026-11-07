import { Link } from 'react-router-dom';
import { CalendarDays, Sparkles } from 'lucide-react';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';
import { UNIVERSITY } from '@/lib/demoUniversity';

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

const initials = (name) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

/** Student identity header: who the student is, on which programme, and what matters today. */
export default function StudentHeader({ student }) {
  return (
    <header className="mb-6 border-b border-line pb-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex min-w-0 items-start gap-3.5">
          <span
            aria-hidden="true"
            className="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-2xl bg-navy text-[17px] font-semibold tracking-[0.02em] text-white"
          >
            {initials(student.name)}
          </span>
          <div className="min-w-0">
            <p className="eyebrow mb-2">Student workspace · {UNIVERSITY.semester} 2026</p>
            <h1 className="text-[24px] font-semibold leading-[1.12] tracking-[-0.025em] text-ink sm:text-[28px]">
              {greeting()}, {student.preferredName}
            </h1>
            <p className="mt-1.5 text-[13px] leading-relaxed text-mutedink">
              {student.programme} · Year {student.year}
            </p>
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              {[student.faculty, `Group ${student.group}`, `ID ${student.studentId}`, UNIVERSITY.academicYear].map(
                (item) => (
                  <span
                    key={item}
                    className="inline-flex items-center rounded-md border border-line bg-white px-2 py-0.5 text-[11.5px] text-mutedink"
                  >
                    {item}
                  </span>
                )
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:shrink-0">
          <Link to={P.student.timetable} className="btn-quiet">
            <CalendarDays className="h-3.5 w-3.5" /> View timetable
          </Link>
          <Link to={P.student.ai} className="btn-primary">
            <Sparkles className="h-3.5 w-3.5" /> AI study companion
          </Link>
        </div>
      </div>
    </header>
  );
}