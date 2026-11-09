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
  const response = await base44.functions.invoke('communication', { action, ...payload });
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