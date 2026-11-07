import { useEffect, useMemo, useState } from 'react';
import PageTitle from '@/components/shell/PageTitle';
import Surface from '@/components/shell/Surface';
import StatusChip from '@/components/shell/StatusChip';
import { base44 } from '@/api/base44Client';
import { useProfessorContext, loadTeaching, pct } from '@/lib/professorData';

export default function StudentPerformancePage() {
  const { professor, courses } = useProfessorContext();
  const [data, setData] = useState(null);
  const [students, setStudents] = useState([]);
  const [courseFilter, setCourseFilter] = useState('all');

  useEffect(() => {
    if (!professor) return;
    Promise.all([loadTeaching(professor.id, courses), base44.entities.Student.list('-created_date', 300)])
      .then(([teaching, list]) => {
        setData(teaching);
        setStudents(Array.isArray(list) ? list : list.items || []);
      });
  }, [professor?.id, courses.length]);

  const rows = useMemo(() => {
    if (!data) return [];
    const byId = new Map(students.map((s) => [s.id, s]));
    const scoped = courseFilter === 'all' ? data.enrollments : data.enrollments.filter((e) => e.course_id === courseFilter);
    const merged = new Map();
    scoped.forEach((enrolment) => {
      const student = byId.get(enrolment.student_id);
      if (!student) return;
      const subs = data.submissions.filter((s) => s.course_id === enrolment.course_id && s.student_id === student.id);
      const graded = subs.filter((s) => typeof s.score === 'number');
      const course = courses.find((c) => c.id === enrolment.course_id);
      const published = data.assignments.filter((a) => a.course_id === enrolment.course_id && a.status === 'published').length;
      const att = data.attendance.filter((r) => r.course_id === enrolment.course_id && r.student_id === student.id);
      const present = att.filter((r) => r.status === 'present' || r.status === 'late').length;
      const attempts = data.attempts.filter((a) => a.course_id === enrolment.course_id && a.student_id === student.id);
      const key = `${student.id}:${enrolment.course_id}`;
      merged.set(key, {
        key,
        name: student.full_name,
        studentId: student.student_id,
        group: student.group_name,
        course: course?.code || '—',
        avg: graded.length
          ? Math.round(graded.reduce((sum, s) => {
            const max = data.assignments.find((a) => a.id === s.assignment_id)?.max_score || 100;
            return sum + (s.score / max) * 100;
          }, 0) / graded.length)
          : null,
        completion: pct(subs.length, Math.max(1, published)),
        attendance: pct(present, att.length),
        quiz: attempts.length ? Math.round(attempts.reduce((sum, a) => sum + (a.score || 0), 0) / attempts.length) : null,
      });
    });
    return [...merged.values()].sort((a, b) => (a.avg ?? 999) - (b.avg ?? 999));
  }, [data, students, courseFilter, courses]);

  const needsSupport = rows.filter((r) => (r.avg !== null && r.avg < 60) || (r.attendance > 0 && r.attendance < 70));

  if (!data) return <p className="py-10 text-center text-[12px] text-mutedink">Loading student performance…</p>;

  return (
    <div>
      <PageTitle
        eyebrow="Professor workspace"
        title="Student performance"
        description="Assessment results, completion and attendance for students enrolled in your courses. Lower averages are listed first."
        meta={[`${rows.length} enrolment records`, `${needsSupport.length} may need support`]}
        actions={
          <select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)} className="rounded-lg border border-line bg-white px-2.5 py-1.5 text-[11.5px] text-ink">
            <option value="all">All my courses</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.code}</option>)}
          </select>
        }
      />

      <Surface title="Support watchlist" subtitle="Average below 60% or attendance below 70%" bodyClassName="px-0 pb-0 pt-1">
        <ul className="divide-y divide-line">
          {needsSupport.slice(0, 6).map((row) => (
            <li key={`w-${row.key}`} className="flex items-center justify-between gap-3 px-5 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-[12px] text-ink">{row.name}</p>
                <p className="text-[10.5px] text-mutedink">{row.course} · {row.studentId} · {row.group}</p>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <StatusChip tone={row.avg !== null && row.avg < 60 ? 'critical' : 'neutral'}>{row.avg === null ? 'No grade' : `${row.avg}%`}</StatusChip>
                <StatusChip tone="warning">{row.attendance}% att.</StatusChip>
              </div>
            </li>
          ))}
          {!needsSupport.length && <li className="px-5 py-6 text-[11.5px] text-mutedink">No students currently fall below the support thresholds.</li>}
        </ul>
      </Surface>

      <div className="mt-4">
        <Surface title="All enrolled students" bodyClassName="px-0 pb-0 pt-1">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-b border-line">
                  {['Student', 'Course', 'Average', 'Completion', 'Attendance', 'Quiz'].map((head) => (
                    <th key={head} className="table-head px-5 py-2">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((row) => (
                  <tr key={row.key} className="row-hover">
                    <td className="px-5 py-2.5">
                      <p className="text-[12px] text-ink">{row.name}</p>
                      <p className="text-[10px] text-mutedink">{row.studentId} · {row.group}</p>
                    </td>
                    <td className="px-5 py-2.5 text-[11px] text-mutedink">{row.course}</td>
                    <td className="px-5 py-2.5">
                      <StatusChip tone={row.avg === null ? 'neutral' : row.avg >= 60 ? 'positive' : 'critical'}>
                        {row.avg === null ? '—' : `${row.avg}%`}
                      </StatusChip>
                    </td>
                    <td className="px-5 py-2.5 text-[11px] text-mutedink">{row.completion}%</td>
                    <td className="px-5 py-2.5 text-[11px] text-mutedink">{row.attendance}%</td>
                    <td className="px-5 py-2.5 text-[11px] text-mutedink">{row.quiz === null ? '—' : `${row.quiz}%`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!rows.length && <p className="px-5 py-6 text-[11.5px] text-mutedink">No enrolments in your courses.</p>}
        </Surface>
      </div>
    </div>
  );
}