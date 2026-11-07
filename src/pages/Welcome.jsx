import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  Users,
  Presentation,
  LayoutDashboard,
  BookOpen,
  Database,
  Sparkles,
  Check,
} from 'lucide-react';
import BrandMark from '@/components/shell/BrandMark';
import { useAuth } from '@/lib/AuthContext';
import { METRICS, FACULTIES, UNIVERSITY } from '@/lib/demoUniversity';

const WORKSPACES = [
  {
    role: 'Student',
    to: '/student',
    icon: Users,
    title: 'Student Workspace',
    summary: 'Everything academic in one calm place: timetable, assignments, grades, credits and announcements.',
    points: ['Today’s schedule and deadlines', 'Academic progress and credits', 'Requests and AI study companion'],
  },
  {
    role: 'Professor',
    to: '/professor',
    icon: Presentation,
    title: 'Professor Workspace',
    summary: 'Teaching at a glance: courses, cohorts, grading queues and the assessments coming up.',
    points: ['Courses and student counts', 'Grading queue and submissions', 'Attendance and assessment planning'],
  },
  {
    role: 'Dean',
    to: '/dean',
    icon: LayoutDashboard,
    title: 'Dean’s Command Center',
    summary: 'Institutional oversight: performance, attendance and risk across every faculty in one view.',
    points: ['Institutional metrics and trends', 'Faculty comparison and alerts', 'Academic risk radar preview'],
  },
];

const PILLARS = [
  { icon: BookOpen, title: 'Learning platform', text: 'Courses, materials, assignments and grading connected to the academic record.' },
  { icon: Database, title: 'Academic data core', text: 'One authoritative structure for faculties, departments, people and results.' },
  { icon: Sparkles, title: 'Intelligence layer', text: 'Analysis and assistance across the data each role is authorised to see.' },
];

const STAGE_ONE = [
  'Application shell with role-aware navigation',
  'Student, professor and dean dashboards',
  'Authentication and role-based routing',
  'Responsive layout from 360px upward',
];

const STAGE_TWO = [
  'Course catalogue and learning platform',
  'Assignments, submissions and grading',
  'Institutional analytics and reporting',
  'AI assistant over authorised records',
];

