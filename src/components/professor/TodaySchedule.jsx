import { Link } from 'react-router-dom';
import Surface from '@/components/shell/Surface';
import StatusChip from '@/components/shell/StatusChip';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';
import { todayIso } from '@/lib/professorData';

const nowMinutes = () => {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
};
const toMinutes = (time = '00:00') => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + (m || 0);
};

function statusFor(session) {
  const start = toMinutes(session.start_time);
  const end = toMinutes(session.end_time);
  const now = nowMinutes();
  if (session.session_date !== todayIso()) return { label: 'Scheduled', tone: 'neutral' };
  if (now > end) return { label: session.attendance_taken ? 'Completed' : 'Ended', tone: session.attendance_taken ? 'positive' : 'warning' };
  if (now >= start) return { label: 'In progress', tone: 'brand' };
  return { label: 'Upcoming today', tone: 'neutral' };
}

export default function TodaySchedule({ sessions }) {
  return (
    <Surface
      title="Today's teaching schedule"
      subtitle={sessions.length ? `${sessions.length} class${sessions.length === 1 ? '' : 'es'} on your timetable` : 'No classes scheduled today'}
      action={
        <Link to={P.professor.teaching} className="link-quiet">
          Full teaching week
        </Link>
      }
      bodyClassName="px-0 pb-0 pt-1"
    >
      {sessions.length === 0 && (
        <p className="px-5 py-6 text-[11.5px] text-mutedink">
          Nothing on the timetable today. Your next sessions appear under My Teaching.
        </p>
      )}
      <ul className="divide-y divide-line">
        {sessions.map((session) => {
          const status = statusFor(session);
          return (
            <li key={session.id} className="row-hover px-5 py-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-[12.5px] font-semibold text-ink">{session.course_code}</p>
                    <StatusChip tone={status.tone}>{status.label}</StatusChip>
                  </div>
                  <p className="mt-0.5 truncate text-[11px] text-mutedink">
                    {session.start_time}–{session.end_time} · {session.room} · Group {session.group_name}
                  </p>
                  <p className="mt-0.5 truncate text-[10.5px] text-mutedink">{session.topic}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <Link to={`${P.professor.attendance}?session=${session.id}`} className="btn-quiet btn-sm">
                    Attendance
                  </Link>
                  <Link to={`${P.professor.courses}?course=${session.course_id}`} className="btn-quiet btn-sm">
                    Course
                  </Link>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </Surface>
  );
}