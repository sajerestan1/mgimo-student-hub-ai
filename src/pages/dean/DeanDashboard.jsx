import { Link } from 'react-router-dom';
import { ArrowRight, Building2, FileText, Radar, RefreshCw, Sparkles } from 'lucide-react';
import PageTitle from '@/components/shell/PageTitle';
import KpiStrip from '@/components/shell/KpiStrip';
import Surface from '@/components/shell/Surface';
import QuickActions from '@/components/shell/QuickActions';
import FacultyTable from '@/components/dean/FacultyTable';
import AttentionPanel from '@/components/dean/AttentionPanel';
import RiskRadar from '@/components/dean/RiskRadar';
import ProgressionPanel from '@/components/dean/ProgressionPanel';
import { PerformanceTrendChart, AttendanceTrendChart, CompletionChart } from '@/components/dean/DeanCharts';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';
import { METRICS, UNIVERSITY } from '@/lib/demoUniversity';

const METRIC_CARDS = [
  { label: 'Students', value: METRICS.students.toLocaleString(), hint: '3 faculties · 9 departments' },
  { label: 'Academic staff', value: METRICS.professors, hint: 'Professors and teaching staff' },
  { label: 'Faculties / departments', value: `${METRICS.faculties} / ${METRICS.departments}`, hint: 'Institutional structure' },
  {
    label: 'Average GPA',
    value: METRICS.averageGpa.toFixed(2),
    delta: '+0.02',
    tone: 'positive',
    hint: 'Fall 26 vs Spring 26',
  },
  { label: 'Attendance', value: `${METRICS.attendance}%`, delta: '+0.3', tone: 'positive', hint: 'Institution-wide average' },
  { label: 'Students needing support', value: METRICS.studentsAtRisk, delta: '4.5%', tone: 'critical', hint: 'Flagged for intervention' },
];

const QUICK_ACTIONS = [
  { label: 'View faculty reports', to: P.dean.faculties, icon: Building2 },
  { label: 'Review academic risks', to: P.dean.risk, icon: Radar },
  { label: 'Generate academic report', to: P.dean.reports, icon: FileText },
];

const LEGEND = [
  ['Economics', 'bg-brand', '93.1%'],
  ['International Relations', 'bg-violet', '90.2%'],
  ['Management & Technology', 'bg-ink', '87.9%'],
];

export default function DeanDashboard() {
  return (
    <div>
      <PageTitle
        eyebrow="Dean’s command center · institutional oversight"
        title="University overview"
        description="Institutional population, faculty comparison, performance and progression trends, and the academic risks that need a decision this week."
        meta={[`${UNIVERSITY.academicYear} · ${UNIVERSITY.semester}`, 'Demonstration dataset', 'All faculties']}
        actions={
          <>
            <span className="mr-1 hidden items-center gap-1.5 text-[11px] text-mutedink sm:inline-flex">
              <RefreshCw className="h-3 w-3" /> {UNIVERSITY.updated}
            </span>
            <Link to={P.dean.reports} className="btn-quiet">
              <FileText className="h-3.5 w-3.5" /> Generate report
            </Link>
            <Link to={P.dean.risk} className="btn-primary">
              <Sparkles className="h-3.5 w-3.5" /> Risk radar
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
            <Link to={P.dean.performance} className="link-quiet">
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
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                {LEGEND.map(([label, color, value]) => (
                  <span key={label} className="inline-flex items-center gap-1.5 text-[11px] text-mutedink">
                    <span className={`h-1.5 w-1.5 rounded-full ${color}`} /> {label}
                    <span className="font-medium tabular-nums text-ink">{value}</span>
                  </span>
                ))}
              </div>
              <Link to={P.dean.attendance} className="link-quiet">
                Attendance analytics <ArrowRight className="h-3.5 w-3.5" />
              </Link>
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
          subtitle="Drill down from the university into faculties, departments and programmes"
          bodyClassName="p-0"
          footer={
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <Link to={P.dean.faculties} className="link-quiet">
                Faculties <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link to={P.dean.departments} className="link-quiet">
                Departments <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link to={P.dean.students} className="link-quiet">
                Students <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          }
        >
          <FacultyTable />
        </Surface>
        <div className="space-y-4">
          <ProgressionPanel />
          <Surface
            title="Course completion by faculty"
            subtitle="Assignment submission, current term"
            bodyClassName="px-3 pb-4 pt-1"
            footer={
              <Link to={P.dean.courses} className="link-quiet">
                Course performance <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          >
            <CompletionChart />
          </Surface>
        </div>
      </div>

      <QuickActions className="mt-4" title="Executive actions" items={QUICK_ACTIONS} />
    </div>
  );
}