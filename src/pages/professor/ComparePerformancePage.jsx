import { useEffect, useMemo, useState } from 'react';
import PageTitle from '@/components/shell/PageTitle';
import ComparePicker from '@/components/professor/ComparePicker';
import CompareMatrix from '@/components/professor/CompareMatrix';
import { base44 } from '@/api/base44Client';
import { useProfessorContext, loadTeaching } from '@/lib/professorData';
import { buildComparisonRows } from '@/lib/compareMetrics';

const MAX_SELECTED = 4;

export default function ComparePerformancePage() {
  const { professor, courses } = useProfessorContext();
  const [data, setData] = useState(null);
  const [students, setStudents] = useState([]);
  const [courseFilter, setCourseFilter] = useState('all');
  const [selected, setSelected] = useState([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!professor) return;
    Promise.all([loadTeaching(professor.id, courses), base44.entities.Student.list('-created_date', 300)]).then(
      ([teaching, list]) => {
        setData(teaching);
        setStudents(Array.isArray(list) ? list : list.items || []);
      }
    );
  }, [professor?.id, courses.length]);

  const rows = useMemo(
    () => buildComparisonRows({ data, students, courses, courseFilter }),
    [data, students, courses, courseFilter]
  );

  // Open on the students with the most ground to recover, so the view is useful immediately.
  useEffect(() => {
    if (!rows.length || selected.length) return;
    const struggling = rows.filter((row) => row.status !== 'stable').slice(0, 3);
    setSelected((struggling.length >= 2 ? struggling : rows.slice(0, 3)).map((row) => row.key));
  }, [rows.length]);

  const toggle = (key) => {
    if (selected.includes(key)) return setSelected(selected.filter((item) => item !== key));
    setSelected(selected.length >= MAX_SELECTED ? [...selected.slice(1), key] : [...selected, key]);
  };

  const compared = selected
    .map((key) => rows.find((row) => row.key === key))
    .filter(Boolean);

  if (!data) return <p className="py-10 text-center text-[12px] text-mutedink">Loading student performance…</p>;

  const falling = rows.filter((row) => row.status === 'at_risk').length;

  return (
    <div>
      <PageTitle
        eyebrow="Professor workspace"
        title="Comparative analysis"
        description="Put students next to each other on marks, attendance, submission and quizzes to see who is slipping before the end of term."
        meta={[`${rows.length} students in scope`, `${falling} falling behind`]}
        actions={
          <select
            value={courseFilter}
            onChange={(event) => {
              setCourseFilter(event.target.value);
              setSelected([]);
            }}
            className="rounded-lg border border-line bg-white px-2.5 py-1.5 text-[11.5px] text-ink"
          >
            <option value="all">All my courses</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.code}
              </option>
            ))}
          </select>
        }
      />

      <div className="grid items-start gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <ComparePicker
          rows={rows}
          selected={selected}
          onToggle={toggle}
          query={query}
          onQueryChange={setQuery}
        />
        <CompareMatrix rows={compared} />
      </div>

      {!rows.length && (
        <p className="mt-4 text-[11.5px] text-mutedink">No enrolments in this scope yet.</p>
      )}
    </div>
  );
}