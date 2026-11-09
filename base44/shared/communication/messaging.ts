// Threads, messages and the notification fan-out. Every write goes through
// these helpers so authorization, limits, previews and deduplication are
// applied in exactly one place.
import { list, nowIso, plainText, preview } from './util.ts';
import { threadAccess } from './identity.ts';
import { writeAudit } from '../accounts.ts';

export const MESSAGE_LIMIT = 4000;
export const ATTACHMENT_LIMIT_COUNT = 3;
export const ATTACHMENT_LIMIT_BYTES = 5 * 1024 * 1024;
const MIME_ALLOWLIST = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
  'text/plain',
  'text/csv',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];

export function sanitiseAttachments(input) {
  if (!Array.isArray(input) || !input.length) return { attachments: [], error: null };
  if (input.length > ATTACHMENT_LIMIT_COUNT) {
    return { attachments: [], error: `Attach at most ${ATTACHMENT_LIMIT_COUNT} files` };
  }
  const attachments = [];
  for (const row of input) {
    const uri = String(row?.file_uri || '');
    const mime = String(row?.mime || '');
    const size = Number(row?.size) || 0;
    if (!uri.startsWith('private/')) return { attachments: [], error: 'Attachments must be uploaded to private storage' };
    if (!MIME_ALLOWLIST.includes(mime)) return { attachments: [], error: 'That file type is not accepted' };
    if (size > ATTACHMENT_LIMIT_BYTES) return { attachments: [], error: 'Each file must be 5 MB or smaller' };
    attachments.push({
      file_uri: uri,
      name: plainText(row?.name || 'Attachment', 120),
      mime,
      size,
    });
  }
  return { attachments, error: null };
}

export async function loadThread(svc, identity, threadId) {
  const thread = await svc.entities.CommunicationThread.get(threadId).catch((e) =>
    e.status === 404 ? null : Promise.reject(e),
  );
  if (!thread) return { thread: null, access: { allowed: false, reason: 'Thread not found' } };

  const participantRow = thread.type === 'group'
    ? null
    : list(
        await svc.entities.ConversationParticipant.filter(
          { conversation_id: thread.id, user_id: identity.id },
          { limit: 2 },
        ),
      )[0] || null;

  const membershipRow = thread.group_id
    ? list(
        await svc.entities.CommunicationGroupMember.filter(
          { group_id: thread.group_id, user_id: identity.id },
          { limit: 2 },
        ),
      )[0] || null
    : null;

  return { thread, participantRow, membershipRow, access: threadAccess(identity, thread, participantRow, membershipRow) };
}

export async function threadParticipants(svc, threadId) {
  return list(
    await svc.entities.ConversationParticipant.filter(
      { conversation_id: threadId, membership_status: 'active' },
      { limit: 40 },
    ),
  );
}

export async function groupMembers(svc, groupId, { activeOnly = true } = {}) {
  const query = activeOnly
    ? { group_id: groupId, membership_status: 'active' }
    : { group_id: groupId };
  return list(await svc.entities.CommunicationGroupMember.filter(query, { limit: 300 }));
}

// Service-role notification write with a dedupe key, so a retried send cannot
// double-notify anyone.
export async function notify(svc, rows) {
  const entries = rows.filter((row) => row?.user_id);
  if (!entries.length) return 0;

  const keys = entries.map((row) => row.dedupe_key).filter(Boolean);
  const existing = keys.length
    ? new Set(
        list(await svc.entities.Notification.filter({ dedupe_key: { $in: keys } }, { limit: 300 })).map(
          (row) => row.dedupe_key,
        ),
      )
    : new Set();

  const fresh = entries.filter((row) => !row.dedupe_key || !existing.has(row.dedupe_key));
  if (!fresh.length) return 0;

  await svc.entities.Notification.bulkCreate(
    fresh.map((row) => ({
      user_id: row.user_id,
      title: plainText(row.title, 120),
      body: preview(row.body || '', 160),
      category: row.category || 'message',
      notification_type: row.notification_type || 'communication',
      link: row.link || '',
      dedupe_key: row.dedupe_key || '',
      is_read: false,
    })),
  );
  return fresh.length;
}

