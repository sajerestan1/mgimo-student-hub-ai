export const WEEKDAY_NAMES = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const WEEKDAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** 1 = Monday ... 7 = Sunday */
export function weekdayNumber(date) {
  return ((date.getDay() + 6) % 7) + 1;
}

export function toISODate(date) {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10);
}

export function startOfAcademicWeek(date) {
  const copy = new Date(date);
  copy.setHours(12, 0, 0, 0);
  copy.setDate(copy.getDate() - (weekdayNumber(copy) - 1));
  return copy;
}

export function addDays(date, days) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export function formatLongDate(date) {
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export function formatShortDate(date) {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function formatDateValue(value) {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function relativeTime(value) {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  const diff = Date.now() - parsed.getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return formatShortDate(parsed);
}

export const STATUS_META = {
  draft: { label: 'Draft', className: 'bg-slate-100 text-slate-600 ring-slate-200' },
  submitted: { label: 'Submitted', className: 'bg-blue-50 text-blue-700 ring-blue-200' },
  under_review: { label: 'Under review', className: 'bg-amber-50 text-amber-700 ring-amber-200' },
  approved: { label: 'Approved', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  rejected: { label: 'Rejected', className: 'bg-rose-50 text-rose-700 ring-rose-200' },
  completed: { label: 'Completed', className: 'bg-violet-50 text-violet-700 ring-violet-200' },
};

export const CATEGORY_META = {
  announcement: { label: 'Announcement', className: 'bg-blue-50 text-blue-700' },
  schedule: { label: 'Schedule change', className: 'bg-violet-50 text-violet-700' },
  application: { label: 'Application update', className: 'bg-emerald-50 text-emerald-700' },
  reminder: { label: 'Reminder', className: 'bg-amber-50 text-amber-700' },
  deadline: { label: 'Deadline', className: 'bg-rose-50 text-rose-700' },
};

export const CLASS_TYPE_META = {
  lecture: { label: 'Lecture', className: 'bg-blue-50 text-blue-700' },
  seminar: { label: 'Seminar', className: 'bg-violet-50 text-violet-700' },
  practice: { label: 'Practice', className: 'bg-emerald-50 text-emerald-700' },
  consultation: { label: 'Consultation', className: 'bg-amber-50 text-amber-700' },
};

export const CERTIFICATE_TYPES = [
  {
    value: 'Enrollment certificate',
    label: 'Enrollment certificate',
    description: 'Confirms that you are a full-time student of the university.',
  },
  {
    value: 'Academic transcript',
    label: 'Academic transcript',
    description: 'Official record of completed courses, credits and grades.',
  },
  {
    value: 'Dean’s letter of recommendation',
    label: 'Dean’s letter of recommendation',
    description: 'A signed letter describing your academic standing.',
  },
  {
    value: 'Certificate of study',
    label: 'Certificate of study',
    description: 'Short confirmation of study for employers or internships.',
  },
  {
    value: 'Scholarship confirmation',
    label: 'Scholarship confirmation',
    description: 'Confirms your current scholarship status and amount.',
  },
  {
    value: 'Visa support letter',
    label: 'Visa support letter',
    description: 'Invitation letter for visa or residence permit procedures.',
  },
];

export function isActiveStatus(status) {
  return status === 'submitted' || status === 'under_review' || status === 'approved';
}