import { base44 } from '@/api/base44Client';
import { getDemoUser } from '@/lib/demoAuth';
import { loadStudentPortal } from '@/lib/studentPortal';

const list = (page) => (Array.isArray(page) ? page : page?.items || []);

export async function loadStudentCourses(userId) {
  if (import.meta.env.VITE_DEMO_MODE === 'true') {
    const user = getDemoUser();
    if (!user || user.role !== 'student') return { student: null, courses: [], courseIds: [], reason: 'no_profile' };
    const context = await loadStudentPortal();
    const courses = (context.courses || []).map((c) => ({
      id: c.id, code: c.code, title: c.title, name: c.title, status: 'published',
      credits: c.credits || 4, level: c.level || 'intermediate', professor_id: c.professorId, professor_email: c.professorEmail, description: c.description, semester: c.semester,
      progress: c.progress, weighted: c.weighted,
    }));
    return { student: context.profile, courses, courseIds: courses.map((c) => c.id), enrolments: courses.length, reason: 'ok' };
  }
  if (!userId) return { student: null, courses: [], courseIds: [], reason: 'no_user' };

  try {
    const response = await base44.functions.invoke('myCourses', {});
    const result = response?.data || {};
    if (result.error) {
      console.error('[student courses] server lookup failed', result.error);
      return { student: null, courses: [], courseIds: [], reason: 'error', error: new Error(result.error) };
    }
    if (result.role === 'student') {
      const courses = (result.courses || []).filter((course) => course.status === 'published');
      return { student: result.student || null, courses, courseIds: courses.map((course) => course.id), enrolments: result.enrolments ?? 0, reason: result.reason || (courses.length ? 'ok' : 'no_enrollments') };
    }
  } catch (error) {
    console.error('[student courses] server lookup failed, falling back to a direct query', error);
  }
  const student = list(await base44.entities.Student.filter({ user_id: userId }, { limit: 2 }))[0];
  if (!student) return { student: null, courses: [], courseIds: [], reason: 'no_profile' };
  const [byStudentId, byUserId] = await Promise.all([
    base44.entities.CourseEnrollment.filter({ student_id: student.id }, { limit: 200 }),
    base44.entities.CourseEnrollment.filter({ student_user_id: userId }, { limit: 200 }),
  ]);
  const enrolments = [...new Map([...list(byStudentId), ...list(byUserId)].map((row) => [row.id, row])).values()];
  const courseIds = [...new Set(enrolments.map((e) => e.course_id))];
  if (!courseIds.length) return { student, courses: [], courseIds: [], enrolments: 0, reason: 'no_enrollments' };
  const courses = list(await base44.entities.Course.filter({ id: { $in: courseIds }, status: { $ne: 'archived' } }, { limit: 100 }));
  return { student, courses, courseIds, enrolments: enrolments.length, reason: courses.some((course) => course.status === 'published') ? 'ok' : 'no_published_courses' };
}
export const shortDate = (value, options, language = 'en-GB') => {
  if (!value) return '—';
  const raw = String(value);
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(raw);
  const date = new Date(dateOnly ? `${raw}T12:00:00` : raw);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString(language, options || { day: 'numeric', month: 'short' });
};
export async function openPrivateFile(uri) {
  if (!uri) return;
  if (uri.startsWith('http')) { window.open(uri, '_blank', 'noopener'); return; }
  const { signed_url: signedUrl } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: uri, expires_in: 300 });
  if (signedUrl) window.open(signedUrl, '_blank', 'noopener');
}