export function audit(base44, identity, { action, target, targetId, details, outcome = 'success' }) {
  return writeAudit(base44, {
    actor: { id: identity.id, full_name: identity.name, role: identity.role },
    action,
    target,
    targetId,
    details,
    outcome,
  });
}

// Creates one message and updates the thread's denormalised header fields.
export async function appendMessage(svc, identity, thread, { body, replyTo, attachments, clientKey, kind = 'text' }) {
  let replyToPreview = '';
  if (replyTo) {
    const original = await svc.entities.CommunicationMessage.get(replyTo).catch((e) =>
      e.status === 404 ? null : Promise.reject(e),
    );
    if (!original || original.thread_id !== thread.id) {
      return { error: 'That message is not part of this conversation', status: 400 };
    }
    replyToPreview = preview(original.body || '', 90);
  }

  if (clientKey) {
    const duplicate = list(
      await svc.entities.CommunicationMessage.filter(
        { thread_id: thread.id, sender_user_id: identity.id, client_key: String(clientKey).slice(0, 80) },
        { limit: 1 },
      ),
    )[0];
    if (duplicate) return { message: duplicate, duplicate: true };
  }

  const text = plainText(body, MESSAGE_LIMIT);
  if (!text && !attachments?.length) return { error: 'Write a message before sending', status: 400 };

  const message = await svc.entities.CommunicationMessage.create({
    thread_id: thread.id,
    group_id: thread.group_id || '',
    sender_user_id: identity.id,
    sender_name: identity.name,
    sender_role: identity.role,
    body: text,
    kind,
    reply_to_id: replyTo || '',
    reply_to_preview: replyToPreview,
    attachments: attachments || [],
    mentions: [],
    pinned: false,
    client_key: clientKey ? String(clientKey).slice(0, 80) : '',
    moderation_status: 'visible',
  });

  await svc.entities.CommunicationThread.update(thread.id, {
    last_message_at: nowIso(),
    last_message_preview: preview(text || (attachments?.length ? 'Attachment' : ''), 110),
    last_sender_name: identity.name,
    message_count: (Number(thread.message_count) || 0) + 1,
  });

  return { message };
}

// Who should hear about a new message in this thread.
export async function messageRecipients(svc, identity, thread) {
  if (thread.type === 'group') {
    const members = await groupMembers(svc, thread.group_id);
    return members
      .filter((row) => row.user_id !== identity.id && !row.muted)
      .map((row) => ({ user_id: row.user_id, name: row.user_name }));
  }

  if (thread.type === 'official') {
    const participants = await threadParticipants(svc, thread.id);
    if (identity.staff) {
      return participants
        .filter((row) => row.user_id !== identity.id && row.user_role !== 'staff')
        .map((row) => ({ user_id: row.user_id, name: row.user_name }));
    }
    // A student's message goes to the Dean's Office mailbox, never to an
    // individual employee's private notification list beyond that policy.
    const staff = list(
      await svc.entities.User.filter({
        role: { $in: ['dean', 'deputy_dean', 'academic_staff', 'admin'] },
      }, { limit: 20 }),
    );
    return staff.filter((row) => row.id !== identity.id).map((row) => ({ user_id: row.id, name: row.full_name }));
  }

  const participants = await threadParticipants(svc, thread.id);
  return participants
    .filter((row) => row.user_id !== identity.id && !row.muted)
    .map((row) => ({ user_id: row.user_id, name: row.user_name }));
}

export function threadLink(thread) {
  return `/communication?thread=${thread.id}`;
}

export async function markThreadRead(svc, identity, thread, participantRow, membershipRow) {
  const stamp = nowIso();
  if (thread.type === 'group' && membershipRow) {
    await svc.entities.CommunicationGroupMember.update(membershipRow.id, { last_read_at: stamp });
    return;
  }
  if (participantRow) {
    await svc.entities.ConversationParticipant.update(participantRow.id, { last_read_at: stamp });
  }
}