import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

// The professor workspace always resolves to a real Professor record: the one
// linked to the signed-in account, then one matching their email, then the
// seeded demonstration professor (Anton Karpov) for preview accounts.
export const DEMO_PROFESSOR_ID = '6aef53824414bb29675df6c5';
export const SEMESTER = 'Fall Semester 2026';

export const todayIso = () => new Date().toISOString().slice(0, 10);
export const dateLabel = (value) =>
  value ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—';
export const dayDiff = (value) =>
  Math.round((new Date(value).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86400000);
export const initials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
export const pct = (value, total) => (total > 0 ? Math.round((value / total) * 100) : 0);

export function useProfessorContext() {
  const { user } = useAuth();
  const [state, setState] = useState({ loading: true, professor: null, courses: [], facultyName: '', departmentName: '' });

  useEffect(() => {
    let alive = true;
    (async () => {
      const [profs, faculties, departments] = await Promise.all([
        base44.entities.Professor.list('-created_date', 80),
        base44.entities.Faculty.list('-created_date', 20),
        base44.entities.Department.list('-created_date', 40),
      ]);
      const email = String(user?.email || '').toLowerCase();
      const professor =
        profs.find((p) => p.user_id && p.user_id === user?.id) ||
        profs.find((p) => p.email && String(p.email).toLowerCase() === email) ||
        profs.find((p) => p.id === DEMO_PROFESSOR_ID) ||
        null;

      let courses = [];
      if (professor) {
        const [page, sessionPage, assignmentPage] = await Promise.all([
          base44.entities.Course.filter({ professor_id: professor.id }, { sort: 'code', limit: 80 }),
          base44.entities.ClassSession.filter({ professor_id: professor.id }, { limit: 200 }),
          base44.entities.Assignment.filter({ professor_id: professor.id }, { limit: 100 }),
        ]);
        // Only the courses this professor actually teaches this semester: those
        // carrying scheduled sessions or assessed work.
        const teaching = new Set(
          [...(sessionPage.items || []), ...(assignmentPage.items || [])].map((row) => row.course_id)
        );
        courses = (page.items || []).filter((course) => teaching.has(course.id));
      }

      if (alive) {
        setState({
          loading: false,
          professor,
          courses,
          facultyName: faculties.find((f) => f.id === professor?.faculty_id)?.name || 'Faculty of International Economic Relations',
          departmentName: departments.find((d) => d.id === professor?.department_id)?.name || 'Department of World Economy',
        });
      }
    })();
    return () => {
      alive = false;
    };
  }, [user?.id]);

  return state;
}

const items = (page) => page?.items || [];

export async function loadTeaching(professorId, courses) {
  const ids = courses.map((c) => c.id);
  if (!ids.length) {
    return { assignments: [], submissions: [], sessions: [], enrollments: [], attempts: [], quizzes: [], threads: [], attendance: [], modules: [], progress: [] };
  }

  const [assignments, submissions, sessions, enrollments, attempts, quizzes, threads, attendance, modules, progress] = await Promise.all([
    base44.entities.Assignment.filter({ professor_id: professorId }, { sort: '-due_date', limit: 100 }),
    base44.entities.Submission.filter({ course_id: { $in: ids } }, { sort: '-submitted_at', limit: 300 }),
    base44.entities.ClassSession.filter({ professor_id: professorId }, { sort: 'session_date', limit: 200 }),
    base44.entities.CourseEnrollment.filter({ course_id: { $in: ids } }, { limit: 400 }),
    base44.entities.QuizAttempt.filter({ course_id: { $in: ids } }, { limit: 300 }),
    base44.entities.Quiz.filter({ professor_id: professorId }, { limit: 40 }),
    base44.entities.Discussion.filter({ course_id: { $in: ids } }, { limit: 120 }),
    base44.entities.AttendanceRecord.filter({ course_id: { $in: ids } }, { limit: 400 }),
    base44.entities.CourseModule.filter({ course_id: { $in: ids } }, { limit: 200 }),
    base44.entities.ModuleProgress.filter({ course_id: { $in: ids } }, { limit: 400 }),
  ]);

  return {
    assignments: items(assignments),
    submissions: items(submissions),
    sessions: items(sessions),
    enrollments: items(enrollments),
    attempts: items(attempts),
    quizzes: items(quizzes),
    threads: items(threads),
    attendance: items(attendance),
    modules: items(modules),
    progress: items(progress),
  };
}

export const courseLabel = (course) => (course ? `${course.code} · ${course.title}` : '');

// Material files live in private storage: the link is signed on demand.
export async function openStoredFile(uri) {
  if (!uri) return;
  if (uri.startsWith('http')) {
    window.open(uri, '_blank', 'noopener');
    return;
  }
  const { signed_url: signedUrl } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: uri, expires_in: 300 });
  if (signedUrl) window.open(signedUrl, '_blank', 'noopener');
}