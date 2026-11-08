import StatusChip from '@/components/shell/StatusChip';
import { letterFor } from '@/lib/lms';

const toneFor = (score) => (score === null ? 'neutral' : score >= 85 ? 'positive' : score >= 70 ? 'brand' : 'warning');

const COMPLETION = {
  completed: { label: 'Completed', tone: 'positive' },
  in_progress: { label: 'In progress', tone: 'brand' },
  not_started: { label: 'Not started', tone: 'neutral' },
};

// The student's own current-semester results, one row per enrolled course.
export default function TranscriptTable({ rows }) {
  if (!rows.length) {
    return <p className="px-5 py-6 text-[11.5px] text-mutedink">No enrolled courses with recorded results.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse text-left">
        <thead>
          <tr className="border-y border-line bg-[#FAFBFD]">
            <th className="table-head px-5 py-2">Course</th>
            <th className="table-head px-3 py-2 text-right">Credits</th>
            <th className="table-head px-3 py-2 text-right">Score</th>
            <th className="table-head px-3 py-2 text-right">Grade</th>
            <th className="table-head px-5 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const completion = COMPLETION[row.completion] || COMPLETION.not_started;
            return (
              <tr key={row.code} className="row-hover border-b border-line/70 last:border-b-0">
                <td className="px-5 py-2">
                  <p className="text-[12px] text-ink">
                    <span className="font-mono text-[10.5px] text-mutedink">{row.code}</span>
                    <span className="mx-1.5 text-line">·</span>
                    {row.title}
                  </p>
                  <p className="text-[10px] text-mutedink">{row.professor}</p>
                </td>
                <td className="px-3 py-2 text-right text-[11.5px] tabular-nums text-mutedink">{row.credits}</td>
                <td className="px-3 py-2 text-right text-[11.5px] font-semibold tabular-nums text-ink">
                  {row.score === null ? '—' : row.score.toFixed(1)}
                </td>
                <td className="px-3 py-2 text-right">
                  <StatusChip tone={toneFor(row.score)}>{letterFor(row.score)}</StatusChip>
                </td>
                <td className="px-5 py-2">
                  <StatusChip tone={completion.tone}>{completion.label}</StatusChip>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}