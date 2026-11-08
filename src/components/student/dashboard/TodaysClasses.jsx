import { Link } from 'react-router-dom';
import Surface from '@/components/shell/Surface';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';
import { clock, shortDate, todayISO } from '@/lib/studentPortal';

const KIND_LABEL = { lecture: 'Lecture', seminar: 'Seminar', practice: 'Practice' };

export default function TodaysClasses({ sessions }) {
  const today = todayISO();
  const todays = sessions.filter((session) => session.date === today).slice(0, 3);
  const nextDay = sessions
    .filter((session) => session.date > today)
    .map((session) => session.date)
    .sort()[0];
  const upcoming = nextDay ? sessions.filter((session) => session.date === nextDay).slice(0, 3) : [];
  const shown = todays.length ? todays : upcoming;
  const day = todays.length ? today : nextDay;

  return (
    <Surface
      title={todays.length ? "Today's schedule" : 'Next classes'}
      subtitle={day ? shortDate(day, { weekday: 'long', day: 'numeric', month: 'long' }) : 'No sessions published'}
      action={
        <Link to={P.student.timetable} className="link-quiet text-[14px]">
          View all
        </Link>
      }
      bodyClassName={shown.length ? 'px-0 pb-0 pt-0' : undefined}
    >
      {shown.length ? (
        <ul className="divide-y divide-line">
          {shown.map((session) => (
            <li key={session.id} className="flex items-start gap-3 px-5 py-3">
              <div className="w-14 shrink-0 text-[14px] font-semibold tabular-nums text-ink">
                {clock(session.start)}
                {session.end && <p className="text-[12px] font-normal text-mutedink">{clock(session.end)}</p>}
              </div>
              <div className="min-w-0">
                <p className="truncate text-[15px] font-medium text-ink">
                  {session.courseCode} · {session.courseTitle}
                </p>
                <p className="mt-0.5 text-[13px] text-mutedink">
                  {[KIND_LABEL[session.kind] || session.kind, session.room || 'Room not set'].join(' · ')}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[14px] leading-relaxed text-mutedink">
          No sessions have been published for your courses. Your timetable fills in as the faculty publishes it.
        </p>
      )}
    </Surface>
  );
}