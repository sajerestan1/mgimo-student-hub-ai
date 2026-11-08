import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PageTitle from '@/components/shell/PageTitle';
import { clock, loadStudentPortal, sessionsOn, todayISO } from '@/lib/studentPortal';

const KIND_LABEL = { lecture: 'Lecture', seminar: 'Seminar', practice: 'Practice' };
const DAY_MS = 86400000;

const isoOf = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const fromISO = (value) => {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const addDays = (date, days) => new Date(date.getTime() + days * DAY_MS);

const startOfWeek = (date) => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() - ((copy.getDay() + 6) % 7));
  return copy;
};

const longDate = (iso) =>
  fromISO(iso).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

const shortDay = (iso) =>
  fromISO(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

function SessionRow({ session }) {
  return (
    <li className="flex items-start gap-3 px-5 py-3">
      <div className="w-14 shrink-0 text-[14px] font-semibold tabular-nums text-ink">
        {clock(session.start)}
        {session.end && <p className="text-[12px] font-normal text-mutedink">{clock(session.end)}</p>}
      </div>
      <div className="min-w-0">
        <p className="text-[15px] font-medium text-ink">
          {session.courseCode} · {session.courseTitle}
        </p>
        <p className="mt-0.5 text-[13px] text-mutedink">
          {[KIND_LABEL[session.kind] || session.kind, session.room || 'Room not set'].join(' · ')}
          {session.topic ? ` · ${session.topic}` : ''}
        </p>
      </div>
    </li>
  );
}

export default function TimetablePage() {
  const [context, setContext] = useState(null);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('week');
  const [anchor, setAnchor] = useState(todayISO());

  useEffect(() => {
    loadStudentPortal()
      .then(setContext)
      .catch(() => setError('Your timetable could not be loaded. Please refresh the page.'));
  }, []);

  const days = useMemo(() => {
    const base = fromISO(anchor);
    if (mode === 'day') return [anchor];
    const monday = startOfWeek(base);
    return Array.from({ length: 7 }, (_, index) => isoOf(addDays(monday, index)));
  }, [anchor, mode]);

  if (error) return <p className="card-surface px-5 py-6 text-[15px] text-critical">{error}</p>;
  if (!context) return <div className="h-64 animate-pulse rounded-xl bg-white" />;

  const today = todayISO();
  const shift = (direction) => setAnchor(isoOf(addDays(fromISO(anchor), direction * (mode === 'day' ? 1 : 7))));
  const rangeLabel = mode === 'day' ? longDate(anchor) : `${shortDay(days[0])} – ${shortDay(days[6])}`;
  const weekCount = days.reduce((sum, day) => sum + sessionsOn(context, day).length, 0);

  return (
    <div>
      <PageTitle
        eyebrow="Student workspace"
        title="Timetable"
        description="Your published teaching sessions. Sessions are created by the faculty and update centrally."
        meta={[rangeLabel, `${weekCount} session${weekCount === 1 ? '' : 's'} in view`]}
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex rounded-lg border border-line bg-white p-0.5">
          {[
            ['day', 'Day'],
            ['week', 'Week'],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setMode(key)}
              className={`rounded-md px-3 py-1.5 text-[14px] font-medium transition-colors ${
                mode === key ? 'bg-royal text-white' : 'text-ink hover:bg-canvas'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => shift(-1)} className="icon-btn" aria-label="Previous">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => setAnchor(today)} className="btn-quiet btn-sm">
            Today
          </button>
          <button type="button" onClick={() => shift(1)} className="icon-btn" aria-label="Next">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {days.map((day) => {
          const sessions = sessionsOn(context, day);
          const isToday = day === today;
          return (
            <section key={day} className="card-surface overflow-hidden">
              <header
                className={`flex items-center justify-between border-b border-line px-5 py-2.5 ${
                  isToday ? 'bg-royal/5' : ''
                }`}
              >
                <p className="text-[14px] font-semibold text-ink">
                  {shortDay(day)}
                  {isToday && <span className="ml-2 text-[13px] font-medium text-royal">Today</span>}
                </p>
                <p className="text-[13px] text-mutedink">
                  {sessions.length ? `${sessions.length} session${sessions.length === 1 ? '' : 's'}` : 'No classes'}
                </p>
              </header>
              {sessions.length ? (
                <ul className="divide-y divide-line">
                  {sessions.map((session) => (
                    <SessionRow key={session.id} session={session} />
                  ))}
                </ul>
              ) : (
                <p className="px-5 py-3 text-[14px] text-mutedink">Nothing scheduled.</p>
              )}
            </section>
          );
        })}
      </div>

      {!context.sessions.length && (
        <p className="mt-4 rounded-lg border border-line bg-white px-4 py-3 text-[14px] leading-relaxed text-mutedink">
          No sessions have been published for your courses yet. Your timetable appears here as soon as the faculty
          publishes it.
        </p>
      )}
    </div>
  );
}