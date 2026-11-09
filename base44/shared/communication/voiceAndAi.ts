// Reactions, voice-note transcription and the AI writing assistant. Kept out of
// the request router because each one owns its own authorisation, limits and
// provider call; the router only dispatches to them.
//
// Security contract, identical in spirit to the rest of the Communication Center:
//   • identity comes from the verified session, never the request body;
//   • every conversation is opened through loadThread(), so participation is
//     re-checked server-side on each call;
//   • audio stays in private storage — the transcription provider sees a
//     5-minute signed link, never a public URL;
//   • nothing here writes a message: transcripts and suggestions are returned
//     to the sender to review and send themselves.
import { list, countSince } from './util.ts';
import { loadThread, audit } from './messaging.ts';
import { canUseCommunication, canPostInThread } from './identity.ts';

const MAX_EMOJI_LENGTH = 3;

const MODE_BRIEF = {
  draft: 'Draft a short institutional message',
  rewrite: 'Rewrite the message in a courteous, professional register',
  simplify: 'Rewrite the message in plain, simple language',
  translate:
    'Translate the message into the requested language, keeping names, course codes and dates exactly as they are',
  suggest: 'Suggest a suitable reply to the message',
  explain: 'Explain the university procedure being asked about, in clear steps',
  summarise: 'Summarise this conversation for the reader',
};

// Core returns a bare string in some SDK versions and an object in others.
const asText = (value) =>
  String(typeof value === 'string' ? value : value?.transcript || value?.text || value?.response || '').trim();

export async function handleReact(base44, svc, identity, body) {
  if (!canUseCommunication(identity)) {
    return Response.json({ error: 'This account cannot use communication services', blocked: true }, { status: 403 });
  }

  const messageId = String(body.messageId || '');
  const emoji = String(body.emoji || '').trim();
  if (!messageId || !emoji) return Response.json({ error: 'Choose a reaction' }, { status: 400 });
  if ([...emoji].length > MAX_EMOJI_LENGTH) {
    return Response.json({ error: 'That reaction is not supported' }, { status: 400 });
  }

  const message = await svc.entities.CommunicationMessage.get(messageId).catch((e) =>
    e.status === 404 ? null : Promise.reject(e),
  );
  if (!message) return Response.json({ error: 'Message not available' }, { status: 404 });

  const { access } = await loadThread(svc, identity, message.thread_id);
  if (!access.allowed) return Response.json({ error: 'Message not available' }, { status: 404 });

  // One reaction per participant per message: picking the same emoji again removes it.
  const current = Array.isArray(message.reactions) ? message.reactions : [];
  const existing = current.findIndex((row) => row.user_id === identity.id && row.emoji === emoji);
  const reactions =
    existing >= 0
      ? current.filter((_, index) => index !== existing)
      : [
          ...current.filter((row) => row.user_id !== identity.id),
          { emoji, user_id: identity.id, user_name: identity.name },
        ];

  await svc.entities.CommunicationMessage.update(message.id, { reactions });
  return Response.json({ ok: true, reactions });
}

export async function handleTranscribe(base44, svc, identity, body) {
  if (!canUseCommunication(identity)) {
    return Response.json({ error: 'This account cannot use communication services', blocked: true }, { status: 403 });
  }

  const threadId = String(body.threadId || '');
  const fileUri = String(body.file_uri || '');
  if (!threadId || !/(^|\/)private\//.test(fileUri)) {
    return Response.json({ error: 'A recorded voice note is required' }, { status: 400 });
  }

  const { thread, access } = await loadThread(svc, identity, threadId);
  if (!access.allowed) return Response.json({ error: 'Conversation not available' }, { status: 404 });
  if (!canPostInThread(identity, access, thread)) {
    return Response.json({ error: 'You cannot post in this conversation' }, { status: 403 });
  }

  const used = await countSince(
    svc,
    'AuditLog',
    { actor_user_id: identity.id, action: 'communication_voice_transcribed' },
    10 * 60 * 1000,
  );
  if (used >= 12) {
    return Response.json({ error: 'Too many transcriptions just now. Try again shortly.' }, { status: 429 });
  }

  const signed = await svc.integrations.Core.CreateFileSignedUrl({ file_uri: fileUri, expires_in: 300 });
  const result = await svc.integrations.Core.TranscribeAudio({ audio_url: signed.signed_url });
  const transcript = asText(result);
  if (!transcript) {
    return Response.json(
      { error: 'That recording could not be transcribed. You can still send the voice note itself.' },
      { status: 502 },
    );
  }

  await audit(base44, identity, {
    action: 'communication_voice_transcribed',
    target: thread.type === 'group' ? thread.title : 'Conversation',
    targetId: thread.id,
    details: 'Voice note transcribed with the platform AI service; transcript returned to the sender for editing.',
  });

  return Response.json({ transcript, source: 'Core.TranscribeAudio' });
}

