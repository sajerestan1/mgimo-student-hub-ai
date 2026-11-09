import { GraduationCap } from 'lucide-react';
import { longWeekLabel, timeLabel, weekDays } from '@/lib/timetable/week';

const KIND = { lecture: 'Lecture', seminar: 'Seminar', practice: 'Practice' };

/**
 * The printable/exportable weekly sheet. Fixed A4-landscape proportions, the
 * complete Monday–Sunday week, and no on-screen interaction — the same markup
 * is used for PDF, PNG, print and share so they can never drift apart.
 *
 * Its type scale (t-*) is scoped in index.css: this is a document, not
 * interface text, so it keeps its own compact sizes.
 */
export default function TimetableSheet({ sessions, title, subtitle, identity, weekStart }) {
  const days = weekDays(weekStart);
  const byDate = {};
  (sessions || []).forEach((session) => {
    (byDate[session.date] = byDate[session.date] || []).push(session);
  });
  Object.values(byDate).forEach((list) => list.sort((a, b) => String(a.start).localeCompare(String(b.start))));

  const generated = new Date().toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="timetable-sheet w-[1180px] bg-white p-7 font-body text-ink">
      <div className="flex items-start justify-between gap-6 rounded-xl bg-navy px-6 py-5 text-white">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
            <GraduationCap className="h-6 w-6 text-white" strokeWidth={1.8} />
          </span>
          <div>
            <p className="t-15 font-semibold tracking-[-0.01em]">Academic Intelligence</p>
            <p className="t-11 text-white/70">Your University. One Intelligent Platform.</p>
          </div>
        </div>
        <div className="text-right">
          <p className="t-10 font-semibold uppercase tracking-[0.16em] text-white/60">Week</p>
          <p className="t-15 mt-1 font-semibold">{longWeekLabel(weekStart)}</p>
        </div>
      </div>

      <div className="mt-5 flex items-end justify-between gap-6 border-b border-line pb-3">
        <div>
          <h2 className="t-24 font-bold leading-tight tracking-[-0.02em] text-ink">{title}</h2>
          <p className="t-12 mt-1 text-mutedink">{subtitle}</p>
        </div>
        {identity && (
          <p className="t-12 text-right font-medium text-ink">
            Issued to
            <span className="ml-1.5 text-mutedink">{identity}</span>
          </p>
        )}
      </div>

      <div className="mt-4 grid grid-cols-7 gap-2">
        {days.map((day) => {
          const items = byDate[day.iso] || [];
          return (
            <div key={day.iso} className="flex flex-col">
              <div className="rounded-t-md border border-line bg-[#FAFBFD] px-2 py-1.5 text-center">
                <p className="t-10 font-semibold uppercase tracking-[0.1em] text-mutedink">{day.short}</p>
                <p className="t-15 mt-0.5 font-semibold tabular-nums text-ink">
                  {day.day} <span className="t-10 font-medium text-mutedink">{day.month}</span>
                </p>
              </div>
              <div className="flex flex-1 flex-col gap-1.5 rounded-b-md border border-t-0 border-line bg-white px-1.5 py-2">
                {items.map((session) => (
                  <div key={session.id} className="rounded border border-line bg-[#F7F9FD] px-1.5 py-1.5">
                    <p className="t-10 font-semibold tabular-nums text-ink">
                      {timeLabel(session.start)}
                      {session.end ? `–${timeLabel(session.end)}` : ''}
                    </p>
                    <p className="t-10 mt-0.5 font-medium leading-snug text-ink">
                      {session.course_code || session.course_title || 'Class'}
                    </p>
                    {session.course_title && session.course_code && (
                      <p className="t-9 leading-snug text-mutedink">{session.course_title}</p>
                    )}
                    <p className="t-9 mt-0.5 leading-snug text-mutedink">
                      {[KIND[session.kind] || session.kind, session.room].filter(Boolean).join(' · ')}
                    </p>
                    {(session.group_name || session.professor_name) && (
                      <p className="t-9 leading-snug text-mutedink">
                        {[session.group_name, session.professor_name].filter(Boolean).join(' · ')}
                      </p>
                    )}
                  </div>
                ))}
                {!items.length && (
                  <div className="flex flex-1 items-center justify-center rounded border border-dashed border-line px-1 py-4">
                    <p className="t-9 text-center leading-snug text-mutedink">No classes</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="t-9 mt-4 flex items-center justify-between border-t border-line pt-2 text-mutedink">
        <p>Generated {generated} · Source: institutional academic register</p>
        <p>Confidential — issued to the named account. Do not redistribute.</p>
      </div>
    </div>
  );
}