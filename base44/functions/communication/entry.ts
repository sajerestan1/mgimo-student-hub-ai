import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { list, nowIso, clean, preview, pairKey, countSince, sha256Hex } from '../../shared/communication/util.ts';
import {
  resolveIdentity,
  canUseCommunication,
  threadAccess,
  canPostInThread,
  canPin,
  conversationCandidates,
  coordinatorScopeFor,
} from '../../shared/communication/identity.ts';
import {
  ensureClassGroup,
  findClassGroup,
  syncGroupMembership,
  ensureSubgroup,
  createInvitation,
  invitationState,
  addMember,
} from '../../shared/communication/groups.ts';
import { handleReact, handleTranscribe, handleAssistant } from '../../shared/communication/voiceAndAi.ts';
import {
  loadThread,
  threadParticipants,
  groupMembers,
  appendMessage,
  messageRecipients,
  threadLink,
  markThreadRead,
  sanitiseAttachments,
  notify,
  audit,
  MESSAGE_LIMIT,
} from '../../shared/communication/messaging.ts';

const OFFICIAL_CATEGORIES = [
  'Academic Affairs',
  'Registration',
  'Examination',
  'Timetable',
  'Certificates and Documents',
  'Student Support',
  'Technical Support',
  'Other',
];

const OFFICIAL_STATUSES = ['open', 'assigned', 'in_progress', 'awaiting_student', 'resolved', 'closed'];
const REPORT_REASONS = ['spam', 'abuse', 'offensive', 'harassment', 'other'];

const threadShell = (thread, extra = {}) => ({
  id: thread.id,
  type: thread.type,
  title: thread.title || 'Conversation',
  preview: thread.last_message_preview || '',
  last_message_at: thread.last_message_at || thread.created_date,
  last_sender_name: thread.last_sender_name || '',
  status: thread.status || '',
  category: thread.category || '',
  group_id: thread.group_id || '',
  academic_group_id: thread.academic_group_id || '',
  ...extra,
});

const unreadFor = (row, thread, identity) => {
  // Staff oversight of a class group is not membership: it never carries an
  // unread count, and a group nobody belongs to has nothing unread.
  if (!row) return 0;
  const readAt = row?.last_read_at || '';
  const lastAt = thread.last_message_at || '';
  if (!lastAt) return 0;
  if (row?.muted) return 0;
  if (String(thread.last_sender_name || '') === identity.name) return 0;
  if (!readAt) return 1;
  return new Date(readAt).getTime() < new Date(lastAt).getTime() ? 1 : 0;
};

async function loadThreadsFor(svc, identity, threads, participations, memberships) {
  const participantByThread = new Map(participations.map((row) => [row.conversation_id, row]));
  const membershipByGroup = new Map(memberships.map((row) => [row.group_id, row]));

  const privateIds = threads.filter((thread) => thread.type !== 'group').map((thread) => thread.id);
  const otherPeople = new Map();
  if (privateIds.length) {
    const rows = list(
      await svc.entities.ConversationParticipant.filter(
        { conversation_id: { $in: privateIds }, membership_status: 'active' },
        { limit: 200 },
      ),
    );
    rows.forEach((row) => {
      if (row.user_id === identity.id) return;
      if (!otherPeople.has(row.conversation_id)) otherPeople.set(row.conversation_id, row.user_name);
    });
  }

  return threads.map((thread) => {
    const row = participantByThread.get(thread.id) || membershipByGroup.get(thread.group_id);
    const title =
      thread.type === 'private'
        ? otherPeople.get(thread.id) || thread.title || 'Private conversation'
        : thread.type === 'official'
          ? thread.title || 'Dean\u2019s Office'
          : thread.title || 'Group';
    return threadShell(thread, {
      title,
      unread: unreadFor(row, thread, identity),
      muted: Boolean(row?.muted),
      my_role: row?.role || (thread.type === 'official' && identity.staff ? 'dean-office' : 'participant'),
    });
  });
}

// Resolves every thread the caller may see. Group visibility comes from
// membership rows; the official mailbox is visible to designated staff only.
async function threadCollection(svc, identity) {
  const participations = list(
    await svc.entities.ConversationParticipant.filter(
      { user_id: identity.id, membership_status: 'active' },
      { limit: 100 },
    ),
  );
  const memberships = list(
    await svc.entities.CommunicationGroupMember.filter(
      { user_id: identity.id, membership_status: 'active' },
      { limit: 100 },
    ),
  );

  const threadIds = participations.map((row) => row.conversation_id).filter(Boolean);
  const groupIds = memberships.map((row) => row.group_id).filter(Boolean);

  const [own, official, byGroup] = await Promise.all([
    threadIds.length
      ? svc.entities.CommunicationThread.filter({ id: { $in: threadIds } }, { sort: '-last_message_at', limit: 100 })
      : [],
    identity.staff
      ? svc.entities.CommunicationThread.filter({ type: 'official' }, { sort: '-last_message_at', limit: 100 })
      : [],
    groupIds.length
      ? svc.entities.CommunicationThread.filter({ group_id: { $in: groupIds } }, { limit: 100 })
      : [],
  ]);

  const seen = new Set();
  const threads = [];
  [...list(own), ...list(official), ...list(byGroup)].forEach((thread) => {
    if (!thread || seen.has(thread.id)) return;
    seen.add(thread.id);
    threads.push(thread);
  });

  threads.sort((a, b) => new Date(b.last_message_at || b.created_date).getTime() - new Date(a.last_message_at || a.created_date).getTime());
  return { threads, participations, memberships };
}

async function myGroups(svc, identity) {
  // A student's own class group is provisioned and reconciled on demand, so the
  // Communication Center never depends on a background job having run.
  if (identity.academicGroup) {
    const group = await ensureClassGroup(svc, identity.academicGroup, identity.student?.program);
    if (group) await syncGroupMembership(svc, group);
  }

  const memberships = list(
    await svc.entities.CommunicationGroupMember.filter(
      { user_id: identity.id, membership_status: { $in: ['active', 'pending'] } },
      { limit: 100 },
    ),
  );
  const groupIds = memberships.map((row) => row.group_id).filter(Boolean);
  const groups = groupIds.length
    ? list(await svc.entities.CommunicationGroup.filter({ id: { $in: groupIds }, status: 'active' }, { limit: 100 }))
    : [];

  if (identity.student && identity.academicGroup) {
    const discoverable = list(
      await svc.entities.CommunicationGroup.filter(
        { academic_group_id: identity.academicGroup, group_type: 'subgroup', status: 'active' },
        { limit: 40 },
      ),
    );
    discoverable.forEach((group) => {
      if (!groups.some((row) => row.id === group.id)) groups.push({ ...group, joinable: group.visibility === 'discoverable' });
    });
  }

  if (identity.staff) {
    const oversight = list(
      await svc.entities.CommunicationGroup.filter({ group_type: 'class' }, { limit: 40 }),
    );
    oversight.forEach((group) => {
      if (!groups.some((row) => row.id === group.id)) groups.push({ ...group, oversight: true });
    });
  }

  const threadIds = groups.map((row) => row.conversation_id).filter(Boolean);
  const threads = threadIds.length
    ? list(await svc.entities.CommunicationThread.filter({ id: { $in: threadIds } }, { limit: 100 }))
    : [];
  const threadById = new Map(threads.map((row) => [row.id, row]));

  return groups.map((group) => {
    const membership = memberships.find((row) => row.group_id === group.id);
    const thread = threadById.get(group.conversation_id);
    const scope = coordinatorScopeFor(identity, group);
    return {
      id: group.id,
      name: group.name,
      description: group.description || '',
      type: group.group_type,
      academic_group_id: group.academic_group_id || '',
      thread_id: group.conversation_id || '',
      member_count: group.member_count || 0,
      coordinator_name: group.coordinator_name || '',
      visibility: group.visibility,
      membership_policy: group.membership_policy,
      joinable: Boolean(group.joinable),
      oversight: Boolean(group.oversight),
      membership_status: membership?.membership_status || (group.oversight ? 'oversight' : ''),
      is_coordinator: Boolean(scope),
      muted: Boolean(membership?.muted),
      unread: thread ? unreadFor(membership, thread, identity) : 0,
      last_activity_at: thread?.last_message_at || group.last_activity_at || group.created_date,
    };
  });
}

