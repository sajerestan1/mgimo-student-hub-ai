import { base44 } from '@/api/base44Client';

// Every study-group read and write goes through the backend function, which
// resolves the student's own enrolments; the browser never touches the entities.
export const FOCUS_OPTIONS = ['exam_prep', 'problem_sets', 'readings', 'projects', 'general'];

export async function studyGroupsApi(action, payload = {}) {
  let response;
  try {
    response = await base44.functions.invoke('studyGroups', { action, ...payload });
  } catch (caught) {
    const error = new Error(
      caught?.response?.data?.error || caught?.message || 'Study groups are unavailable'
    );
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

export const focusKey = (focus) => `student.studyGroups.focus.${FOCUS_OPTIONS.includes(focus) ? focus : 'general'}`;