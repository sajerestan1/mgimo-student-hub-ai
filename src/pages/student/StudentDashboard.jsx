import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';
import { loadStudentPortal } from '@/lib/studentPortal';
import { useWorkspace } from '@/lib/workspaceRole';
import { useI18n } from '@/i18n/I18nProvider';
import WelcomeHeader from '@/components/student/dashboard/WelcomeHeader';
import SnapshotStrip from '@/components/student/dashboard/SnapshotStrip';
import TodaysClasses from '@/components/student/dashboard/TodaysClasses';
import PriorityTasks from '@/components/student/dashboard/PriorityTasks';
import RecentActivity from '@/components/student/dashboard/RecentActivity';
import AcademicBriefing from '@/components/student/dashboard/AcademicBriefing';
import AcademicPerformance from '@/components/student/dashboard/AcademicPerformance';

export default function StudentDashboard() {
  const { preview, workspace } = useWorkspace();
  const { t } = useI18n();
  const [context, setContext] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    loadStudentPortal()
      .then((data) => alive && setContext(data))
      .catch(() => alive && setError('Your academic record could not be loaded. Please refresh the page.'));
    return () => {
      alive = false;
    };
  }, []);

  if (error) {
    return <p className="card-surface px-5 py-6 text-[15px] text-critical">{error}</p>;
  }

  if (!context) {
    return (
      <div className="space-y-4">
        <div className="h-16 animate-pulse rounded-xl bg-white" />
        <div className="h-24 animate-pulse rounded-xl bg-white" />
        <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
          <div className="h-64 animate-pulse rounded-xl bg-white" />
          <div className="h-64 animate-pulse rounded-xl bg-white" />
        </div>
      </div>
    );
  }

  // A staff account may open this workspace to inspect it. It has no student
  // record of its own, so it must not be told its record "is not linked".
  if (!context.linked && preview) {
    return (
      <div className="card-surface px-5 py-10 text-center">
        <h1 className="text-[length:var(--type-section)] font-semibold tracking-[-0.02em] text-ink">
          {t('studentPreview.title')}
        </h1>
        <p className="mx-auto mt-2 max-w-md text-[15px] leading-relaxed text-mutedink">{t('studentPreview.body')}</p>
        <Link to={workspace.home} className="btn-quiet mt-4 inline-flex">
          {t('studentPreview.back')}
        </Link>
      </div>
    );
  }

  if (!context.linked) {
    return (
      <div className="card-surface px-5 py-10 text-center">
        <h1 className="text-[length:var(--type-section)] font-semibold tracking-[-0.02em] text-ink">
          Your student record is not linked yet
        </h1>
        <p className="mx-auto mt-2 max-w-md text-[15px] leading-relaxed text-mutedink">
          {context.scopeNote || 'The student office links your account to the academic register.'} Once it is linked,
          your courses, timetable and results appear here.
        </p>
        <Link to={P.student.profile} className="btn-quiet mt-4 inline-flex">
          View account details
        </Link>
      </div>
    );
  }

  return (
    <div>
      <WelcomeHeader profile={context.profile} />
      <SnapshotStrip summary={context.summary} />

      <div className="mt-4">
        <AcademicPerformance context={context} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <div className="space-y-4">
          <TodaysClasses sessions={context.sessions} />
          <PriorityTasks context={context} />
        </div>
        <div className="space-y-4">
          <AcademicBriefing context={context} />
          <RecentActivity context={context} />
        </div>
      </div>
    </div>
  );
}