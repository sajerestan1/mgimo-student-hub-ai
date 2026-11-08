import StatusChip from '@/components/shell/StatusChip';

const STATUS = {
  graded: { label: 'Graded', tone: 'positive' },
  awaiting_grading: { label: 'Awaiting grade', tone: 'warning' },
  missing: { label: 'Missing', tone: 'critical' },
  not_submitted: { label: 'Not submitted', tone: 'neutral' },
};

const date = (value) =>
  value ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

// One course's assessment records, exactly as the LMS gradebook calculates them.
export default function AssessmentRows({ rows }) {
  if (!rows.length) {
    return <p className="px-1 py-3 text-[11.5px] text-mutedink">No assessments have been recorded for this course yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[620px] text-left">
        <thead>
          <tr className="border-b border-line">
            <th className="table-head py-2 pr-3">Assessment</th>
            <th className="table-head px-3 py-2">Category</th>
            <th className="table-head px-3 py-2 text-right">Score</th>
            <th className="table-head px-3 py-2 text-right">Contribution</th>
            <th className="table-head px-3 py-2">Graded</th>
            <th className="table-head py-2 pl-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const status = STATUS[row.status] || STATUS.not_submitted;
            return (
              <tr key={row.id} className="border-b border-line/70 last:border-b-0">
                <td className="py-2.5 pr-3">
                  <p className="text-[12px] text-ink">{row.title}</p>
                  {row.feedback && (
                    <p className="mt-0.5 max-w-sm text-[10.5px] leading-relaxed text-mutedink">{row.feedback}</p>
                  )}
                  {row.late && <p className="text-[10px] text-warning">Submitted after the due date</p>}
                </td>
                <td className="px-3 py-2.5 text-[11px] text-mutedink">{row.categoryLabel}</td>
                <td className="px-3 py-2.5 text-right text-[11.5px] tabular-nums text-ink">
                  {row.score === null ? '—' : `${row.score}/${row.max}`}
                </td>
                <td className="px-3 py-2.5 text-right text-[11.5px] tabular-nums text-mutedink">
                  {row.contribution === null ? '—' : `${row.contribution} pts`}
                </td>
                <td className="px-3 py-2.5 text-[11px] text-mutedink">{date(row.gradedAt)}</td>
                <td className="py-2.5 pl-3">
                  <StatusChip tone={status.tone}>{status.label}</StatusChip>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}