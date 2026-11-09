import { base44 } from '@/api/base44Client';

// The only source of timetable data: a server-resolved week for the signed-in
// account. The browser sends a week, never an identity, role, student id or
// professor id — the endpoint decides what this caller may see.
export async function fetchTimetable(weekStart) {
  const response = await base44.functions.invoke('workspaceTimetable', { week_start: weekStart });
  const data = response?.data || {};
  if (data.error) throw new Error(data.error);
  if (!Array.isArray(data.sessions)) throw new Error('The timetable could not be read.');
  return data;
}