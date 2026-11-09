import { base44 } from '@/api/base44Client';

export const ATTACHMENT_LIMIT = 3;
export const ATTACHMENT_BYTES = 5 * 1024 * 1024;
export const ALLOWED_MIME = [
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

// Every communication read and write goes through the backend function; the
// browser never queries a communication entity directly.
export async function comm(action, payload = {}) {
  let response;
  try {
    response = await base44.functions.invoke('communication', { action, ...payload });
  } catch (caught) {
    // A non-2xx answer throws before the body can be read, so the backend's own
    // message is lifted out of the error here: without it every failure would
    // reach the user as "Request failed with status code 500".
    const error = new Error(caught?.response?.data?.error || caught?.message || 'Communication is unavailable');
    error.status = caught?.response?.status;
    throw error;
  }
  const data = response?.data || {};
  if (data.error) {
    const error = new Error(data.error);
    error.status = response?.status;
    throw error;
  }
  return data;
}

// Files are uploaded to private storage (stored privately); the message carries
// only the opaque storage reference, and access is re-checked on download.
export async function uploadAttachment(file) {
  if (file.size > ATTACHMENT_BYTES) throw new Error('Each file must be 5 MB or smaller');
  if (!ALLOWED_MIME.includes(file.type)) throw new Error('That file type is not accepted');
  const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
  return { file_uri, name: file.name, mime: file.type, size: file.size };
}

export const OFFICIAL_CATEGORIES = [
  'Academic Affairs',
  'Registration',
  'Examination',
  'Timetable',
  'Certificates and Documents',
  'Student Support',
  'Technical Support',
  'Other',
];

export const OFFICIAL_STATUSES = [
  { value: 'open', label: 'Open' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'awaiting_student', label: 'Awaiting student' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

export function formatStamp(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  const today = new Date();
  const sameDay = date.toDateString() === today.toDateString();
  return sameDay
    ? date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function formatSize(bytes) {
  if (!bytes) return '';
  return bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}

// ── Voice notes ────────────────────────────────────────────────────────────
// The recorder produces webm/opus on Chrome and Android, mp4/m4a on Safari and
// iOS, ogg on Firefox. All four are accepted by the backend allowlist and by the
// platform's transcription service.
export const VOICE_BYTES = 10 * 1024 * 1024;
export const VOICE_SECONDS = 300;
export const AUDIO_MIME = ['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/x-m4a'];
const AUDIO_EXT = {
  'audio/webm': 'webm',
  'audio/ogg': 'ogg',
  'audio/mp4': 'm4a',
  'audio/mpeg': 'mp3',
  'audio/wav': 'wav',
  'audio/x-m4a': 'm4a',
};

export const isAudioMime = (mime) => String(mime || '').startsWith('audio/');

export function formatDuration(seconds) {
  const total = Math.max(0, Math.round(Number(seconds) || 0));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

// Voice notes use the same private storage as every other attachment (stored
// privately): the message carries only the storage reference, and playback goes
// through a short-lived signed link issued to a verified participant.
export async function uploadVoiceNote(blob, seconds) {
  if (!blob || !blob.size) throw new Error('Nothing was recorded');
  if (blob.size > VOICE_BYTES) throw new Error('A voice note must be 10 MB or smaller');
  const mime = String(blob.type || 'audio/webm').split(';')[0];
  if (!AUDIO_MIME.includes(mime)) throw new Error('That recording format is not supported');
  const file = new File([blob], `voice-note.${AUDIO_EXT[mime] || 'webm'}`, { type: mime });
  const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
  return { file_uri, name: `Voice note · ${formatDuration(seconds)}`, mime, size: blob.size };
}