import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { seedAdminData } from '@/lib/adminSeed';
import { buildAnalytics, iso } from '@/lib/adminMetrics';
import { STAFF_ROLES } from '@/lib/roles';

const AdminDataContext = createContext(null);

async function fetchAll(entity, sort = '-created_date') {
  const rows = [];
  let cursor = null;
  for (let page = 0; page < 8; page += 1) {
    const result = await entity.filter({}, { sort, limit: 500, ...(cursor ? { cursor } : {}) });
    if (Array.isArray(result)) return result;
    rows.push(...(result?.items || []));
    if (!result?.has_more) break;
    cursor = result.next_cursor;
  }
  return rows;
}

export function AdminDataProvider({ children }) {
  const [me, setMe] = useState(null);
  const [data, setData] = useState({
    faculties: [],
    departments: [],
    students: [],
    professors: [],
    courses: [],
    academicRecords: [],
    attendanceRecords: [],
    requests: [],
    requestEvents: [],
    announcements: [],
    events: [],
    tasks: [],
    settings: [],
    auditLogs: [],
    conversations: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await base44.auth.me();
      setMe(user);
      await seedAdminData(user);
      const [
        faculties,
        departments,
        students,
        professors,
        courses,
        academicRecords,
        attendanceRecords,
        requests,
        requestEvents,
        announcements,
        events,
        tasks,
        settings,
        auditLogs,
      ] = await Promise.all([
        fetchAll(base44.entities.Faculty, 'code'),
        fetchAll(base44.entities.Department, 'name'),
        fetchAll(base44.entities.Student, 'full_name'),
        fetchAll(base44.entities.Professor, 'full_name'),
        fetchAll(base44.entities.Course, 'code'),
        fetchAll(base44.entities.AcademicRecord, '-recorded_date'),
        fetchAll(base44.entities.AttendanceRecord, '-session_date'),
        fetchAll(base44.entities.AdminRequest, '-submitted_date'),
        fetchAll(base44.entities.RequestEvent, '-event_date'),
        fetchAll(base44.entities.Announcement, '-publish_date'),
        fetchAll(base44.entities.AcademicEvent, 'start_date'),
        fetchAll(base44.entities.AdministrativeTask, 'due_date'),
        fetchAll(base44.entities.AppSetting, 'key'),
        fetchAll(base44.entities.AuditLog, '-logged_at'),
      ]);
      setData({
        faculties,
        departments,
        students,
        professors,
        // only institutional course offerings carry a faculty; legacy rows are excluded
        courses: courses.filter((course) => course.faculty_id),
        academicRecords,
        attendanceRecords,
        requests,
        requestEvents,
        announcements,
        events,
        tasks,
        settings,
        auditLogs,
      });
    } catch (err) {
      setError(err?.message || 'Institutional records could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const role = me?.role === 'admin' ? 'dean' : me?.role || 'dean';
  const rawRole = me?.role || 'admin';

  const logAction = useCallback(
    async (action, target, details = '') => {
      const entry = {
        actor_name: me?.full_name || me?.email || 'Administrator',
        actor_role: rawRole,
        action,
        target,
        details,
        logged_at: new Date().toISOString(),
      };
      try {
        const created = await base44.entities.AuditLog.create(entry);
        setData((prev) => ({ ...prev, auditLogs: [created, ...prev.auditLogs] }));
      } catch (err) {
        /* audit logging must never block the administrative action */
      }
    },
    [me, rawRole]
  );

  const changeRequestStatus = useCallback(
    async (request, status, note) => {
      const entry = {
        request_id: request.id,
        type: 'status_change',
        status,
        note: note || `Status changed to ${status.replace(/_/g, ' ')}.`,
        actor_name: me?.full_name || 'Dean’s Office',
        actor_role: rawRole,
        event_date: iso(new Date()),
      };
      const [updated, event] = await Promise.all([
        base44.entities.AdminRequest.update(request.id, { status }),
        base44.entities.RequestEvent.create(entry),
      ]);
      setData((prev) => ({
        ...prev,
        requests: prev.requests.map((item) => (item.id === request.id ? { ...item, status } : item)),
        requestEvents: [event, ...prev.requestEvents],
      }));
      await logAction(`Request ${status.replace(/_/g, ' ')}`, request.subject, note || '');
      return updated;
    },
    [me, rawRole, logAction]
  );

  const addRequestComment = useCallback(
    async (request, note) => {
      const entry = {
        request_id: request.id,
        type: 'comment',
        status: request.status,
        note,
        actor_name: me?.full_name || 'Dean’s Office',
        actor_role: rawRole,
        event_date: iso(new Date()),
      };
      const created = await base44.entities.RequestEvent.create(entry);
      setData((prev) => ({ ...prev, requestEvents: [created, ...prev.requestEvents] }));
      return created;
    },
    [me, rawRole]
  );

  const assignRequest = useCallback(
    async (request, assignedTo) => {
      await base44.entities.AdminRequest.update(request.id, { assigned_to: assignedTo });
      setData((prev) => ({
        ...prev,
        requests: prev.requests.map((item) => (item.id === request.id ? { ...item, assigned_to: assignedTo } : item)),
      }));
      await logAction('Request assigned', request.subject, `Assigned to ${assignedTo}`);
    },
    [logAction]
  );

  const createRequest = useCallback(
    async (values) => {
      const created = await base44.entities.AdminRequest.create({
        ...values,
        status: 'submitted',
        submitted_date: iso(new Date()),
        is_demo: true,
      });
      const event = await base44.entities.RequestEvent.create({
        request_id: created.id,
        type: 'status_change',
        status: 'submitted',
        note: 'Submitted to the Dean’s Office.',
        actor_name: me?.full_name || 'Dean’s Office',
        actor_role: rawRole,
        event_date: iso(new Date()),
      });
      setData((prev) => ({
        ...prev,
        requests: [created, ...prev.requests],
        requestEvents: [event, ...prev.requestEvents],
      }));
      await logAction('Request created', created.subject);
      return created;
    },
    [me, rawRole, logAction]
  );

  const updateAttendance = useCallback(
    async (record, status) => {
      await base44.entities.AttendanceRecord.update(record.id, { status });
      setData((prev) => ({
        ...prev,
        attendanceRecords: prev.attendanceRecords.map((item) =>
          item.id === record.id ? { ...item, status } : item
        ),
      }));
      await logAction('Attendance corrected', `Session ${record.session_date}`, `${record.status} → ${status}`);
    },
    [logAction]
  );

  const saveFaculty = useCallback(
    async (values, id) => {
      const saved = id
        ? await base44.entities.Faculty.update(id, values)
        : await base44.entities.Faculty.create({ ...values, is_demo: true });
      setData((prev) => ({
        ...prev,
        faculties: id
          ? prev.faculties.map((item) => (item.id === id ? { ...item, ...values } : item))
          : [...prev.faculties, saved],
      }));
      await logAction(id ? 'Faculty updated' : 'Faculty created', values.name);
      return saved;
    },
    [logAction]
  );

  const saveDepartment = useCallback(
    async (values, id) => {
      const saved = id
        ? await base44.entities.Department.update(id, values)
        : await base44.entities.Department.create({ ...values, is_demo: true });
      setData((prev) => ({
        ...prev,
        departments: id
          ? prev.departments.map((item) => (item.id === id ? { ...item, ...values } : item))
          : [...prev.departments, saved],
      }));
      await logAction(id ? 'Department updated' : 'Department created', values.name);
      return saved;
    },
    [logAction]
  );

  const saveEvent = useCallback(
    async (values, id) => {
      const saved = id
        ? await base44.entities.AcademicEvent.update(id, values)
        : await base44.entities.AcademicEvent.create({ ...values, is_demo: true });
      setData((prev) => ({
        ...prev,
        events: id
          ? prev.events.map((item) => (item.id === id ? { ...item, ...values } : item))
          : [...prev.events, saved],
      }));
      await logAction(id ? 'Calendar event updated' : 'Calendar event created', values.title);
      return saved;
    },
    [logAction]
  );

  const deleteEvent = useCallback(
    async (id) => {
      await base44.entities.AcademicEvent.delete(id);
      setData((prev) => ({ ...prev, events: prev.events.filter((item) => item.id !== id) }));
      await logAction('Calendar event removed', 'Academic calendar');
    },
    [logAction]
  );

  const saveAnnouncement = useCallback(
    async (values, id) => {
      const saved = id
        ? await base44.entities.Announcement.update(id, values)
        : await base44.entities.Announcement.create({ ...values, is_demo: true });
      setData((prev) => ({
        ...prev,
        announcements: id
          ? prev.announcements.map((item) => (item.id === id ? { ...item, ...values } : item))
          : [...prev.announcements, saved],
      }));
      await logAction(id ? 'Announcement updated' : 'Announcement created', values.title);
      return saved;
    },
    [logAction]
  );

  const updateSetting = useCallback(
    async (setting, value) => {
      await base44.entities.AppSetting.update(setting.id, { value });
      setData((prev) => ({
        ...prev,
        settings: prev.settings.map((item) => (item.id === setting.id ? { ...item, value } : item)),
      }));
      await logAction('Threshold updated', setting.label || setting.key, `${setting.value} → ${value}`);
    },
    [logAction]
  );

  const updateTask = useCallback(
    async (task, status) => {
      await base44.entities.AdministrativeTask.update(task.id, { status });
      setData((prev) => ({
        ...prev,
        tasks: prev.tasks.map((item) => (item.id === task.id ? { ...item, status } : item)),
      }));
      await logAction('Task updated', task.title, `Status ${status}`);
    },
    [logAction]
  );

  const createStudentNote = useCallback(
    async (student, interventionStatus) => {
      await base44.entities.Student.update(student.id, { intervention_status: interventionStatus });
      setData((prev) => ({
        ...prev,
        students: prev.students.map((item) =>
          item.id === student.id ? { ...item, intervention_status: interventionStatus } : item
        ),
      }));
      await logAction('Intervention status updated', student.full_name, interventionStatus);
    },
    [logAction]
  );

  const analytics = useMemo(() => buildAnalytics(data), [data]);

  const value = useMemo(
    () => ({
      me,
      role,
      rawRole,
      isStaff: STAFF_ROLES.includes(rawRole),
      loading,
      error,
      ...data,
      analytics,
      reload: load,
      logAction,
      changeRequestStatus,
      createRequest,
      addRequestComment,
      assignRequest,
      updateAttendance,
      saveFaculty,
      saveDepartment,
      saveEvent,
      deleteEvent,
      saveAnnouncement,
      updateSetting,
      updateTask,
      createStudentNote,
    }),
    [
      me,
      role,
      rawRole,
      loading,
      error,
      data,
      analytics,
      load,
      logAction,
      changeRequestStatus,
      createRequest,
      addRequestComment,
      assignRequest,
      updateAttendance,
      saveFaculty,
      saveDepartment,
      saveEvent,
      deleteEvent,
      saveAnnouncement,
      updateSetting,
      updateTask,
      createStudentNote,
    ]
  );

  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>;
}

export function useAdminData() {
  const context = useContext(AdminDataContext);
  if (!context) throw new Error('useAdminData must be used inside AdminDataProvider');
  return context;
}