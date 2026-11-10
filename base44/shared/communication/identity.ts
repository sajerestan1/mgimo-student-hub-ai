// Who the caller is, resolved from the verified session and the institutional
// records on every request. Nothing here ever reads a role, id or group that
// the browser supplied: the request body carries resource ids only, and every
// one of them is checked against this resolved identity.
import { list } from './util.ts';
import { resolveAcademicIdentity } from '../student/academicIdentity.ts';

export const STAFF_ROLES = ['admin', 'dean', 'deputy_dean', 'academic_staff'];
export const MODERATOR_ROLES = ['admin', 'dean', 'deputy_dean'];
export const GOVERNANCE_ROLES = ['admin', 'dean'];
export const BLOCKED_STATUSES = ['suspended', 'deactivated'];

export async function resolveIdentity(svc, user) {
  const record = await svc.entities.User.get(user.id).catch((e) => (e.status === 404 ? null : Promise.reject(e)));
  const role = record?.role || user.role || 'user';
  const status = record?.account_status || 'active';

  const identity = {
    id: user.id,
    email: String(record?.email || user.email || '').toLowerCase(),
    name: record?.full_name || user.full_name || 'Member',
    role,
    status,
    blocked: BLOCKED_STATUSES.includes(status),
    staff: STAFF_ROLES.includes(role),
    canModerate: MODERATOR_ROLES.includes(role),
    canGovern: GOVERNANCE_ROLES.includes(role),
    student: null,
    professor: null,
    academicGroup: '',
    facultyId: record?.faculty_id || '',
    coordinatorScopes: [],
  };

  // The academic group is never read from the browser and never from a second
  // source: the same resolver the administration register and every student
  // page use decides it, so the cohort shown here cannot disagree with them.
  if (role === 'student') {
    const academic = await resolveAcademicIdentity(svc, user);
    identity.student = academic.student;
    identity.academicGroup = academic.groupName;
    identity.academicYear = academic.year;
    identity.studentId = academic.studentId;
    identity.programme = academic.programme;
    identity.identityConflicts = academic.conflicts || [];
  }
  if (role === 'professor') {
    identity.professor = list(await svc.entities.Professor.filter({ user_id: user.id }, { limit: 2 }))[0] || null;
  }

  identity.coordinatorScopes = list(
    await svc.entities.CoordinatorAssignment.filter(
      { coordinator_user_id: user.id, status: 'active' },
      { limit: 20 },
    ),
  );

  return identity;
}

// A coordinator scope is a row in CoordinatorAssignment — never a role change.
export function coordinatorScopeFor(identity, group) {
  if (!group) return null;
  return (
    identity.coordinatorScopes.find(
      (row) => (row.scope_type === 'subgroup' && row.group_id === group.id) ||
        (row.scope_type === 'class' && row.academic_group_id && row.academic_group_id === group.academic_group_id),
    ) || null
  );
}

export function canUseCommunication(identity) {
  return Boolean(identity) && !identity.blocked && (identity.staff || ['student', 'professor'].includes(identity.role));
}

// ── Thread access ───────────────────────────────────────────────────────────
// Access to one exact thread is decided here, from rows in the database:
// participation for private/official threads, active membership for group
// threads, and a documented staff policy for the official channel only.
export function threadAccess(identity, thread, participantRow, membershipRow) {
  if (!thread) return { allowed: false, reason: 'Thread not found' };
  if (thread.type === 'group') {
    if (membershipRow && membershipRow.membership_status === 'active') {
      return { allowed: true, via: membershipRow.role === 'coordinator' ? 'coordinator' : 'member' };
    }
    return { allowed: false, reason: 'Not a member of this group' };
  }
  if (participantRow && participantRow.membership_status === 'active') {
    return { allowed: true, via: 'participant' };
  }
  // The official channel is an institutional mailbox, not a private chat: staff
  // designated to the Dean's Office may open it. Private threads stay closed to
  // everyone who is not a participant, staff included.
  if (thread.type === 'official' && identity.staff) {
    return { allowed: true, via: 'dean-office' };
  }
  return { allowed: false, reason: 'Not a participant in this conversation' };
}

export function canPostInThread(identity, access, thread) {
  if (!access?.allowed || identity.blocked) return false;
  if (thread.type === 'official' && thread.status === 'closed') return false;
  return true;
}

export function canPin(identity, access) {
  if (identity.staff) return true;
  return access?.via === 'coordinator';
}

