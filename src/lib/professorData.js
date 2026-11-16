import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { DEMO_INSTITUTION } from '@/lib/demoInstitutionData';

// The professor workspace resolves to a real Professor record: the one linked
// to the signed-in account by user_id, then one matching their email. Courses
// are read straight from Course.professor_id — never through sessions or
// assignments, which used to hide courses that had no teaching rows yet.
export const SEMESTER = 'Fall Semester 2026';

export const todayIso = () => new Date().toISOString().slice(0, 10);
export const dateLabel = (value) =>
  value ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—';
export const dayDiff = (value) =>
  Math.round((new Date(value).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86400000);
export const initials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
export const pct = (value, total) => (total > 0 ? Math.round((value / total) * 100) : 0);

const EMPTY_STATE = {
  loading: true,
  professor: null,
  courses: [],
  facultyName: '',
  departmentName: '',
  reason: null,
  error: null,
};

export function useProfessorContext() {
  const { user } = useAuth();
  const [state, setState] = useState(EMPTY_STATE);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (import.meta.env.VITE_DEMO_MODE === 'true') {
          const demoProfessor = DEMO_INSTITUTION.professors[0];
          const demoCourses = DEMO_INSTITUTION.courses.filter((course) => course.professor_id === demoProfessor.id);
          if (!alive) return;
          setState({
            loading: false, professor: demoProfessor, courses: demoCourses,
            facultyName: 'School of International Relations',
            departmentName: 'International Relations & Foreign Policy',
            reason: 'ok', error: null,
          });
          return;
        }
        const [faculties, departments] = await Promise.all([
          base44.entities.Faculty.list('-created_date', 20),
          base44.entities.Department.list('-created_date', 40),
        ]);

        // The myCourses endpoint resolves the teaching profile and its courses
        // server-side; the direct query is only a fallback if that call fails.
        let professor = null;
        let courses = [];
        try {
          const response = await base44.functions.invoke('myCourses', {});
          const result = response?.data || {};
          if (result.error) throw new Error(result.error);
          if (result.role === 'professor' && result.professor) {
            professor = result.professor;
            courses = result.courses || [];
          }
        } catch (error) {
          console.error('[professor workspace] server lookup failed, falling back to a direct query', error);
        }

        if (!professor) {
          const profs = await base44.entities.Professor.list('-created_date', 80);
          const email = String(user?.email || '').toLowerCase();
          professor =
            profs.find((p) => p.user_id && p.user_id === user?.id) ||
            profs.find((p) => p.email && String(p.email).toLowerCase() === email) ||
            null;
          if (professor) {
            const page = await base44.entities.Course.filter(
              { professor_id: professor.id, status: { $ne: 'archived' } },
              { sort: 'code', limit: 80 }
            );
            courses = page.items || [];
          }
        }

        if (!alive) return;
        setState({
          loading: false,
          professor,
          courses,
          facultyName: faculties.find((f) => f.id === professor?.faculty_id)?.name || 'Faculty of International Economic Relations',
          departmentName: departments.find((d) => d.id === professor?.department_id)?.name || 'Department of World Economy',
          reason: !professor ? 'no_profile' : courses.length ? 'ok' : 'no_courses',
          error: null,
        });
      } catch (error) {
        console.error('[professor workspace] teaching context could not be loaded', error);
        if (alive) setState({ ...EMPTY_STATE, loading: false, reason: 'error', error });
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
  if (import.meta.env.VITE_DEMO_MODE === 'true') {
    const roster = DEMO_INSTITUTION.students.slice(0, 12).map((s, i) => ({ id: 'enr-' + i, student_id: s.id, student_name: s.full_name, course_id: courses[i % Math.max(1, courses.length)]?.id }));
    const assignments = courses.map((course, i) => ({ id: 'assignment-' + i, course_id: course.id, course_code: course.code, title: ['Policy brief','Midterm analysis','Research essay'][i % 3], due_date: '2026-11-' + String(20 + i).padStart(2, '0'), status: 'published', max_score: 100 }));
    return {
      assignments,
      submissions: roster.slice(0, 8).map((e, i) => ({ id: 'sub-' + i, assignment_id: assignments[i % assignments.length]?.id, course_id: e.course_id, student_id: e.student_id, student_name: e.student_name, status: i % 3 ? 'graded' : 'submitted', score: i % 3 ? 72 + i * 3 : null, submitted_at: '2026-11-1' + (i + 1) })),
      sessions: courses.map((course, i) => ({ id: 'session-' + i, course_id: course.id, course_code: course.code, session_date: todayIso(), start_time: '10:00', room: 'Room ' + (201 + i), group_name: 'IR-21', attendance_taken: false })),
      enrollments: roster, attempts: [], quizzes: [], threads: [], attendance: [], modules: [], progress: [],
    };
  }
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