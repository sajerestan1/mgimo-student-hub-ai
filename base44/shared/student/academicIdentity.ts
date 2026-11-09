// ONE authoritative academic identity per account.
//
// The linked Student record is the single source of the academic identity —
// student number, faculty, department, programme, academic year and class group.
// Every surface (administration register, student dashboard, profile, timetable,
// attendance, course lists, Communication Center) resolves it through this
// module, so one account can never be displayed with two different cohorts.
//
// The User fields of the same names are a DERIVED MIRROR written from this
// resolver (syncAccountMirror); they are never treated as authority. Nothing in
// this module reads an identifier, year or group supplied by the browser.

const list = (page) => (Array.isArray(page) ? page : page?.items || []);
const norm = (value) => String(value || '').toLowerCase().trim();

// Only a student-facing account may claim a student record.
const STUDENT_ACCOUNT_ROLES = ['student', 'user', ''];

export const ACADEMIC_MIRROR_FIELDS = ['student_id', 'group_name', 'programme', 'faculty_id', 'department_id'];

export const MIRROR_TO_STUDENT_FIELD = {
  student_id: 'student_id',
  group_name: 'group_name',
  programme: 'program',
  faculty_id: 'faculty_id',
  department_id: 'department_id',
};

function emptyIdentity(conflicts = []) {
  return {
    linked: false,
    source: 'none',
    student: null,
    conflicts,
    studentId: '',
    groupName: '',
    year: null,
    programme: '',
    facultyId: '',
    departmentId: '',
    enrollmentStatus: '',
    fullName: '',
    email: '',
  };
}

export function academicFields(student) {
  return {
    studentId: student?.student_id || '',
    groupName: student?.group_name || '',
    year: typeof student?.year === 'number' ? student.year : null,
    programme: student?.program || '',
    facultyId: student?.faculty_id || '',
    departmentId: student?.department_id || '',
    enrollmentStatus: student?.enrollment_status || '',
    fullName: student?.full_name || '',
    email: student?.email || '',
  };
}

// Deterministic choice when an account is linked to more than one record:
// an active enrolment first, then the most recently updated record. Never a
// random row, so every surface picks the same one.
function rank(row) {
  const active = !row.enrollment_status || row.enrollment_status === 'active' ? 1 : 0;
  const touched = new Date(row.updated_date || row.created_date || 0).getTime();
  return active * 1e15 + touched;
}

export function pickAuthoritativeStudent(rows) {
  return [...rows].sort((a, b) => rank(b) - rank(a))[0] || null;
}

/**
 * Resolve the signed-in account to its one academic identity.
 * `adopt: false` performs the same resolution without claiming a prepared
 * record (used by read-only administrative inspection).
 */
export async function resolveAcademicIdentity(svc, user, { adopt = true } = {}) {
  if (!user?.id) return emptyIdentity();

  const linkedRows = list(await svc.entities.Student.filter({ user_id: user.id }, { limit: 10 }));
  if (linkedRows.length) {
    const student = pickAuthoritativeStudent(linkedRows);
    const conflicts =
      linkedRows.length > 1
        ? [
            {
              type: 'duplicate_student_records',
              detail: `${linkedRows.length} student records are linked to this account; the most recent active record is used.`,
              ids: linkedRows.map((row) => row.id),
            },
          ]
        : [];
    return { linked: true, source: 'linked', student, conflicts, ...academicFields(student) };
  }

  if (!STUDENT_ACCOUNT_ROLES.includes(norm(user.role))) return emptyIdentity();

  const address = norm(user.email);
  if (!address) return emptyIdentity();

  const direct = list(await svc.entities.Student.filter({ email: address }, { limit: 10 }));
  const scanned = direct.length
    ? direct
    : list(await svc.entities.Student.list('-created_date', 500)).filter((row) => norm(row.email) === address);
  const matches = scanned.filter((row) => norm(row.email) === address);

  // A record that already belongs to somebody else blocks adoption outright.
  const foreign = matches.filter((row) => row.user_id && row.user_id !== user.id);
  if (foreign.length) {
    return emptyIdentity([
      {
        type: 'record_owned_by_another_account',
        detail: 'A student record on this address is already linked to a different account.',
        ids: foreign.map((row) => row.id),
      },
    ]);
  }

  const adoptable = matches.filter((row) => !row.user_id);
  if (!adoptable.length) return emptyIdentity();
  if (adoptable.length > 1) {
    return emptyIdentity([
      {
        type: 'ambiguous_records',
        detail: `${adoptable.length} unlinked student records share this sign-in address; none was adopted.`,
        ids: adoptable.map((row) => row.id),
      },
    ]);
  }
  if (!adopt) {
    return { linked: false, source: 'available', student: adoptable[0], conflicts: [], ...academicFields(adoptable[0]) };
  }

  const adopted = await svc.entities.Student.update(adoptable[0].id, { user_id: user.id });
  return { linked: true, source: 'adopted', student: adopted, conflicts: [], ...academicFields(adopted) };
}

/**
 * Write the derived account mirror from the authoritative record. The record
 * always wins, including when it holds an empty value.
 */
export async function syncAccountMirror(svc, accountId, identity) {
  if (!accountId || !identity?.linked) return [];
  const account = await svc.entities.User.get(accountId).catch((e) =>
    e.status === 404 ? null : Promise.reject(e),
  );
  if (!account) return [];

  const desired = {
    student_id: identity.studentId,
    group_name: identity.groupName,
    programme: identity.programme,
    faculty_id: identity.facultyId,
    department_id: identity.departmentId,
  };

  const patch = {};
  const changed = [];
  for (const [key, value] of Object.entries(desired)) {
    const current = String(account[key] || '');
    if (current === String(value || '')) continue;
    patch[key] = value || '';
    changed.push({ field: key, before: current, after: value || '' });
  }
  if (!Object.keys(patch).length) return [];
  await svc.entities.User.update(accountId, patch);
  return changed;
}