import Surface from '@/components/shell/Surface';

function Bar({ label, value, hint, tone = 'bg-brand' }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <p className="truncate text-[11px] text-ink">{label}</p>
        <p className="shrink-0 text-[11px] font-medium text-mutedink">{hint}</p>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[#EEF1F7]">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${Math.max(2, Math.min(100, value))}%` }} />
      </div>
    </div>
  );
}

// Course indicators computed from the LMS records of each course.
export default function CoursePerformancePanel({ rows }) {
  return (
    <Surface title="Course performance" subtitle="Average marks, module completion and engagement, from your live course records">
      {rows.length === 0 ? (
        <p className="py-4 text-[11.5px] text-mutedink">No graded work recorded yet.</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {rows.map((row) => (
            <div key={row.id} className="rounded-lg border border-line px-3 py-2.5">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="truncate text-[12px] font-semibold text-ink">{row.code}</p>
                <span className="shrink-0 text-[10.5px] text-mutedink">{row.students} students</span>
              </div>
              <div className="space-y-2">
                <Bar label="Average assessment mark" value={row.mark ?? 0} hint={row.mark === null ? 'No marks' : `${row.mark}%`} />
                <Bar label="Submissions received" value={row.completion} hint={`${row.completion}%`} tone="bg-violet" />
                <Bar label="Modules completed" value={row.modules} hint={`${row.modules}%`} tone="bg-positive" />
                <Bar label="Quiz participation" value={row.quiz} hint={`${row.quiz}%`} tone="bg-warning" />
                <Bar label="Student discussion posts" value={row.participation} hint={`${row.participation}% of students`} tone="bg-navy" />
              </div>
            </div>
          ))}
        </div>
      )}
    </Surface>
  );
}