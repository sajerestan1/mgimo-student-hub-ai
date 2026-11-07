import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import Surface from '@/components/shell/Surface';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';
import { TODAY_SESSIONS, NEXT_SESSION, weekdayName, TODAY_INDEX, formatDate, isoIn } from '@/lib/studentWorkspace';

function statusFor(session) {
  const now = new Date();
  const [endHour, endMinute] = session.end.split(':').map(Number);
  const ends = new Date();
  ends.setHours(endHour, endMinute, 0, 0);
  if (now > ends) return { label: 'Finished', tone: 'neutral' };
  const [startHour, startMinute] = session.start.split(':').map(Number);
  const starts = new Date();
  starts.setHours(startHour, startMinute, 0, 0);
  if (now >= starts) return { label: 'In session', tone: 'positive' };
  return { label: 'Scheduled', tone: 'brand' };
}

const TONES = {
  neutral: 'bg-[#F2F4F8] text-[#5A6779]',
  positive: 'bg-[#E6F5F1] text-[#0F7B66]',
  brand: 'bg-[#EEEBFE] text-[#5B4DEB]',
};

export default function TodayScheduleCard() {
  return (
    <Surface
      title="Today's schedule"
      subtitle={`${weekdayName(TODAY_INDEX)}, ${formatDate(isoIn(0), { day: 'numeric', month: 'long' })}`}
      action={
        <Link to={P.student.timetable} className="link-quiet">
          Full timetable
        </Link>
      }
      bodyClassName="px-5 pb-5 pt-1"
    >
      {TODAY_SESSIONS.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
          <Clock className="h-5 w-5 text-mutedink/70" />
          <p className="text-[12.5px] font-medium text-ink">No classes today</p>
          <p className="text-[11px] text-mutedink">
            {NEXT_SESSION
              ? `Next session: ${weekdayName(NEXT_SESSION.weekday)} ${NEXT_SESSION.start} · ${NEXT_SESSION.course.code} ${NEXT_SESSION.course.title}`
              : 'No teaching sessions are scheduled this week.'}
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-line">
          {TODAY_SESSIONS.map((session) => {
            const status = statusFor(session);
            return (
              <li key={session.id} className="flex gap-3 py-3">
                <div className="w-[86px] shrink-0">
                  <p className="text-[12.5px] font-semibold tabular-nums text-ink">{session.start}</p>
                  <p className="text-[10.5px] tabular-nums text-mutedink">{session.end}</p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12.5px] font-medium text-ink">
                    {session.course.code} · {session.course.title}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-mutedink">
                    {session.course.lecturer} · {session.room}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <span className="rounded px-1.5 py-0.5 text-[10px] font-medium text-mutedink ring-1 ring-line">
                      {session.kind}
                    </span>
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${TONES[status.tone]}`}>
                      {status.label}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Surface>
  );
}