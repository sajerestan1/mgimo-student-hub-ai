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
import AttendancePanel from '@/components/student/dashboard/AttendancePanel';
import CommunicationsPanel from '@/components/student/dashboard/CommunicationsPanel';

export default function StudentDashboard() {
  const { preview, workspace } = useWorkspace();
  const { t } = useI18n();
  const [context, setContext] = useState(null);
  // A flag, not a message: the wording is resolved at render time so it follows
  // the interface language without refetching the record.
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    loadStudentPortal()
      .then((data) => alive && setContext(data))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, []);

  if (failed) {
    return (
      <p className="card-surface px-5 py-6 text-[15px] text-critical">{t('student.dashboard.error')}</p>
    );
  }

  if (!context) {
    return (
      <div className="space-y-3">
        <div className="h-16 animate-pulse rounded-xl bg-white" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((key) => (
            <div key={key} className="h-[86px] animate-pulse rounded-xl bg-white" />
          ))}
        </div>
        <div className="grid gap-3 xl:grid-cols-2">
          <div className="h-64 animate-pulse rounded-xl bg-white" />
          <div className="h-64 animate-pulse rounded-xl bg-white" />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {[0, 1, 2, 3].map((key) => (
            <div key={key} className="h-44 animate-pulse rounded-xl bg-white" />
          ))}
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
          {t('student.dashboard.unlinked.title')}
        </h1>
        <p className="mx-auto mt-2 max-w-md text-[15px] leading-relaxed text-mutedink">
          {t('student.dashboard.unlinked.body')}
        </p>
        {context.scopeNote && (
          <p className="mx-auto mt-1.5 max-w-md text-[13px] leading-relaxed text-mutedink/80">{context.scopeNote}</p>
        )}
        <Link to={P.student.profile} className="btn-quiet mt-4 inline-flex">
          {t('student.common.viewAccount')}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-3">
      <WelcomeHeader profile={context.profile} context={context} />

      <SnapshotStrip summary={context.summary} />

      <AcademicBriefing context={context} />

      {/* Analytics sit side by side only once each panel keeps a readable chart width.
          Each grid cell is min-w-0 so a long course code or message can never widen
          the track past the viewport. */}
      <div className="grid gap-3 xl:grid-cols-2">
        <div className="min-w-0">
          <AcademicPerformance context={context} />
        </div>
        <div className="min-w-0">
          <AttendancePanel context={context} />
        </div>
      </div>

      {/* Balanced two-column lower dashboard; equal heights come from h-full panels. */}
      <div className="grid gap-3 md:grid-cols-2">
        <div className="min-w-0">
          <CommunicationsPanel />
        </div>
        <div className="min-w-0">
          <PriorityTasks context={context} />
        </div>
        <div className="min-w-0">
          <TodaysClasses sessions={context.sessions} />
        </div>
        <div className="min-w-0">
          <RecentActivity context={context} />
        </div>
      </div>
    </div>
  );
}