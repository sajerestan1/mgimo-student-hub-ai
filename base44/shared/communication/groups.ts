// Academic class groups, student subgroups, invitation links and coordinator
// scopes. The academic group on the Student record stays the only roster
// source; communication membership is always derived from it.
import { list, nowIso, randomToken, sha256Hex, clean } from './util.ts';

const SYSTEM_ID = '';
const SYSTEM_NAME = 'Institutional system';

export async function findClassGroup(svc, academicGroupId) {
  if (!academicGroupId) return null;
  return (
    list(
      await svc.entities.CommunicationGroup.filter(
        { group_type: 'class', academic_group_id: academicGroupId },
        { limit: 2 },
      ),
    )[0] || null
  );
}

// Idempotent: a class group exists at most once per academic group.
export async function ensureClassGroup(svc, academicGroupId, label) {
  const name = clean(academicGroupId, 40);
  if (!name) return null;

  const existing = await findClassGroup(svc, name);
  if (existing) return existing;

  const title = label ? `${name} — ${clean(label, 80)}` : `${name} — Class group`;
  const thread = await svc.entities.CommunicationThread.create({
    type: 'group',
    title,
    created_by: SYSTEM_ID,
    created_by_name: SYSTEM_NAME,
    academic_group_id: name,
    last_message_at: nowIso(),
    is_demo: true,
  });

  const group = await svc.entities.CommunicationGroup.create({
    name: title,
    description: `Automatic communication group for academic group ${name}. Membership follows the academic record.`,
    group_type: 'class',
    academic_group_id: name,
    conversation_id: thread.id,
    visibility: 'group_only',
    membership_policy: 'auto',
    status: 'active',
    created_by: SYSTEM_ID,
    created_by_name: SYSTEM_NAME,
    member_count: 0,
    last_activity_at: nowIso(),
    is_demo: true,
  });

  await svc.entities.CommunicationThread.update(thread.id, { group_id: group.id });
  await svc.entities.CommunicationMessage.create({
    thread_id: thread.id,
    group_id: group.id,
    sender_user_id: SYSTEM_ID,
    sender_name: SYSTEM_NAME,
    sender_role: 'system',
    kind: 'system',
    body: `This group was provisioned automatically for academic group ${name}.`,
    moderation_status: 'visible',
  });

  return group;
}

// Reconciles one group's membership with the academic roster. Safe to retry:
// it only creates missing rows, closes rows whose student moved group, and
// never deletes history.
export async function syncGroupMembership(svc, group) {
  const students = list(await svc.entities.Student.list('-created_date', 300));
  const members = list(
    await svc.entities.CommunicationGroupMember.filter(
      { group_id: group.id, membership_status: 'active' },
      { limit: 300 },
    ),
  );

  const groupOfUser = new Map(students.filter((row) => row.user_id).map((row) => [row.user_id, row.group_name]));
  const nameOfUser = new Map(students.filter((row) => row.user_id).map((row) => [row.user_id, row.full_name]));
  const memberIds = new Set(members.map((row) => row.user_id));

  const joiners = students.filter(
    (row) => row.user_id && row.group_name === group.academic_group_id && !memberIds.has(row.user_id),
  );

  if (joiners.length) {
    await svc.entities.CommunicationGroupMember.bulkCreate(
      joiners.map((row) => ({
        group_id: group.id,
        conversation_id: group.conversation_id || '',
        user_id: row.user_id,
        user_name: row.full_name || 'Student',
        user_role: 'student',
        role: 'member',
        membership_status: 'active',
        membership_source: 'academic_group',
        joined_at: nowIso(),
        last_read_at: nowIso(),
        muted: false,
      })),
    );
  }

  const leavers = members.filter((row) => {
    const currentGroup = groupOfUser.get(row.user_id);
    return currentGroup !== undefined && currentGroup !== group.academic_group_id;
  });
  for (const row of leavers) {
    await svc.entities.CommunicationGroupMember.update(row.id, {
      membership_status: 'left',
      left_at: nowIso(),
    });
  }

  const count = await svc.entities.CommunicationGroupMember.count({
    group_id: group.id,
    membership_status: 'active',
  });
  await svc.entities.CommunicationGroup.update(group.id, { member_count: count });

  return { added: joiners.length, removed: leavers.length, count, names: nameOfUser };
}

