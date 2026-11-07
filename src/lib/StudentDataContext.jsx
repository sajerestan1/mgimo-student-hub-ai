import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { seedStudentData } from '@/lib/demoData';
import { toISODate, isActiveStatus } from '@/lib/academic';

const StudentDataContext = createContext(null);

function items(result) {
  if (Array.isArray(result)) return result;
  return result?.items || [];
}

export function StudentDataProvider({ children }) {
  const [userId, setUserId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [grades, setGrades] = useState([]);
  const [applications, setApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const me = await base44.auth.me();
      setUserId(me.id);
      await seedStudentData(me);
      const [profiles, courseRes, scheduleRes, gradeRes, applicationRes, notificationRes] =
        await Promise.all([
          base44.entities.StudentProfile.filter({ user_id: me.id }),
          base44.entities.Course.filter({ user_id: me.id }, { sort: 'code', limit: 100 }),
          base44.entities.ScheduleEntry.filter({ user_id: me.id }, { sort: 'start_time', limit: 200 }),
          base44.entities.Grade.filter({ user_id: me.id }, { sort: '-date', limit: 200 }),
          base44.entities.Application.filter({ user_id: me.id }, { sort: '-created_date', limit: 100 }),
          base44.entities.Notification.filter({ user_id: me.id }, { sort: '-created_date', limit: 100 }),
        ]);
      setProfile(items(profiles)[0] || null);
      setCourses(items(courseRes));
      setSchedule(items(scheduleRes));
      setGrades(items(gradeRes));
      setApplications(items(applicationRes));
      setNotifications(items(notificationRes));
    } catch (err) {
      setError(err?.message || 'Your academic record could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const refreshApplications = useCallback(async () => {
    if (!userId) return;
    const res = await base44.entities.Application.filter(
      { user_id: userId },
      { sort: '-created_date', limit: 100 }
    );
    setApplications(items(res));
  }, [userId]);

  const createApplication = useCallback(
    async ({ certificate_type, purpose, needed_by, status }) => {
      if (!userId) return null;
      const today = toISODate(new Date());
      const record = await base44.entities.Application.create({
        user_id: userId,
        certificate_type,
        title: `${certificate_type} request`,
        purpose: purpose || '',
        needed_by: needed_by || '',
        status,
        submitted_date: status === 'draft' ? '' : today,
        history: [
          {
            status,
            date: today,
            note: status === 'draft' ? 'Saved as a draft' : 'Submitted to the Dean’s Office',
          },
        ],
      });
      await refreshApplications();
      return record;
    },
    [userId, refreshApplications]
  );

  const updateApplication = useCallback(
    async (id, patch) => {
      await base44.entities.Application.update(id, patch);
      await refreshApplications();
    },
    [refreshApplications]
  );

  const setNotificationRead = useCallback(async (id, isRead) => {
    setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, is_read: isRead } : item)));
    await base44.entities.Notification.update(id, { is_read: isRead });
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    if (!userId) return;
    setNotifications((prev) => prev.map((item) => ({ ...item, is_read: true })));
    await base44.entities.Notification.updateMany(
      { user_id: userId, is_read: false },
      { $set: { is_read: true } }
    );
  }, [userId]);

  const saveProfile = useCallback(
    async (patch) => {
      if (!profile) return null;
      const updated = await base44.entities.StudentProfile.update(profile.id, patch);
      setProfile((prev) => ({ ...prev, ...patch }));
      return updated;
    },
    [profile]
  );

  const value = useMemo(() => {
    const unreadCount = notifications.filter((item) => !item.is_read).length;
    const average = grades.length
      ? grades.reduce((sum, grade) => sum + (Number(grade.grade_points) || 0), 0) / grades.length
      : null;
    const activeApplications = applications.filter((application) =>
      isActiveStatus(application.status)
    ).length;
    const credits = grades.reduce((sum, grade) => sum + (Number(grade.credits) || 0), 0);

    return {
      userId,
      profile,
      courses,
      schedule,
      grades,
      applications,
      notifications,
      loading,
      error,
      average,
      credits,
      unreadCount,
      activeApplications,
      reload: load,
      refreshApplications,
      createApplication,
      updateApplication,
      setNotificationRead,
      markAllNotificationsRead,
      saveProfile,
    };
  }, [
    userId,
    profile,
    courses,
    schedule,
    grades,
    applications,
    notifications,
    loading,
    error,
    load,
    refreshApplications,
    createApplication,
    updateApplication,
    setNotificationRead,
    markAllNotificationsRead,
    saveProfile,
  ]);

  return <StudentDataContext.Provider value={value}>{children}</StudentDataContext.Provider>;
}

export function useStudentData() {
  const context = useContext(StudentDataContext);
  if (!context) {
    throw new Error('useStudentData must be used inside StudentDataProvider');
  }
  return context;
}