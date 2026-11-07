import StatusChip from '@/components/shell/StatusChip';

const cellInput = 'w-20 rounded-md border border-line bg-white px-2 py-1 text-[12px] text-ink focus:border-royal/40 focus:outline-none focus:ring-2 focus:ring-royal/10';

export default function BulkGradeTable({ rows, drafts, maxScore, onChange }) {
  if (!rows.length) {
    return <p className="px-5 py-6 text-[11.5px] text-mutedink">No submissions have been received for this assignment yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-left">
        <thead>
          <tr className="border-y border-line bg-canvas">
            <th className="table-head px-5 py-2">Student</th>
            <th className="table-head px-3 py-2">Submitted</th>
            <th className="table-head px-3 py-2">Current</th>
            <th className="table-head px-3 py-2">Mark / {maxScore}</th>
            <th className="table-head px-5 py-2 text-right">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map(({ submission }) => {
            const draft = drafts[submission.id];
            const changed = draft !== undefined && draft !== '' && Number(draft) !== submission.score;
            return (
              <tr key={submission.id} className="row-hover">
                <td className="px-5 py-2.5">
                  <p className="text-[12px] font-medium text-ink">{submission.student_name}</p>
                  <p className="text-[10.5px] text-mutedink">
                    {submission.student_group || '—'} · {submission.student_id || 'no id'}
                  </p>
                </td>
                <td className="px-3 py-2.5 text-[11px] text-mutedink">{submission.submitted_at || '—'}</td>
                <td className="px-3 py-2.5 text-[11.5px] text-ink">
                  {typeof submission.score === 'number' ? submission.score : '—'}
                </td>
                <td className="px-3 py-2.5">
                  <input
                    type="number"
                    min="0"
                    max={maxScore}
                    value={draft ?? (typeof submission.score === 'number' ? String(submission.score) : '')}
                    onChange={(event) => onChange(submission.id, event.target.value)}
                    className={cellInput}
                    placeholder="—"
                  />
                </td>
                <td className="px-5 py-2.5 text-right">
                  <StatusChip tone={changed ? 'warning' : typeof submission.score === 'number' ? 'positive' : 'neutral'}>
                    {changed ? 'Unsaved' : typeof submission.score === 'number' ? 'Graded' : 'To grade'}
                  </StatusChip>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}