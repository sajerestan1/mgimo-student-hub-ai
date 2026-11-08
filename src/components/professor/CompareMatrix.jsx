import Surface from '@/components/shell/Surface';
import StatusChip from '@/components/shell/StatusChip';
import { STATUS_LABEL, STATUS_TONE } from '@/lib/compareMetrics';

const METRICS = [
  { key: 'avg', label: 'Average mark', target: 60 },
  { key: 'attendance', label: 'Attendance', target: 70 },
  { key: 'completion', label: 'Work submitted', target: 60 },
  { key: 'quiz', label: 'Quiz average', target: 60 },
];

const show = (value) => (value === null || value === undefined ? '—' : `${value}%`);

function Bar({ value, weak }) {
  if (value === null || value === undefined) return <span className="text-[11px] text-mutedink">—</span>;
  return (
    <div className="space-y-1">
      <p className={`text-[13px] font-semibold tabular-nums ${weak ? 'text-critical' : 'text-ink'}`}>{value}%</p>
      <div className="h-1 w-full overflow-hidden rounded-full bg-line">
        <div
          className={`h-full rounded-full ${weak ? 'bg-critical' : 'bg-brand'}`}
          style={{ width: `${Math.max(2, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
}

export default function CompareMatrix({ rows }) {
  if (rows.length < 2) {
    return (
      <Surface title="Side-by-side comparison">
        <p className="py-8 text-center text-[11.5px] text-mutedink">
          Select at least two students from the cohort list to line their performance up.
        </p>
      </Surface>
    );
  }

  const lowest = (key) => {
    const values = rows.map((row) => row[key]).filter((value) => value !== null && value !== undefined);
    return values.length > 1 ? Math.min(...values) : null;
  };

  return (
    <Surface
      title="Side-by-side comparison"
      subtitle="The weakest mark in each row is highlighted against the rest of the group"
      bodyClassName="px-0 pb-0 pt-1"
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-left">
          <thead>
            <tr className="border-y border-line bg-canvas">
              <th className="table-head px-5 py-2.5">Metric</th>
              {rows.map((row) => (
                <th key={row.key} className="px-3 py-2.5 align-top">
                  <p className="text-[12px] font-semibold leading-tight text-ink">{row.name}</p>
                  <p className="mt-0.5 text-[10px] font-normal text-mutedink">
                    {row.courses} · {row.studentId || row.group || '—'}
                  </p>
                  <span className="mt-1.5 inline-flex">
                    <StatusChip tone={STATUS_TONE[row.status]}>{STATUS_LABEL[row.status]}</StatusChip>
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {METRICS.map((metric) => {
              const floor = lowest(metric.key);
              return (
                <tr key={metric.key}>
                  <td className="px-5 py-3">
                    <p className="text-[11.5px] font-medium text-ink">{metric.label}</p>
                    <p className="text-[10px] text-mutedink">Target {metric.target}%</p>
                  </td>
                  {rows.map((row) => {
                    const value = row[metric.key];
                    const weak = floor !== null && value === floor;
                    return (
                      <td key={row.key} className="px-3 py-3">
                        <Bar value={value} weak={weak} />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            <tr>
              <td className="px-5 py-3 text-[11.5px] font-medium text-ink">Support priority</td>
              {rows.map((row) => (
                <td key={row.key} className="px-3 py-3 text-[11.5px] text-mutedink">
                  {row.riskScore} <span className="text-[10px]">index</span>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <p className="border-t border-line px-5 py-2.5 text-[10px] leading-relaxed text-mutedink">
        Support index combines mark, attendance and submission shortfalls — a higher number means more ground to recover.
      </p>
    </Surface>
  );
}