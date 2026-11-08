import { base44 } from '@/api/base44Client';

const list = (page) => (Array.isArray(page) ? page : page?.items || []);

// Resolves the signed-in student to their Student record, then to the courses
// they are enrolled in. Enrolments are read twice on purpose: once by the
// Student record id (the relationship the enrolment rows are written with) and
// once by the denormalised student_user_id that the read rules use, so a
// profile that was relinked does not silently empty the course list.
export async function loadStudentCourses(userId) {
  if (!userId) return { student: null, courses: [], courseIds: [], reason: 'no_user' };

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

export const shortDate = (value) =>
  value ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—';

export async function openPrivateFile(uri) {
  if (!uri) return;
  if (uri.startsWith('http')) {
    window.open(uri, '_blank', 'noopener');
    return;
  }
  const { signed_url: signedUrl } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: uri, expires_in: 300 });
  if (signedUrl) window.open(signedUrl, '_blank', 'noopener');
}