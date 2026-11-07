import { Link } from 'react-router-dom';
import {
  Users,
  Presentation,
  Building2,
  Network,
  GraduationCap,
  CalendarCheck,
  BarChart3,
  FileText,
  Sparkles,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import PageTitle from '@/components/shell/PageTitle';
import KpiStrip from '@/components/shell/KpiStrip';
import Surface from '@/components/shell/Surface';
import WorkspaceGuard from '@/components/shell/WorkspaceGuard';
import QuickActions from '@/components/shell/QuickActions';
import FacultyTable from '@/components/dean/FacultyTable';
import AttentionPanel from '@/components/dean/AttentionPanel';
import RiskRadar from '@/components/dean/RiskRadar';
import {
  PerformanceTrendChart,
  AttendanceTrendChart,
  CompletionChart,
} from '@/components/dean/DeanCharts';
import { METRICS, UNIVERSITY } from '@/lib/demoUniversity';

const METRIC_CARDS = [
  { label: 'Students', value: METRICS.students.toLocaleString(), hint: '3 faculties · 9 departments' },
  { label: 'Academic staff', value: METRICS.professors, hint: 'Across 9 departments' },
  { label: 'Average GPA', value: METRICS.averageGpa.toFixed(2), delta: '+0.02', tone: 'positive', hint: 'Fall 26 vs Spring 26' },
  { label: 'Attendance', value: `${METRICS.attendance}%`, delta: '+0.3', tone: 'positive', hint: 'Institution-wide average' },
  { label: 'At risk', value: METRICS.studentsAtRisk, delta: '4.5%', tone: 'critical', hint: 'Flagged for support' },
  { label: 'Submission rate', value: `${METRICS.completion}%`, delta: '+2', tone: 'positive', hint: 'Assignments submitted on time' },
];

const QUICK_ACTIONS = [
  { label: 'Faculties', to: '/faculty', icon: Building2 },
  { label: 'Departments', to: '/departments', icon: Network },
  { label: 'Students', to: '/students', icon: Users },
  { label: 'Professors', to: '/professors', icon: Presentation },
  { label: 'Analytics', to: '/analytics', icon: BarChart3 },
  { label: 'Attendance reports', to: '/attendance', icon: CalendarCheck },
  { label: 'Learning platform', to: '/lms', icon: GraduationCap },
  { label: 'Institutional report', to: '/analytics', icon: FileText },
];

const LEGEND = [
  ['Economics', 'bg-brand', '93.1%'],
  ['International Relations', 'bg-violet', '90.2%'],
  ['Management & Technology', 'bg-ink', '87.9%'],
];

export default function DeanCommandCenter() {
  return (
    <WorkspaceGuard allow="dean">
      <PageTitle
        eyebrow="Dean’s command center"
        title="University overview"
        description="Institutional performance, faculty comparison and the signals that need a decision this week."
        meta={[`${UNIVERSITY.academicYear} · ${UNIVERSITY.semester}`, 'Demonstration dataset']}
        actions={
          <>
            <span className="mr-1 hidden items-center gap-1.5 text-[11px] text-mutedink sm:inline-flex">
              <RefreshCw className="h-3 w-3" /> {UNIVERSITY.updated}
            </span>
            <Link to="/analytics" className="btn-quiet">
              <FileText className="h-3.5 w-3.5" /> Generate report
            </Link>
            <Link to="/ai-assistant" className="btn-primary">
              <Sparkles className="h-3.5 w-3.5" /> Ask the assistant
            </Link>
          </>
        }
      />

      <KpiStrip columns={6} items={METRIC_CARDS} />

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        <Surface
          title="Academic performance"
          subtitle="Average GPA across the last five terms"
          action={<span className="chip bg-[#E9F5EF] text-[#1D7A50]">4.05 · +0.02</span>}
          bodyClassName="px-3 pb-4 pt-1"
          footer={
            <Link to="/analytics" className="link-quiet">
              Open performance analytics <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        >
          <PerformanceTrendChart />
        </Surface>
        <AttentionPanel />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <Surface
          title="Attendance trend"
          subtitle="Weekly rate per faculty, last six weeks"
          bodyClassName="px-3 pb-3 pt-1"
          footer={
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
              {LEGEND.map(([label, color, value]) => (
                <span key={label} className="inline-flex items-center gap-1.5 text-[11px] text-mutedink">
                  <span className={`h-1.5 w-1.5 rounded-full ${color}`} /> {label}
                  <span className="font-medium tabular-nums text-ink">{value}</span>
                </span>
              ))}
            </div>
          }
        >
          <AttendanceTrendChart />
        </Surface>
        <RiskRadar />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        <Surface
          title="Faculty comparison"
          subtitle="Students, performance, attendance and support load this term"
          bodyClassName="p-0"
          footer={
            <Link to="/analytics" className="link-quiet">
              Compare faculties in analytics <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        >
          <FacultyTable />
        </Surface>
        <Surface
          title="Assignment completion"
          subtitle="Submitted vs outstanding, current term"
          bodyClassName="px-3 pb-4 pt-1"
        >
          <CompletionChart />
        </Surface>
      </div>

      <QuickActions className="mt-4" title="Administrative actions" items={QUICK_ACTIONS} />
    </WorkspaceGuard>
  );
}