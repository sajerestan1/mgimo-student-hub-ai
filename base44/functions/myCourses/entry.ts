import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { resolveAcademicIdentity } from '../../shared/student/academicIdentity.ts';

const list = (page) => (Array.isArray(page) ? page : page?.items || []);
const sameEmail = (a, b) => Boolean(a) && Boolean(b) && String(a).toLowerCase() === String(b).toLowerCase();

// Resolves the calling account to its academic profile with service-role reads,
// so the course list never depends on which per-record read rule happens to pass.
// A professor profile is linked only by an exact email match. No unlinked record is
// ever handed to an account that merely holds the professor role: a name or a role
// never stands in for evidence that the profile belongs to this person.
async function findProfessor(svc, user) {
  const linked = list(await svc.entities.Professor.filter({ user_id: user.id }, { limit: 2 }))[0];
  if (linked) return linked;

  const byEmail =
    list(await svc.entities.Professor.filter({ email: user.email }, { limit: 5 })).find((p) => sameEmail(p.email, user.email)) ||
    list(await svc.entities.Professor.list('-created_date', 300)).find((p) => sameEmail(p.email, user.email));
  if (!byEmail) return null;
  if (!byEmail.user_id) await svc.entities.Professor.update(byEmail.id, { user_id: user.id });
  return { ...byEmail, user_id: user.id };
}

// Identity comes from the one shared resolver, so course enrolment, timetable,
// dashboard and the administration register always name the same student.
async function findStudent(svc, user) {
  const identity = await resolveAcademicIdentity(svc, user);
  return identity.student;
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const caller = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!caller) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await req.json().catch(() => ({}));
    const svc = base44.asServiceRole;

    // An administrator may inspect a named account's course resolution, which is
    // data admins already read. Nobody else can name another account.
    const inspecting = Boolean(payload.asEmail) && String(caller.role || '').toLowerCase() === 'admin';
    const readOnly = inspecting && !payload.asUserId;
    const user = inspecting
      ? { ...caller, email: String(payload.asEmail), role: payload.asRole || 'user', id: payload.asUserId || '' }
      : caller;

    const professor = readOnly
      ? list(await svc.entities.Professor.list('-created_date', 300)).find((p) => sameEmail(p.email, user.email)) || null
      : await findProfessor(svc, user);

    if (professor) {
      const rows = list(await svc.entities.Course.filter({ professor_id: professor.id }, { sort: 'code', limit: 100 }));
      const active = rows.filter((course) => course.status !== 'archived');
      const courses = active.filter((course) => course.status === 'published');
      return Response.json({
        role: 'professor',
        professor,
        student: null,
        courses,
        total: active.length,
        reason: courses.length ? 'ok' : 'no_courses',
      });
    }

    let student = readOnly
      ? list(await svc.entities.Student.list('-created_date', 300)).find((s) => sameEmail(s.email, user.email)) || null
      : await findStudent(svc, user);
    // A student record is only ever the one the shared resolver attributes to
    // this account; no arbitrary unclaimed record is adopted here.
    if (!student) {
      return Response.json({ role: 'student', student: null, professor: null, courses: [], reason: 'no_profile' });
    }

    const byStudentId = list(await svc.entities.CourseEnrollment.filter({ student_id: student.id }, { limit: 400 }));
    const byUserId = user.id
      ? list(await svc.entities.CourseEnrollment.filter({ student_user_id: user.id }, { limit: 400 }))
      : [];
    const enrolments = [...new Map([...byStudentId, ...byUserId].map((row) => [row.id, row])).values()];

    if (!readOnly) {
      const unlinked = enrolments.filter((row) => row.student_user_id !== user.id);
      if (unlinked.length) {
        await svc.entities.CourseEnrollment.bulkUpdate(unlinked.map((row) => ({ id: row.id, student_user_id: user.id })));
      }
    }

    const courseIds = [...new Set(enrolments.map((row) => row.course_id).filter(Boolean))];
    if (!courseIds.length) {
      return Response.json({ role: 'student', student, professor: null, courses: [], enrolments: 0, reason: 'no_enrollments' });
    }

    const rows = list(await svc.entities.Course.filter({ id: { $in: courseIds } }, { limit: 200 }));
    const active = rows.filter((course) => course.status !== 'archived');
    const courses = active.filter((course) => course.status === 'published');

    return Response.json({
      role: 'student',
      student,
      professor: null,
      courses,
      enrolments: enrolments.length,
      total: active.length,
      reason: courses.length ? 'ok' : 'no_published_courses',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}