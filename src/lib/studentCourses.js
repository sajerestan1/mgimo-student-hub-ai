import { base44 } from '@/api/base44Client';

// Resolves the signed-in student to their Student record, then to the courses
// their professor teaches — the same records the professor workspace writes to.
export async function loadStudentCourses(userId) {
  if (!userId) return { student: null, courses: [], courseIds: [] };

  const studentPage = await base44.entities.Student.filter({ user_id: userId }, { limit: 2 });
  const student = (studentPage.items || [])[0];
  if (!student) return { student: null, courses: [], courseIds: [] };

  const enrolments = await base44.entities.CourseEnrollment.filter({ student_id: student.id }, { limit: 200 });
  const courseIds = (enrolments.items || []).map((e) => e.course_id);
  const courses = courseIds.length
    ? (await base44.entities.Course.filter({ id: { $in: courseIds } }, { limit: 100 })).items || []
    : [];

  return { student, courses, courseIds };
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