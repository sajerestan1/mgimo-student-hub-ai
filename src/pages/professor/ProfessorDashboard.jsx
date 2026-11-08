import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PageTitle from '@/components/shell/PageTitle';
import Surface from '@/components/shell/Surface';
import TodaySchedule from '@/components/professor/TodaySchedule';
import TeachingKpis from '@/components/professor/TeachingKpis';
import GradingQueuePanel from '@/components/professor/GradingQueuePanel';
import CoursePerformancePanel from '@/components/professor/CoursePerformancePanel';
import UpcomingAssessmentsPanel from '@/components/professor/UpcomingAssessmentsPanel';
import TeachingAlerts from '@/components/professor/TeachingAlerts';
import GradeTrendCard from '@/components/professor/GradeTrendCard';
import StrugglingStudentsCard from '@/components/professor/StrugglingStudentsCard';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';
import { useProfessorContext, loadTeaching, todayIso, dayDiff, pct, SEMESTER } from '@/lib/professorData';
import { buildGradeTrend } from '@/lib/gradeTrends';

export default function ProfessorDashboard() {
  const { loading, professor, courses, facultyName, departmentName } = useProfessorContext();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!professor) return;
    loadTeaching(professor.id, courses).then(setData);
  }, [professor?.id, courses.length]);

  const view = useMemo(() => {
    if (!data) return null;
    const today = todayIso();
    const sessionsToday = data.sessions
      .filter((s) => s.session_date === today)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
    const enrolled = new Set(data.enrollments.map((e) => e.student_id)).size;
    const pending = data.submissions.filter((s) => s.status === 'submitted');
    const attendanceDue = data.sessions.filter((s) => !s.attendance_taken && dayDiff(s.session_date) <= 0).length;
    const upcoming = data.assignments
      .filter((a) => a.status === 'published' && dayDiff(a.due_date) >= 0)
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

    const queueMap = new Map();
    pending.forEach((s) => {
      const assignment = data.assignments.find((a) => a.id === s.assignment_id);
      if (!assignment) return;
      const row = queueMap.get(s.assignment_id) || { assignment, pending: 0, latest: s.submitted_at };
      row.pending += 1;
      if (s.submitted_at > row.latest) row.latest = s.submitted_at;
      queueMap.set(s.assignment_id, row);
    });
    const queue = [...queueMap.values()];

    const performance = courses.filter((c) => data.enrollments.some((e) => e.course_id === c.id)).map((c) => {
      const courseSubs = data.submissions.filter((s) => s.course_id === c.id);
      const graded = courseSubs.filter((s) => typeof s.score === 'number');
      const courseAssignments = data.assignments.filter((a) => a.course_id === c.id && a.status !== 'draft');
      const roster = data.enrollments.filter((e) => e.course_id === c.id).length;
      const courseAttempts = data.attempts.filter((a) => a.course_id === c.id && typeof a.score === 'number');
      const courseModules = data.modules.filter((m) => m.course_id === c.id);
      const courseProgress = data.progress.filter((p) => p.course_id === c.id && p.completed);
      const coursePosts = data.threads.filter((t) => t.course_id === c.id && t.author_role === 'student');
      const mark = graded.length
        ? Math.round(graded.reduce((sum, s) => {
          const max = data.assignments.find((a) => a.id === s.assignment_id)?.max_score || 100;
          return sum + (s.score / max) * 100;
        }, 0) / graded.length)
        : null;
      return {
        id: c.id,
        code: `${c.code} · ${c.title}`,
        students: roster,
        mark,
        completion: pct(courseSubs.length, Math.max(1, roster * Math.max(1, courseAssignments.length))),
        modules: pct(courseProgress.length, Math.max(1, roster * Math.max(1, courseModules.length))),
        quiz: pct(courseAttempts.length, Math.max(1, roster * Math.max(1, data.quizzes.filter((q) => q.course_id === c.id && q.status === 'published').length))),
        participation: pct(new Set(coursePosts.map((p) => p.author_user_id || p.author_name)).size, Math.max(1, roster)),
      };
    });

    const gradedSubs = data.submissions.filter((s) => typeof s.score === 'number');
    const assignmentSlots = data.enrollments.reduce(
      (sum, e) => sum + data.assignments.filter((a) => a.course_id === e.course_id && a.status !== 'draft').length,
      0
    );
    const outstanding = data.assignments
      .filter((a) => a.status !== 'draft' && a.due_date && a.due_date < today)
      .reduce((sum, a) => {
        const roster = data.enrollments.filter((e) => e.course_id === a.course_id).length;
        const submitted = new Set(data.submissions.filter((s) => s.assignment_id === a.id).map((s) => s.student_id || s.student_name)).size;
        return sum + Math.max(0, roster - submitted);
      }, 0);
    const averageMark = gradedSubs.length
      ? Math.round(
          gradedSubs.reduce((sum, s) => {
            const max = data.assignments.find((a) => a.id === s.assignment_id)?.max_score || 100;
            return sum + (s.score / max) * 100;
          }, 0) / gradedSubs.length
        )
      : null;
    const scoredAttempts = data.attempts.filter((a) => typeof a.score === 'number');
    const quizSlots = data.enrollments.reduce(
      (sum, e) => sum + data.quizzes.filter((q) => q.course_id === e.course_id && q.status === 'published').length,
      0
    );
    const moduleSlots = data.enrollments.reduce(
      (sum, e) => sum + data.modules.filter((m) => m.course_id === e.course_id).length,
      0
    );

    const unanswered = data.threads.filter(
      (t) => !t.parent_id && !data.threads.some((r) => r.parent_id === t.id && r.author_role === 'professor')
    );

    const trend = buildGradeTrend(data, courses);

    const alerts = [];
    if (trend.watchlist.length) {
      alerts.push({
        id: 'trend',
        tag: 'Early warning',
        tone: 'critical',
        title: `${trend.watchlist.length} student${trend.watchlist.length === 1 ? '' : 's'} trending down`,
        detail: 'Recent marks have fallen — review the grade trend',
        to: P.professor.students,
      });
    }
    if (pending.length) {
      alerts.push({ id: 'pending', tag: 'Grade', tone: 'brand', title: `${pending.length} submissions awaiting a grade`, detail: 'Open the grading queue to return feedback', to: P.professor.grading });
    }
    if (attendanceDue) {
      alerts.push({ id: 'attendance', tag: 'Today', tone: 'warning', title: `${attendanceDue} session${attendanceDue === 1 ? '' : 's'} without attendance`, detail: 'Record attendance for your classes', to: P.professor.attendance });
    }
    upcoming.slice(0, 2).forEach((a) => {
      alerts.push({ id: a.id, tag: 'Deadline', tone: 'critical', title: `${a.title} is due soon`, detail: `${a.course_code} · ${Math.max(0, dayDiff(a.due_date))} days left`, to: `${P.professor.assignments}` });
    });
    unanswered.slice(0, 2).forEach((t) => {
      alerts.push({ id: t.id, tag: 'Question', tone: 'neutral', title: t.title, detail: `${t.course_code} · ${t.author_name} is waiting for a reply`, to: P.professor.discussions });
    });
    if (sessionsToday.length) {
      const next = sessionsToday.find((s) => !s.attendance_taken);
      if (next) {
        alerts.push({ id: 'next', tag: 'Class', tone: 'brand', title: `${next.course_code} at ${next.start_time}`, detail: `${next.room} · Group ${next.group_name}`, to: `${P.professor.attendance}?session=${next.id}` });
      }
    }

    return {
      sessionsToday,
      stats: {
        courses: courses.length,
        students: enrolled,
        today: sessionsToday.length,
        pending: pending.length,
        attendanceDue,
        upcoming: upcoming.length,
        submissionRate: pct(data.submissions.length, Math.max(1, assignmentSlots)),
        outstanding,
        averageMark,
        quizParticipation: pct(data.attempts.length, Math.max(1, quizSlots)),
        quizAverage: scoredAttempts.length
          ? Math.round(scoredAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / scoredAttempts.length)
          : null,
        moduleCompletion: pct(data.progress.filter((p) => p.completed).length, Math.max(1, moduleSlots)),
      },
      queue,
      performance,
      trend,
      upcomingRows: upcoming.map((a) => ({
        ...a,
        enrolled: data.enrollments.filter((e) => e.course_id === a.course_id).length,
        submitted: data.submissions.filter((s) => s.assignment_id === a.id).length,
        graded: data.submissions.filter((s) => s.assignment_id === a.id && typeof s.score === 'number').length,
      })),
      alerts: alerts.slice(0, 6),
    };
  }, [data, courses]);

  if (loading || !view) {
    return <p className="py-10 text-center text-[12px] text-mutedink">Loading your teaching workspace…</p>;
  }

  return (
    <div>
      <PageTitle
        eyebrow="Professor workspace"
        title={`Welcome back, ${professor?.full_name || 'Professor'}`}
        description={`${professor?.title || 'Professor'} · ${facultyName} · ${departmentName}`}
        meta={[SEMESTER, professor?.full_name ? `${professor.full_name.split(' ').slice(-1)[0]} teaching load` : 'Teaching load', 'Live LMS records']}
        actions={
          <>
            <Link to={P.professor.ai} className="btn-quiet">
              AI teaching assistant
            </Link>
            <Link to={P.professor.assignments} className="btn-primary">
              New assignment
            </Link>
          </>
        }
      />

      <div className="space-y-4">
        <TeachingKpis stats={view.stats} />

        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <TodaySchedule sessions={view.sessionsToday} />
          <TeachingAlerts alerts={view.alerts} />
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <GradeTrendCard points={view.trend.points} change={view.trend.change} />
          <StrugglingStudentsCard rows={view.trend.watchlist} />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <GradingQueuePanel queue={view.queue} />
          <UpcomingAssessmentsPanel rows={view.upcomingRows} />
        </div>

        <Surface
          title="Teaching notes"
          subtitle="Your workspace reads and writes the same academic records as the student workspace"
        >
          <p className="text-[11.5px] leading-relaxed text-mutedink">
            Every figure on this page is calculated from your live course records: enrolments, submissions, quiz
            attempts, module progress and discussion posts. No performance number is hardcoded. Grading a submission
            writes the score and feedback straight to the student record, and published resources, assignments and
            quizzes are visible to enrolled students immediately.
          </p>
        </Surface>

        <CoursePerformancePanel rows={view.performance} />
      </div>
    </div>
  );
}