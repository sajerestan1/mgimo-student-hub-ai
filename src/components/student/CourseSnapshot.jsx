import { COURSES, courseAttendance, courseAverage, letterFor } from '@/lib/studentWorkspace';

const toneFor = (value) => (value >= 80 ? 'bg-positive' : value >= 70 ? 'bg-warning' : 'bg-critical');

export default function CourseSnapshot() {
  return (
    <ul className="space-y-3">
      {COURSES.map((course) => {
        const average = courseAverage(course.id);
        const attendance = courseAttendance(course.id);
        return (
          <li key={course.id}>
            <div className="flex items-baseline justify-between gap-2">
              <p className="truncate text-[11.5px] font-medium text-ink">
                {course.code}
                <span className="ml-1 text-[10px] font-normal text-mutedink">{course.title}</span>
              </p>
              <p className="shrink-0 text-[11.5px] font-semibold tabular-nums text-ink">
                {average.toFixed(1)}
                <span className="ml-1 text-[10px] font-medium text-mutedink">{letterFor(average)}</span>
              </p>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-line">
              <div
                className={`h-full rounded-full ${toneFor(average)}`}
                style={{ width: `${Math.max(4, Math.min(100, average))}%` }}
              />
            </div>
            <p className="mt-0.5 text-[10px] text-mutedink">Attendance {attendance}%</p>
          </li>
        );
      })}
    </ul>
  );
}