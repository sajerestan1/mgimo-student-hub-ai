import { useEffect, useState } from 'react';
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
import { useAuth } from '@/lib/AuthContext';
import { loadStudentAcademics } from '@/lib/academicRecords';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    let alive = true;
    loadStudentAcademics(user.id).then((result) => {
      if (alive) setData(result);
    });
    return () => { alive = false; };
  }, [user?.id]);

  const accountName = user?.full_name || user?.email?.split('@')[0] || 'Student';
  const firstName = accountName.split(' ')[0];
  const initials = accountName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  if (!data) {
    return <div className="card-surface p-6 text-[12.5px] text-mutedink">Loading your academic overview…</div>;
  }

  const { student, courses, summary } = data;

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
              Here is your academic overview for {student?.program || 'this semester'}.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {student && (
            <span className="rounded-md border border-line bg-white px-2 py-1 text-[10.5px] text-mutedink">
              {student.group_name || 'No group'} · Year {student.year || '—'}
            </span>
          )}
          <Link to={P.student.timetable} className="btn-quiet">
            <CalendarDays className="h-3.5 w-3.5" /> Timetable
          </Link>
          <Link to={P.student.ai} className="btn-primary">
            <Sparkles className="h-3.5 w-3.5" /> Study companion
          </Link>
        </div>
      </header>

      <AiSummaryCard summary={summary} />
      <SummaryCards summary={summary} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <DeadlinesCard items={summary.openAssignments} />
        <TodayScheduleCard />
        <RecentGradesCard grades={summary.recentGrades} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ProgressCard courses={courses} summary={summary} />
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