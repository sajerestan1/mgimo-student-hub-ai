import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageTitle from '@/components/shell/PageTitle';
import Surface from '@/components/shell/Surface';
import StatusChip from '@/components/shell/StatusChip';
import { base44 } from '@/api/base44Client';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';
import { useProfessorContext, dateLabel, pct } from '@/lib/professorData';

export default function ProfessorCoursesPage() {
  const { professor, courses } = useProfessorContext();
  const [selectedId, setSelectedId] = useState(new URLSearchParams(window.location.search).get('course'));
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    if (!selectedId && courses.length) setSelectedId(courses[0].id);
  }, [courses.length]);

  useEffect(() => {
    if (!selectedId) return;
    let alive = true;
    (async () => {
      const [enr, assignments, subs, sessions, att, materials] = await Promise.all([
        base44.entities.CourseEnrollment.filter({ course_id: selectedId }, { limit: 200 }),
        base44.entities.Assignment.filter({ course_id: selectedId }, { limit: 40 }),
        base44.entities.Submission.filter({ course_id: selectedId }, { limit: 200 }),
        base44.entities.ClassSession.filter({ course_id: selectedId }, { sort: '-session_date', limit: 40 }),
        base44.entities.AttendanceRecord.filter({ course_id: selectedId }, { limit: 300 }),
        base44.entities.CourseMaterial.count({ course_id: selectedId }),
      ]);
      const ids = (enr.items || []).map((e) => e.student_id);
      const students = ids.length
        ? (await base44.entities.Student.filter({ id: { $in: ids } }, { limit: 200 })).items || []
        : [];
      if (!alive) return;
      setDetail({
        students,
        assignments: assignments.items || [],
        submissions: subs.items || [],
        sessions: sessions.items || [],
        attendance: att.items || [],
        materials,
      });
    })();
    return () => {
      alive = false;
    };
  }, [selectedId]);

  const course = courses.find((c) => c.id === selectedId);

  const roster = (detail?.students || []).map((student) => {
    const subs = (detail.submissions || []).filter((s) => s.student_id === student.id);
    const graded = subs.filter((s) => typeof s.score === 'number');
    const avg = graded.length
      ? Math.round(graded.reduce((sum, s) => {
        const max = (detail.assignments || []).find((a) => a.id === s.assignment_id)?.max_score || 100;
        return sum + (s.score / max) * 100;
      }, 0) / graded.length)
      : null;
    const att = (detail.attendance || []).filter((r) => r.student_id === student.id);
    const present = att.filter((r) => r.status === 'present' || r.status === 'late').length;
    return { student, submitted: subs.length, avg, attendance: pct(present, att.length) };
  });

  return (
    <div>
      <PageTitle
        eyebrow="Professor workspace"
        title="My courses"
        description="Course rosters, timetable, materials and performance for the courses you teach."
        meta={[`${courses.length} assigned courses`, 'Fall Semester 2026']}
        actions={<Link to={P.professor.assignments} className="btn-quiet">Assignments</Link>}
      />

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.6fr]">
        <Surface title="Assigned courses" bodyClassName="px-0 pb-0 pt-1">
          <ul className="divide-y divide-line">
            {courses.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(c.id)}
                  className={`w-full px-5 py-3 text-left ${c.id === selectedId ? 'bg-brand-soft/60' : 'row-hover'}`}
                >
                  <p className="truncate text-[12px] font-medium text-ink">{c.code} · {c.title}</p>
                  <p className="mt-0.5 text-[10.5px] text-mutedink">{c.credits} credits · {c.semester}</p>
                </button>
              </li>
            ))}
            {!courses.length && <li className="px-5 py-6 text-[11.5px] text-mutedink">No courses are assigned to your profile.</li>}
          </ul>
        </Surface>

        {course && detail && (
          <div className="space-y-4">
            <Surface
              title={`${course.code} · ${course.title}`}
              subtitle={`${detail.students.length} enrolled · ${detail.assignments.length} assignments · ${detail.materials} materials`}
              action={<Link to={`${P.professor.grading}`} className="link-quiet">Grade</Link>}
            >
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ['Sessions', detail.sessions.length],
                  ['Attendance records', detail.attendance.length],
                  ['Submissions', detail.submissions.length],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg border border-line px-3 py-2">
                    <p className="text-[10.5px] text-mutedink">{label}</p>
                    <p className="mt-0.5 text-[16px] font-semibold text-ink">{value}</p>
                  </div>
                ))}
              </div>
            </Surface>

            <Surface title="Enrolled students" bodyClassName="px-0 pb-0 pt-1">
              <ul className="divide-y divide-line">
                {roster.map(({ student, submitted, avg, attendance }) => (
                  <li key={student.id} className="flex items-center justify-between gap-3 px-5 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-[12px] text-ink">{student.full_name}</p>
                      <p className="text-[10.5px] text-mutedink">{student.student_id} · Group {student.group_name} · {submitted} submitted</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <StatusChip tone={avg === null ? 'neutral' : avg >= 60 ? 'positive' : 'critical'}>
                        {avg === null ? 'No grade' : `${avg}%`}
                      </StatusChip>
                      <StatusChip tone={attendance >= 75 ? 'positive' : 'warning'}>{attendance}% att.</StatusChip>
                    </div>
                  </li>
                ))}
                {!roster.length && <li className="px-5 py-6 text-[11.5px] text-mutedink">No students are enrolled yet.</li>}
              </ul>
            </Surface>

            <Surface title="Course timetable" bodyClassName="px-0 pb-0 pt-1">
              <ul className="divide-y divide-line">
                {detail.sessions.slice(0, 10).map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-3 px-5 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-[12px] text-ink">{dateLabel(s.session_date)} · {s.start_time}–{s.end_time}</p>
                      <p className="text-[10.5px] text-mutedink">{s.room} · {s.topic}</p>
                    </div>
                    <Link to={`${P.professor.attendance}?session=${s.id}`} className="link-quiet">Attendance</Link>
                  </li>
                ))}
                {!detail.sessions.length && <li className="px-5 py-6 text-[11.5px] text-mutedink">No sessions scheduled.</li>}
              </ul>
            </Surface>
          </div>
        )}
      </div>
    </div>
  );
}