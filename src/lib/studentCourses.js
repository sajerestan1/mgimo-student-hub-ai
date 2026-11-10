import { base44 } from '@/api/base44Client';

const list = (page) => (Array.isArray(page) ? page : page?.items || []);

// The course list is resolved by the myCourses endpoint from the signed-in
// account (profile → enrolments → published courses). That endpoint reads with
// the service role, so a per-record read rule can never silently empty the page,
// and it returns the reason a list is empty. The direct queries stay as a
// fallback for the case where the endpoint itself is unavailable.
export async function loadStudentCourses(userId) {
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
      return {
        student: result.student || null,
        courses,
        courseIds: courses.map((course) => course.id),
        enrolments: result.enrolments ?? 0,
        reason: result.reason || (courses.length ? 'ok' : 'no_enrollments'),
      };
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

  const courses = list(
    await base44.entities.Course.filter({ id: { $in: courseIds }, status: { $ne: 'archived' } }, { limit: 100 })
  );

  return {
    student,
    courses,
    courseIds,
    enrolments: enrolments.length,
    reason: courses.some((course) => course.status === 'published') ? 'ok' : 'no_published_courses',
  };
}

// The locale follows the interface language; English ordering stays the default
// for any caller that does not pass one.
export const shortDate = (value, options, language = 'en-GB') =>
  value ? new Date(value).toLocaleDateString(language, options || { day: 'numeric', month: 'short' }) : '—';

export async function openPrivateFile(uri) {
  if (!uri) return;
  if (uri.startsWith('http')) {
    window.open(uri, '_blank', 'noopener');
    return;
  }
  const { signed_url: signedUrl } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: uri, expires_in: 300 });
  if (signedUrl) window.open(signedUrl, '_blank', 'noopener');
}