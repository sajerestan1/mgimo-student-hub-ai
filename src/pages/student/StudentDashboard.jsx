import { CalendarDays, ClipboardList, FileText, GraduationCap } from 'lucide-react';
import KpiStrip from '@/components/shell/KpiStrip';
import QuickActions from '@/components/shell/QuickActions';
import StudentHeader from '@/components/student/StudentHeader';
import SchedulePanel from '@/components/student/SchedulePanel';
import DeadlinesPanel from '@/components/student/DeadlinesPanel';
import GradesPanel from '@/components/student/GradesPanel';
import ProgressPanel from '@/components/student/ProgressPanel';
import StandingPanel from '@/components/student/StandingPanel';
import ExamsPanel from '@/components/student/ExamsPanel';
import AnnouncementsPanel from '@/components/student/AnnouncementsPanel';
import AssistantEntry from '@/components/shared/AssistantEntry';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';
import { DEMO_STUDENT } from '@/lib/demoUniversity';

const QUICK_ACTIONS = [
  { label: 'View timetable', to: P.student.timetable, icon: CalendarDays },
  { label: 'Submit assignment', to: P.student.assignments, icon: ClipboardList },
  { label: 'Check grades', to: P.student.grades, icon: GraduationCap },
  { label: 'Apply for certificate', to: P.student.applications, icon: FileText },
];

const openAssignments = DEMO_STUDENT.assignments.filter((item) => item.status !== 'submitted').length;

const METRICS = [
  {
    label: 'Current GPA',
    value: DEMO_STUDENT.gpa.toFixed(2),
    hint: 'Fall Semester 2026 · top 12% of cohort',
    delta: '+0.04',
    tone: 'positive',
  },
  {
    label: 'Cumulative GPA',
    value: DEMO_STUDENT.cumulativeGpa.toFixed(2),
    hint: `Across ${DEMO_STUDENT.creditsEarned} completed credits`,
    delta: '+0.02',
    tone: 'positive',
  },
  {
    label: 'Credits completed',
    value: String(DEMO_STUDENT.creditsEarned),
    hint: `${DEMO_STUDENT.creditsRemaining} remaining of ${DEMO_STUDENT.creditsRequired}`,
  },
  {
    label: 'Attendance',
    value: `${DEMO_STUDENT.attendance}%`,
    hint: 'Requirement is 85% per course',
    delta: '+1.2',
    tone: 'positive',
  },
  {
    label: 'Open assignments',
    value: String(openAssignments),
    hint: 'Closest deadline in 2 days',
    delta: 'Due 9 Nov',
    tone: 'warning',
  },
];

export default function StudentDashboard() {
  return (
    <div>
      <StudentHeader student={DEMO_STUDENT} />

      <KpiStrip columns={5} items={METRICS} />

      <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <SchedulePanel />
          <DeadlinesPanel />
          <GradesPanel />
        </div>
        <div className="space-y-4">
          <StandingPanel />
          <ProgressPanel />
          <ExamsPanel />
          <AnnouncementsPanel />
        </div>
      </div>

      <AssistantEntry
        eyebrow="AI study companion"
        title="Ask about your own courses, deadlines and results"
        description="A personal study assistant scoped to your own academic record — it can explain your grades, plan revision around your timetable and flag deadlines you are close to missing."
        prompts={['What should I revise for the ECO-301 mid-term?', 'How many credits do I still need?', 'Plan my week around the 9 Nov deadline']}
        to={P.student.ai}
        ctaLabel="Open study companion"
      />

      <QuickActions className="mt-4" title="My actions" items={QUICK_ACTIONS} />
    </div>
  );
}