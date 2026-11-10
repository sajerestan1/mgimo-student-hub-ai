import { Link } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';
import Surface from '@/components/shell/Surface';
import PanelTitle from './PanelTitle';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';
import { clock, shortDate, todayISO } from '@/lib/studentPortal';
import { useI18n } from '@/i18n/I18nProvider';

export default function TodaysClasses({ sessions }) {
  const { t, language } = useI18n();
  const today = todayISO();
  const todays = sessions.filter((session) => session.date === today).slice(0, 3);
  const nextDay = sessions
    .filter((session) => session.date > today)
    .map((session) => session.date)
    .sort()[0];
  const upcoming = nextDay ? sessions.filter((session) => session.date === nextDay).slice(0, 3) : [];
  const shown = todays.length ? todays : upcoming;
  const day = todays.length ? today : nextDay;

  const kindLabel = (kind) => {
    const key = `student.dashboard.kinds.${kind}`;
    const label = t(key);
    return label === key ? kind : label;
  };

  return (
    <Surface
      className="h-full"
      title={
        <PanelTitle icon={CalendarDays} tone="brand">
          {todays.length ? t('student.dashboard.todaySchedule') : t('student.dashboard.nextClasses')}
        </PanelTitle>
      }
      subtitle={
        day
          ? shortDate(day, { weekday: 'long', day: 'numeric', month: 'long' }, language)
          : t('student.dashboard.noSessionsPublished')
      }
      action={
        <Link
          to={P.student.timetable}
          className="inline-flex shrink-0 items-center gap-1 text-[length:var(--type-meta)] font-medium text-[#2563EB] transition-colors hover:text-[#1D4ED8]"
        >
          {t('student.dashboard.viewAll')}
        </Link>
      }
      bodyClassName={shown.length ? 'px-0 pb-0 pt-0' : undefined}
    >
      {shown.length ? (
        <ul className="divide-y divide-line">
          {shown.map((session) => (
            <li key={session.id} className="flex items-start gap-3 px-5 py-3">
              <div className="w-14 shrink-0 text-[length:var(--type-secondary)] font-semibold tabular-nums text-ink">
                {clock(session.start)}
                {session.end && <p className="mt-0.5 text-[length:var(--type-meta)] font-normal text-mutedink">{clock(session.end)}</p>}
              </div>
              <div className="min-w-0">
                <p className="truncate text-[length:var(--type-secondary)] font-medium text-ink">
                  {session.courseCode} · {session.courseTitle}
                </p>
                <p className="mt-0.5 truncate text-[length:var(--type-meta)] text-mutedink">
                  {[kindLabel(session.kind), session.room || t('student.dashboard.roomNotSet')].join(' · ')}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[length:var(--type-secondary)] leading-relaxed text-mutedink">{t('student.dashboard.noSessions')}</p>
      )}
    </Surface>
  );
}