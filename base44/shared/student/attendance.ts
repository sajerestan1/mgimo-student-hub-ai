// One attendance counting rule for every student surface.
//
// The register can hold more than one row for the same course on the same day
// (a corrected register, a re-taken roll call). Counting those rows directly
// inflates both the number of classes held and the number of absences, so the
// portal reads attendance through this module only.

export const ATTENDANCE_STATUS_RANK = { present: 3, late: 2, excused: 1, absent: 0 };

export const dayOf = (value) => String(value || '').slice(0, 10);

/**
 * One entry per course per day.
 *
 * - A duplicated row can never create a second absence: the most favourable
 *   recorded outcome wins, so a correction to "present" is not overruled by an
 *   older "absent" row.
 * - A status outside the four known outcomes (for example a cancelled session
 *   recorded as "cancelled") is dropped: a class that was not held is neither
 *   attended nor missed.
 */
export function dedupeAttendanceRecords(rows) {
  const seen = new Map();
  (rows || []).forEach((row) => {
    const status = String(row?.status || '').toLowerCase();
    if (!(status in ATTENDANCE_STATUS_RANK)) return;
    const key = `${row.course_id || '—'}|${dayOf(row.session_date)}`;
    const current = seen.get(key);
    if (!current || ATTENDANCE_STATUS_RANK[status] > ATTENDANCE_STATUS_RANK[String(current.status).toLowerCase()]) {
      seen.set(key, { ...row, status });
    }
  });
  return [...seen.values()];
}

export function attendanceTotals(rows) {
  const totals = { present: 0, late: 0, excused: 0, absent: 0 };
  (rows || []).forEach((row) => {
    const status = String(row.status || '').toLowerCase();
    if (status in totals) totals[status] += 1;
  });
  const held = totals.present + totals.late + totals.excused + totals.absent;
  const attended = totals.present + totals.late + totals.excused;
  return { ...totals, held, attended, rate: held ? Math.round((attended / held) * 100) : null };
}