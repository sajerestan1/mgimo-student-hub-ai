import { Link } from 'react-router-dom';
import { BookOpen, CalendarCheck, ClipboardCheck, ClipboardList, Sparkles, Users } from 'lucide-react';
import PageTitle from '@/components/shell/PageTitle';
import KpiStrip from '@/components/shell/KpiStrip';
import QuickActions from '@/components/shell/QuickActions';
import WorkspaceGuard from '@/components/shell/WorkspaceGuard';
import TeachingSchedule from '@/components/professor/TeachingSchedule';
import GradingQueue from '@/components/professor/GradingQueue';
import CourseList from '@/components/professor/CourseList';
import StudentActivity from '@/components/professor/StudentActivity';
import AssessmentList from '@/components/professor/AssessmentList';
import AttendanceReview from '@/components/professor/AttendanceReview';
import { DEMO_PROFESSOR } from '@/lib/demoUniversity';

const QUICK_ACTIONS = [
  { label: 'Take attendance', to: '/attendance', icon: CalendarCheck },
  { label: 'Grade submissions', to: '/assignments', icon: ClipboardCheck },
  { label: 'Create assignment', to: '/assignments', icon: ClipboardList },
  { label: 'My students', to: '/students', icon: Users },
  { label: 'Course workspace', to: '/courses', icon: BookOpen },
  { label: 'AI teaching assistant', to: '/ai-assistant', icon: Sparkles },
];

const DELTAS = {
  grading: { delta: '+5 today', tone: 'warning' },
  attendance: { delta: '2 new', tone: 'warning' },
};

export default function ProfessorWorkspace() {
  const data = DEMO_PROFESSOR;

  return (
    <WorkspaceGuard allow="professor">
      <PageTitle
        eyebrow={`Teaching workspace · ${data.semester}`}
        title={`Professor ${data.name.replace('Dr. ', '')}`}
        description={`${data.title} · ${data.department}. Three sessions today and 27 submissions awaiting feedback.`}
        meta={[data.faculty, '4 courses · 186 students', 'Office hours Thu 14:00']}
        actions={
          <>
            <Link to="/attendance" className="btn-quiet">
              <CalendarCheck className="h-3.5 w-3.5" /> Take attendance
            </Link>
            <Link to="/assignments" className="btn-primary">
              <ClipboardList className="h-3.5 w-3.5" /> Create assignment
            </Link>
          </>
        }
      />

      <KpiStrip
        columns={4}
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

      <QuickActions className="mt-4" title="Teaching shortcuts" items={QUICK_ACTIONS} />
    </WorkspaceGuard>
  );
}