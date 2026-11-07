import { useEffect, useState } from 'react';
import PageTitle from '@/components/shell/PageTitle';
import Surface from '@/components/shell/Surface';
import StatusChip from '@/components/shell/StatusChip';
import { base44 } from '@/api/base44Client';
import { useProfessorContext, dateLabel, dayDiff } from '@/lib/professorData';

const OPTIONS = ['present', 'late', 'absent', 'excused'];
const TONE = { present: 'positive', late: 'warning', absent: 'critical', excused: 'brand' };

export default function ProfessorAttendancePage() {
  const { professor } = useProfessorContext();
  const [sessions, setSessions] = useState(null);
  const [selectedId, setSelectedId] = useState(new URLSearchParams(window.location.search).get('session'));
  const [roster, setRoster] = useState([]);
  const [marks, setMarks] = useState({});
  const [existing, setExisting] = useState([]);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState('');

  const loadSessions = async () => {
    if (!professor) return;
    const page = await base44.entities.ClassSession.filter(
      { professor_id: professor.id },
      { sort: '-session_date', limit: 80 }
    );
    const list = page.items || [];
    setSessions(list);
    if (!selectedId && list.length) setSelectedId(list[0].id);
  };

  useEffect(() => {
    loadSessions();
  }, [professor?.id]);

  const session = (sessions || []).find((s) => s.id === selectedId);

  useEffect(() => {
    if (!session) return;
    let alive = true;
    (async () => {
      const [enrolments, records] = await Promise.all([
        base44.entities.CourseEnrollment.filter({ course_id: session.course_id }, { limit: 200 }),
        base44.entities.AttendanceRecord.filter({ course_id: session.course_id, session_date: session.session_date }, { limit: 200 }),
      ]);
      const ids = (enrolments.items || []).map((e) => e.student_id);
      const students = ids.length
        ? (await base44.entities.Student.filter({ id: { $in: ids } }, { limit: 200 })).items || []
        : [];
      if (!alive) return;
      const prior = records.items || [];
      setRoster(students);
      setExisting(prior);
      setMarks(Object.fromEntries(students.map((s) => [s.id, prior.find((r) => r.student_id === s.id)?.status || 'present'])));
      setSaved('');
    })();
    return () => {
      alive = false;
    };
  }, [session?.id]);

  const save = async () => {
    if (!session || !roster.length) return;
    setBusy(true);
    try {
      const updates = [];
      const creates = [];
      roster.forEach((student) => {
        const status = marks[student.id] || 'present';
        const record = existing.find((r) => r.student_id === student.id);
        if (record) {
          if (record.status !== status) updates.push({ id: record.id, status });
        } else {
          creates.push({
            student_id: student.id,
            course_id: session.course_id,
            faculty_id: student.faculty_id,
            department_id: student.department_id,
            session_date: session.session_date,
            status,
            recorded_by: professor.full_name,
            is_demo: true,
          });
        }
      });
      if (updates.length) await base44.entities.AttendanceRecord.bulkUpdate(updates);
      if (creates.length) await base44.entities.AttendanceRecord.bulkCreate(creates);
      if (!session.attendance_taken) await base44.entities.ClassSession.update(session.id, { attendance_taken: true });
      await loadSessions();
      setSaved(`Attendance saved for ${roster.length} students.`);
    } finally {
      setBusy(false);
    }
  };

  if (!sessions) return <p className="py-10 text-center text-[12px] text-mutedink">Loading your class sessions…</p>;

  return (
    <div>
      <PageTitle
        eyebrow="Professor workspace"
        title="Attendance management"
        description="Pick a class session, mark the roster and save. Saved attendance appears in each student's attendance history immediately."
        meta={[`${sessions.filter((s) => !s.attendance_taken && dayDiff(s.session_date) <= 0).length} sessions outstanding`, `${sessions.length} sessions on record`]}
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_1.5fr]">
        <Surface title="Class sessions" bodyClassName="px-0 pb-0 pt-1" subtitle="Most recent first">
          <ul className="max-h-[520px] divide-y divide-line overflow-y-auto scroll-thin">
            {sessions.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(s.id)}
                  className={`flex w-full items-start justify-between gap-2 px-5 py-3 text-left transition-colors ${s.id === selectedId ? 'bg-brand-soft/60' : 'row-hover'}`}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-[12px] font-medium text-ink">{s.course_code}</span>
                    <span className="mt-0.5 block text-[10.5px] text-mutedink">
                      {dateLabel(s.session_date)} · {s.start_time}–{s.end_time} · {s.room}
                    </span>
                  </span>
                  <StatusChip tone={s.attendance_taken ? 'positive' : dayDiff(s.session_date) < 0 ? 'warning' : 'neutral'}>
                    {s.attendance_taken ? 'Recorded' : 'Open'}
                  </StatusChip>
                </button>
              </li>
            ))}
          </ul>
        </Surface>

        <Surface
          title={session ? `${session.course_code} · ${dateLabel(session.session_date)}` : 'Select a session'}
          subtitle={session ? `${session.start_time}–${session.end_time} · ${session.room} · Group ${session.group_name}` : 'Choose a class from the list'}
          action={session ? <span className="text-[10.5px] text-mutedink">{roster.length} enrolled</span> : null}
        >
          {!session && <p className="text-[11.5px] text-mutedink">Select a session to mark attendance.</p>}
          {session && (
            <div className="space-y-3">
              <ul className="divide-y divide-line rounded-lg border border-line">
                {roster.map((student) => (
                  <li key={student.id} className="flex flex-col gap-2 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate text-[12px] font-medium text-ink">{student.full_name}</p>
                      <p className="text-[10.5px] text-mutedink">{student.student_id} · Group {student.group_name}</p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {OPTIONS.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setMarks((prev) => ({ ...prev, [student.id]: option }))}
                          className={`rounded-md px-2 py-1 text-[10.5px] font-medium capitalize transition-colors ${
                            (marks[student.id] || 'present') === option
                              ? 'bg-navy text-white'
                              : 'border border-line bg-white text-mutedink hover:bg-canvas'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
              {!roster.length && <p className="text-[11.5px] text-mutedink">No students are enrolled in this course.</p>}
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={save} disabled={busy || !roster.length} className="btn-primary disabled:opacity-60">
                  {busy ? 'Saving…' : 'Save attendance'}
                </button>
                <StatusChip tone={TONE[marks[roster[0]?.id] || 'present']}>
                  {Object.values(marks).filter((v) => v === 'absent').length} absent
                </StatusChip>
                {saved && <span className="text-[11px] text-positive">{saved}</span>}
              </div>
            </div>
          )}
        </Surface>
      </div>
    </div>
  );
}