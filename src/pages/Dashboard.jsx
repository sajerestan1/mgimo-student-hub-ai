import { useStudentData } from '@/lib/StudentDataContext';
import { LoadingState, ErrorState } from '@/components/LoadingState';
import HeroOverview from '@/components/dashboard/HeroOverview';
import TodayClasses from '@/components/dashboard/TodayClasses';
import QuickActions from '@/components/dashboard/QuickActions';
import DeadlineList from '@/components/dashboard/DeadlineList';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import { weekdayNumber } from '@/lib/academic';

export default function Dashboard() {
  const {
    loading,
    error,
    reload,
    profile,
    schedule,
    notifications,
    average,
    activeApplications,
    unreadCount,
  } = useStudentData();

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const todayWeekday = weekdayNumber(new Date());
  const todayEntries = [...schedule]
    .filter((entry) => Number(entry.weekday) === todayWeekday)
    .sort((a, b) => String(a.start_time).localeCompare(String(b.start_time)));

  return (
    <div className="space-y-6 fade-up">
      <HeroOverview
        profile={profile}
        average={average}
        activeApplications={activeApplications}
        unreadCount={unreadCount}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <TodayClasses entries={todayEntries} />
        <QuickActions />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DeadlineList notifications={notifications} />
        <ActivityFeed notifications={notifications} />
      </div>
    </div>
  );
}