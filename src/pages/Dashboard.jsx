import { Link } from 'react-router-dom';
import {
  Users,
  GraduationCap,
  Building2,
  Layers,
  CalendarCheck,
  TrendingUp,
  AlertTriangle,
  FileText,
  CalendarDays,
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import KpiCard from '@/components/admin/KpiCard';
import Panel from '@/components/admin/Panel';
import DataTable from '@/components/admin/DataTable';
import AiBriefing from '@/components/dashboard/AiBriefing';
import RiskRadarPanel from '@/components/dashboard/RiskRadarPanel';
import PendingActionsPanel from '@/components/dashboard/PendingActionsPanel';
import { BarBlock, LineBlock, DonutBlock, ChartLegend } from '@/components/charts/Charts';
import { useAdminData } from '@/lib/AdminDataContext';
import { formatGpa, formatPercent, formatDate } from '@/lib/exportCsv';

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning, Dean.';
  if (hour < 18) return 'Good afternoon, Dean.';
  return 'Good evening, Dean.';
}

export default function Dashboard() {
  const { analytics, requests, tasks, events, loading, error, reload } = useAdminData();

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-16 animate-pulse rounded-2xl bg-white" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-24 animate-pulse rounded-2xl bg-white" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-surface p-6 text-center">
        <p className="font-heading text-[17px] text-ink">Institutional records could not be loaded</p>
        <p className="mt-1 text-[12px] text-mutedink">{error}</p>
        <button
          type="button"
          onClick={reload}
          className="mt-3 rounded-lg bg-navy px-3.5 py-2 text-[12px] font-medium text-white hover:bg-navy-mid"
        >
          Retry
        </button>
      </div>
    );
  }

  const { kpis, facultyRows, gradeDistribution, attendanceTrend, upcomingEvents } = analytics;
  const topFaculties = [...facultyRows].sort((a, b) => (b.avgGpa || 0) - (a.avgGpa || 0)).slice(0, 6);

  const kpiCards = [
    { label: 'Total students', value: kpis.totalStudents, caption: 'active enrolments', icon: Users, accent: 'navy' },
    { label: 'Professors & staff', value: kpis.totalStaff, caption: 'academic personnel', icon: GraduationCap, accent: 'navy' },
    { label: 'Faculties', value: kpis.facultyCount, caption: 'academic schools', icon: Building2, accent: 'gold' },
    { label: 'Departments', value: kpis.departmentCount, caption: 'across all faculties', icon: Layers, accent: 'gold' },
    {
      label: 'Attendance rate',
      value: formatPercent(kpis.attendanceRate),
      caption: `this week ${formatPercent(kpis.attendanceWeek)}`,
      icon: CalendarCheck,
      accent: 'green',
    },
    { label: 'Average performance', value: `${formatGpa(kpis.avgGpa)} / 5.00`, caption: 'current semester', icon: TrendingUp, accent: 'navy' },
    { label: 'Students requiring intervention', value: kpis.atRisk, caption: 'high or medium risk indicators', icon: AlertTriangle, accent: 'red' },
    { label: 'Pending requests', value: kpis.pendingRequests, caption: 'awaiting administrative decision', icon: FileText, accent: 'gold' },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Executive Dashboard"
        title={greeting()}
        description="Here is your university's academic and administrative overview."
        actions={
          <>
            <span className="rounded-lg border border-[#E1E8F2] bg-white px-3 py-2 text-[11.5px] font-medium text-ink">
              {analytics.currentTermLabel}
            </span>
            <Link
              to="/assistant"
              className="rounded-lg bg-navy px-3.5 py-2 text-[11.5px] font-medium text-white transition-colors hover:bg-navy-mid"
            >
              Ask the AI Dean Assistant
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpiCards.map((card) => (
          <KpiCard key={card.label} {...card} />
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AiBriefing />
        </div>
        <RiskRadarPanel analytics={analytics} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel
          title="Academic performance by faculty"
          subtitle="Average grade, current semester"
          bodyClassName="p-3"
        >
          <BarBlock data={facultyRows.map((faculty) => ({ label: faculty.code, value: Number((faculty.avgGpa || 0).toFixed(2)) }))} height={190} />
        </Panel>
        <Panel title="Attendance trend" subtitle="Institutional attendance rate by week" bodyClassName="p-3">
          {attendanceTrend.length > 0 ? (
            <LineBlock data={attendanceTrend} height={190} />
          ) : (
            <p className="py-16 text-center text-[12px] text-mutedink">No attendance sessions recorded yet.</p>
          )}
        </Panel>
        <Panel title="Grade distribution" subtitle="Current semester results" bodyClassName="p-3">
          <DonutBlock
            data={gradeDistribution}
            height={160}
            colors={['#102D50', '#4C79A8', '#D8B66A', '#B05C5A']}
            centerValue={formatGpa(kpis.avgGpa)}
            centerLabel="avg GPA"
          />
          <ChartLegend data={gradeDistribution} colors={['#102D50', '#4C79A8', '#D8B66A', '#B05C5A']} />
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <PendingActionsPanel analytics={analytics} requests={requests} tasks={tasks} />

        <Panel
          title="Academic calendar"
          subtitle="Upcoming examinations, deadlines and meetings"
          actions={
            <Link to="/calendar" className="text-[11px] font-medium text-navy hover:underline">
              Calendar
            </Link>
          }
          bodyClassName="p-4"
        >
          <ul className="space-y-2">
            {upcomingEvents.slice(0, 5).map((event) => (
              <li key={event.id} className="flex gap-2.5 rounded-lg border border-[#EEF2F8] px-2.5 py-2">
                <span className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-md bg-[#F2F6FB] text-navy">
                  <span className="text-[12px] font-semibold leading-none">
                    {new Date(`${event.start_date}T00:00:00`).getDate()}
                  </span>
                  <span className="text-[8px] uppercase leading-none text-mutedink">
                    {new Date(`${event.start_date}T00:00:00`).toLocaleString('en-GB', { month: 'short' })}
                  </span>
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[11.5px] font-medium text-ink">{event.title}</span>
                  <span className="block truncate text-[10px] capitalize text-mutedink">
                    {event.type.replace(/_/g, ' ')} · {event.facultyName}
                  </span>
                </span>
              </li>
            ))}
            {upcomingEvents.length === 0 && (
              <li className="py-4 text-center text-[11.5px] text-mutedink">No upcoming academic events.</li>
            )}
          </ul>
        </Panel>

        <Panel
          title="Top faculties"
          subtitle="Ranked by average academic performance"
          actions={
            <Link to="/faculties" className="text-[11px] font-medium text-navy hover:underline">
              Faculties
            </Link>
          }
          bodyClassName="p-0"
        >
          <DataTable
            dense
            columns={[
              { key: 'code', label: 'Faculty', render: (row) => <span className="font-medium">{row.code}</span> },
              { key: 'studentCount', label: 'Students', align: 'right' },
              { key: 'attendanceRate', label: 'Attendance', align: 'right', render: (row) => formatPercent(row.attendanceRate) },
              { key: 'avgGpa', label: 'Avg GPA', align: 'right', render: (row) => formatGpa(row.avgGpa) },
            ]}
            rows={topFaculties}
          />
        </Panel>
      </div>

      <p className="mt-4 text-[10.5px] text-mutedink">
        Next academic deadline:{' '}
        {upcomingEvents[0] ? `${upcomingEvents[0].title} — ${formatDate(upcomingEvents[0].start_date)}` : 'no deadline recorded'} ·{' '}
        {events.length} calendar entries on file.
      </p>
    </div>
  );
}