export default function Welcome() {
  const { user } = useAuth();
  const destination = user ? '/dashboard' : '/login';

  return (
    <div className="min-h-dvh bg-white">
      <header className="sticky top-0 z-30 border-b border-[#EDF0F6] bg-white/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <BrandMark className="h-8 w-8" />
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold tracking-tight text-ink">Academic Intelligence</p>
            <p className="hidden text-[10px] text-mutedink sm:block">{UNIVERSITY.name}</p>
          </div>
          <nav className="ml-auto hidden items-center gap-5 text-[12px] text-mutedink md:flex">
            <a href="#workspaces" className="hover:text-ink">Workspaces</a>
            <a href="#platform" className="hover:text-ink">Platform</a>
            <a href="#roadmap" className="hover:text-ink">Roadmap</a>
          </nav>
          <Link
            to={destination}
            className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-navy px-3 py-2 text-[12px] font-medium text-white transition-colors hover:bg-navy-mid md:ml-5"
          >
            {user ? 'Open dashboard' : 'Sign in'} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-[#EDF0F6]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(79,117,255,0.13),transparent_70%)]" />
        <div className="relative mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-12">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E4E9F4] bg-white px-2.5 py-1 text-[10.5px] font-medium text-mutedink">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" /> MGIMO AI Challenge 2026 · Stage 1 prototype
            </span>
            <h1 className="mt-4 text-[30px] font-semibold leading-[1.12] tracking-[-0.03em] text-ink sm:text-[42px]">
              One intelligence layer for the whole university.
            </h1>
            <p className="mt-4 max-w-xl text-[13.5px] leading-relaxed text-mutedink sm:text-[14px]">
              Academic Intelligence connects students, professors and the dean’s office around a single academic record — so
              teaching, studying and institutional oversight stop being separate systems.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              <Link
                to={destination}
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2.5 text-[12.5px] font-medium text-white shadow-sm transition-colors hover:bg-brand/90"
              >
                {user ? 'Open my dashboard' : 'Sign in to the platform'} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <a
                href="#workspaces"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#E1E7F2] px-4 py-2.5 text-[12.5px] font-medium text-ink transition-colors hover:bg-[#F6F8FC]"
              >
                Explore the workspaces
              </a>
            </div>
            <p className="mt-5 flex max-w-xl items-start gap-2 text-[11px] leading-relaxed text-mutedink">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-mutedink/70" />
              {UNIVERSITY.disclaimer} Every person and record shown is fictional.
            </p>
          </div>

          <div className="relative">
            <div className="rounded-2xl border border-[#E6EAF2] bg-white p-4 shadow-[0_30px_60px_-45px_rgba(20,33,61,0.55)]">
              <div className="flex items-center justify-between">
                <p className="text-[11.5px] font-medium text-ink">Institutional overview</p>
                <span className="rounded-full bg-[#F1F4FA] px-2 py-0.5 text-[9.5px] text-mutedink">Demonstration</span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {[
                  ['Students', METRICS.students.toLocaleString()],
                  ['Average GPA', METRICS.averageGpa.toFixed(2)],
                  ['Attendance', `${METRICS.attendance}%`],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-[#F6F8FC] px-2.5 py-2">
                    <p className="text-[9.5px] text-mutedink">{label}</p>
                    <p className="mt-0.5 text-[15px] font-semibold text-ink">{value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 space-y-2">
                {FACULTIES.map((faculty) => (
                  <div key={faculty.id} className="rounded-xl border border-[#EEF1F7] px-2.5 py-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="truncate font-medium text-ink">{faculty.name}</span>
                      <span className="ml-2 shrink-0 text-mutedink">{faculty.gpa.toFixed(2)} GPA</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#EDF1F8]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand to-violet"
                        style={{ width: `${(faculty.attendance / 100) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="workspaces" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="text-[11px] font-medium text-brand">Three experiences, one platform</p>
        <h2 className="mt-1 text-[22px] font-semibold tracking-[-0.02em] text-ink sm:text-[26px]">
          Built around how each role actually works
        </h2>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {WORKSPACES.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="card-surface flex flex-col p-5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
                </span>
                <p className="mt-3 text-[10px] font-medium uppercase tracking-[0.1em] text-mutedink">{item.role}</p>
                <h3 className="mt-0.5 text-[15px] font-semibold tracking-tight text-ink">{item.title}</h3>
                <p className="mt-1.5 text-[12px] leading-relaxed text-mutedink">{item.summary}</p>
                <ul className="mt-3 space-y-1.5">
                  {item.points.map((point) => (
                    <li key={point} className="flex items-start gap-1.5 text-[11.5px] text-ink/75">
                      <Check className="mt-0.5 h-3 w-3 shrink-0 text-positive" /> {point}
                    </li>
                  ))}
                </ul>
                <Link
                  to={destination}
                  className="mt-4 inline-flex items-center gap-1 text-[11.5px] font-medium text-brand hover:underline"
                >
                  {user ? 'Open workspace' : 'Sign in to preview'} <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      <section id="platform" className="border-y border-[#EDF0F6] bg-[#FAFBFE]">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14">
          <div className="grid gap-3 md:grid-cols-3">
            {PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div key={pillar.title} className="rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(20,33,61,0.04)]">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F1F4FA] text-navy">
                    <Icon className="h-4 w-4" />
                  </span>
                  <h3 className="mt-3 text-[13.5px] font-semibold text-ink">{pillar.title}</h3>
                  <p className="mt-1 text-[12px] leading-relaxed text-mutedink">{pillar.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="roadmap" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-ink sm:text-[26px]">Development roadmap</h2>
        <p className="mt-1 max-w-2xl text-[12.5px] leading-relaxed text-mutedink">
          Stage 1 establishes the interface, navigation and role-aware structure. Modules that are not built yet are marked
          clearly rather than simulated.
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <div className="card-surface p-5">
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-semibold text-ink">Stage 1 · Live in this prototype</p>
              <span className="rounded-full bg-positive/10 px-2 py-0.5 text-[10px] font-medium text-positive">Available</span>
            </div>
            <ul className="mt-3 space-y-2">
              {STAGE_ONE.map((item) => (
                <li key={item} className="flex items-start gap-2 text-[12px] text-ink/80">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-positive" /> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="card-surface p-5">
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-semibold text-ink">Stage 2 · Next</p>
              <span className="rounded-full bg-warning/10 px-2 py-0.5 text-[10px] font-medium text-warning">In design</span>
            </div>
            <ul className="mt-3 space-y-2">
              {STAGE_TWO.map((item) => (
                <li key={item} className="flex items-start gap-2 text-[12px] text-mutedink">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-mutedink/50" /> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#EDF0F6] px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <BrandMark className="h-6 w-6" />
            <p className="text-[11.5px] font-medium text-ink">Academic Intelligence</p>
          </div>
          <p className="max-w-2xl text-[10.5px] leading-relaxed text-mutedink">{UNIVERSITY.disclaimer}</p>
        </div>
      </footer>
    </div>
  );
}