import { GraduationCap } from 'lucide-react';
import { longWeekLabel, timeLabel, weekDays } from '@/lib/timetable/week';

// Kind identity for the exported document: navy, blue and green accents keep
// the sheet inside the institution palette (no new colour system).
const KIND = {
  lecture: { label: 'Lecture', accent: '#14213D', tint: '#F4F6FB' },
  seminar: { label: 'Seminar', accent: '#4F75FF', tint: '#F2F6FF' },
  practice: { label: 'Practice', accent: '#16A085', tint: '#F1FAF7' },
};
const kindMeta = (kind) => KIND[kind] || { label: kind || 'Session', accent: '#64748B', tint: '#F7F9FD' };

/**
 * The printable/exportable weekly sheet. Laid out with tables rather than CSS
 * grid or flex gaps because html2canvas (PDF, PNG, print and share all capture
 * this exact node) renders table geometry reliably and flex gaps poorly.
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
    <div className="timetable-sheet w-[1180px] bg-[#F6F8FC] p-6 font-body text-ink">
      {/* Masthead: navy band, institution mark, the exported week. */}
      <div className="rounded-xl bg-navy px-6 py-5 text-white">
        <table className="w-full border-collapse">
          <tbody>
            <tr>
              <td className="w-[46px] align-middle">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                  <GraduationCap className="h-6 w-6 text-white" strokeWidth={1.8} />
                </span>
              </td>
              <td className="pl-3 align-middle">
                <p className="t-15 font-semibold tracking-[-0.01em]">Academic Intelligence</p>
                <p className="t-11 text-white/70">Weekly timetable · issued from the academic register</p>
              </td>
              <td className="align-middle text-right">
                <p className="t-10 font-semibold uppercase tracking-[0.16em] text-white/60">Week</p>
                <p className="t-15 mt-1 font-semibold">{longWeekLabel(weekStart)}</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Document identity: whose week this is. */}
      <table className="mt-4 w-full border-collapse border-b border-line">
        <tbody>
          <tr>
            <td className="pb-3 align-bottom">
              <h2 className="t-24 font-bold leading-tight tracking-[-0.02em] text-ink">{title}</h2>
              {subtitle && <p className="t-12 mt-1 text-mutedink">{subtitle}</p>}
            </td>
            {identity && (
              <td className="pb-3 text-right align-bottom">
                <p className="t-10 font-semibold uppercase tracking-[0.12em] text-mutedink">Issued to</p>
                <p className="t-12 font-semibold text-ink">{identity}</p>
              </td>
            )}
          </tr>
        </tbody>
      </table>

      {/* The week itself: tinted day headers over white day panels. */}
      <table className="mt-4 w-full table-fixed border-collapse overflow-hidden rounded-lg">
        <thead>
          <tr>
            {days.map((day) => (
              <th key={day.iso} className="w-[14.28%] border border-[#22355C] bg-navy px-1 py-1.5 align-middle">
                <p className="t-10 font-semibold uppercase tracking-[0.1em] text-white/65">{day.short}</p>
                <p className="t-15 font-semibold tabular-nums text-white">
                  {day.day} <span className="t-10 font-medium text-white/60">{day.month}</span>
                </p>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {days.map((day) => {
              const items = byDate[day.iso] || [];
              return (
                <td key={day.iso} className="border border-line bg-white px-1.5 py-2 align-top">
                  {items.map((session) => {
                    const meta = kindMeta(session.kind);
                    return (
                      <div
                        key={session.id}
                        className="mb-1.5 rounded-md border border-line p-1.5"
                        style={{ borderLeft: `3px solid ${meta.accent}`, backgroundColor: meta.tint }}
                      >
                        <p className="t-10 font-semibold tabular-nums text-ink">
                          {timeLabel(session.start)}
                          {session.end ? `–${timeLabel(session.end)}` : ''}
                        </p>
                        <p className="t-10 mt-0.5 font-semibold leading-snug text-ink">
                          {session.course_code || session.course_title || 'Class'}
                        </p>
                        {session.course_title && session.course_code && (
                          <p className="t-9 leading-snug text-ink/70">{session.course_title}</p>
                        )}
                        <p className="t-9 mt-1 font-medium leading-snug" style={{ color: meta.accent }}>
                          {[meta.label, session.room].filter(Boolean).join(' · ')}
                        </p>
                        {(session.group_name || session.professor_name) && (
                          <p className="t-9 leading-snug text-mutedink">
                            {[session.group_name, session.professor_name].filter(Boolean).join(' · ')}
                          </p>
                        )}
                      </div>
                    );
                  })}
                  {!items.length && (
                    <div className="rounded-md border border-dashed border-line px-1 py-5 text-center">
                      <p className="t-9 leading-snug text-mutedink">No classes</p>
                    </div>
                  )}
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>

      {/* Legend and provenance, so a shared image is self-explanatory. */}
      <table className="mt-3 w-full border-collapse rounded-lg border border-line bg-white">
        <tbody>
          <tr>
            <td className="px-3 py-2 align-middle">
              {Object.entries(KIND).map(([key, meta]) => (
                <span key={key} className="mr-3 inline-block">
                  <span
                    className="mr-1.5 inline-block align-middle"
                    style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: meta.accent }}
                  />
                  <span className="t-9 align-middle text-ink/80">{meta.label}</span>
                </span>
              ))}
            </td>
            <td className="px-3 py-2 text-right align-middle">
              <p className="t-9 text-mutedink">Generated {generated}</p>
              <p className="t-9 text-mutedink">Confidential — issued to the named account.</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}