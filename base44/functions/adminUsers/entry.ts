import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { ASSIGNABLE_ROLES, isAdmin, isSuperAdmin, missingFields, writeAudit } from '../../shared/accounts.ts';
import { duplicateUsernames, normalizeUsername, usernameError, usernameOwner } from '../../shared/accounts/username.ts';
import {
  MIRROR_TO_STUDENT_FIELD,
  resolveAcademicIdentity,
  syncAccountMirror,
} from '../../shared/student/academicIdentity.ts';
import { ensureClassGroup, syncGroupMembership } from '../../shared/communication/groups.ts';

const normEmail = (value) => String(value || '').toLowerCase().trim();
const list = (page) => (Array.isArray(page) ? page : page?.items || []);

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const STATUSES = ['active', 'suspended', 'deactivated'];
const ALL_ROLES = [
  'admin',
  'dean',
  'deputy_dean',
  'faculty_admin',
  'department_head',
  'professor',
  'academic_staff',
  'student',
  'user',
];

// Compulsory profile data may live on the administrator's User record or on the
// linked Student / Professor profile. For a student the Student record is the
// authority and the User fields are only its mirror, so this register can never
// display a cohort the student's own workspace disagrees with.
function resolvedProfile(record, student, professor) {
  return {
    full_name: record.full_name || student?.full_name || professor?.full_name || '',
    faculty_id: student?.faculty_id || record.faculty_id || professor?.faculty_id || '',
    department_id: student?.department_id || record.department_id || professor?.department_id || '',
    group_name: student?.group_name || record.group_name || '',
    programme: student?.program || record.programme || '',
    student_id: student?.student_id || record.student_id || '',
    professor_id: record.professor_id || '',
    contact_email: record.contact_email || record.email || '',
    phone: record.phone || '',
    photo_uri: record.photo_uri || '',
  };
}

function shape(record, student, professor) {
  const profile = resolvedProfile(record, student, professor);
  const missing = missingFields({ ...record, ...profile });
  // Which source produced the academic placement, and whether the account's own
  // copy still disagrees with it — reported, never silently averaged.
  const identityMismatch = student
    ? Object.entries(MIRROR_TO_STUDENT_FIELD)
        .filter(([mirrorField, studentField]) => String(record[mirrorField] || '') !== String(student[studentField] || ''))
        .map(([mirrorField]) => mirrorField)
    : [];
  return {
    ...profile,
    year: typeof student?.year === 'number' ? student.year : null,
    identity_source: student ? 'student_record' : 'account',
    identity_mismatch: identityMismatch,
    id: record.id,
    email: record.email,
    username: normalizeUsername(record.username),
    username_updated_at: record.username_updated_at || '',
    username_assigned_by: record.username_assigned_by || '',
    role: record.role || 'user',
    admin_level: record.admin_level || 'standard',
    account_status: record.account_status || 'active',
    provisioned: record.provisioned === true,
    created_date: record.created_date || '',
    last_login_at: record.last_login_at || '',
    missing,
    profile_complete: missing.length === 0,
  };
}

const label = (key) =>
  ({
    full_name: 'Full name',
    phone: 'Phone',
    contact_email: 'Email',
    faculty_id: 'Faculty',
    department_id: 'Department',
    group_name: 'Class / group',
    programme: 'Programme',
    student_id: 'Student ID',
    professor_id: 'Professor ID',
    role: 'Role',
    admin_level: 'Administration level',
    account_status: 'Account status',
  })[key] || key;

