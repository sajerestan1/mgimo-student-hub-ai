import { base44 } from '@/api/base44Client';

/**
 * Academic performance and attendance intelligence.
 * Every figure is computed on the server from the authenticated student's own
 * records; this module only asks for it and never sends a student identifier.
 */
let cache = null;
const CACHE_MS = 15000;

async function call(payload) {
  const response = await base44.functions.invoke('academicIntelligence', payload);
  const data = response?.data || {};
  if (data.error) throw new Error(data.error);
  return data;
}

export function loadAcademicIntelligence({ fresh = false } = {}) {
  if (!fresh && cache && Date.now() - cache.at < CACHE_MS) return cache.promise;
  const promise = call({ action: 'overview' }).catch((error) => {
    cache = null;
    throw error;
  });
  cache = { at: Date.now(), promise };
  return promise;
}

export const saveAcademicPreferences = (payload) =>
  call({ action: 'savePreferences', ...payload }).then((data) => {
    cache = null;
    return data;
  });

export const askAcademicAdvisor = (payload) => call({ action: 'advisor', ...payload });
export const loadAttendancePolicy = () => call({ action: 'policy' });
export const saveAttendancePolicy = (payload) => call({ action: 'savePolicy', ...payload });

export const ATTENDANCE_TONE = {
  ok: 'positive',
  halfway: 'brand',
  approaching: 'warning',
  high: 'warning',
  critical: 'critical',
  reached: 'critical',
  exceeded: 'critical',
};

export const ATTENDANCE_LABEL = {
  ok: 'Within the allowance',
  halfway: 'More than halfway used',
  approaching: 'Approaching the limit',
  high: 'High risk',
  critical: 'Critical',
  reached: 'Allowance reached',
  exceeded: 'Limit exceeded',
};

export const COURSE_TONE = { on_track: 'positive', watch: 'warning', attention: 'critical', awaiting: 'neutral' };
export const COURSE_LABEL = { on_track: 'On track', watch: 'Watch', attention: 'Needs attention', awaiting: 'No results yet' };
export const TREND_LABEL = {
  improving: 'Improving',
  declining: 'Declining',
  stable: 'Stable',
  insufficient: 'Too few results for a trend',
};

export const score = (value, suffix = '') =>
  value === null || value === undefined ? '—' : `${value}${suffix}`;