async function unreadTotals(svc, identity) {
  const { threads, participations, memberships } = await threadCollection(svc, identity);
  const unreadMessages = (await loadThreadsFor(svc, identity, threads, participations, memberships)).reduce(
    (sum, thread) => sum + thread.unread,
    0,
  );
  const unreadNotifications = await svc.entities.Notification.count({ user_id: identity.id, is_read: false });
  return { unreadMessages, unreadNotifications };
}

function canGovern(identity) {
  return identity.canGovern;
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const svc = base44.asServiceRole;
    const identity = await resolveIdentity(svc, user);
    const body = await req.json().catch(() => ({}));
    const action = String(body.action || '');

    if (!canUseCommunication(identity)) {
      return Response.json(
        { error: 'This account cannot use communication services', blocked: true, status: identity.status },
        { status: 403 },
      );
    }

    // ── bootstrap ───────────────────────────────────────────────────────────
    if (action === 'bootstrap') {
      const counts = await unreadTotals(svc, identity);
      const scopes = identity.coordinatorScopes.map((row) => ({
        scope_type: row.scope_type,
        academic_group_id: row.academic_group_id || '',
        group_id: row.group_id || '',
      }));
      return Response.json({
        identity: {
          id: identity.id,
          name: identity.name,
          role: identity.role,
          staff: identity.staff,
          canModerate: identity.canModerate,
          canGovern: canGovern(identity),
          academicGroup: identity.academicGroup,
          academicYear: identity.academicYear ?? null,
          studentId: identity.studentId || '',
          identityConflicts: identity.identityConflicts || [],
          cohorts: [identity.academicGroup].filter(Boolean),
          coordinatorScopes: scopes,
        },
        counts,
      });
    }

    // ── official thread detail (staff and requester) ─────────────────────────
    if (action === 'inbox') {
      const { threads, participations, memberships } = await threadCollection(svc, identity);
      const enriched = await loadThreadsFor(svc, identity, threads, participations, memberships);
      const filter = String(body.filter || 'all');
      const items = enriched.filter((thread) => {
        if (filter === 'private') return thread.type === 'private';
        if (filter === 'official') return thread.type === 'official';
        if (filter === 'groups') return thread.type === 'group';
        return true;
      });
      return Response.json({ items, counts: await unreadTotals(svc, identity) });
    }

    if (action === 'groups') {
      return Response.json({ items: await myGroups(svc, identity) });
    }

    if (action === 'candidates') {
      const all = await conversationCandidates(svc, identity);
      const query = clean(body.q, 60).toLowerCase();
      const items = query
        ? all.filter((row) => `${row.name} ${row.group} ${row.role}`.toLowerCase().includes(query))
        : all;
      return Response.json({ items: items.slice(0, 60), officialOnly: identity.role === 'student' });
    }

    if (action === 'thread') {
      const threadId = String(body.threadId || '');
      if (!threadId) return Response.json({ error: 'threadId is required' }, { status: 400 });
      const { thread, participantRow, membershipRow, access } = await loadThread(svc, identity, threadId);
      if (!access.allowed) return Response.json({ error: 'Conversation not available' }, { status: 404 });

      const [messages, participants] = await Promise.all([
        svc.entities.CommunicationMessage.filter(
          { thread_id: thread.id },
          { sort: '-created_date', limit: 60 },
        ),
        thread.type === 'group' ? groupMembers(svc, thread.group_id) : threadParticipants(svc, thread.id),
      ]);

      const group = thread.group_id
        ? await svc.entities.CommunicationGroup.get(thread.group_id).catch((e) =>
            e.status === 404 ? null : Promise.reject(e),
          )
        : null;
      const scope = group ? coordinatorScopeFor(identity, group) : null;

      return Response.json({
        thread: threadShell(thread, {
          title:
            thread.type === 'private'
              ? participants.find((row) => row.user_id !== identity.id)?.user_name || thread.title
              : thread.title,
          assigned_to_name: thread.assigned_to_name || '',
          group_name: group?.name || '',
          coordinator_name: group?.coordinator_name || '',
          member_count: group?.member_count || 0,
          muted: Boolean(participantRow?.muted || membershipRow?.muted),
        }),
        messages: list(messages).reverse().map((message) => ({
          id: message.id,
          body: message.moderation_status === 'hidden' ? '' : message.body || '',
          hidden: message.moderation_status === 'hidden',
          mine: message.sender_user_id === identity.id,
          sender_name: message.sender_name,
          sender_role: message.sender_role,
          kind: message.kind,
          created_date: message.created_date,
          edited_at: message.edited_at || '',
          reply_to_preview: message.reply_to_preview || '',
          attachments: (message.attachments || []).map((row, index) => ({
            index,
            name: row.name,
            mime: row.mime,
            size: row.size,
          })),
          reactions: (message.reactions || []).map((row) => ({
            emoji: row.emoji,
            user_id: row.user_id,
            user_name: row.user_name,
          })),
          pinned: Boolean(message.pinned),
        })),
        participants: participants.map((row) => ({
          user_id: row.user_id,
          name: row.user_name || row.user_name,
          role: row.user_role,
          group_role: row.role || '',
          status: row.membership_status || 'active',
        })),
        permissions: {
          canPost: canPostInThread(identity, access, thread),
          canPin: canPin(identity, access),
          canManageStatus: identity.staff,
          canInvite: Boolean(scope) || identity.staff,
          isCoordinator: Boolean(scope),
          isStaff: identity.staff,
        },
        status: thread.status || '',
      });
    }

    if (action === 'markRead') {
      const { thread, participantRow, membershipRow, access } = await loadThread(svc, identity, String(body.threadId || ''));
      if (!access.allowed) return Response.json({ error: 'Conversation not available' }, { status: 404 });
      await markThreadRead(svc, identity, thread, participantRow, membershipRow);
      return Response.json({ ok: true });
    }

    if (action === 'mute') {
      const { thread, participantRow, membershipRow, access } = await loadThread(svc, identity, String(body.threadId || ''));
      if (!access.allowed) return Response.json({ error: 'Conversation not available' }, { status: 404 });
      const muted = Boolean(body.muted);
      if (thread.type === 'group' && membershipRow) {
        await svc.entities.CommunicationGroupMember.update(membershipRow.id, { muted });
      } else if (participantRow) {
        await svc.entities.ConversationParticipant.update(participantRow.id, { muted });
      }
      return Response.json({ ok: true, muted });
    }

    // ── sending ─────────────────────────────────────────────────────────────
    if (action === 'send') {
      const threadId = String(body.threadId || '');
      if (!threadId) return Response.json({ error: 'threadId is required' }, { status: 400 });

      const sent = await countSince(svc, 'CommunicationMessage', { sender_user_id: identity.id }, 60 * 1000);
      if (sent >= 30) return Response.json({ error: 'You are sending messages too quickly. Try again shortly.' }, { status: 429 });

      const { thread, participantRow, access } = await loadThread(svc, identity, threadId);
      if (!access.allowed) return Response.json({ error: 'Conversation not available' }, { status: 404 });
      if (!canPostInThread(identity, access, thread)) {
        return Response.json({ error: 'You cannot post in this conversation' }, { status: 403 });
      }

      const { attachments, error: attachmentError } = sanitiseAttachments(body.attachments);
      if (attachmentError) return Response.json({ error: attachmentError }, { status: 400 });
      if (String(body.body || '').length > MESSAGE_LIMIT) {
        return Response.json({ error: `A message may be up to ${MESSAGE_LIMIT} characters` }, { status: 400 });
      }

      // Staff replying in the official mailbox join the thread they answer, so
      // the requester can continue with the same person.
      if (thread.type === 'official' && !participantRow && identity.staff) {
        await svc.entities.ConversationParticipant.create({
          conversation_id: thread.id,
          user_id: identity.id,
          user_name: identity.name,
          user_role: 'staff',
          joined_at: nowIso(),
          last_read_at: nowIso(),
          muted: false,
          membership_status: 'active',
        });
      }

      const result = await appendMessage(svc, identity, thread, {
        body: body.body,
        replyTo: body.replyToId,
        attachments,
        clientKey: body.clientKey,
        kind: 'text',
      });
      if (result.error) return Response.json({ error: result.error }, { status: result.status || 400 });

      if (thread.type === 'official' && identity.staff && thread.status === 'open') {
        await svc.entities.CommunicationThread.update(thread.id, {
          status: 'in_progress',
          assigned_to_name: identity.name,
        });
      }

      const recipients = await messageRecipients(svc, identity, {
        ...thread,
        message_count: (Number(thread.message_count) || 0) + 1,
      });
      const group = thread.group_id
        ? await svc.entities.CommunicationGroup.get(thread.group_id).catch(() => null)
        : null;

      await notify(
        svc,
        recipients.map((row) => ({
          user_id: row.user_id,
          title:
            thread.type === 'group'
              ? `${identity.name} · ${group?.name || 'Group'}`
              : thread.type === 'official'
                ? identity.staff
                  ? 'Dean\u2019s Office replied to your enquiry'
                  : `New Dean\u2019s Office enquiry · ${thread.category || 'Official'}`
                : `${identity.name} sent you a message`,
          // Official and group notifications stay generic: no message text
          // leaves the authorised conversation view.
          body:
            thread.type === 'official'
              ? `${thread.category || 'Official enquiry'} · ${identity.staff ? 'Official reply' : 'New enquiry'}`
              : preview(body.body || 'Attachment', 110),
          category: thread.type === 'official' ? 'official' : 'message',
          notification_type: thread.type === 'group' ? 'group_message' : 'private_message',
          // Sender and conversation metadata are resolved here, from the
          // authenticated identity and the authorised thread — never from the
          // request body.
          sender_name: identity.name,
          conversation_name:
            thread.type === 'group'
              ? group?.name || 'Group'
              : thread.type === 'official'
                ? `Dean\u2019s Office \u00b7 ${thread.category || 'Official'}`
                : 'Private conversation',
          message_id: result.message.id,
          link: threadLink(thread, result.message.id),
          dedupe_key: `msg:${result.message.id}:${row.user_id}`,
        })),
      );

      return Response.json({ message: result.message, duplicate: Boolean(result.duplicate) });
    }

    if (action === 'editMessage' || action === 'deleteMessage') {
      const messageId = String(body.messageId || '');
      const message = await svc.entities.CommunicationMessage.get(messageId).catch((e) =>
        e.status === 404 ? null : Promise.reject(e),
      );
      if (!message) return Response.json({ error: 'Message not available' }, { status: 404 });
      const { access } = await loadThread(svc, identity, message.thread_id);
      if (!access.allowed) return Response.json({ error: 'Message not available' }, { status: 404 });
      if (message.sender_user_id !== identity.id) {
        return Response.json({ error: 'You can only change your own messages' }, { status: 403 });
      }

      if (action === 'deleteMessage') {
        await svc.entities.CommunicationMessage.update(message.id, {
          deleted_at: nowIso(),
          body: '',
          moderation_status: 'removed',
        });
        return Response.json({ ok: true });
      }

      const age = Date.now() - new Date(message.created_date).getTime();
      if (age > 15 * 60 * 1000) {
        return Response.json({ error: 'Messages can only be edited within 15 minutes' }, { status: 403 });
      }
      const text = clean(body.body, MESSAGE_LIMIT);
      if (!text) return Response.json({ error: 'Write a message before saving' }, { status: 400 });
      await svc.entities.CommunicationMessage.update(message.id, {
        body: text.replace(/[<>]/g, ''),
        edited_at: nowIso(),
      });
      return Response.json({ ok: true });
    }

    if (action === 'pin') {
      const messageId = String(body.messageId || '');
      const message = await svc.entities.CommunicationMessage.get(messageId).catch((e) =>
        e.status === 404 ? null : Promise.reject(e),
      );
      if (!message) return Response.json({ error: 'Message not available' }, { status: 404 });
      const { thread, access } = await loadThread(svc, identity, message.thread_id);
      if (!access.allowed) return Response.json({ error: 'Message not available' }, { status: 404 });
      if (!canPin(identity, access)) {
        return Response.json({ error: 'Only coordinators and staff can pin messages' }, { status: 403 });
      }
      await svc.entities.CommunicationMessage.update(message.id, { pinned: Boolean(body.pinned) });
      await audit(base44, identity, {
        action: 'communication_message_pinned',
        target: thread.title || thread.id,
        targetId: message.id,
        details: `Pin state set to ${Boolean(body.pinned)}.`,
      });
      return Response.json({ ok: true });
    }

    if (action === 'report') {
      const reported = await countSince(svc, 'MessageReport', { reporter_user_id: identity.id }, 60 * 60 * 1000);
      if (reported >= 20) return Response.json({ error: 'Too many reports in a short period' }, { status: 429 });

      const messageId = String(body.messageId || '');
      const message = await svc.entities.CommunicationMessage.get(messageId).catch((e) =>
        e.status === 404 ? null : Promise.reject(e),
      );
      if (!message) return Response.json({ error: 'Message not available' }, { status: 404 });
      const { thread, access } = await loadThread(svc, identity, message.thread_id);
      if (!access.allowed) return Response.json({ error: 'Message not available' }, { status: 404 });

      const report = await svc.entities.MessageReport.create({
        message_id: message.id,
        conversation_id: message.thread_id,
        group_id: message.group_id || '',
        reporter_user_id: identity.id,
        reporter_name: identity.name,
        accused_user_id: message.sender_user_id,
        accused_name: message.sender_name,
        reason: REPORT_REASONS.includes(body.reason) ? body.reason : 'other',
        note: clean(body.note, 500),
        excerpt: preview(message.body || '', 200),
        status: 'open',
      });

      const moderators = list(await svc.entities.User.list('-created_date', 60)).filter((row) =>
        ['dean', 'admin', 'deputy_dean'].includes(row.role),
      );
      await notify(
        svc,
        moderators.map((row) => ({
          user_id: row.id,
          title: 'New message report',
          body: `${thread.title || 'A conversation'} · reported for ${report.reason}`,
          category: 'security',
          notification_type: 'moderation_report',
          link: '/communication/moderation',
          dedupe_key: `report:${report.id}:${row.id}`,
        })),
      );

      await audit(base44, identity, {
        action: 'communication_message_reported',
        target: thread.title || thread.id,
        targetId: report.id,
        details: `Reason ${report.reason}. Message content not copied into the audit log.`,
      });

      return Response.json({ ok: true });
    }

    if (action === 'startPrivate') {
      const started = await countSince(
        svc,
        'CommunicationThread',
        { created_by: identity.id, type: 'private' },
        10 * 60 * 1000,
      );
      if (started >= 10) return Response.json({ error: 'Too many new conversations. Try again later.' }, { status: 429 });

      const targetId = String(body.targetUserId || '');
      if (!targetId || targetId === identity.id) {
        return Response.json({ error: 'Choose a recipient from the directory' }, { status: 400 });
      }

      // The recipient must appear in the caller's server-derived candidate list.
      const candidates = await conversationCandidates(svc, identity);
      const target = candidates.find((row) => row.user_id === targetId);
      if (!target) return Response.json({ error: 'You are not authorised to message this person' }, { status: 403 });

      const key = pairKey(identity.id, targetId);
      const existing = list(
        await svc.entities.CommunicationThread.filter({ type: 'private', participant_key: key }, { limit: 2 }),
      )[0];
      if (existing) return Response.json({ threadId: existing.id, existing: true });

      const thread = await svc.entities.CommunicationThread.create({
        type: 'private',
        title: `${identity.name} · ${target.name}`,
        created_by: identity.id,
        created_by_name: identity.name,
        participant_key: key,
        last_message_at: nowIso(),
        message_count: 0,
        is_demo: false,
      });

      await svc.entities.ConversationParticipant.bulkCreate([
        {
          conversation_id: thread.id,
          user_id: identity.id,
          user_name: identity.name,
          user_role: identity.role,
          joined_at: nowIso(),
          last_read_at: nowIso(),
          muted: false,
          membership_status: 'active',
        },
        {
          conversation_id: thread.id,
          user_id: targetId,
          user_name: target.name,
          user_role: target.role,
          joined_at: nowIso(),
          last_read_at: '',
          muted: false,
          membership_status: 'active',
        },
      ]);

      await audit(base44, identity, {
        action: 'communication_thread_created',
        target: target.name,
        targetId: thread.id,
        details: `Private conversation opened from an authorised directory match: ${target.reason}.`,
      });

      return Response.json({ threadId: thread.id });
    }

    if (action === 'startOfficial') {
      const opened = await countSince(
        svc,
        'CommunicationThread',
        { created_by: identity.id, type: 'official' },
        60 * 60 * 1000,
      );
      if (opened >= 5) return Response.json({ error: 'Too many enquiries opened recently' }, { status: 429 });

      const category = OFFICIAL_CATEGORIES.includes(body.category) ? body.category : 'Other';
      const subject = clean(body.subject, 140);
      if (!subject) return Response.json({ error: 'Add a short subject' }, { status: 400 });

      const { attachments, error: attachmentError } = sanitiseAttachments(body.attachments);
      if (attachmentError) return Response.json({ error: attachmentError }, { status: 400 });

      let recipient = null;
      if (identity.staff) {
        const candidates = await conversationCandidates(svc, identity);
        recipient = candidates.find((row) => row.user_id === String(body.targetUserId || ''));
        if (!recipient) return Response.json({ error: 'Choose an authorised recipient' }, { status: 403 });
      }

      const title = identity.staff
        ? `${category} · ${recipient.name}`
        : `${category} · ${identity.name}`;

      const thread = await svc.entities.CommunicationThread.create({
        type: 'official',
        title,
        created_by: identity.id,
        created_by_name: identity.name,
        category,
        status: identity.staff ? 'assigned' : 'open',
        assigned_to_name: identity.staff ? identity.name : '',
        last_message_at: nowIso(),
        message_count: 0,
        is_demo: false,
      });

      const people = identity.staff
        ? [
            { id: identity.id, name: identity.name, role: 'staff' },
            { id: recipient.user_id, name: recipient.name, role: recipient.role },
          ]
        : [{ id: identity.id, name: identity.name, role: identity.role }];

      await svc.entities.ConversationParticipant.bulkCreate(
        people.map((person) => ({
          conversation_id: thread.id,
          user_id: person.id,
          user_name: person.name,
          user_role: person.role,
          joined_at: nowIso(),
          last_read_at: person.id === identity.id ? nowIso() : '',
          muted: false,
          membership_status: 'active',
        })),
      );

      const result = await appendMessage(svc, identity, thread, {
        body: `${subject}\n\n${clean(body.body, MESSAGE_LIMIT)}`,
        attachments,
        clientKey: body.clientKey,
      });
      if (result.error) return Response.json({ error: result.error }, { status: 400 });

      if (!identity.staff) {
        const staff = list(await svc.entities.User.list('-created_date', 60)).filter((row) =>
          ['dean', 'deputy_dean', 'academic_staff', 'admin'].includes(row.role),
        );
        await notify(
          svc,
          staff.map((row) => ({
            user_id: row.id,
            title: `New Dean\u2019s Office enquiry · ${category}`,
            body: 'A student opened an official enquiry. Open the Dean\u2019s Office mailbox to respond.',
            category: 'official',
            notification_type: 'official_enquiry',
            link: '/communication',
            dedupe_key: `official:${thread.id}:${row.id}`,
          })),
        );
      } else {
        await notify(svc, [
          {
            user_id: recipient.user_id,
            title: `Official message from the Dean\u2019s Office · ${category}`,
            body: `${subject}`,
            category: 'official',
            notification_type: 'official_message',
            link: threadLink(thread),
            dedupe_key: `official:${thread.id}:${recipient.user_id}`,
          },
        ]);
      }

      await audit(base44, identity, {
        action: 'communication_official_opened',
        target: title,
        targetId: thread.id,
        details: `Official enquiry category ${category}. Subject recorded; message content not copied to audit.`,
      });

      return Response.json({ threadId: thread.id });
    }

    if (action === 'setOfficialStatus') {
      if (!identity.staff) return Response.json({ error: 'Forbidden' }, { status: 403 });
      const threadId = String(body.threadId || '');
      const status = OFFICIAL_STATUSES.includes(body.status) ? body.status : null;
      if (!status) return Response.json({ error: 'Unknown status' }, { status: 400 });
      const thread = await svc.entities.CommunicationThread.get(threadId).catch((e) =>
        e.status === 404 ? null : Promise.reject(e),
      );
      if (!thread || thread.type !== 'official') return Response.json({ error: 'Enquiry not found' }, { status: 404 });

      await svc.entities.CommunicationThread.update(thread.id, {
        status,
        assigned_to_name: thread.assigned_to_name || identity.name,
      });
      const participants = await threadParticipants(svc, thread.id);
      await notify(
        svc,
        participants
          .filter((row) => row.user_id !== identity.id)
          .map((row) => ({
            user_id: row.user_id,
            title: 'Official enquiry updated',
            body: `Status changed to ${status.replace(/_/g, ' ')}.`,
            category: 'official',
            notification_type: 'official_status',
            link: threadLink(thread),
            dedupe_key: `status:${thread.id}:${status}:${row.user_id}`,
          })),
      );
      await audit(base44, identity, {
        action: 'communication_official_status',
        target: thread.title || thread.id,
        targetId: thread.id,
        details: `Status set to ${status}.`,
      });
      return Response.json({ ok: true, status });
    }

    // ── groups and subgroups ────────────────────────────────────────────────
    if (action === 'createSubgroup') {
      if (identity.role !== 'student' && !identity.staff) {
        return Response.json({ error: 'Only students and staff can create subgroups' }, { status: 403 });
      }
      const created = await countSince(
        svc,
        'CommunicationGroup',
        { created_by: identity.id, group_type: 'subgroup' },
        24 * 60 * 60 * 1000,
      );
      if (created >= 5) return Response.json({ error: 'Subgroup limit reached for today' }, { status: 429 });

      const name = clean(body.name, 80);
      if (name.length < 3) return Response.json({ error: 'Give the subgroup a name' }, { status: 400 });

      const parent = identity.academicGroup ? await findClassGroup(svc, identity.academicGroup) : null;
      const group = await ensureSubgroup(svc, identity, {
        name,
        description: body.description,
        visibility: body.visibility,
        membershipPolicy: body.membershipPolicy,
        parentGroupId: parent?.id || '',
      });

      await audit(base44, identity, {
        action: 'communication_group_created',
        target: group.name,
        targetId: group.id,
        details: 'Subgroup created; creator recorded as coordinator.',
      });

      return Response.json({ group: { id: group.id, name: group.name } });
    }

    if (action === 'invite') {
      const groupId = String(body.groupId || '');
      const group = await svc.entities.CommunicationGroup.get(groupId).catch((e) =>
        e.status === 404 ? null : Promise.reject(e),
      );
      if (!group) return Response.json({ error: 'Group not found' }, { status: 404 });

      const scope = coordinatorScopeFor(identity, group);
      if (!scope && !identity.staff) {
        return Response.json({ error: 'Only the group coordinator can create invitations' }, { status: 403 });
      }

      const issued = await countSince(svc, 'GroupInvitation', { created_by: identity.id }, 60 * 60 * 1000);
      if (issued >= 20) return Response.json({ error: 'Too many invitations created recently' }, { status: 429 });

      const { invitation, token } = await createInvitation(svc, identity, group, body);
      await audit(base44, identity, {
        action: 'communication_invitation_created',
        target: group.name,
        targetId: invitation.id,
        details: `Invitation valid for ${body.expiresInHours || 72} hours, ${invitation.maximum_uses} uses.`,
      });
      return Response.json({ invitation: { id: invitation.id }, token, path: `/invite/${token}` });
    }

    if (action === 'invitations') {
      const groupId = String(body.groupId || '');
      const group = await svc.entities.CommunicationGroup.get(groupId).catch((e) =>
        e.status === 404 ? null : Promise.reject(e),
      );
      if (!group) return Response.json({ error: 'Group not found' }, { status: 404 });
      const scope = coordinatorScopeFor(identity, group);
      if (!scope && !identity.staff) return Response.json({ error: 'Forbidden' }, { status: 403 });

      const rows = list(
        await svc.entities.GroupInvitation.filter({ group_id: group.id }, { sort: '-created_date', limit: 20 }),
      );
      return Response.json({
        items: rows.map((row) => ({
          id: row.id,
          status: invitationState(row),
          expires_at: row.expires_at,
          maximum_uses: row.maximum_uses,
          usage_count: row.usage_count,
          approval_required: row.approval_required,
          created_by_name: row.created_by_name,
          created_date: row.created_date,
        })),
      });
    }

    if (action === 'revokeInvitation') {
      const invitationId = String(body.invitationId || '');
      const invitation = await svc.entities.GroupInvitation.get(invitationId).catch((e) =>
        e.status === 404 ? null : Promise.reject(e),
      );
      if (!invitation) return Response.json({ error: 'Invitation not found' }, { status: 404 });
      const group = await svc.entities.CommunicationGroup.get(invitation.group_id).catch(() => null);
      const scope = group ? coordinatorScopeFor(identity, group) : null;
      if (!scope && !identity.staff) return Response.json({ error: 'Forbidden' }, { status: 403 });

      await svc.entities.GroupInvitation.update(invitation.id, {
        status: 'revoked',
        revoked_at: nowIso(),
      });
      await audit(base44, identity, {
        action: 'communication_invitation_revoked',
        target: invitation.group_name || invitation.group_id,
        targetId: invitation.id,
        details: 'Invitation link revoked.',
      });
      return Response.json({ ok: true });
    }

    // Preview is deliberately minimal: a signed-in caller learns the group name
    // only, never the member list or any academic record.
    if (action === 'invitationPreview') {
      const token = String(body.token || '').slice(0, 128);
      if (!token) return Response.json({ error: 'Invitation not found' }, { status: 404 });
      const hash = await sha256Hex(token);
      const invitation = list(
        await svc.entities.GroupInvitation.filter({ token_hash: hash }, { limit: 1 }),
      )[0];
      const state = invitationState(invitation);
      if (!invitation || state !== 'active') {
        return Response.json({ valid: false, state, group: null });
      }
      const group = await svc.entities.CommunicationGroup.get(invitation.group_id).catch(() => null);
      if (!group || group.status !== 'active') return Response.json({ valid: false, state: 'unavailable', group: null });
      return Response.json({
        valid: true,
        state,
        group: {
          name: group.name,
          description: group.description || '',
          academic_group_id: group.academic_group_id || '',
          approval_required: Boolean(invitation.approval_required),
        },
        eligible_group: identity.academicGroup === (group.academic_group_id || identity.academicGroup),
      });
    }

    if (action === 'acceptInvitation') {
      const accepted = await countSince(svc, 'CommunicationGroupMember', { user_id: identity.id, membership_source: 'invitation' }, 60 * 60 * 1000);
      if (accepted >= 20) return Response.json({ error: 'Too many joins in a short period' }, { status: 429 });

      const token = String(body.token || '').slice(0, 128);
      const hash = await sha256Hex(token);
      const invitation = list(
        await svc.entities.GroupInvitation.filter({ token_hash: hash }, { limit: 1 }),
      )[0];
      const state = invitationState(invitation);
      if (!invitation || state !== 'active') {
        return Response.json({ error: 'This invitation is no longer valid', state }, { status: 410 });
      }

      const group = await svc.entities.CommunicationGroup.get(invitation.group_id).catch(() => null);
      if (!group || group.status !== 'active') {
        return Response.json({ error: 'This group is no longer available' }, { status: 410 });
      }

      if (group.academic_group_id && group.academic_group_id !== identity.academicGroup) {
        return Response.json({ error: 'This invitation belongs to another academic group' }, { status: 403 });
      }
      if (group.group_type === 'class') {
        const member = list(
          await svc.entities.CommunicationGroupMember.filter({ group_id: group.id, user_id: identity.id }, { limit: 1 }),
        )[0];
        if (!member) return Response.json({ error: 'Class membership follows your academic record' }, { status: 403 });
      }

      const status = invitation.approval_required ? 'pending' : 'active';
      const { member } = await addMember(svc, group, identity, { source: 'invitation', status });

      await svc.entities.GroupInvitation.update(invitation.id, {
        usage_count: (Number(invitation.usage_count) || 0) + 1,
        status:
          (Number(invitation.usage_count) || 0) + 1 >= Number(invitation.maximum_uses) ? 'exhausted' : 'active',
      });

      const coordinators = list(
        await svc.entities.CommunicationGroupMember.filter(
          { group_id: group.id, role: 'coordinator', membership_status: 'active' },
          { limit: 5 },
        ),
      );
      await notify(
        svc,
        coordinators
          .filter((row) => row.user_id !== identity.id)
          .map((row) => ({
            user_id: row.user_id,
            title: status === 'pending' ? 'Membership request to approve' : 'A student joined your subgroup',
            body: `${identity.name} · ${group.name}`,
            category: 'message',
            notification_type: 'group_membership',
            link: `/communication/groups?group=${group.id}`,
            dedupe_key: `join:${group.id}:${identity.id}:${row.user_id}`,
          })),
      );

      await audit(base44, identity, {
        action: 'communication_invitation_accepted',
        target: group.name,
        targetId: group.id,
        details: `Membership ${status} through an invitation link.`,
      });

      return Response.json({
        ok: true,
        status,
        group: { id: group.id, name: group.name, thread_id: group.conversation_id || '' },
      });
    }

    if (action === 'approveMember') {
      const memberId = String(body.memberId || '');
      const member = await svc.entities.CommunicationGroupMember.get(memberId).catch((e) =>
        e.status === 404 ? null : Promise.reject(e),
      );
      if (!member) return Response.json({ error: 'Membership not found' }, { status: 404 });
      const group = await svc.entities.CommunicationGroup.get(member.group_id).catch(() => null);
      const scope = group ? coordinatorScopeFor(identity, group) : null;
      if (!scope && !identity.staff) return Response.json({ error: 'Forbidden' }, { status: 403 });

      await svc.entities.CommunicationGroupMember.update(member.id, {
        membership_status: 'active',
        joined_at: nowIso(),
      });
      await notify(svc, [
        {
          user_id: member.user_id,
          title: `You were admitted to ${group.name}`,
          body: 'Your membership was approved.',
          category: 'message',
          notification_type: 'group_membership',
          link: `/communication?thread=${group.conversation_id}`,
          dedupe_key: `approved:${member.id}`,
        },
      ]);
      await audit(base44, identity, {
        action: 'communication_membership_approved',
        target: group.name,
        targetId: member.id,
        details: `Membership activated for ${member.user_name}.`,
      });
      return Response.json({ ok: true });
    }

    if (action === 'leaveGroup') {
      const groupId = String(body.groupId || '');
      const group = await svc.entities.CommunicationGroup.get(groupId).catch((e) =>
        e.status === 404 ? null : Promise.reject(e),
      );
      if (!group) return Response.json({ error: 'Group not found' }, { status: 404 });
      if (group.group_type === 'class') {
        return Response.json({ error: 'Class group membership follows your academic record' }, { status: 403 });
      }
      const member = list(
        await svc.entities.CommunicationGroupMember.filter(
          { group_id: group.id, user_id: identity.id, membership_status: 'active' },
          { limit: 1 },
        ),
      )[0];
      if (!member) return Response.json({ error: 'You are not a member' }, { status: 404 });

      await svc.entities.CommunicationGroupMember.update(member.id, {
        membership_status: 'left',
        left_at: nowIso(),
      });
      const count = await svc.entities.CommunicationGroupMember.count({
        group_id: group.id,
        membership_status: 'active',
      });
      await svc.entities.CommunicationGroup.update(group.id, { member_count: count });
      await audit(base44, identity, {
        action: 'communication_membership_left',
        target: group.name,
        targetId: group.id,
        details: 'Member left the subgroup.',
      });
      return Response.json({ ok: true });
    }

    if (action === 'groupMembers') {
      const groupId = String(body.groupId || '');
      const group = await svc.entities.CommunicationGroup.get(groupId).catch((e) =>
        e.status === 404 ? null : Promise.reject(e),
      );
      if (!group) return Response.json({ error: 'Group not found' }, { status: 404 });

      const mine = list(
        await svc.entities.CommunicationGroupMember.filter(
          { group_id: group.id, user_id: identity.id, membership_status: 'active' },
          { limit: 1 },
        ),
      )[0];
      if (!mine && !identity.staff) return Response.json({ error: 'Group not available' }, { status: 404 });

      const rows = await groupMembers(svc, group.id, { activeOnly: false });
      const scope = coordinatorScopeFor(identity, group);
      return Response.json({
        group: {
          id: group.id,
          name: group.name,
          description: group.description || '',
          coordinator_name: group.coordinator_name || '',
          member_count: group.member_count || 0,
          type: group.group_type,
          academic_group_id: group.academic_group_id || '',
          thread_id: group.conversation_id || '',
          is_coordinator: Boolean(scope),
          canInvite: Boolean(scope) || identity.staff,
        },
        members: rows.map((row) => ({
          id: row.id,
          user_id: row.user_id,
          name: row.user_name,
          role: row.role,
          status: row.membership_status,
          source: row.membership_source,
          joined_at: row.joined_at,
        })),
      });
    }

    if (action === 'downloadAttachment') {
      const messageId = String(body.messageId || '');
      const index = Number(body.index);
      const message = await svc.entities.CommunicationMessage.get(messageId).catch((e) =>
        e.status === 404 ? null : Promise.reject(e),
      );
      if (!message) return Response.json({ error: 'File not available' }, { status: 404 });
      const { access } = await loadThread(svc, identity, message.thread_id);
      if (!access.allowed) return Response.json({ error: 'File not available' }, { status: 404 });

      const attachment = (message.attachments || [])[index];
      if (!attachment) return Response.json({ error: 'File not available' }, { status: 404 });

      const signed = await svc.integrations.Core.CreateFileSignedUrl({
        file_uri: attachment.file_uri,
        expires_in: 120,
      });

      await audit(base44, identity, {
        action: 'communication_attachment_downloaded',
        target: attachment.name,
        targetId: message.id,
        details: 'Short-lived signed link issued after membership verification.',
      });

      return Response.json({ url: signed.signed_url, name: attachment.name, expires_in: 120 });
    }

    // Reactions, voice-note transcription and the writing assistant each own
    // their authorisation and provider call in one shared module.
    if (action === 'react') return handleReact(base44, svc, identity, body);
    if (action === 'transcribe') return handleTranscribe(base44, svc, identity, body);
    if (action === 'assistant') return handleAssistant(base44, svc, identity, body);

    // ── notifications ───────────────────────────────────────────────────────
    if (action === 'notifications') {
      const unreadOnly = Boolean(body.unreadOnly);
      const rows = list(
        await svc.entities.Notification.filter(
          unreadOnly ? { user_id: identity.id, is_read: false } : { user_id: identity.id },
          { sort: '-created_date', limit: 50 },
        ),
      );
      return Response.json({
        items: rows.map((row) => ({
          id: row.id,
          title: row.title,
          body: row.body || '',
          category: row.category || '',
          type: row.notification_type || '',
          link: row.link || '',
          sender_name: row.sender_name || '',
          conversation_name: row.conversation_name || '',
          message_id: row.message_id || '',
          is_read: Boolean(row.is_read),
          created_date: row.created_date,
        })),
        // The true unread total, not just the unread rows on this page.
        unread: rows.filter((row) => !row.is_read).length,
        unreadTotal: await svc.entities.Notification.count({ user_id: identity.id, is_read: false }),
      });
    }

    if (action === 'notificationsRead') {
      const notificationId = String(body.notificationId || '');
      if (notificationId) {
        const row = await svc.entities.Notification.get(notificationId).catch((e) =>
          e.status === 404 ? null : Promise.reject(e),
        );
        // IDOR guard: the record must belong to the caller.
        if (!row || row.user_id !== identity.id) {
          return Response.json({ error: 'Notification not found' }, { status: 404 });
        }
        await svc.entities.Notification.update(row.id, { is_read: true });
        return Response.json({ ok: true });
      }
      await svc.entities.Notification.updateMany(
        { user_id: identity.id, is_read: false },
        { $set: { is_read: true } },
      );
      return Response.json({ ok: true });
    }

    // ── moderation ──────────────────────────────────────────────────────────
    if (action === 'reports') {
      if (!identity.canModerate) return Response.json({ error: 'Forbidden' }, { status: 403 });
      const rows = list(
        await svc.entities.MessageReport.filter({}, { sort: '-created_date', limit: 50 }),
      );
      return Response.json({
        items: rows.map((row) => ({
          id: row.id,
          message_id: row.message_id,
          reporter_name: row.reporter_name,
          accused_name: row.accused_name || '',
          reason: row.reason,
          note: row.note || '',
          excerpt: row.excerpt || '',
          status: row.status,
          created_date: row.created_date,
          reviewed_by: row.reviewed_by || '',
          resolution: row.resolution || '',
        })),
      });
    }

    if (action === 'resolveReport') {
      if (!identity.canModerate) return Response.json({ error: 'Forbidden' }, { status: 403 });
      const reportId = String(body.reportId || '');
      const report = await svc.entities.MessageReport.get(reportId).catch((e) =>
        e.status === 404 ? null : Promise.reject(e),
      );
      if (!report) return Response.json({ error: 'Report not found' }, { status: 404 });

      const outcome = body.outcome === 'hide' ? 'hide' : 'dismiss';
      if (outcome === 'hide') {
        await svc.entities.CommunicationMessage.update(report.message_id, {
          moderation_status: 'hidden',
          moderation_note: clean(body.note, 300),
        });
      }
      await svc.entities.MessageReport.update(report.id, {
        status: outcome === 'hide' ? 'actioned' : 'dismissed',
        reviewed_by: identity.name,
        reviewed_at: nowIso(),
        resolution: clean(body.note, 300),
      });

      await notify(svc, [
        {
          user_id: report.reporter_user_id,
          title: 'Your report was reviewed',
          body: outcome === 'hide' ? 'Action was taken on the reported message.' : 'No action was taken on this report.',
          category: 'security',
          notification_type: 'moderation_result',
          link: '/communication',
          dedupe_key: `reportresult:${report.id}`,
        },
      ]);

      await audit(base44, identity, {
        action: 'communication_moderation_decision',
        target: report.accused_name || report.message_id,
        targetId: report.id,
        details: `Outcome ${outcome}. Message content not copied into the audit log.`,
      });
      return Response.json({ ok: true });
    }

    // ── coordinators (administrator or dean only) ───────────────────────────
    if (action === 'coordinators') {
      if (!identity.canGovern) return Response.json({ error: 'Forbidden' }, { status: 403 });
      const query = clean(body.q, 40).toLowerCase();
      const rows = list(
        await svc.entities.CoordinatorAssignment.filter({}, { sort: '-created_date', limit: 100 }),
      );
      const items = rows
        .filter((row) =>
          !query ||
          `${row.coordinator_name} ${row.academic_group_id}`.toLowerCase().includes(query),
        )
        .map((row) => ({
          id: row.id,
          coordinator_user_id: row.coordinator_user_id,
          coordinator_name: row.coordinator_name,
          scope_type: row.scope_type,
          academic_group_id: row.academic_group_id || '',
          group_id: row.group_id || '',
          status: row.status,
          assigned_by_name: row.assigned_by_name || '',
          assigned_at: row.assigned_at,
          revoked_at: row.revoked_at || '',
          reason: row.reason || '',
        }));
      return Response.json({ items });
    }

    if (action === 'coordinatorCandidates') {
      if (!identity.canGovern) return Response.json({ error: 'Forbidden' }, { status: 403 });
      const academicGroup = clean(body.academicGroupId, 40);
      if (!academicGroup) return Response.json({ items: [] });
      const students = list(
        await svc.entities.Student.filter({ group_name: academicGroup }, { limit: 60 }),
      );
      return Response.json({
        items: students.map((row) => ({
          user_id: row.user_id || '',
          name: row.full_name,
          student_id: row.student_id,
          linked: Boolean(row.user_id),
        })),
      });
    }

    if (action === 'assignCoordinator' || action === 'revokeCoordinator') {
      if (!identity.canGovern) return Response.json({ error: 'Forbidden' }, { status: 403 });

      if (action === 'revokeCoordinator') {
        const assignmentId = String(body.assignmentId || '');
        const assignment = await svc.entities.CoordinatorAssignment.get(assignmentId).catch((e) =>
          e.status === 404 ? null : Promise.reject(e),
        );
        if (!assignment) return Response.json({ error: 'Assignment not found' }, { status: 404 });

        await svc.entities.CoordinatorAssignment.update(assignment.id, {
          status: 'revoked',
          revoked_at: nowIso(),
          revoked_by: identity.id,
          revoked_reason: clean(body.reason, 300),
        });
        if (assignment.group_id) {
          const member = list(
            await svc.entities.CommunicationGroupMember.filter(
              {
                group_id: assignment.group_id,
                user_id: assignment.coordinator_user_id,
                membership_status: 'active',
              },
              { limit: 1 },
            ),
          )[0];
          if (member) {
            await svc.entities.CommunicationGroupMember.update(member.id, { role: 'member' });
          }
        }
        await notify(svc, [
          {
            user_id: assignment.coordinator_user_id,
            title: 'Coordinator appointment ended',
            body: 'Your communication coordinator appointment was revoked by the administration.',
            category: 'message',
            notification_type: 'coordinator_removed',
            link: '/communication',
            dedupe_key: `coordrevoke:${assignment.id}`,
          },
        ]);
        await audit(base44, identity, {
          action: 'communication_coordinator_revoked',
          target: assignment.coordinator_name,
          targetId: assignment.id,
          details: `Scope ${assignment.scope_type} ${assignment.academic_group_id || assignment.group_id}. Reason: ${
            clean(body.reason, 300) || 'not stated'
          }.`,
        });
        return Response.json({ ok: true });
      }

      const scopeType = body.scopeType === 'subgroup' ? 'subgroup' : 'class';
      const targetUserId = String(body.userId || '');
      const candidate = list(
        await svc.entities.User.list('-created_date', 60),
      ).find((row) => row.id === targetUserId);
      if (!candidate || candidate.role !== 'student') {
        return Response.json({ error: 'Choose a student account' }, { status: 400 });
      }

      const studentRecord = list(
        await svc.entities.Student.filter({ user_id: targetUserId }, { limit: 1 }),
      )[0];
      if (!studentRecord) return Response.json({ error: 'That account has no student record' }, { status: 400 });

      let group = null;
      if (scopeType === 'class') {
        const academicGroup = clean(body.academicGroupId || studentRecord.group_name, 40);
        if (academicGroup !== studentRecord.group_name) {
          return Response.json({ error: 'The student is not in that academic group' }, { status: 400 });
        }
        group = await ensureClassGroup(svc, academicGroup, studentRecord.program);
      } else {
        const groupId = String(body.groupId || '');
        group = await svc.entities.CommunicationGroup.get(groupId).catch((e) =>
          e.status === 404 ? null : Promise.reject(e),
        );
        if (!group) return Response.json({ error: 'Subgroup not found' }, { status: 404 });
      }

      const existing = list(
        await svc.entities.CoordinatorAssignment.filter(
          {
            coordinator_user_id: targetUserId,
            scope_type: scopeType,
            status: 'active',
            ...(scopeType === 'class'
              ? { academic_group_id: group.academic_group_id }
              : { group_id: group.id }),
          },
          { limit: 1 },
        ),
      )[0];
      if (existing) return Response.json({ error: 'This student already coordinates that group' }, { status: 409 });

      const previous = list(
        await svc.entities.CoordinatorAssignment.filter(
          {
            scope_type: scopeType,
            status: 'active',
            ...(scopeType === 'class'
              ? { academic_group_id: group.academic_group_id }
              : { group_id: group.id }),
          },
          { limit: 5 },
        ),
      );

      await svc.entities.CoordinatorAssignment.create({
        coordinator_user_id: targetUserId,
        coordinator_name: studentRecord.full_name,
        scope_type: scopeType,
        academic_group_id: group.academic_group_id || '',
        group_id: group.id,
        conversation_id: group.conversation_id || '',
        assigned_by: identity.id,
        assigned_by_name: identity.name,
        assigned_at: nowIso(),
        reason: clean(body.reason, 300),
        status: 'active',
      });

      const { member } = await addMember(svc, group, {
        id: targetUserId,
        name: studentRecord.full_name,
        role: 'student',
      }, { role: 'coordinator', source: 'coordinator', status: 'active' });
      if (member?.id) {
        await svc.entities.CommunicationGroupMember.update(member.id, { role: 'coordinator' });
      }
      await svc.entities.CommunicationGroup.update(group.id, {
        coordinator_name: studentRecord.full_name,
      });

      await notify(svc, [
        {
          user_id: targetUserId,
          title: 'You are now a group coordinator',
          body: `${group.name} · coordinators can post announcements, pin messages and invite members.`,
          category: 'message',
          notification_type: 'coordinator_appointed',
          link: `/communication?thread=${group.conversation_id}`,
          dedupe_key: `coord:${group.id}:${targetUserId}`,
        },
        ...previous
          .filter((row) => row.coordinator_user_id !== targetUserId)
          .map((row) => ({
            user_id: row.coordinator_user_id,
            title: 'Coordinator role reassigned',
            body: `${group.name} now has a new coordinator.`,
            category: 'message',
            notification_type: 'coordinator_removed',
            link: '/communication',
            dedupe_key: `coordhandover:${group.id}:${row.coordinator_user_id}:${targetUserId}`,
          })),
      ]);

      await audit(base44, identity, {
        action: 'communication_coordinator_appointed',
        target: studentRecord.full_name,
        targetId: targetUserId,
        details: `Scope ${scopeType} ${group.academic_group_id || group.id}. ${
          previous.length ? `Replaced ${previous.map((row) => row.coordinator_name).join(', ')}. ` : ''
        }${clean(body.reason, 300)}`,
      });

      return Response.json({ ok: true, group: { id: group.id, name: group.name } });
    }

    // Staff-only reconciliation used for demonstration readiness: provisions one
    // class group per academic group that exists in the academic records.
    if (action === 'provisionClassGroups') {
      if (!identity.staff) return Response.json({ error: 'Forbidden' }, { status: 403 });
      const students = list(await svc.entities.Student.list('-created_date', 300));
      const names = [...new Set(students.map((row) => row.group_name).filter(Boolean))].slice(0, 40);
      let created = 0;
      let members = 0;
      for (const name of names) {
        const before = await findClassGroup(svc, name);
        const group = await ensureClassGroup(svc, name, students.find((row) => row.group_name === name)?.program);
        if (!before && group) created += 1;
        if (group) {
          const result = await syncGroupMembership(svc, group);
          members += result.count;
        }
      }
      await audit(base44, identity, {
        action: 'communication_groups_provisioned',
        target: 'Academic groups',
        targetId: '',
        details: `${names.length} academic groups reconciled; ${created} created; ${members} active memberships.`,
      });
      return Response.json({ groups: names.length, created, members });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}