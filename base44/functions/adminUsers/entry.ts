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