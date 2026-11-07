import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  CalendarCheck,
  ClipboardList,
  Users,
  Sparkles,
  MapPin,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import PageTitle from '@/components/shell/PageTitle';
import MetricCard from '@/components/shell/MetricCard';
import Surface from '@/components/shell/Surface';
import WorkspaceGuard from '@/components/shell/WorkspaceGuard';
import { DEMO_PROFESSOR } from '@/lib/demoUniversity';

const ACTIONS = [
  { label: 'Take attendance', to: '/attendance', icon: CalendarCheck },
  { label: 'Grade assignments', to: '/assignments', icon: ClipboardCheck },
  { label: 'Create assignment', to: '/assignments', icon: ClipboardList },
  { label: 'View students', to: '/students', icon: Users },
  { label: 'Open course', to: '/courses', icon: BookOpen },
  { label: 'Generate quiz with AI', to: '/ai-assistant', icon: Sparkles },
];

export default function ProfessorWorkspace() {
  const data = DEMO_PROFESSOR;

  return (
    <WorkspaceGuard allow="professor">
      <PageTitle
        eyebrow="Welcome back,"
        title={`Professor ${data.name.replace('Dr. ', '')}`}
        description={`${data.title} · ${data.department}`}
        meta={
          <>
            <span>{data.faculty}</span>
            <span className="h-1 w-1 rounded-full bg-mutedink/40" />
            <span>{data.courses.length} courses this term</span>
            <span className="h-1 w-1 rounded-full bg-mutedink/40" />
            <span>{data.semester}</span>
          </>
        }
        actions={
          <Link
            to="/assignments"
            className="inline-flex items-center gap-1.5 rounded-lg bg-navy px-3.5 py-2 text-[11.5px] font-medium text-white hover:bg-navy-mid"
          >
            <ClipboardList className="h-3.5 w-3.5" /> Create assignment
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {data.metrics.map((item) => (
          <MetricCard key={item.key} label={item.label} value={item.value} hint={item.hint} tone={item.tone} />
        ))}
      </div>

      <div className="mt-2.5 grid gap-2.5 lg:grid-cols-[1.55fr_1fr]">
        <div className="space-y-2.5">
          <Surface
            title="Today's teaching"
            subtitle="Thursday, 7 November · 3 sessions"
            bodyClassName="p-0"
          >
            <ul className="divide-y divide-[#F3F5FA]">
              {data.schedule.map((session) => (
                <li key={session.id} className={cn('flex items-start gap-3 px-4 py-3', session.state === 'now' && 'bg-[#F7F9FF]')}>
                  <div className="w-[74px] shrink-0">
                    <p className="text-[11px] font-medium text-ink">{session.time.split(' – ')[0]}</p>
                    <p className="text-[10px] text-mutedink">{session.time.split(' – ')[1]}</p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-medium text-ink">
                      {session.title || session.course} <span className="font-normal text-mutedink">· {session.group}</span>
                    </p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[10.5px] text-mutedink">
                      <span>{session.code}</span>
                      <span className="inline-flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" /> {session.room}</span>
                    </p>
                  </div>
                  {session.state === 'now' && (
                    <span className="shrink-0 rounded-md bg-brand px-1.5 py-0.5 text-[9px] font-medium text-white">Now</span>
                  )}
                  {session.state === 'next' && (
                    <span className="shrink-0 rounded-md bg-[#EEF1F7] px-1.5 py-0.5 text-[9px] font-medium text-mutedink">Next</span>
                  )}
                </li>
              ))}
            </ul>
          </Surface>

          <Surface
            title="Grading queue"
            subtitle="27 submissions awaiting feedback"
            action={
              <Link to="/assignments" className="text-[11px] font-medium text-brand hover:underline">
                Open grading
              </Link>
            }
            bodyClassName="p-0"
          >
            <ul className="divide-y divide-[#F3F5FA]">
              {data.gradingQueue.map((item) => {
                const progress = Math.round((item.submitted / item.total) * 100);
                return (
                  <li key={item.id} className="px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-[12px] font-medium text-ink">{item.title}</p>
                        <p className="mt-0.5 text-[10.5px] text-mutedink">
                          {item.course} · {item.submitted}/{item.total} submitted · due {item.due}
                        </p>
                      </div>
                      <Link
                        to="/assignments"
                        className="shrink-0 rounded-lg border border-[#E1E7F2] px-2 py-1 text-[10.5px] font-medium text-ink hover:bg-[#F6F8FC]"
                      >
                        Grade
                      </Link>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#EDF1F8]">
                      <div className="h-full rounded-full bg-brand" style={{ width: `${progress}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </Surface>

          <Surface title="Recent submissions" subtitle="Latest student work across your courses" bodyClassName="p-0">
            <ul className="divide-y divide-[#F3F5FA]">
              {data.submissions.map((item) => (
                <li key={item.id} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/10 text-[9.5px] font-semibold text-brand">
                    {item.student.split(' ').map((part) => part[0]).join('')}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11.5px] font-medium text-ink">{item.title}</p>
                    <p className="truncate text-[10.5px] text-mutedink">
                      {item.student} · {item.course}
                    </p>
                  </div>
                  <span className="shrink-0 text-[9.5px] text-mutedink">{item.when}</span>
                </li>
              ))}
            </ul>
          </Surface>
        </div>

        <div className="space-y-2.5">
          <Surface
            title="My courses"
            subtitle="Fall Semester 2026"
            action={
              <Link to="/courses" className="text-[11px] font-medium text-brand hover:underline">
                All courses
              </Link>
            }
            bodyClassName="p-0"
          >
            <ul className="divide-y divide-[#F3F5FA]">
              {data.courses.map((course) => (
                <li key={course.id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-[12px] font-medium text-ink">{course.title}</p>
                      <p className="mt-0.5 text-[10.5px] text-mutedink">
                        {course.code} · {course.students} students
                      </p>
                    </div>
                    <span
                      className={cn(
                        'shrink-0 rounded-md px-1.5 py-0.5 text-[9.5px] font-medium',
                        course.status === 'On track' ? 'bg-positive/10 text-positive' : 'bg-warning/10 text-warning'
                      )}
                    >
                      {course.status}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#EDF1F8]">
                      <div className="h-full rounded-full bg-gradient-to-r from-brand to-violet" style={{ width: `${course.progress}%` }} />
                    </div>
                    <span className="text-[9.5px] text-mutedink">{course.progress}%</span>
                  </div>
                </li>
              ))}
            </ul>
          </Surface>

          <Surface title="Academic actions" bodyClassName="p-2.5">
            <div className="grid grid-cols-2 gap-1.5">
              {ACTIONS.map((action) => {
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

          <Surface title="Upcoming assessments" bodyClassName="p-0">
            <ul className="divide-y divide-[#F3F5FA]">
              {data.assessments.map((item) => (
                <li key={item.id} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="w-11 shrink-0 text-[10.5px] font-medium text-ink">{item.date}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11.5px] font-medium text-ink">{item.title}</p>
                    <p className="text-[10px] text-mutedink">{item.course}</p>
                  </div>
                  <span className="shrink-0 rounded-md bg-[#EEF1F7] px-1.5 py-0.5 text-[9.5px] text-mutedink">{item.type}</span>
                </li>
              ))}
            </ul>
          </Surface>

          <Surface title="Attendance to review" bodyClassName="p-0">
            <ul className="divide-y divide-[#F3F5FA]">
              {data.attendanceFlags.map((flag) => (
                <li key={flag.id} className="flex items-start gap-2.5 px-4 py-2.5">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
                  <div className="min-w-0">
                    <p className="text-[11.5px] font-medium text-ink">
                      {flag.course} · {flag.group}
                    </p>
                    <p className="text-[10.5px] leading-relaxed text-mutedink">{flag.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-[#F3F5FA] px-4 py-2.5">
              <Link to="/attendance" className="inline-flex items-center gap-1 text-[11px] font-medium text-brand hover:underline">
                Review attendance <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </Surface>

          <p className="px-1 text-[10px] leading-relaxed text-mutedink">
            <Clock className="mr-1 inline h-3 w-3" /> Timetable, grading and attendance actions open their Stage 2 modules.
          </p>
        </div>
      </div>
    </WorkspaceGuard>
  );
}