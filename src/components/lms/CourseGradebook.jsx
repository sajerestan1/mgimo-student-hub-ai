import Surface from '@/components/shell/Surface';
import StatusChip from '@/components/shell/StatusChip';
import { shortDate } from '@/lib/studentCourses';
import { letterFor } from '@/lib/lms';

const STATUS_LABEL = {
  graded: 'Graded',
  awaiting_grading: 'Awaiting grading',
  missing: 'Missing',
  not_submitted: 'Not yet due',
};

const STATUS_TONE = {
  graded: 'positive',
  awaiting_grading: 'warning',
  missing: 'critical',
  not_submitted: 'neutral',
};

export default function CourseGradebook({ course, gradebook }) {
  return (
    <div className="space-y-4">
      <Surface
        title="Course gradebook"
        subtitle="Weighted result calculated from your own recorded submissions and quiz attempts"
      >
        <div className="grid gap-3 sm:grid-cols-4">
          {gradebook.categories.map((category) => (
            <div key={category.key} className="rounded-lg border border-line bg-canvas p-3">
              <p className="text-[10.5px] text-mutedink">{category.label}</p>
              <p className="mt-1 text-[16px] font-semibold tabular-nums text-ink">
                {category.score === null ? '—' : `${category.score.toFixed(1)}%`}
              </p>
              <p className="text-[10px] text-mutedink">{category.weight}% of the final grade</p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
          <div>
            <p className="text-[10.5px] text-mutedink">Weighted result</p>
            <p className="text-[22px] font-semibold tabular-nums text-ink">
              {gradebook.weighted === null ? '—' : gradebook.weighted.toFixed(1)}
              <span className="ml-2 text-[13px] font-medium text-mutedink">{letterFor(gradebook.weighted)}</span>
            </p>
            <p className="text-[10.5px] text-mutedink">
              Based on {gradebook.weightScored}% of the course weight that has actually been assessed
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <StatusChip tone={gradebook.awaiting ? 'warning' : 'neutral'}>{gradebook.awaiting} awaiting grading</StatusChip>
            <StatusChip tone={gradebook.missing ? 'critical' : 'positive'}>{gradebook.missing} missing items</StatusChip>
          </div>
        </div>
      </Surface>

      <Surface title="Assessment detail" subtitle="Every item, its weight and the feedback returned" bodyClassName="px-0 pb-0 pt-1">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left">
            <thead>
              <tr className="border-b border-line">
                <th className="table-head px-5 py-2">Assessment</th>
                <th className="table-head px-3 py-2">Category</th>
                <th className="table-head px-3 py-2">Due</th>
                <th className="table-head px-3 py-2">Score</th>
                <th className="table-head px-5 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {gradebook.categories.flatMap((category) =>
                category.items.map((item) => (
                  <tr key={`${category.key}-${item.id}`} className="row-hover border-b border-line/70">
                    <td className="px-5 py-2.5">
                      <p className="text-[12px] font-medium text-ink">{item.title}</p>
                      {item.feedback && (
                        <p className="mt-0.5 max-w-md text-[10.5px] leading-relaxed text-mutedink">{item.feedback}</p>
                      )}
                      {item.late && <p className="text-[10px] text-warning">Submitted after the due date</p>}
                    </td>
                    <td className="px-3 py-2.5 text-[11px] text-mutedink">{category.label}</td>
                    <td className="px-3 py-2.5 text-[11px] text-mutedink">{shortDate(item.dueDate)}</td>
                    <td className="px-3 py-2.5 text-[11.5px] tabular-nums text-ink">
                      {item.score === null ? '—' : `${item.score}/${item.max}`}
                    </td>
                    <td className="px-5 py-2.5">
                      <StatusChip tone={STATUS_TONE[item.status]}>{STATUS_LABEL[item.status]}</StatusChip>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <p className="border-t border-line px-5 py-3 text-[10.5px] leading-relaxed text-mutedink">
          Missing work is displayed as missing and excluded from the weighted result. It is only counted as zero where the
          course policy says so, which {course.code} does not.
        </p>
      </Surface>
    </div>
  );
}