import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageTitle from '@/components/shell/PageTitle';
import Surface from '@/components/shell/Surface';
import StatusChip from '@/components/shell/StatusChip';
import { base44 } from '@/api/base44Client';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';
import { useProfessorContext, dateLabel, dayDiff, todayIso } from '@/lib/professorData';

export default function MyTeachingPage() {
  const { professor, courses } = useProfessorContext();
  const [sessions, setSessions] = useState(null);

  useEffect(() => {
    if (!professor) return;
    base44.entities.ClassSession.filter({ professor_id: professor.id }, { sort: 'session_date', limit: 120 })
      .then((page) => setSessions(page.items || []));
  }, [professor?.id]);

  if (!sessions) return <p className="py-10 text-center text-[12px] text-mutedink">Loading your teaching week…</p>;

  const today = sessions.filter((s) => s.session_date === todayIso());
  const upcoming = sessions.filter((s) => dayDiff(s.session_date) > 0).slice(0, 8);
  const past = sessions.filter((s) => dayDiff(s.session_date) < 0).slice(-12).reverse();

  const Row = ({ session, showDate }) => (
    <li className="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="truncate text-[12.5px] font-medium text-ink">
          {session.course_code} · {session.course_title}
        </p>
        <p className="mt-0.5 text-[10.5px] text-mutedink">
          {showDate ? `${dateLabel(session.session_date)} · ` : ''}
          {session.start_time}–{session.end_time} · {session.room} · Group {session.group_name} · {session.kind}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <StatusChip tone={session.attendance_taken ? 'positive' : 'warning'}>
          {session.attendance_taken ? 'Attendance recorded' : 'Attendance open'}
        </StatusChip>
        <Link to={`${P.professor.attendance}?session=${session.id}`} className="btn-quiet btn-sm">Mark</Link>
      </div>
    </li>
  );

  return (
    <div>
      <PageTitle
        eyebrow="Professor workspace"
        title="My teaching"
        description="Every scheduled class across your courses, with the attendance state of each session."
        meta={[`${courses.length} courses`, `${sessions.length} sessions on record`, `Today: ${today.length} classes`]}
        actions={<Link to={P.professor.courses} className="btn-quiet">My courses</Link>}
      />

      <div className="space-y-4">
        <Surface title="Today" subtitle={today.length ? 'Your classes for today' : 'No classes today'} bodyClassName="px-0 pb-0 pt-1">
          <ul className="divide-y divide-line">
            {today.map((s) => <Row key={s.id} session={s} />)}
            {!today.length && <li className="px-5 py-6 text-[11.5px] text-mutedink">Nothing scheduled today. The next sessions are listed below.</li>}
          </ul>
        </Surface>

        <Surface title="Upcoming" subtitle="Next two weeks of teaching" bodyClassName="px-0 pb-0 pt-1">
          <ul className="divide-y divide-line">
            {upcoming.map((s) => <Row key={s.id} session={s} showDate />)}
            {!upcoming.length && <li className="px-5 py-6 text-[11.5px] text-mutedink">No future sessions are scheduled.</li>}
          </ul>
        </Surface>

        <Surface title="Recently taught" subtitle="Latest completed sessions" bodyClassName="px-0 pb-0 pt-1">
          <ul className="divide-y divide-line">
            {past.map((s) => <Row key={s.id} session={s} showDate />)}
          </ul>
        </Surface>
      </div>
    </div>
  );
}