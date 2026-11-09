// Weekly timetable generation for the demonstration dataset.
//
// Sessions are placed by a deterministic allocator that checks three
// constraints at once — the class group, the professor and the room are never
// booked twice in the same slot — so the resulting register contains no
// conflicts and every student's week is internally consistent.

export const SLOTS = [
  ['09:00', '10:30'],
  ['10:45', '12:15'],
  ['13:00', '14:30'],
  ['14:45', '16:15'],
  ['16:30', '18:00'],
];

export const ROOMS = {
  IR: ['214', '307', 'Senate Hall 2', 'A-204'],
  IER: ['118', '212', 'B-112', 'Conference Room 3'],
};

const KINDS = ['lecture', 'seminar', 'practice'];
const DAY_COUNT = 5;
const SLOT_COUNT = SLOTS.length;
const GRID = DAY_COUNT * SLOT_COUNT;

const isoOf = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const mondayOf = (value = new Date()) => {
  const base = new Date(value.getFullYear(), value.getMonth(), value.getDate());
  base.setDate(base.getDate() - ((base.getDay() + 6) % 7));
  return base;
};

const addDays = (date, days) => {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  next.setDate(next.getDate() + days);
  return next;
};

// entries: [{ courseId, courseCode, courseTitle, professorId, group, faculty, sessions, topicFor }]
// Returns one row per individual class meeting across the requested weeks.
export function buildWeeklySessions(entries, weekOffsets) {
  const groupBusy = new Map();
  const professorBusy = new Map();
  const roomBusy = new Map();

  const claim = (map, key, value) => {
    if (!map.has(key)) map.set(key, new Set());
    map.get(key).add(value);
  };
  const taken = (map, key, value) => Boolean(map.get(key)?.has(value));

  const pattern = [];

  entries.forEach((entry, entryIndex) => {
    let placed = 0;
    const start = (entryIndex * 3) % GRID;
    for (let step = 0; step < GRID && placed < entry.sessions; step += 1) {
      const cell = (start + step) % GRID;
      const day = Math.floor(cell / SLOT_COUNT);
      const slot = cell % SLOT_COUNT;
      const slotKey = `${day}-${slot}`;
      if (taken(groupBusy, entry.group, slotKey)) continue;
      if (taken(professorBusy, entry.professorId, slotKey)) continue;
      const room = (ROOMS[entry.faculty] || ROOMS.IR).find(
        (candidate) => !taken(roomBusy, `${slotKey}`, candidate),
      );
      if (!room) continue;
      claim(groupBusy, entry.group, slotKey);
      claim(professorBusy, entry.professorId, slotKey);
      claim(roomBusy, slotKey, room);
      pattern.push({
        entry,
        day,
        slot,
        room,
        kind: entry.kinds ? entry.kinds[placed % entry.kinds.length] : KINDS[placed % KINDS.length],
      });
      placed += 1;
    }
  });

  const monday = mondayOf(new Date());
  const rows = [];
  weekOffsets.forEach((offset) => {
    const weekStart = addDays(monday, offset * 7);
    pattern.forEach((item) => {
      const date = addDays(weekStart, item.day);
      rows.push({
        course_id: item.entry.courseId,
        course_code: item.entry.courseCode,
        course_title: item.entry.courseTitle,
        professor_id: item.entry.professorId,
        group_name: item.entry.group,
        session_date: isoOf(date),
        start_time: SLOTS[item.slot][0],
        end_time: SLOTS[item.slot][1],
        room: item.room,
        topic: item.entry.topicFor ? item.entry.topicFor(item.day) : '',
        kind: item.kind,
        attendance_taken: isoOf(date) < isoOf(new Date()),
        is_demo: true,
      });
    });
  });

  return rows;
}