import { Link } from 'react-router-dom';
import { CalendarDays, Sparkles } from 'lucide-react';
import AiSummaryCard from '@/components/student/AiSummaryCard';
import SummaryCards from '@/components/student/SummaryCards';
import DeadlinesCard from '@/components/student/DeadlinesCard';
import TodayScheduleCard from '@/components/student/TodayScheduleCard';
import RecentGradesCard from '@/components/student/RecentGradesCard';
import ProgressCard from '@/components/student/ProgressCard';
import WellbeingCard from '@/components/student/WellbeingCard';
import ExamPrepCard from '@/components/student/ExamPrepCard';
import MentorsCard from '@/components/student/MentorsCard';
import AnnouncementsCard from '@/components/student/AnnouncementsCard';
import CourseAnnouncementsCard from '@/components/student/CourseAnnouncementsCard';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';
import { STUDENT } from '@/lib/studentWorkspace';
import { useAuth } from '@/lib/AuthContext';

export default function StudentDashboard() {
  const { user } = useAuth();
  const accountName = user?.full_name || user?.email?.split('@')[0] || STUDENT.fullName;
  const firstName = accountName.split(' ')[0];
  const initials = accountName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-royal/10 text-[13px] font-semibold text-royal">
            {initials}
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-[22px] font-semibold leading-tight tracking-[-0.03em] text-ink sm:text-[26px]">
              Welcome back, {firstName}!
            </h1>
            <p className="mt-0.5 text-[12px] text-mutedink">
              Here is your academic overview for {STUDENT.semester.toLowerCase()}.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md border border-line bg-white px-2 py-1 text-[10.5px] text-mutedink">
            {STUDENT.group} · Year {STUDENT.year}
          </span>
          <Link to={P.student.timetable} className="btn-quiet">
            <CalendarDays className="h-3.5 w-3.5" /> Timetable
          </Link>
          <Link to={P.student.ai} className="btn-primary">
            <Sparkles className="h-3.5 w-3.5" /> Study companion
          </Link>
        </div>
      </header>

      <AiSummaryCard />
      <SummaryCards />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <DeadlinesCard />
        <TodayScheduleCard />
        <RecentGradesCard />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ProgressCard />
        <WellbeingCard />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ExamPrepCard />
        <MentorsCard />
      </div>

      <CourseAnnouncementsCard />
      <AnnouncementsCard />
    </div>
  );
}