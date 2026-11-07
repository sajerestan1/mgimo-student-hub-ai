import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  ClipboardList,
  GraduationCap,
  FileText,
  Sparkles,
  Clock,
  MapPin,
  Megaphone,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import PageTitle from '@/components/shell/PageTitle';
import MetricCard from '@/components/shell/MetricCard';
import Surface from '@/components/shell/Surface';
import WorkspaceGuard from '@/components/shell/WorkspaceGuard';
import { StudentGpaChart } from '@/components/dean/DeanCharts';
import { DEMO_STUDENT, UNIVERSITY } from '@/lib/demoUniversity';

const PRIORITY = {
  high: 'bg-critical/10 text-critical',
  normal: 'bg-brand/10 text-brand',
  low: 'bg-[#EEF1F7] text-mutedink',
};

const ASSIGNMENT_STATUS = {
  not_started: { label: 'Not started', className: 'bg-[#EEF1F7] text-mutedink' },
  in_progress: { label: 'In progress', className: 'bg-warning/10 text-warning' },
  submitted: { label: 'Submitted', className: 'bg-positive/10 text-positive' },
};

const QUICK_ACTIONS = [
  { label: 'Open LMS', to: '/lms', icon: BookOpen },
  { label: 'View schedule', to: '/schedule', icon: CalendarDays },
  { label: 'Check grades', to: '/grades', icon: GraduationCap },
  { label: 'Submit assignment', to: '/assignments', icon: ClipboardList },
  { label: 'Request certificate', to: '/applications', icon: FileText },
  { label: 'Ask AI study companion', to: '/ai-assistant', icon: Sparkles },
];

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function StudentWorkspace() {
  const student = DEMO_STUDENT;
  const creditProgress = Math.round((student.creditsEarned / student.creditsRequired) * 100);

  return (
    <WorkspaceGuard allow="student">
      <PageTitle
        eyebrow={`${greeting()},`}
        title={student.name}
        description={`${student.programme} · Year ${student.year}`}
        meta={
          <>
            <span>{UNIVERSITY.academicYear} · {UNIVERSITY.semester}</span>
            <span className="h-1 w-1 rounded-full bg-mutedink/40" />
            <span>{student.faculty}</span>
            <span className="h-1 w-1 rounded-full bg-mutedink/40" />
            <span>{student.department}</span>
            <span className="h-1 w-1 rounded-full bg-mutedink/40" />
            <span>Group {student.group}</span>
          </>
        }
        actions={
          <Link
            to="/lms"
            className="inline-flex items-center gap-1.5 rounded-lg bg-navy px-3.5 py-2 text-[11.5px] font-medium text-white hover:bg-navy-mid"
          >
            <BookOpen className="h-3.5 w-3.5" /> Open learning platform
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {student.overview.map((item) => (
          <MetricCard key={item.key} label={item.label} value={item.value} hint={item.hint} tone={item.tone} />
        ))}
      </div>

      <div className="mt-2.5 grid gap-2.5 lg:grid-cols-[1.55fr_1fr]">
        <div className="space-y-2.5">
          <Surface
            title="Today's schedule"
            subtitle="Thursday, 7 November · 4 sessions"
            action={<span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-medium text-brand">In progress</span>}
            bodyClassName="p-0"
          >
            <ul className="divide-y divide-[#F3F5FA]">
              {student.schedule.map((session) => (
                <li
                  key={session.id}
                  className={cn(
                    'flex items-start gap-3 px-4 py-3',
                    session.state === 'now' && 'bg-[#F7F9FF]'
                  )}
                >
                  <div className="w-[74px] shrink-0">
                    <p className="text-[11px] font-medium text-ink">{session.time.split(' – ')[0]}</p>
                    <p className="text-[10px] text-mutedink">{session.time.split(' – ')[1]}</p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-medium text-ink">{session.course}</p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[10.5px] text-mutedink">
                      <span>{session.code}</span>
                      <span className="inline-flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" /> {session.room}</span>
                      <span>{session.professor}</span>
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
            title="Upcoming assignments"
            subtitle="3 open · 1 submitted"
            action={
              <Link to="/assignments" className="text-[11px] font-medium text-brand hover:underline">
                Open assignments
              </Link>
            }
            bodyClassName="p-0"
          >
            <ul className="divide-y divide-[#F3F5FA]">
              {student.assignments.map((assignment) => (
                <li key={assignment.id} className="flex items-start gap-3 px-4 py-3">
                  <span className={cn('mt-0.5 rounded-md px-1.5 py-0.5 text-[9px] font-medium uppercase', PRIORITY[assignment.priority])}>
                    {assignment.priority}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-medium text-ink">{assignment.title}</p>
                    <p className="mt-0.5 text-[10.5px] text-mutedink">
                      {assignment.course} · due {assignment.due}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className={cn('rounded-md px-1.5 py-0.5 text-[9.5px] font-medium', ASSIGNMENT_STATUS[assignment.status].className)}>
                      {ASSIGNMENT_STATUS[assignment.status].label}
                    </span>
                    <Link to="/assignments" aria-label={`Open ${assignment.title}`} className="text-mutedink hover:text-brand">
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </Surface>

          <Surface
            title="Recent grades"
            subtitle="Current term results released so far"
            action={
              <Link to="/grades" className="text-[11px] font-medium text-brand hover:underline">
                Full grade book
              </Link>
            }
            bodyClassName="p-0"
          >
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#F0F3F8] text-[10px] font-medium text-mutedink">
                  <th className="px-4 py-2 font-medium">Course</th>
                  <th className="hidden px-3 py-2 font-medium sm:table-cell">Code</th>
                  <th className="px-3 py-2 text-right font-medium">Credits</th>
                  <th className="px-4 py-2 text-right font-medium">Grade</th>
                </tr>
              </thead>
              <tbody>
                {student.grades.map((grade) => (
                  <tr key={grade.code} className="border-b border-[#F5F7FB] last:border-0">
                    <td className="px-4 py-2.5 text-[12px] text-ink">{grade.course}</td>
                    <td className="hidden px-3 py-2.5 text-[11px] text-mutedink sm:table-cell">{grade.code}</td>
                    <td className="px-3 py-2.5 text-right text-[11.5px] text-mutedink">{grade.credits}</td>
                    <td className="px-4 py-2.5 text-right">
                      <span className="font-medium text-ink">{grade.grade}</span>
                      <span className="ml-1 text-[10px] text-mutedink">{grade.points.toFixed(1)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Surface>
        </div>

        <div className="space-y-2.5">
          <Surface title="Academic performance" subtitle="GPA across the last five terms">
            <StudentGpaChart data={student.progress} />
            <div className="mt-2 space-y-3">
              <div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-mutedink">Credits completed</span>
                  <span className="font-medium text-ink">
                    {student.creditsEarned} / {student.creditsRequired}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#EDF1F8]">
                  <div className="h-full rounded-full bg-gradient-to-r from-brand to-violet" style={{ width: `${creditProgress}%` }} />
                </div>
                <p className="mt-1 text-[10px] text-mutedink">{creditProgress}% of the degree completed · on track</p>
              </div>
              <div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-mutedink">Attendance</span>
                  <span className="font-medium text-positive">{student.attendance}%</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#EDF1F8]">
                  <div className="h-full rounded-full bg-positive" style={{ width: `${student.attendance}%` }} />
                </div>
                <p className="mt-1 text-[10px] text-mutedink">Requirement is 85% per course</p>
              </div>
            </div>
          </Surface>

          <Surface
            title="Announcements"
            subtitle="University, faculty and course"
            action={
              <Link to="/announcements" className="text-[11px] font-medium text-brand hover:underline">
                All
              </Link>
            }
            bodyClassName="p-0"
          >
            <ul className="divide-y divide-[#F3F5FA]">
              {student.announcements.map((item) => (
                <li key={item.id} className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <Megaphone className="h-3 w-3 text-brand" />
                    <p className="text-[9.5px] font-medium text-brand">{item.scope}</p>
                    <span className="ml-auto text-[9.5px] text-mutedink">{item.date}</span>
                  </div>
                  <p className="mt-1 text-[12px] font-medium leading-snug text-ink">{item.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-mutedink">{item.body}</p>
                </li>
              ))}
            </ul>
          </Surface>

          <Surface title="Quick actions" bodyClassName="p-2.5">
            <div className="grid grid-cols-2 gap-1.5">
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.to}
                    to={action.to}
                    className="flex items-center gap-1.5 rounded-lg border border-[#EDF0F6] px-2 py-2 text-[11px] font-medium text-ink transition-colors hover:border-brand/30 hover:bg-[#F7F9FF]"
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0 text-brand" />
                    <span className="truncate">{action.label}</span>
                  </Link>
                );
              })}
            </div>
            <p className="mt-2 px-0.5 text-[10px] leading-relaxed text-mutedink">
              <Clock className="mr-1 inline h-3 w-3" />
              Modules marked “Soon” open a description of what is being built in Stage 2.
            </p>
          </Surface>
        </div>
      </div>
    </WorkspaceGuard>
  );
}