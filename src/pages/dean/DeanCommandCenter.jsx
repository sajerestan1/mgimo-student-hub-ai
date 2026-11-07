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
} from 'lucide-react';
import PageTitle from '@/components/shell/PageTitle';
import MetricCard from '@/components/shell/MetricCard';
import Surface from '@/components/shell/Surface';
import WorkspaceGuard from '@/components/shell/WorkspaceGuard';
import FacultyTable from '@/components/dean/FacultyTable';
import AttentionPanel from '@/components/dean/AttentionPanel';
import RiskRadar from '@/components/dean/RiskRadar';
import {
  PerformanceTrendChart,
  FacultyPerformanceChart,
  AttendanceTrendChart,
  StudentDistributionChart,
  CompletionChart,
} from '@/components/dean/DeanCharts';
import { METRICS, UNIVERSITY } from '@/lib/demoUniversity';

const METRIC_CARDS = [
  { label: 'Students', value: METRICS.students.toLocaleString(), hint: '3 faculties · 9 departments', tone: 'brand' },
  { label: 'Professors', value: METRICS.professors, hint: '268 academic staff', tone: 'brand' },
  { label: 'Faculties', value: METRICS.faculties, hint: '9 departments', tone: 'neutral' },
  { label: 'Average GPA', value: METRICS.averageGpa.toFixed(2), hint: '+0.02 vs previous term', tone: 'positive' },
  { label: 'Attendance', value: `${METRICS.attendance}%`, hint: 'Institution-wide average', tone: 'positive' },
  { label: 'Needs support', value: METRICS.studentsAtRisk, hint: 'Students flagged this term', tone: 'critical' },
];

const QUICK_ACTIONS = [
  { label: 'View faculties', to: '/faculty', icon: Building2 },
  { label: 'View departments', to: '/departments', icon: Network },
  { label: 'View students', to: '/students', icon: Users },
  { label: 'View professors', to: '/professors', icon: Presentation },
  { label: 'Academic analytics', to: '/analytics', icon: BarChart3 },
  { label: 'Attendance reports', to: '/attendance', icon: CalendarCheck },
  { label: 'LMS overview', to: '/lms', icon: GraduationCap },
  { label: 'Generate academic report', to: '/analytics', icon: FileText },
];

export default function DeanCommandCenter() {
  return (
    <WorkspaceGuard allow="dean">
      <PageTitle
        eyebrow="Dean’s Command Center"
        title="University Command Center"
        description="What is happening across Academic Intelligence University, what needs your attention, and what to act on next."
        meta={
          <>
            <span>{UNIVERSITY.academicYear} · {UNIVERSITY.semester}</span>
            <span className="h-1 w-1 rounded-full bg-mutedink/40" />
            <span className="inline-flex items-center gap-1">
              <RefreshCw className="h-2.5 w-2.5" /> {UNIVERSITY.updated}
            </span>
            <span className="h-1 w-1 rounded-full bg-mutedink/40" />
            <span>Demonstration dataset</span>
          </>
        }
        actions={
          <>
            <Link
              to="/analytics"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#E1E7F2] bg-white px-3 py-2 text-[11.5px] font-medium text-ink hover:bg-[#F6F8FC]"
            >
              <FileText className="h-3.5 w-3.5" /> Generate report
            </Link>
            <Link
              to="/ai-assistant"
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-[11.5px] font-medium text-white hover:bg-brand/90"
            >
              <Sparkles className="h-3.5 w-3.5" /> AI assistant
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
        {METRIC_CARDS.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="mt-2.5 grid gap-2.5 lg:grid-cols-2">
        <Surface title="Academic performance trend" subtitle="Average GPA across the last five terms">
          <PerformanceTrendChart />
        </Surface>
        <Surface title="Performance by faculty" subtitle="Current term average GPA">
          <FacultyPerformanceChart />
        </Surface>
        <Surface title="Attendance trend" subtitle="Weekly attendance rate per faculty">
          <AttendanceTrendChart />
          <div className="mt-2 flex flex-wrap items-center gap-3 text-[10.5px] text-mutedink">
            {[
              ['Economics', 'bg-brand'],
              ['International Relations', 'bg-violet'],
              ['Management & Technology', 'bg-navy'],
            ].map(([label, color]) => (
              <span key={label} className="inline-flex items-center gap-1">
                <span className={`h-1.5 w-1.5 rounded-full ${color}`} /> {label}
              </span>
            ))}
          </div>
        </Surface>
        <Surface title="Student distribution" subtitle="Enrolment by study year">
          <StudentDistributionChart />
        </Surface>
      </div>

      <div className="mt-2.5 grid gap-2.5 lg:grid-cols-[1fr_1fr]">
        <AttentionPanel />
        <RiskRadar />
      </div>

      <div className="mt-2.5 grid gap-2.5 lg:grid-cols-[1.55fr_1fr]">
        <Surface
          title="Faculty overview"
          subtitle="Comparison across the three faculties this term"
          bodyClassName="p-0"
        >
          <FacultyTable />
        </Surface>
        <div className="space-y-2.5">
          <Surface title="Assignment completion" subtitle="Submitted vs outstanding, current term">
            <CompletionChart />
          </Surface>
          <Surface title="Administrative quick actions" bodyClassName="p-2.5">
            <div className="grid grid-cols-2 gap-1.5">
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.label}
                    to={action.to}
                    className="flex items-center gap-1.5 rounded-lg border border-[#EDF0F6] px-2 py-2 text-[11px] font-medium text-ink transition-colors hover:border-brand/30 hover:bg-[#F7F9FF]"
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0 text-brand" />
                    <span className="truncate">{action.label}</span>
                  </Link>
                );
              })}
            </div>
          </Surface>
        </div>
      </div>
    </WorkspaceGuard>
  );
}