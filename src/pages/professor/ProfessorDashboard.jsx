import { Link } from 'react-router-dom';
import { CalendarCheck, ClipboardCheck, ClipboardList, FolderUp } from 'lucide-react';
import PageTitle from '@/components/shell/PageTitle';
import KpiStrip from '@/components/shell/KpiStrip';
import QuickActions from '@/components/shell/QuickActions';
import TeachingSchedule from '@/components/professor/TeachingSchedule';
import GradingQueue from '@/components/professor/GradingQueue';
import CourseList from '@/components/professor/CourseList';
import StudentActivity from '@/components/professor/StudentActivity';
import AssessmentList from '@/components/professor/AssessmentList';
import AttendanceReview from '@/components/professor/AttendanceReview';
import AssistantEntry from '@/components/shared/AssistantEntry';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';
import { DEMO_PROFESSOR } from '@/lib/demoUniversity';

const QUICK_ACTIONS = [
  { label: 'Create assignment', to: P.professor.assignments, icon: ClipboardList },
  { label: 'Upload material', to: P.professor.materials, icon: FolderUp },
  { label: 'Record attendance', to: P.professor.attendance, icon: CalendarCheck },
  { label: 'Create quiz', to: P.professor.quizzes, icon: ClipboardCheck },
  { label: 'Review submissions', to: P.professor.grading, icon: ClipboardCheck },
];

const DELTAS = {
  grading: { delta: '+5 today', tone: 'warning' },
  quizzes: { delta: '3 new', tone: 'warning' },
  attendance: { delta: '2 new', tone: 'warning' },
};

export default function ProfessorDashboard() {
  const data = DEMO_PROFESSOR;

  return (
    <div>
      <PageTitle
        eyebrow="Teaching workspace · Fall Semester 2026"
        title={`Professor ${data.name.replace('Dr. ', '')}`}
        description={`${data.title} · ${data.department}. Three sessions today, 27 submissions and 12 quizzes awaiting feedback.`}
        meta={[data.faculty, data.department, '4 courses · 186 students', 'Office hours Thu 14:00']}
        actions={
          <>
            <Link to={P.professor.attendance} className="btn-quiet">
              <CalendarCheck className="h-3.5 w-3.5" /> Record attendance
            </Link>
            <Link to={P.professor.assignments} className="btn-primary">
              <ClipboardList className="h-3.5 w-3.5" /> Create assignment
            </Link>
          </>
        }
      />

      <KpiStrip
        columns={5}
        items={data.metrics.map((item) => ({
          label: item.label,
          value: item.value,
          hint: item.hint,
          ...(DELTAS[item.key] || {}),
        }))}
      />

      <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <TeachingSchedule />
          <GradingQueue />
          <StudentActivity />
        </div>
        <div className="space-y-4">
          <CourseList />
          <AssessmentList />
          <AttendanceReview />
        </div>
      </div>

      <AssistantEntry
        eyebrow="AI teaching assistant"
        title="Ask about your courses, cohorts and grading load"
        description="Scoped to the courses you teach: cohort performance, attendance anomalies, outstanding grading and draft feedback for submission review."
        prompts={['Which cohort is falling behind in ECO-340?', 'Summarise this week’s submissions', 'Draft feedback for the trade policy brief']}
        to={P.professor.ai}
        ctaLabel="Open teaching assistant"
      />

      <QuickActions className="mt-4" title="Teaching actions" items={QUICK_ACTIONS} />
    </div>
  );
}