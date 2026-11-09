import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { isBlockedStatus, missingFields, writeAudit } from '../../shared/accounts.ts';

// Applies the institutional provisioning an administrator recorded before the
// account holder ever signed in. Runs once, server-side, keyed by the verified
// sign-in email — never by anything the client sends.
async function applyProvision(base44, record, provision) {
  const sr = base44.asServiceRole;
  const role = provision.role;

  await sr.entities.User.update(record.id, {
    role,
    account_status: provision.account_status || 'active',
    provisioned: true,
    full_name: provision.full_name || record.full_name || '',
    phone: provision.phone || record.phone || '',
    contact_email: provision.email,
    faculty_id: provision.faculty_id || '',
    department_id: provision.department_id || '',
    group_name: provision.group_name || '',
    programme: provision.programme || '',
    student_id: provision.student_id || '',
    professor_id: provision.professor_id || '',
  });

  const existing =
    role === 'student'
      ? await sr.entities.Student.filter({ user_id: record.id })
      : role === 'professor'
      ? await sr.entities.Professor.filter({ user_id: record.id })
      : [];

  if (!existing.length && role === 'student') {
    // A record that the student office already prepared for this address (the
    // demonstration student) is adopted instead of duplicated, so the account
    // opens with its full academic record, timetable and results.
    const prepared = (await sr.entities.Student.filter({ email: provision.email })).find((row) => !row.user_id);
    if (prepared) {
      await sr.entities.Student.update(prepared.id, { user_id: record.id });
      await sr.entities.AccountProvision.update(provision.id, {
        status: 'applied',
        applied_user_id: record.id,
        applied_at: new Date().toISOString(),
      });
      await writeAudit(base44, {
        actor: { full_name: 'Institutional provisioning', role: 'system', id: '' },
        action: 'account_provisioned',
        targetId: record.id,
        target: provision.email,
        details: `Role ${role} applied and an existing institutional student record was linked to the account.`,
      });
      return;
    }
    await sr.entities.Student.create({
      user_id: record.id,
      full_name: provision.full_name || record.full_name || 'Student',
      student_id: provision.student_id || '',
      faculty_id: provision.faculty_id || '',
      department_id: provision.department_id || '',
      group_name: provision.group_name || '',
      program: provision.programme || '',
      email: provision.email,
      enrollment_status: 'active',
      is_demo: false,
    });
  }

  if (!existing.length && role === 'professor') {
    await sr.entities.Professor.create({
      user_id: record.id,
      full_name: provision.full_name || record.full_name || 'Professor',
      faculty_id: provision.faculty_id || '',
      department_id: provision.department_id || '',
      email: provision.email,
      is_demo: false,
    });
  }

  await sr.entities.AccountProvision.update(provision.id, {
    status: 'applied',
    applied_user_id: record.id,
    applied_at: new Date().toISOString(),
  });

  await writeAudit(base44, {
    actor: { full_name: 'Institutional provisioning', role: 'system', id: '' },
    action: 'account_provisioned',
    targetId: record.id,
    target: provision.email,
    details: `Role ${role} applied from the administrator's provisioning record${provision.created_by_name ? ` created by ${provision.created_by_name}` : ''}.`,
  });
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const caller = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!caller) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const sr = base44.asServiceRole;
    let record = await sr.entities.User.get(caller.id).catch((e) => (e.status === 404 ? null : Promise.reject(e)));

    // A pending institutional provision is the authority: it is keyed by the
    // verified sign-in address, applied once, and adopts the prepared record
    // instead of creating a second one. Waiting on the provision rather than
    // on the account's own flag means an account that was registered or edited
    // outside the flow still receives its institutional placement.
    if (record) {
      const email = String(caller.email || record.email || '').toLowerCase();
      const pending = email ? await sr.entities.AccountProvision.filter({ email, status: 'pending' }) : [];
      if (pending.length) {
        await applyProvision(base44, record, pending[0]);
        record = await sr.entities.User.get(caller.id);
      }
    }

    const role = record?.role || caller.role || 'user';
    const status = record?.account_status || 'active';
    const profile = {
      role,
      contact_email: record?.contact_email || caller.email || '',
      phone: record?.phone || '',
      photo_uri: record?.photo_uri || '',
      faculty_id: record?.faculty_id || '',
      group_name: record?.group_name || '',
    };
    const missing = missingFields(profile);

    // Throttled activity stamp: at most one write every ten minutes per session.
    const stamp = record?.last_login_at ? new Date(record.last_login_at).getTime() : 0;
    if (record && Date.now() - stamp > 10 * 60 * 1000) {
      await sr.entities.User.update(record.id, { last_login_at: new Date().toISOString() });
    }

    return Response.json({
      provisioned: record?.provisioned === true,
      role,
      status,
      blocked: isBlockedStatus(status),
      missing,
      profile_complete: missing.length === 0,
      profile: {
        contact_email: profile.contact_email,
        phone: profile.phone,
        photo_uri: profile.photo_uri,
        faculty_id: profile.faculty_id,
        group_name: profile.group_name,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}