export async function ensureSubgroup(svc, identity, input) {
  const name = clean(input.name, 80);
  const description = clean(input.description, 400);
  const visibility = ['group_only', 'discoverable', 'invite_only', 'private'].includes(input.visibility)
    ? input.visibility
    : 'group_only';
  const policy = ['invite', 'approval'].includes(input.membershipPolicy) ? input.membershipPolicy : 'invite';

  const thread = await svc.entities.CommunicationThread.create({
    type: 'group',
    title: name,
    created_by: identity.id,
    created_by_name: identity.name,
    academic_group_id: identity.academicGroup || '',
    last_message_at: nowIso(),
    is_demo: true,
  });

  const group = await svc.entities.CommunicationGroup.create({
    name,
    description,
    group_type: 'subgroup',
    academic_group_id: identity.academicGroup || '',
    parent_group_id: input.parentGroupId || '',
    conversation_id: thread.id,
    created_by: identity.id,
    created_by_name: identity.name,
    visibility,
    membership_policy: policy,
    status: 'active',
    member_count: 1,
    coordinator_name: identity.name,
    last_activity_at: nowIso(),
    is_demo: true,
  });

  await svc.entities.CommunicationThread.update(thread.id, { group_id: group.id });

  await svc.entities.CommunicationGroupMember.create({
    group_id: group.id,
    conversation_id: thread.id,
    user_id: identity.id,
    user_name: identity.name,
    user_role: identity.role,
    role: 'coordinator',
    membership_status: 'active',
    membership_source: 'coordinator',
    joined_at: nowIso(),
    last_read_at: nowIso(),
    muted: false,
  });

  await svc.entities.CommunicationMessage.create({
    thread_id: thread.id,
    group_id: group.id,
    sender_user_id: SYSTEM_ID,
    sender_name: SYSTEM_NAME,
    sender_role: 'system',
    kind: 'system',
    body: `${identity.name} created this subgroup.`,
    moderation_status: 'visible',
  });

  return group;
}

export async function createInvitation(svc, identity, group, options) {
  const token = randomToken(32);
  const tokenHash = await sha256Hex(token);
  const hours = Math.min(Math.max(Number(options.expiresInHours) || 72, 1), 24 * 14);
  const maximumUses = Math.min(Math.max(Number(options.maximumUses) || 25, 1), 200);

  const invitation = await svc.entities.GroupInvitation.create({
    group_id: group.id,
    group_name: group.name,
    conversation_id: group.conversation_id || '',
    academic_group_id: group.academic_group_id || '',
    token_hash: tokenHash,
    created_by: identity.id,
    created_by_name: identity.name,
    expires_at: new Date(Date.now() + hours * 3600 * 1000).toISOString(),
    maximum_uses: maximumUses,
    usage_count: 0,
    approval_required: Boolean(options.approvalRequired),
    status: 'active',
    note: clean(options.note, 160),
  });

  return { invitation, token };
}

export function invitationState(invitation) {
  if (!invitation) return 'invalid';
  if (invitation.revoked_at || invitation.status === 'revoked') return 'revoked';
  if (new Date(invitation.expires_at).getTime() < Date.now()) return 'expired';
  if (Number(invitation.usage_count) >= Number(invitation.maximum_uses)) return 'exhausted';
  return 'active';
}

export async function addMember(svc, group, identity, { role = 'member', source = 'invitation', status = 'active' } = {}) {
  const existing = list(
    await svc.entities.CommunicationGroupMember.filter(
      { group_id: group.id, user_id: identity.id },
      { limit: 2 },
    ),
  )[0];

  if (existing) {
    if (existing.membership_status === 'active') return { member: existing, created: false };
    await svc.entities.CommunicationGroupMember.update(existing.id, {
      membership_status: status,
      membership_source: source,
      joined_at: nowIso(),
      left_at: '',
    });
    return { member: { ...existing, membership_status: status }, created: false };
  }

  const member = await svc.entities.CommunicationGroupMember.create({
    group_id: group.id,
    conversation_id: group.conversation_id || '',
    user_id: identity.id,
    user_name: identity.name,
    user_role: identity.role,
    role,
    membership_status: status,
    membership_source: source,
    joined_at: nowIso(),
    last_read_at: nowIso(),
    muted: false,
  });
  return { member, created: true };
}