// ── Who may start a conversation with whom ─────────────────────────────────
// The matrix is evaluated from enrolments, course ownership, group membership
// and coordinator scope — never from a role string sent by the client.
export async function conversationCandidates(svc, identity) {
  const candidates = [];
  const seen = new Set();
  const push = (row, group, reason) => {
    if (!row?.user_id || seen.has(row.user_id) || row.user_id === identity.id) return;
    seen.add(row.user_id);
    candidates.push({ user_id: row.user_id, name: row.name, role: row.role, group, reason });
  };

  if (identity.student) {
    // The student directory is university-wide by policy: every active student
    // holding a linked account is reachable, whatever cohort they sit in. The
    // academic group travels with the result as context only and is never a
    // filter, so a student can reach peers outside their own class group.
    // `push` below already skips unlinked records and the caller themselves.
    const students = list(await svc.entities.Student.list('-created_date', 500));
    students.forEach((row) => {
      const status = String(row.enrollment_status || '').toLowerCase();
      if (status && status !== 'active') return;
      push(
        { user_id: row.user_id, name: row.full_name, role: 'student' },
        row.group_name,
        row.group_name === identity.academicGroup ? 'Classmate' : 'Student at the university',
      );
    });

    const enrolments = list(
      await svc.entities.CourseEnrollment.filter({ student_id: identity.student.id }, { limit: 40 }),
    );
    const courseIds = [...new Set(enrolments.map((row) => row.course_id).filter(Boolean))];
    if (courseIds.length) {
      const courses = list(await svc.entities.Course.filter({ id: { $in: courseIds } }, { limit: 40 }));
      const professorIds = [...new Set(courses.map((row) => row.professor_id).filter(Boolean))];
      if (professorIds.length) {
        const professors = list(await svc.entities.Professor.filter({ id: { $in: professorIds } }, { limit: 40 }));
        professors.forEach((row) => {
          const taught = courses.filter((course) => course.professor_id === row.id).map((course) => course.code);
          push(
            { user_id: row.user_id, name: row.full_name, role: 'professor' },
            taught.filter(Boolean).join(', '),
            'Teaches your course',
          );
        });
      }
    }
  }

  if (identity.professor) {
    const courses = list(await svc.entities.Course.filter({ professor_id: identity.professor.id }, { limit: 40 }));
    const courseIds = courses.map((row) => row.id);
    if (courseIds.length) {
      const enrolments = list(
        await svc.entities.CourseEnrollment.filter({ course_id: { $in: courseIds } }, { limit: 200 }),
      );
      const studentIds = [...new Set(enrolments.map((row) => row.student_id).filter(Boolean))];
      if (studentIds.length) {
        const students = list(await svc.entities.Student.filter({ id: { $in: studentIds } }, { limit: 60 }));
        students.forEach((row) =>
          push({ user_id: row.user_id, name: row.full_name, role: 'student' }, row.group_name, 'Enrolled in your course'),
        );
      }
    }
    const colleagues = list(await svc.entities.Professor.list('-created_date', 40));
    colleagues.forEach((row) =>
      push({ user_id: row.user_id, name: row.full_name, role: 'professor' }, row.title || '', 'Faculty colleague'),
    );
  }

  if (identity.staff) {
    const students = list(await svc.entities.Student.list('-created_date', 40));
    students.forEach((row) =>
      push({ user_id: row.user_id, name: row.full_name, role: 'student' }, row.group_name, 'Student record'),
    );
    const professors = list(await svc.entities.Professor.list('-created_date', 40));
    professors.forEach((row) =>
      push({ user_id: row.user_id, name: row.full_name, role: 'professor' }, row.title || '', 'Faculty member'),
    );
  }

  // Coordinators may reach the members of the groups they coordinate.
  for (const scope of identity.coordinatorScopes) {
    if (!scope.group_id) continue;
    const members = list(
      await svc.entities.CommunicationGroupMember.filter(
        { group_id: scope.group_id, membership_status: 'active' },
        { limit: 60 },
      ),
    );
    members.forEach((row) =>
      push({ user_id: row.user_id, name: row.user_name, role: row.user_role }, 'Coordinated group', 'Group member'),
    );
  }

  return candidates;
}

export function candidateKind(identity, candidate) {
  if (!candidate) return null;
  if (identity.staff) return 'official';
  if (candidate.role === 'student' && identity.role === 'student') return 'private';
  return 'private';
}