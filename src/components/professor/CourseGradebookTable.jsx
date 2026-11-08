import Surface from '@/components/shell/Surface';
import StatusChip from '@/components/shell/StatusChip';
import { Download } from 'lucide-react';
import { downloadCsv, formatPercent } from '@/lib/exportCsv';

// The same gradebook the students see, one row per enrolled student.
export default function CourseGradebookTable({ data }) {
  const { course, assignments, quizzes, roster, modules } = data;
  const columns = [
    ...assignments.map((a) => ({ key: `a-${a.id}`, label: a.title, kind: 'assignment', id: a.id })),
    ...quizzes.map((q) => ({ key: `q-${q.id}`, label: q.title, kind: 'quiz', id: q.id })),
  ];

  const exportCsv = () => {
    downloadCsv(
      `${course.code}-gradebook.csv`,
      [
        { label: 'Student', value: (row) => row.student.full_name },
        { label: 'Student ID', value: (row) => row.student.student_id || '' },
        { label: 'Group', value: (row) => row.student.group_name || '' },
        { label: 'Modules completed', value: (row) => `${row.progress.completed}/${modules.length}` },
        ...columns.map((column) => ({
          label: column.label,
          value: (row) => {
            const item = row.gradebook.rows.find((entry) => entry.id === column.id);
            if (!item || item.score === null) return item?.status || '';
            return `${item.score}/${item.max}`;
          },
        })),
        { label: 'Course result', value: (row) => (row.gradebook.weighted === null ? '' : row.gradebook.weighted) },
      ],
      roster
    );
  };

  return (
    <Surface
      title="Course gradebook"
      subtitle={`${roster.length} enrolled students · ${assignments.length} assignments · ${quizzes.length} quizzes`}
      bodyClassName="px-0 pb-0 pt-1"
      action={
        <button type="button" onClick={exportCsv} className="btn-quiet btn-sm" disabled={!roster.length}>
          <Download className="h-3.5 w-3.5" /> Export CSV
        </button>
      }
    >
      {!roster.length && <p className="px-5 py-6 text-[11.5px] text-mutedink">No students are enrolled in this course.</p>}
      {roster.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead>
              <tr className="border-b border-line">
                <th className="table-head px-5 py-2">Student</th>
                <th className="table-head px-3 py-2">Modules</th>
                {columns.map((column) => (
                  <th key={column.key} className="table-head px-3 py-2">{column.label.slice(0, 24)}</th>
                ))}
                <th className="table-head px-5 py-2 text-right">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {roster.map((row) => (
                <tr key={row.student.id} className="row-hover">
                  <td className="px-5 py-2.5">
                    <p className="text-[12px] text-ink">{row.student.full_name}</p>
                    <p className="text-[10px] text-mutedink">{row.student.student_id} · {row.student.group_name}</p>
                  </td>
                  <td className="px-3 py-2.5 text-[11px] text-mutedink">{row.progress.completed}/{modules.length}</td>
                  {columns.map((column) => {
                    const item = row.gradebook.rows.find((entry) => entry.id === column.id);
                    if (!item) return <td key={column.key} className="px-3 py-2.5 text-[11px] text-mutedink">—</td>;
                    if (item.status === 'awaiting_grading') {
                      return <td key={column.key} className="px-3 py-2.5"><StatusChip tone="warning">To grade</StatusChip></td>;
                    }
                    if (item.score === null) {
                      return (
                        <td key={column.key} className="px-3 py-2.5 text-[11px] text-mutedink">
                          {item.status === 'missing' ? 'Missing' : '—'}
                        </td>
                      );
                    }
                    return (
                      <td key={column.key} className="px-3 py-2.5 text-[11px] tabular-nums text-ink">
                        {column.kind === 'quiz' ? formatPercent(item.score) : `${item.score}/${item.max}`}
                      </td>
                    );
                  })}
                  <td className="px-5 py-2.5 text-right">
                    <StatusChip tone={row.gradebook.weighted === null ? 'neutral' : row.gradebook.weighted >= 60 ? 'positive' : 'critical'}>
                      {row.gradebook.weighted === null ? '—' : `${row.gradebook.weighted.toFixed(1)} ${row.gradebook.letter}`}
                    </StatusChip>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Surface>
  );
}