// Student identifiers are generated here — never accepted from a browser — and
// continue the institutional sequence, so two administrators can never mint the
// same identifier.
async function nextStudentId(sr) {
  const rows = await sr.entities.Student.list('-created_date', 500);
  const highest = rows.reduce((max, row) => {
    const match = String(row.student_id || '').match(/(\d+)\s*$/);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  const year = new Date().getFullYear();
  let candidate = Math.max(highest + 1, 1);
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const id = `MG-${year}-${candidate}`;
    const taken = await sr.entities.Student.filter({ student_id: id });
    if (!taken.length) return id;
    candidate += 1;
  }
  return `MG-${year}-${String(Date.now()).slice(-6)}`;
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const caller = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!caller) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!isAdmin(caller)) return Response.json({ error: 'Administrator access required' }, { status: 403 });
    if (caller.account_status === 'suspended' || caller.account_status === 'deactivated') {
      return Response.json({ error: 'This administrator account is not active' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const action = String(body.action || 'list');
    const sr = base44.asServiceRole;

    if (action === 'list') {
      const [users, students, professors, faculties, departments] = await Promise.all([
        sr.entities.User.list('-created_date', 300),
        sr.entities.Student.list('-created_date', 500),
        sr.entities.Professor.list('-created_date', 500),
        sr.entities.Faculty.list('name', 60),
        sr.entities.Department.list('name', 120),
      ]);

      const studentByUser = new Map(students.filter((s) => s.user_id).map((s) => [s.user_id, s]));
      const professorByUser = new Map(professors.filter((p) => p.user_id).map((p) => [p.user_id, p]));

      const search = String(body.search || '').trim().toLowerCase();
      const rows = users
        .map((record) => shape(record, studentByUser.get(record.id), professorByUser.get(record.id)))
        .filter((row) => {
          if (body.role && body.role !== 'all' && row.role !== body.role) return false;
          if (body.faculty_id && body.faculty_id !== 'all' && row.faculty_id !== body.faculty_id) return false;
          if (body.group_name && body.group_name !== 'all' && row.group_name !== body.group_name) return false;
          if (body.status && body.status !== 'all' && row.account_status !== body.status) return false;
          if (!search) return true;
          return [row.full_name, row.email, row.username, row.student_id, row.professor_id]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(search));
        });

      return Response.json({
        users: rows,
        faculties: faculties.map((f) => ({ id: f.id, name: f.name })),
        departments: departments.map((d) => ({ id: d.id, name: d.name, faculty_id: d.faculty_id })),
        canManageAdmins: isSuperAdmin(caller),
        // Clashes already present in stored data are surfaced for an
        // administrator to resolve; the assignment path refuses to add one.
        username_conflicts: duplicateUsernames(rows),
        username_missing: rows.filter((row) => !row.username).length,
      });
    }

    if (action === 'create') {
      const email = String(body.email || '').trim().toLowerCase();
      const role = String(body.role || 'student');
      const full_name = String(body.full_name || '').trim();

      if (!EMAIL_RE.test(email)) return Response.json({ error: 'Enter a valid email address' }, { status: 400 });
      if (!ASSIGNABLE_ROLES.includes(role)) return Response.json({ error: 'Unsupported role' }, { status: 400 });
      if (role === 'admin' && !isSuperAdmin(caller)) {
        return Response.json({ error: 'Only a Super Administrator can create administrator accounts' }, { status: 403 });
      }
      if (!full_name) return Response.json({ error: 'Full name is required' }, { status: 400 });

      const student_id = String(body.student_id || '').trim();
      const professor_id = String(body.professor_id || '').trim();

      const [existingUsers, pendingProvisions] = await Promise.all([
        sr.entities.User.filter({ email }),
        sr.entities.AccountProvision.filter({ email, status: 'pending' }),
      ]);
      if (existingUsers.length || pendingProvisions.length) {
        return Response.json({ error: 'An account already exists for this email address' }, { status: 409 });
      }

      if (student_id) {
        const [takenStudent, takenProvision] = await Promise.all([
          sr.entities.Student.filter({ student_id }),
          sr.entities.AccountProvision.filter({ student_id, status: 'pending' }),
        ]);
        if (takenStudent.length || takenProvision.length) {
          return Response.json({ error: `Student ID ${student_id} is already assigned` }, { status: 409 });
        }
      }
      if (professor_id) {
        const takenProvision = await sr.entities.AccountProvision.filter({ professor_id, status: 'pending' });
        if (takenProvision.length) {
          return Response.json({ error: `Professor ID ${professor_id} is already assigned` }, { status: 409 });
        }
      }

      // The platform sends the invitation and the account holder sets their own
      // password; no password ever passes through this application.
      try {
        await base44.users.inviteUser(email, 'user');
      } catch (inviteError) {
        const message = String(inviteError?.message || '');
        const status = inviteError?.status === 409 || /exist/i.test(message) ? 409 : 400;
        return Response.json(
          { error: status === 409 ? 'An account already exists for this email address' : `The invitation could not be sent: ${message}` },
          { status }
        );
      }

      const provision = await sr.entities.AccountProvision.create({
        email,
        role,
        status: 'pending',
        account_status: 'active',
        full_name,
        phone: String(body.phone || '').trim(),
        faculty_id: body.faculty_id || '',
        department_id: body.department_id || '',
        group_name: String(body.group_name || '').trim(),
        programme: String(body.programme || '').trim(),
        student_id,
        professor_id,
        created_by_name: caller.full_name || caller.email || '',
        created_by_user_id: caller.id,
      });

      await writeAudit(base44, {
        actor: caller,
        action: 'account_created',
        targetId: '',
        target: email,
        details: `${label('role')}: ${role}${student_id ? ` · Student ID ${student_id}` : ''}${professor_id ? ` · Professor ID ${professor_id}` : ''}. Invitation sent; profile applied on first sign-in.`,
      });

      return Response.json({ provision });
    }

    // Email-only student provisioning. The administrator supplies an address;
    // the server creates or adopts everything else — invitation, Student record,
    // its generated identifier and the account link. Nothing identifying is read
    // from the request, and an association that already exists is never moved.
    if (action === 'provision_student') {
      const email = String(body.email || '').trim().toLowerCase();
      if (!EMAIL_RE.test(email)) return Response.json({ error: 'Enter a valid email address' }, { status: 400 });

      const normEmail = (value) => String(value || '').toLowerCase().trim();
      const [usersOnEmail, studentsOnEmail] = await Promise.all([
        sr.entities.User.filter({ email }),
        sr.entities.Student.filter({ email }),
      ]);
      const account = usersOnEmail.find((row) => normEmail(row.email) === email) || null;
      const onEmail = (
        studentsOnEmail.length ? studentsOnEmail : await sr.entities.Student.list('-created_date', 500)
      ).filter((row) => normEmail(row.email) === email);

      // A student record on this address that belongs to somebody else blocks
      // the operation outright — nothing is reassigned.
      const foreign = onEmail.find((row) => row.user_id && row.user_id !== account?.id);
      if (foreign) {
        await writeAudit(base44, {
          actor: caller,
          action: 'student_provision_conflict',
          targetId: foreign.user_id,
          target: email,
          details: `Student record ${foreign.student_id || foreign.id} is already linked to another account.`,
          outcome: 'denied',
        });
        return Response.json(
          {
            status: 'conflict',
            conflict: 'A student record on this email is already linked to a different account. Resolve that link before provisioning.',
          },
          { status: 409 },
        );
      }

      const linkedRecord = account ? onEmail.find((row) => row.user_id === account.id) : null;
      if (linkedRecord) {
        return Response.json({
          status: 'linked',
          unchanged: true,
          message: 'This account is already linked to its student record. Nothing was changed.',
          account: { exists: true, id: account.id, role: account.role || 'user' },
          student: {
            id: linkedRecord.id,
            student_id: linkedRecord.student_id || '',
            full_name: linkedRecord.full_name || '',
            group_name: linkedRecord.group_name || '',
          },
          account_link: 'linked',
          invitation: 'not_required',
        });
      }

      // Only a student-facing account may be given a student record.
      if (account && !['', 'user', 'student'].includes(String(account.role || '').toLowerCase())) {
        await writeAudit(base44, {
          actor: caller,
          action: 'student_provision_conflict',
          targetId: account.id,
          target: email,
          details: `Existing account holds the ${account.role} role and cannot be turned into a student account.`,
          outcome: 'denied',
        });
        return Response.json(
          {
            status: 'conflict',
            conflict: `An account with this email already exists with the ${label('role').toLowerCase()} "${account.role}". Student provisioning was stopped.`,
          },
          { status: 409 },
        );
      }

      // An account is created and invited only when it does not exist; the
      // platform owns the invitation and the password, this app never sees one.
      let target = account;
      let invitation = 'not_required';
      if (!target) {
        try {
          await base44.users.inviteUser(email, 'user');
          invitation = 'sent';
        } catch (inviteError) {
          const message = String(inviteError?.message || '');
          const existing = inviteError?.status === 409 || /exist/i.test(message);
          if (!existing) {
            await writeAudit(base44, {
              actor: caller,
              action: 'student_provision_failed',
              targetId: '',
              target: email,
              details: `Invitation failed: ${message}`,
              outcome: 'failure',
            });
            return Response.json(
              { status: 'failed', error: `The invitation could not be sent: ${message}` },
              { status: 400 },
            );
          }
          invitation = 'already_registered';
        }
        const found = await sr.entities.User.filter({ email });
        target = found.find((row) => normEmail(row.email) === email) || null;
      }

      // The prepared record is adopted when it exists, so an address can never
      // accumulate a second student profile.
      let student = onEmail[0] || null;
      let recordCreated = false;
      if (!student) {
        student = await sr.entities.Student.create({
          email,
          full_name: String(body.full_name || '').trim() || target?.full_name || email.split('@')[0],
          student_id: await nextStudentId(sr),
          faculty_id: body.faculty_id || '',
          department_id: body.department_id || '',
          group_name: String(body.group_name || '').trim(),
          program: String(body.programme || '').trim(),
          enrollment_status: 'active',
          is_demo: false,
        });
        recordCreated = true;
      }

      // The association is established here, from the verified account email.
      if (target && !student.user_id) {
        await sr.entities.Student.update(student.id, { user_id: target.id });
        await sr.entities.User.update(target.id, {
          role: 'student',
          account_status: target.account_status || 'active',
          provisioned: true,
          student_id: student.student_id || '',
          contact_email: email,
          faculty_id: student.faculty_id || target.faculty_id || '',
          group_name: student.group_name || target.group_name || '',
          programme: student.program || target.programme || '',
        });
      }
      const linked = Boolean(target && (student.user_id === target.id || recordCreated));

      const provisionPayload = {
        email,
        role: 'student',
        account_status: 'active',
        full_name: student.full_name || '',
        faculty_id: student.faculty_id || '',
        department_id: student.department_id || '',
        group_name: student.group_name || '',
        programme: student.program || '',
        student_id: student.student_id || '',
        created_by_name: caller.full_name || caller.email || '',
        created_by_user_id: caller.id,
      };
      const pending = (await sr.entities.AccountProvision.filter({ email, status: 'pending' }))[0];
      let provision = pending
        ? await sr.entities.AccountProvision.update(pending.id, provisionPayload)
        : await sr.entities.AccountProvision.create({ ...provisionPayload, status: 'pending' });

      if (linked) {
        provision = await sr.entities.AccountProvision.update(provision.id, {
          status: 'applied',
          applied_user_id: target.id,
          applied_at: new Date().toISOString(),
        });
      }

      const status = linked ? 'linked' : 'pending_invitation';
      await writeAudit(base44, {
        actor: caller,
        action: 'student_provisioned',
        targetId: target?.id || '',
        target: email,
        details: `Student record ${student.student_id || student.id} ${recordCreated ? 'created' : 'adopted'} · account ${
          target ? 'linked' : 'not yet signed in'
        } · ${status}.`,
      });

      return Response.json({
        status,
        message: linked
          ? 'The student account is created and linked to its student record.'
          : 'The student record is created and the invitation sent. The account links itself on first sign-in.',
        account: { exists: Boolean(target), id: target?.id || '', role: target?.role || 'user' },
        student: {
          id: student.id,
          student_id: student.student_id || '',
          full_name: student.full_name || '',
          group_name: student.group_name || '',
        },
        account_link: linked ? 'linked' : 'pending',
        invitation,
        provision: { id: provision.id, status: provision.status },
      });
    }

    if (action === 'update') {
      const userId = String(body.userId || '');
      if (!userId) return Response.json({ error: 'userId is required' }, { status: 400 });

      const target = await sr.entities.User.get(userId).catch((e) => (e.status === 404 ? null : Promise.reject(e)));
      if (!target) return Response.json({ error: 'User not found' }, { status: 404 });

      const patch = body.patch || {};
      const isSelf = target.id === caller.id;

      if (isSelf && patch.role && patch.role !== target.role) {
        return Response.json({ error: 'You cannot change your own role' }, { status: 403 });
      }
      if (target.role === 'admin' && !isSuperAdmin(caller)) {
        return Response.json({ error: 'Only a Super Administrator can modify administrator accounts' }, { status: 403 });
      }
      if (patch.role && !ALL_ROLES.includes(patch.role)) {
        return Response.json({ error: 'Unsupported role' }, { status: 400 });
      }
      if (patch.role === 'admin' && !isSuperAdmin(caller)) {
        return Response.json({ error: 'Only a Super Administrator can grant administrator access' }, { status: 403 });
      }
      if (patch.admin_level && patch.admin_level !== target.admin_level && !isSuperAdmin(caller)) {
        return Response.json({ error: 'Only a Super Administrator can change administration level' }, { status: 403 });
      }
      if (patch.role && patch.role !== 'admin' && patch.admin_level) delete patch.admin_level;

      // A username is validated before anything is written, so a rejected alias
      // cannot leave the account or its academic record half-saved. Matching is
      // case-insensitive across every account.
      if ('username' in patch) {
        const candidate = normalizeUsername(patch.username);
        if (candidate && candidate !== normalizeUsername(target.username)) {
          const invalid = usernameError(candidate);
          if (invalid) return Response.json({ error: invalid }, { status: 400 });
          const owner = await usernameOwner(sr, candidate, target.id);
          if (owner) {
            return Response.json({ error: 'That username is already in use by another account' }, { status: 409 });
          }
        }
      }

      const editable = [
        'full_name',
        'phone',
        'contact_email',
        'faculty_id',
        'department_id',
        'group_name',
        'programme',
        'student_id',
        'professor_id',
        'role',
        'admin_level',
      ];

      // Academic placement is written to the authoritative Student record — the
      // one record every student surface resolves — and it is compared against
      // THAT record, not against the account's copy. Saving a form whose values
      // match the account but disagree with the record therefore still repairs
      // the record, which is what makes this work on data already out of step.
      const academicInput = {};
      for (const key of ['student_id', 'group_name', 'programme', 'faculty_id', 'department_id', 'year']) {
        if (!(key in patch)) continue;
        academicInput[key] = key === 'year' ? Number(patch.year) || null : String(patch[key] || '').trim();
      }

      let academicChanges = [];
      let recordWritten = false;
      if (Object.keys(academicInput).length) {
        const identity = await resolveAcademicIdentity(sr, target, { adopt: false });
        const record = identity?.student || null;
        if (record) {
          const recordPatch = {};
          for (const [key, value] of Object.entries(academicInput)) {
            if (key === 'year') {
              if (value !== null && value !== record.year) recordPatch.year = value;
              continue;
            }
            const studentField = MIRROR_TO_STUDENT_FIELD[key];
            if (studentField && String(record[studentField] || '') !== String(value)) {
              recordPatch[studentField] = value;
            }
          }
          if (Object.keys(recordPatch).length) {
            await sr.entities.Student.update(record.id, recordPatch);
            recordWritten = true;
            academicChanges = Object.entries(recordPatch).map(
              ([key, value]) => `${key}: ${record[key] || '—'} → ${value || '—'}`,
            );
          }
          // The account's copy always follows the record, never the other way.
          const settled = await resolveAcademicIdentity(sr, target, { adopt: false });
          await syncAccountMirror(sr, target.id, settled);
        }
      }

      const update = {};
      const changes = [...academicChanges];
      for (const key of editable) {
        if (!(key in patch)) continue;
        // A mirrored academic field was just written to the record itself.
        if (recordWritten && key in academicInput) continue;
        const next = typeof patch[key] === 'string' ? patch[key].trim() : patch[key];
        const current = target[key] || '';
        if (next === current) continue;
        update[key] = next;
        changes.push(`${label(key)}: ${current || '—'} → ${next || '—'}`);
      }

      if (patch.contact_email && !EMAIL_RE.test(String(patch.contact_email).trim())) {
        return Response.json({ error: 'Enter a valid email address' }, { status: 400 });
      }

      // The alias itself, plus who assigned it and when. Nothing else about the
      // account is rewritten: its id, email and password stay with the platform.
      if ('username' in patch) {
        const next = normalizeUsername(patch.username);
        if (next !== normalizeUsername(target.username)) {
          update.username = next;
          update.username_updated_at = next ? new Date().toISOString() : '';
          update.username_assigned_by = next ? caller.full_name || caller.email || '' : '';
          changes.push(`Username: ${target.username || '—'} → ${next || '—'}`);
        }
      }

      if (!Object.keys(update).length && !recordWritten) {
        return Response.json({ ok: true, changed: changes.length });
      }

      if (Object.keys(update).length) {
        await sr.entities.User.update(target.id, update);
      }

      if (update.full_name) {
        for (const entity of ['Student', 'Professor']) {
          const page = await sr.entities[entity].filter({ user_id: target.id });
          if (page.length) await sr.entities[entity].update(page[0].id, { full_name: update.full_name });
        }
      }

      const actionName =
        'role' in update || 'admin_level' in update
          ? 'role_changed'
          : 'account_status' in update
          ? 'status_changed'
          : 'username' in update
          ? 'username_assigned'
          : 'contact_email' in update
          ? 'email_changed'
          : 'faculty_id' in update || 'faculty_id' in academicInput
          ? 'faculty_assigned'
          : 'group_name' in update || 'group_name' in academicInput
          ? 'group_assigned'
          : 'profile_updated';

      await writeAudit(base44, {
        actor: caller,
        action: actionName,
        targetId: target.id,
        target: target.email,
        details: changes.join(' · '),
      });

      return Response.json({ ok: true, changed: changes.length });
    }

    // Read-only diagnosis: what every surface actually resolves for a named
    // account (register row, student record, class group, membership, timetable
    // scope, enrolments, duplicates). No record is written — not even an
    // adoption — so an administrator can see disagreement before repairing it.
    if (action === 'identityReport') {
      const emails = (Array.isArray(body.emails) ? body.emails : [body.email])
        .filter(Boolean)
        .slice(0, 5)
        .map(normEmail);
      if (!emails.length) return Response.json({ error: 'At least one email address is required' }, { status: 400 });

      const [users, students, groups, members, enrolments, sessions] = await Promise.all([
        sr.entities.User.list('-created_date', 300),
        sr.entities.Student.list('-created_date', 800),
        sr.entities.CommunicationGroup.list('-created_date', 200),
        sr.entities.CommunicationGroupMember.list('-created_date', 400),
        sr.entities.CourseEnrollment.list('-created_date', 800),
        sr.entities.ClassSession.list('-created_date', 400),
      ]);

      const items = [];
      for (const email of emails) {
        const account = list(users).find((row) => normEmail(row.email) === email) || null;
        const linkedRecords = account ? list(students).filter((row) => row.user_id === account.id) : [];
        const recordsOnEmail = list(students).filter((row) => normEmail(row.email) === email);
        const identity = account ? await resolveAcademicIdentity(sr, account, { adopt: false }) : null;
        const registerRow = account ? shape(account, identity?.student || null, null) : null;
        const group = identity?.groupName
          ? list(groups).find((row) => row.group_type === 'class' && row.academic_group_id === identity.groupName) || null
          : null;
        const membership = account && group
          ? list(members).find((row) => row.group_id === group.id && row.user_id === account.id) || null
          : null;
        const ownEnrolments = identity?.student
          ? list(enrolments).filter((row) => row.student_id === identity.student.id)
          : [];
        const courseIds = [...new Set(ownEnrolments.map((row) => row.course_id).filter(Boolean))];
        const cohortSessions = list(sessions).filter(
          (row) => courseIds.includes(row.course_id) && (!row.group_name || row.group_name === identity?.groupName),
        );
        const activeMembers = group
          ? list(members).filter((row) => row.group_id === group.id && row.membership_status === 'active').length
          : 0;

        items.push({
          email,
          account: account
            ? {
                id: account.id,
                role: account.role || 'user',
                status: account.account_status || 'active',
                mirror: {
                  student_id: account.student_id || '',
                  group_name: account.group_name || '',
                  programme: account.programme || '',
                  faculty_id: account.faculty_id || '',
                },
              }
            : null,
          student: identity?.student
            ? {
                id: identity.student.id,
                student_id: identity.studentId,
                group_name: identity.groupName,
                year: identity.year,
                programme: identity.programme,
                faculty_id: identity.facultyId,
                department_id: identity.departmentId,
                enrollment_status: identity.student.enrollment_status || 'active',
                source: identity.source,
              }
            : null,
          register: registerRow
            ? {
                group_name: registerRow.group_name,
                student_id: registerRow.student_id,
                year: registerRow.year,
                identity_source: registerRow.identity_source,
                identity_mismatch: registerRow.identity_mismatch,
              }
            : null,
          communication: group
            ? {
                group_id: group.id,
                group_name: group.name,
                academic_group_id: group.academic_group_id,
                membership_status: membership?.membership_status || 'none',
                member_count: activeMembers,
                stored_member_count: group.member_count || 0,
              }
            : null,
          timetable: { group: identity?.groupName || '', cohort_sessions: cohortSessions.length },
          enrolments: { count: ownEnrolments.length, courses: courseIds.length },
          duplicates: {
            linked_student_records: linkedRecords.length,
            records_on_email: recordsOnEmail.length,
          },
          conflicts: identity?.conflicts || [],
        });
      }

      return Response.json({ items });
    }

    // Repair: make the account mirror and the class-group membership follow the
    // authoritative student record, and reconcile member counts. Nothing is
    // deleted and no identifier, link, enrolment, grade or submission is touched.
    if (action === 'reconcileIdentities') {
      const emails = (Array.isArray(body.emails) ? body.emails : []).map(normEmail).filter(Boolean).slice(0, 50);
      const users = list(await sr.entities.User.list('-created_date', 300));
      const targets = emails.length
        ? users.filter((row) => emails.includes(normEmail(row.email)))
        : users.filter((row) => normEmail(row.role) === 'student');

      const results = [];
      let repaired = 0;
      let conflicts = 0;

      for (const account of targets) {
        if (normEmail(account.role) !== 'student') {
          results.push({ email: account.email, status: 'skipped', reason: 'Not a student account' });
          continue;
        }
        const before = await resolveAcademicIdentity(sr, account, { adopt: false });
        if (!before.student) {
          conflicts += (before.conflicts || []).length;
          results.push({
            email: account.email,
            status: 'no_record',
            conflicts: before.conflicts || [],
          });
          continue;
        }

        const identity = await resolveAcademicIdentity(sr, account);
        const mirror = await syncAccountMirror(sr, account.id, identity);
        let group = null;
        let membership = null;
        if (identity.groupName) {
          group = await ensureClassGroup(sr, identity.groupName, identity.programme);
          if (group) {
            membership = await syncGroupMembership(sr, group);
            // A student whose record moved cohort may still sit in the old class
            // group; that stale row is closed here, so the two never disagree.
            const stale = list(
              await sr.entities.CommunicationGroupMember.filter(
                { user_id: account.id, membership_status: 'active' },
                { limit: 30 },
              ),
            ).filter((row) => row.group_id !== group.id);
            for (const row of stale) {
              const owner = list(await sr.entities.CommunicationGroup.filter({ id: row.group_id }, { limit: 1 }))[0];
              if (owner && owner.group_type === 'class') {
                await sr.entities.CommunicationGroupMember.update(row.id, {
                  membership_status: 'left',
                  left_at: new Date().toISOString(),
                });
                const count = await sr.entities.CommunicationGroupMember.count({
                  group_id: owner.id,
                  membership_status: 'active',
                });
                await sr.entities.CommunicationGroup.update(owner.id, { member_count: count });
              }
            }
          }
        }

        conflicts += (identity.conflicts || []).length;
        if (mirror.length) repaired += 1;
        results.push({
          email: account.email,
          status: mirror.length || identity.source === 'adopted' ? 'repaired' : 'already_consistent',
          before: {
            mirror: {
              group_name: account.group_name || '',
              student_id: account.student_id || '',
              programme: account.programme || '',
            },
          },
          after: {
            group_name: identity.groupName,
            student_id: identity.studentId,
            year: identity.year,
            programme: identity.programme,
            faculty_id: identity.facultyId,
            source: identity.source,
          },
          mirror_changes: mirror,
          class_group: group
            ? { id: group.id, name: group.name, members: membership?.count ?? null, added: membership?.added ?? null, removed: membership?.removed ?? null }
            : null,
          conflicts: identity.conflicts || [],
        });
      }

      await writeAudit(base44, {
        actor: caller,
        action: 'academic_identities_reconciled',
        targetId: '',
        target: emails.length ? emails.join(', ') : 'All student accounts',
        details: `${targets.length} account(s) inspected · ${repaired} aligned with their student record · ${conflicts} conflict(s) reported. No academic record was deleted.`,
      });

      return Response.json({ inspected: targets.length, repaired, conflicts, results });
    }

    if (action === 'setStatus') {
      const userId = String(body.userId || '');
      const status = String(body.status || '');
      if (!userId || !STATUSES.includes(status)) {
        return Response.json({ error: 'A user and a supported status are required' }, { status: 400 });
      }
      if (userId === caller.id) return Response.json({ error: 'You cannot change your own account status' }, { status: 403 });

      const target = await sr.entities.User.get(userId).catch((e) => (e.status === 404 ? null : Promise.reject(e)));
      if (!target) return Response.json({ error: 'User not found' }, { status: 404 });
      if (target.role === 'admin' && !isSuperAdmin(caller)) {
        return Response.json({ error: 'Only a Super Administrator can change an administrator account' }, { status: 403 });
      }

      const previous = target.account_status || 'active';
      await sr.entities.User.update(target.id, { account_status: status });

      const actionName =
        status === 'suspended'
          ? 'account_suspended'
          : status === 'deactivated'
          ? 'account_deactivated'
          : previous === 'deactivated'
          ? 'account_reactivated'
          : previous === 'suspended'
          ? 'account_reactivated'
          : 'account_activated';

      await writeAudit(base44, {
        actor: caller,
        action: actionName,
        targetId: target.id,
        target: target.email,
        details: `Account status: ${previous} → ${status}. Academic records retained.`,
      });

      return Response.json({ ok: true, status });
    }

    if (action === 'resetPassword') {
      const userId = String(body.userId || '');
      if (!userId) return Response.json({ error: 'userId is required' }, { status: 400 });

      const target = await sr.entities.User.get(userId).catch((e) => (e.status === 404 ? null : Promise.reject(e)));
      if (!target) return Response.json({ error: 'User not found' }, { status: 404 });
      if (target.role === 'admin' && !isSuperAdmin(caller) && target.id !== caller.id) {
        return Response.json({ error: 'Only a Super Administrator can reset an administrator password' }, { status: 403 });
      }

      const to = target.contact_email || target.email;
      let sent = true;
      let message = '';
      try {
        await sr.integrations.Core.SendEmail({
          to,
          template_name: 'PasswordResetNotice',
          category: 'transactional',
          variables: {
            first_name: (target.full_name || '').split(' ')[0] || 'there',
            reset_url: 'https://nexus-mgimo-ai.base44.app/forgot-password',
          },
        });
      } catch (sendError) {
        sent = false;
        message = String(sendError?.message || 'The recovery email could not be sent');
      }

      await writeAudit(base44, {
        actor: caller,
        action: 'password_reset_initiated',
        targetId: target.id,
        target: to,
        outcome: sent ? 'success' : 'failure',
        details: sent
          ? 'Recovery email sent. The account holder sets a new password through the secure reset flow; no password was viewed or stored.'
          : `Recovery email failed: ${message}`,
      });

      return Response.json({ ok: sent, email: to, message: sent ? '' : message });
    }

    if (action === 'audit') {
      const logs = await sr.entities.AuditLog.list('-logged_at', Math.min(Number(body.limit) || 100, 200));
      return Response.json({ logs });
    }

    return Response.json({ error: `Unsupported action: ${action}` }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}