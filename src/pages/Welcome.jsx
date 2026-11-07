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
import ProgressBar from '@/components/shell/ProgressBar';
import { useAuth } from '@/lib/AuthContext';
import { METRICS, FACULTIES, UNIVERSITY } from '@/lib/demoUniversity';

const WORKSPACES = [
  {
    role: 'Student',
    to: '/student',
    icon: Users,
    title: 'Student workspace',
    summary: 'A personal academic workspace: today’s timetable, deadlines, credits and results in one calm view.',
    points: ['Today’s schedule and upcoming deadlines', 'Academic progress and credit tracking', 'Requests and AI study companion'],
  },
  {
    role: 'Professor',
    to: '/professor',
    icon: Presentation,
    title: 'Professor workspace',
    summary: 'Teaching at a glance: courses, cohorts, grading queues and the assessments coming up.',
    points: ['Courses, cohorts and progress', 'Grading queue and student activity', 'Attendance review and assessment planning'],
  },
  {
    role: 'Dean',
    to: '/dean',
    icon: LayoutDashboard,
    title: 'Dean’s command center',
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
  const primaryLabel = user ? 'Open my dashboard' : 'Sign in to the platform';

  return (
    <div className="min-h-dvh bg-white">
      <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-5 sm:px-8">
          <BrandMark className="h-7 w-7" />
          <div className="min-w-0">
            <p className="truncate text-[12.5px] font-semibold tracking-[-0.01em] text-ink">Academic Intelligence</p>
            <p className="hidden text-[10px] text-mutedink sm:block">{UNIVERSITY.name}</p>
          </div>
          <nav className="ml-auto hidden items-center gap-6 text-[12px] text-mutedink md:flex">
            <a href="#workspaces" className="transition-colors hover:text-ink">Workspaces</a>
            <a href="#platform" className="transition-colors hover:text-ink">Platform</a>
            <a href="#roadmap" className="transition-colors hover:text-ink">Roadmap</a>
          </nav>
          <Link
            to={destination}
            className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-navy px-3.5 py-2 text-[12px] font-medium text-white transition-colors hover:bg-navy-mid md:ml-6"
          >
            {user ? 'Dashboard' : 'Sign in'} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      <section className="border-b border-line">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-2.5 py-1 text-[10.5px] font-medium text-mutedink">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" /> MGIMO AI Challenge 2026 · Stage 1 prototype
            </span>
            <h1 className="mt-5 text-[32px] font-semibold leading-[1.08] tracking-[-0.035em] text-ink sm:text-[46px]">
              One intelligence layer for the whole university.
            </h1>
            <p className="mt-5 max-w-xl text-[14px] leading-relaxed text-mutedink">
              Academic Intelligence connects students, professors and the dean’s office around a single academic record — so
              teaching, studying and institutional oversight stop being separate systems.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-2.5">
              <Link
                to={destination}
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2.5 text-[12.5px] font-medium text-white transition-colors hover:bg-brand-deep"
              >
                {primaryLabel} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <a
                href="#workspaces"
                className="inline-flex items-center gap-1.5 rounded-lg border border-line px-4 py-2.5 text-[12.5px] font-medium text-ink transition-colors hover:bg-canvas"
              >
                Explore the workspaces
              </a>
            </div>
            <p className="mt-6 flex max-w-xl items-start gap-2 text-[11px] leading-relaxed text-mutedink">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-mutedink/70" />
              {UNIVERSITY.disclaimer} Every person and record shown is fictional.
            </p>
          </div>

          <div className="card-surface overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
              <p className="text-[12.5px] font-semibold text-ink">Institutional overview</p>
              <span className="rounded-md bg-canvas px-2 py-0.5 text-[10.5px] text-mutedink">Demonstration</span>
            </div>
            <div className="grid grid-cols-3 gap-px bg-line">
              {[
                ['Students', METRICS.students.toLocaleString()],
                ['Average GPA', METRICS.averageGpa.toFixed(2)],
                ['Attendance', `${METRICS.attendance}%`],
              ].map(([label, value]) => (
                <div key={label} className="bg-white px-4 py-3.5">
                  <p className="text-[10.5px] text-mutedink">{label}</p>
                  <p className="mt-1 text-[19px] font-semibold leading-none tracking-[-0.02em] tabular-nums text-ink">{value}</p>
                </div>
              ))}
            </div>
            <div className="space-y-3.5 px-5 py-4">
              {FACULTIES.map((faculty) => (
                <div key={faculty.id}>
                  <div className="flex items-baseline justify-between text-[11.5px]">
                    <span className="truncate font-medium text-ink">{faculty.name}</span>
                    <span className="ml-2 shrink-0 tabular-nums text-mutedink">
                      {faculty.gpa.toFixed(2)} GPA · {faculty.attendance}%
                    </span>
                  </div>
                  <ProgressBar
                    value={faculty.attendance}
                    tone={faculty.attendance >= 90 ? 'positive' : 'warning'}
                    className="mt-1.5 h-1"
                  />
                </div>
              ))}
            </div>
            <Link
              to={destination}
              className="flex items-center justify-between border-t border-line px-5 py-3 text-[11.5px] font-medium text-brand transition-colors hover:bg-canvas"
            >
              Explore the command center <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <section id="workspaces" className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
        <p className="eyebrow text-brand">Three experiences, one platform</p>
        <h2 className="mt-2 max-w-2xl text-[24px] font-semibold tracking-[-0.025em] text-ink sm:text-[30px]">
          Built around how each role actually works
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {WORKSPACES.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="card-surface flex flex-col p-5">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-brand" strokeWidth={1.8} />
                  <p className="eyebrow">{item.role}</p>
                </div>
                <h3 className="mt-3 text-[15px] font-semibold tracking-[-0.01em] text-ink">{item.title}</h3>
                <p className="mt-1.5 text-[12px] leading-relaxed text-mutedink">{item.summary}</p>
                <ul className="mt-3.5 space-y-1.5 border-t border-line pt-3.5">
                  {item.points.map((point) => (
                    <li key={point} className="flex items-start gap-1.5 text-[11.5px] leading-relaxed text-ink/70">
                      <Check className="mt-0.5 h-3 w-3 shrink-0 text-positive" strokeWidth={2.4} /> {point}
                    </li>
                  ))}
                </ul>
                <Link to={destination} className="link-quiet mt-4">
                  {user ? 'Open workspace' : 'Sign in to preview'} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      <section id="platform" className="border-y border-line bg-canvas">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-14">
          <div className="grid gap-8 md:grid-cols-3 md:gap-10">
            {PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div key={pillar.title}>
                  <Icon className="h-4 w-4 text-navy" strokeWidth={1.8} />
                  <h3 className="mt-2.5 text-[13.5px] font-semibold text-ink">{pillar.title}</h3>
                  <p className="mt-1 text-[12px] leading-relaxed text-mutedink">{pillar.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="roadmap" className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
        <h2 className="text-[24px] font-semibold tracking-[-0.025em] text-ink sm:text-[30px]">Development roadmap</h2>
        <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-mutedink">
          Stage 1 establishes the interface, navigation and role-aware structure. Modules that are not built yet are marked
          clearly rather than simulated.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="card-surface p-5">
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-semibold text-ink">Stage 1 · Live in this prototype</p>
              <span className="chip bg-[#E9F5EF] text-[#1D7A50]">Available</span>
            </div>
            <ul className="mt-4 space-y-2">
              {STAGE_ONE.map((item) => (
                <li key={item} className="flex items-start gap-2 text-[12px] leading-relaxed text-ink/80">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-positive" strokeWidth={2.2} /> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="card-surface p-5">
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-semibold text-ink">Stage 2 · Next</p>
              <span className="chip bg-[#FCF3E4] text-[#8E6018]">In design</span>
            </div>
            <ul className="mt-4 space-y-2">
              {STAGE_TWO.map((item) => (
                <li key={item} className="flex items-start gap-2 text-[12px] leading-relaxed text-mutedink">
                  <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[#B9C2D2]" /> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <footer className="border-t border-line px-5 py-8 sm:px-8">
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