export async function handleAssistant(base44, svc, identity, body) {
  if (!canUseCommunication(identity)) {
    return Response.json({ error: 'This account cannot use communication services', blocked: true }, { status: 403 });
  }

  const mode = String(body.mode || 'draft');
  if (!MODE_BRIEF[mode]) return Response.json({ error: 'Unsupported assistant request' }, { status: 400 });

  const used = await countSince(
    svc,
    'AuditLog',
    { actor_user_id: identity.id, action: 'communication_assistant_used' },
    10 * 60 * 1000,
  );
  if (used >= 25) {
    return Response.json({ error: 'The assistant is busy for you just now. Try again shortly.' }, { status: 429 });
  }

  const text = String(body.text || '').slice(0, 2000).trim();
  const language = String(body.language || '').slice(0, 40).trim();
  const audience = String(body.audience || 'classmate').slice(0, 40);
  const threadId = String(body.threadId || '');

  // A conversation is only ever read through the same access check that opens it
  // in the UI, so the assistant cannot summarise a thread the user cannot read.
  let conversation = '';
  if (threadId) {
    const { thread, access } = await loadThread(svc, identity, threadId);
    if (!access.allowed) return Response.json({ error: 'Conversation not available' }, { status: 404 });
    const rows = list(
      await svc.entities.CommunicationMessage.filter(
        { thread_id: thread.id },
        { sort: '-created_date', limit: 40 },
      ),
    );
    conversation = rows
      .reverse()
      .filter((row) => row.moderation_status !== 'hidden')
      .map(
        (row) =>
          `${row.sender_name} (${row.sender_role}): ${String(row.body || '').slice(0, 400)}${
            (row.attachments || []).length ? ' [attachment]' : ''
          }`,
      )
      .join('\n');
  }

  if (mode === 'summarise' && !conversation) {
    return Response.json({ error: 'Open a conversation before asking for a summary' }, { status: 400 });
  }
  if (!text && ['rewrite', 'simplify', 'translate', 'suggest', 'explain'].includes(mode)) {
    return Response.json({ error: 'Write or paste the message first' }, { status: 400 });
  }

  const prompt = [
    'You are the writing assistant inside the Communication Center of a university student portal (MGIMO).',
    `You are helping a ${identity.role} named ${identity.name}.`,
    `TASK: ${MODE_BRIEF[mode]}.`,
    mode === 'draft' ? `The recipient is a ${audience}.` : '',
    language ? `Requested language: ${language}.` : '',
    'Rules: never invent university rules, deadlines, fees or names. If a procedure detail is unknown, say who to ask (course instructor, student office or Dean\u2019s Office).',
    'Keep it under 160 words, plain text, no markdown headings, no emoji unless the user already used one. Polite, neutral and professional.',
    'Output only the message text or the summary. Never claim the message has been sent.',
    conversation ? `CONVERSATION THE USER IS AUTHORISED TO SEE:\n${conversation}` : '',
    text ? `THE USER\u2019S TEXT:\n${text}` : '',
  ]
    .filter(Boolean)
    .join('\n\n');

  const response = await svc.integrations.Core.InvokeLLM({ prompt });
  const suggestion = asText(response);
  if (!suggestion) {
    return Response.json({ error: 'The assistant did not return a draft. Try again.' }, { status: 502 });
  }

  await audit(base44, identity, {
    action: 'communication_assistant_used',
    target: MODE_BRIEF[mode],
    targetId: threadId,
    details: 'Suggestion returned for the user to edit; nothing was sent.',
  });

  return Response.json({ suggestion, mode });
}