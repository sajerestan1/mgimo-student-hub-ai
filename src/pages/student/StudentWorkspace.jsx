import { Link } from 'react-router-dom';
import {
  BookOpen,
  CalendarDays,
  ClipboardList,
  FileText,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import PageTitle from '@/components/shell/PageTitle';
import KpiStrip from '@/components/shell/KpiStrip';
import QuickActions from '@/components/shell/QuickActions';
import WorkspaceGuard from '@/components/shell/WorkspaceGuard';
import SchedulePanel from '@/components/student/SchedulePanel';
import DeadlinesPanel from '@/components/student/DeadlinesPanel';
import ProgressPanel from '@/components/student/ProgressPanel';
import GradesPanel from '@/components/student/GradesPanel';
import AnnouncementsPanel from '@/components/student/AnnouncementsPanel';
import { DEMO_STUDENT, UNIVERSITY } from '@/lib/demoUniversity';

const QUICK_ACTIONS = [
  { label: 'Open learning platform', to: '/lms', icon: BookOpen },
  { label: 'Week schedule', to: '/schedule', icon: CalendarDays },
  { label: 'Grade book', to: '/grades', icon: GraduationCap },
  { label: 'Assignments', to: '/assignments', icon: ClipboardList },
  { label: 'Request a certificate', to: '/applications', icon: FileText },
  { label: 'AI study companion', to: '/ai-assistant', icon: Sparkles },
];

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function StudentWorkspace() {
  const student = DEMO_STUDENT;

  return (
    <WorkspaceGuard allow="student">
      <PageTitle
        eyebrow="Thursday, 7 November · Week 10"
        title={`${greeting()}, ${student.preferredName}`}
        description={`${student.programme} · Year ${student.year}. Two sessions remain today and three deadlines are open.`}
        meta={[`${UNIVERSITY.academicYear} · ${UNIVERSITY.semester}`, student.faculty, `Group ${student.group}`]}
        actions={
          <>
            <Link to="/applications" className="btn-quiet">
              <FileText className="h-3.5 w-3.5" /> Request certificate
            </Link>
            <Link to="/lms" className="btn-primary">
              <BookOpen className="h-3.5 w-3.5" /> Open learning platform
            </Link>
          </>
        }
      />

      <KpiStrip
        columns={4}
        items={student.overview.map((item) => ({
          label: item.label,
          value: item.value,
          hint: item.hint,
          delta: item.key === 'gpa' ? '+0.04' : undefined,
          tone: item.tone,
        }))}
      />

      <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <SchedulePanel />
          <DeadlinesPanel />
          <GradesPanel />
        </div>
        <div className="space-y-4">
          <ProgressPanel />
          <AnnouncementsPanel />
        </div>
      </div>

      <QuickActions className="mt-4" title="Academic shortcuts" items={QUICK_ACTIONS} />
    </WorkspaceGuard>
  );
}