// Pure date helpers for the weekly timetable. Weeks run Monday → Sunday.

export const DAY_MS = 86400000;

export const isoOf = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export const parseISO = (value) => {
  const [y, m, d] = String(value || '').split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};

export const addDays = (date, days) => new Date(date.getTime() + days * DAY_MS);

export const mondayOf = (value) => {
  const base = value ? parseISO(value) : new Date();
  const clean = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  clean.setDate(clean.getDate() - ((clean.getDay() + 6) % 7));
  return isoOf(clean);
};

export const shiftWeek = (weekStart, weeks) => isoOf(addDays(parseISO(weekStart), weeks * 7));

export const weekDays = (weekStart) =>
  Array.from({ length: 7 }, (_, index) => {
    const date = addDays(parseISO(weekStart), index);
    return {
      iso: isoOf(date),
      weekday: date.toLocaleDateString('en-GB', { weekday: 'long' }),
      short: date.toLocaleDateString('en-GB', { weekday: 'short' }),
      day: date.getDate(),
      month: date.toLocaleDateString('en-GB', { month: 'short' }),
      monthLong: date.toLocaleDateString('en-GB', { month: 'long' }),
    };
  });

export const weekRange = (weekStart) => {
  const days = weekDays(weekStart);
  return { from: days[0].iso, to: days[6].iso };
};

export const weekLabel = (weekStart) => {
  const days = weekDays(weekStart);
  const first = days[0];
  const last = days[6];
  return `${first.short} ${first.day} ${first.month} – ${last.short} ${last.day} ${last.month} ${parseISO(last.iso).getFullYear()}`;
};

export const longWeekLabel = (weekStart) => {
  const days = weekDays(weekStart);
  const first = days[0];
  const last = days[6];
  return `${first.day} ${first.monthLong} – ${last.day} ${last.monthLong} ${parseISO(last.iso).getFullYear()}`;
};

export const shortDate = (iso) => {
  const date = parseISO(iso);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

export const timeLabel = (value) => (value ? String(value).slice(0, 5) : '');