import PageTitle from '@/components/shell/PageTitle';
import { COURSES, TODAY_INDEX, TIMETABLE, courseById, weekdayName, STUDENT } from '@/lib/studentWorkspace';

const DAYS = [1, 2, 3, 4, 5, 6];

export default function TimetablePage() {
  return (
    <div>
      <PageTitle
        eyebrow="Student workspace"
        title="Timetable"
        description="Your teaching week for the current semester. Sessions are published by the faculty and update centrally."
        meta={[STUDENT.semester, '12 weekly sessions', `${COURSES.length} courses`, 'Mon–Sat']}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {DAYS.map((day) => {
          const sessions = TIMETABLE.filter((session) => session.weekday === day).sort((a, b) =>
            a.start.localeCompare(b.start)
          );
          const isToday = day === TODAY_INDEX;
          return (
            <section key={day} className={`card-surface overflow-hidden ${isToday ? 'ring-1 ring-royal/30' : ''}`}>
              <header className="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
                <p className="text-[12.5px] font-semibold text-ink">{weekdayName(day)}</p>
                {isToday ? (
                  <span className="rounded bg-royal px-1.5 py-0.5 text-[10px] font-medium text-white">Today</span>
                ) : (
                  <span className="text-[10.5px] text-mutedink">{sessions.length} sessions</span>
                )}
              </header>
              {sessions.length === 0 ? (
                <p className="px-4 py-6 text-center text-[11.5px] text-mutedink">No teaching sessions.</p>
              ) : (
                <ul className="divide-y divide-line">
                  {sessions.map((session) => {
                    const course = courseById(session.courseId);
                    return (
                      <li key={session.id} className="px-4 py-3">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="text-[12px] font-semibold tabular-nums text-ink">
                            {session.start}–{session.end}
                          </p>
                          <span className="shrink-0 rounded px-1.5 py-0.5 text-[10px] text-mutedink ring-1 ring-line">
                            {session.kind}
                          </span>
                        </div>
                        <p className="mt-1 text-[12px] font-medium leading-snug text-ink">
                          {course.code} · {course.title}
                        </p>
                        <p className="mt-0.5 text-[10.5px] text-mutedink">
                          {course.lecturer} · {session.room}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}
      </div>

      <p className="mt-4 rounded-lg border border-line bg-white px-4 py-3 text-[11px] leading-relaxed text-mutedink">
        This timetable is fictional demonstration data held in the prototype. In production it is read from the
        faculty’s scheduling record, so room changes appear here without a separate notification.
      </p>
    </div>
  );
}