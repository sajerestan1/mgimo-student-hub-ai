import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { ASSIGNABLE_ROLES, isAdmin, isSuperAdmin, missingFields, writeAudit } from '../../shared/accounts.ts';

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
// linked Student / Professor profile; the roster resolves both.
function resolvedProfile(record, student, professor) {
  return {
    full_name: record.full_name || student?.full_name || professor?.full_name || '',
    faculty_id: record.faculty_id || student?.faculty_id || professor?.faculty_id || '',
    department_id: record.department_id || professor?.department_id || '',
    group_name: record.group_name || student?.group_name || '',
    programme: record.programme || student?.program || '',
    student_id: record.student_id || student?.student_id || '',
    professor_id: record.professor_id || '',
    contact_email: record.contact_email || record.email || '',
    phone: record.phone || '',
    photo_uri: record.photo_uri || '',
  };
}

function shape(record, student, professor) {
  const profile = resolvedProfile(record, student, professor);
  const missing = missingFields({ ...record, ...profile });
  return {
    ...profile,
    id: record.id,
    email: record.email,
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
          return [row.full_name, row.email, row.student_id, row.professor_id]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(search));
        });

      return Response.json({
        users: rows,
        faculties: faculties.map((f) => ({ id: f.id, name: f.name })),
        departments: departments.map((d) => ({ id: d.id, name: d.name, faculty_id: d.faculty_id })),
        canManageAdmins: isSuperAdmin(caller),
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
          faculty_id: target.faculty_id || student.faculty_id || '',
          group_name: target.group_name || student.group_name || '',
          programme: target.programme || student.program || '',
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

      const update = {};
      const changes = [];
      for (const key of editable) {
        if (!(key in patch)) continue;
        const next = typeof patch[key] === 'string' ? patch[key].trim() : patch[key];
        const current = target[key] || '';
        if (next === current) continue;
        update[key] = next;
        changes.push(`${label(key)}: ${current || '—'} → ${next || '—'}`);
      }

      if (patch.contact_email && !EMAIL_RE.test(String(patch.contact_email).trim())) {
        return Response.json({ error: 'Enter a valid email address' }, { status: 400 });
      }

      if (!Object.keys(update).length) return Response.json({ ok: true, changed: 0 });

      await sr.entities.User.update(target.id, update);

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
          : 'contact_email' in update
          ? 'email_changed'
          : 'faculty_id' in update
          ? 'faculty_assigned'
          : 'group_name' in update
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