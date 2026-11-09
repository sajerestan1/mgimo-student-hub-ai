import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { DEAN_ROLES } from '../../shared/dean/dataset.ts';

// The caller's own weekly schedule. Identity and role are resolved from the
// authenticated session — never from the request body — so a browser cannot ask
// for somebody else's week, another professor's teaching, or a wider scope.
// This endpoint is read-only: nothing here writes to the academic register.

const DAY_MS = 86400000;
const list = (page) => (Array.isArray(page) ? page : page?.items || []);

const isoOf = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const parseISO = (value) => {
  const [y, m, d] = String(value).split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};

const mondayOf = (value) => {
  const base = value ? parseISO(value) : new Date();
  const clean = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  clean.setDate(clean.getDate() - ((clean.getDay() + 6) % 7));
  return clean;
};

const addDays = (date, days) => new Date(date.getTime() + days * DAY_MS);

const sameEmail = (a, b) => String(a || '').toLowerCase().trim() === String(b || '').toLowerCase().trim();

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const sr = base44.asServiceRole;
    const body = await req.json().catch(() => ({}));
    const weekStart = mondayOf(body.week_start);
    const from = isoOf(weekStart);
    const to = isoOf(addDays(weekStart, 6));
    const range = { $gte: from, $lte: to };

    const role = String(user.role || '').toLowerCase();
    let rows = [];
    let meta = {};

    if (role === 'student') {
      const student = list(await sr.entities.Student.filter({ user_id: user.id }, { limit: 1 }))[0];
      if (!student) {
        return Response.json(
          { error: 'Your account is not linked to a student record yet. Contact the student office.' },
          { status: 403 },
        );
      }
      const enrolments = list(await sr.entities.CourseEnrollment.filter({ student_id: student.id }, { limit: 150 }));
      const courseIds = [...new Set(enrolments.map((row) => row.course_id).filter(Boolean))];
      if (courseIds.length) {
        const week = list(
          await sr.entities.ClassSession.filter(
            { course_id: { $in: courseIds }, session_date: range },
            { sort: 'session_date', limit: 150 },
          ),
        );
        // A course is taught separately to each class group, so the student's
        // week is their own group's meetings — never another cohort's.
        rows = week.filter((row) => !row.group_name || row.group_name === student.group_name);
      }
      meta = {
        workspace: 'student',
        title: 'Weekly timetable',
        subtitle: student.group_name ? `Group ${student.group_name}` : 'Your enrolled courses',
        identity: student.full_name || user.full_name || '',
        group: student.group_name || '',
        scope_note: 'Your own enrolled classes only.',
      };
    } else if (role === 'professor') {
      let professor = list(await sr.entities.Professor.filter({ user_id: user.id }, { limit: 1 }))[0];
      if (!professor) {
        const byEmail = list(await sr.entities.Professor.filter({ email: user.email }, { limit: 5 }))[0];
        professor = byEmail || null;
      }
      if (!professor) {
        return Response.json(
          { error: 'Your account is not linked to a teaching record yet. Contact your department office.' },
          { status: 403 },
        );
      }
      rows = list(
        await sr.entities.ClassSession.filter(
          { professor_id: professor.id, session_date: range },
          { sort: 'session_date', limit: 150 },
        ),
      );
      meta = {
        workspace: 'professor',
        title: 'Teaching timetable',
        subtitle: 'Your own scheduled classes',
        identity: professor.full_name || user.full_name || '',
        group: '',
        scope_note: 'Your own teaching sessions only.',
      };
    } else if (DEAN_ROLES.includes(role)) {
      // Administrative scope is decided here from the account, not from input.
      let facultyId = '';
      let departmentId = '';
      let label = 'the whole institution';
      if (role === 'faculty_admin' && user.faculty_id) {
        facultyId = user.faculty_id;
        label = 'your faculty';
      } else if (role === 'department_head' && user.department_id) {
        departmentId = user.department_id;
        label = 'your department';
      }

      const courses = list(await sr.entities.Course.list('-created_date', 500));
      const scopedCourses = courses.filter((course) => {
        if (facultyId) return course.faculty_id === facultyId;
        if (departmentId) return course.department_id === departmentId;
        return true;
      });
      const courseIds = scopedCourses.map((course) => course.id).filter(Boolean);
      if (courseIds.length) {
        rows = list(
          await sr.entities.ClassSession.filter(
            { course_id: { $in: courseIds }, session_date: range },
            { sort: 'session_date', limit: 400 },
          ),
        );
      }
      meta = {
        workspace: 'administration',
        title: 'Institutional timetable',
        subtitle: `Teaching schedule for ${label}`,
        identity: user.full_name || '',
        group: '',
        scope_note: `Scoped to ${label}. Class groups only — no student records.`,
      };
    } else {
      return Response.json({ error: 'This timetable is not available for your account.' }, { status: 403 });
    }

    // Course titles live on the session; professor names are resolved once for
    // the sessions the caller is already entitled to see.
    const professorIds = [...new Set(rows.map((row) => row.professor_id).filter(Boolean))];
    const professorNames = {};
    if (professorIds.length) {
      const professors = list(
        await sr.entities.Professor.filter({ id: { $in: professorIds } }, { limit: 100 }),
      );
      professors.forEach((person) => {
        professorNames[person.id] = person.full_name || '';
      });
    }

    const sessions = rows.map((row) => ({
      id: row.id,
      date: row.session_date,
      start: row.start_time || '',
      end: row.end_time || '',
      room: row.room || '',
      kind: row.kind || 'lecture',
      course_code: row.course_code || '',
      course_title: row.course_title || '',
      topic: row.topic || '',
      group_name: row.group_name || '',
      professor_name: professorNames[row.professor_id] || '',
    }));

    return Response.json({
      ...meta,
      week_start: from,
      week_end: to,
      sessions,
      generated_at: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}