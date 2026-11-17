import { base44 } from '@/api/base44Client';
import { getDemoUser } from '@/lib/demoAuth';
import { loadStudentPortal } from '@/lib/studentPortal';
import { addDays, isoOf, mondayOf, parseISO } from '@/lib/timetable/week';

// Demo students share the same weekly pattern as the dashboard. The pattern
// repeats when a student browses another week; production remains server-authorised.
export async function fetchTimetable(weekStart) {
  if (import.meta.env.VITE_DEMO_MODE === 'true') {
    const user = getDemoUser();
    const student = user?.role === 'student';
    const professor = user?.role === 'professor';
    if (student) {
      const context = await loadStudentPortal();
      const courseByCode = new Map((context.courses || []).map((course) => [course.code, course]));
      const sessions = (context.sessions || []).map((session) => {
        const currentWeek = parseISO(mondayOf(session.date));
        const sessionDate = parseISO(session.date);
        const dayOffset = Math.round((sessionDate - currentWeek) / 86400000);
        const date = isoOf(addDays(parseISO(weekStart), dayOffset));
        return {
          id: session.id,
          date,
          start: session.start,
          end: session.end,
          course_code: session.courseCode,
          course_title: session.courseTitle,
          room: session.room,
          kind: session.kind,
          professor_name: courseByCode.get(session.courseCode)?.professor || null,
        };
      });
      return {
        sessions,
        subtitle: 'Your scheduled week · Demo data',
        scope_note: context.scopeNote || null,
        identity: context.profile?.full_name || user.full_name || 'Demo student',
      };
    }
    const sessions = [
      { id: 'demo-s1', date: weekStart, start: '09:30', end: '11:00', courseCode: 'IR-201', courseTitle: 'Theory of International Relations', room: 'Room 304', kind: 'lecture' },
      { id: 'demo-s2', date: weekStart, start: '11:30', end: '13:00', courseCode: 'IE-201', courseTitle: 'World Economy', room: 'Room 218', kind: 'seminar' },
      { id: 'demo-s3', date: weekStart, start: '14:00', end: '15:30', courseCode: 'LW-201', courseTitle: 'Public International Law', room: 'Room 112', kind: 'lecture' },
      { id: 'demo-s4', date: weekStart, start: '16:00', end: '17:30', courseCode: 'IR-201', courseTitle: 'Foreign Policy Workshop', room: 'Room 405', kind: 'practice' },
      { id: 'demo-s5', date: weekStart, start: '10:00', end: '11:30', courseCode: 'IR-201', courseTitle: 'Academic Seminar', room: 'Room 304', kind: 'seminar' },
    ];
    return { sessions: professor ? sessions : [], subtitle: 'Sample academic week · Demo data', scope_note: null, identity: user?.full_name || 'Demo account' };
  }
  const response = await base44.functions.invoke('workspaceTimetable', { week_start: weekStart });
  const data = response?.data || {};
  if (data.error) throw new Error(data.error);
  if (!Array.isArray(data.sessions)) throw new Error('The timetable could not be read.');
  return data;
}
