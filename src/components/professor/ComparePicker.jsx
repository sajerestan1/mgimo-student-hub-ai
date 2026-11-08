import { Search } from 'lucide-react';
import Surface from '@/components/shell/Surface';
import StatusChip from '@/components/shell/StatusChip';
import { STATUS_LABEL, STATUS_TONE } from '@/lib/compareMetrics';

export default function ComparePicker({ rows, selected, onToggle, query, onQueryChange }) {
  const visible = rows.filter((row) =>
    `${row.name} ${row.studentId || ''} ${row.group || ''} ${row.courses}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Surface
      title="Cohort"
      subtitle="Ranked by support priority — select up to four students"
      action={<StatusChip tone="brand">{selected.length}/4</StatusChip>}
      bodyClassName="px-0 pb-0 pt-1"
    >
      <div className="px-5 pb-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-mutedink" />
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search a student or group"
            className="w-full rounded-lg border border-line bg-white py-1.5 pl-8 pr-3 text-[11.5px] text-ink focus:border-royal/40 focus:outline-none focus:ring-2 focus:ring-royal/10"
          />
        </div>
      </div>
      <ul className="max-h-[520px] divide-y divide-line overflow-y-auto scroll-thin">
        {visible.map((row) => {
          const active = selected.includes(row.key);
          return (
            <li key={row.key}>
              <button
                type="button"
                onClick={() => onToggle(row.key)}
                className={`flex w-full items-center gap-2.5 px-5 py-2.5 text-left transition-colors ${
                  active ? 'bg-brand-soft' : 'hover:bg-[#FAFBFD]'
                }`}
              >
                <span
                  className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border ${
                    active ? 'border-brand bg-brand text-white' : 'border-[#CFD6E4] bg-white'
                  }`}
                >
                  {active && <span className="text-[9px] leading-none">✓</span>}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[11.5px] font-medium text-ink">{row.name}</span>
                  <span className="block truncate text-[10px] text-mutedink">
                    {row.courses} · {row.group || 'no group'}
                  </span>
                </span>
                <span className="shrink-0">
                  <StatusChip tone={STATUS_TONE[row.status]}>{STATUS_LABEL[row.status]}</StatusChip>
                </span>
              </button>
            </li>
          );
        })}
        {!visible.length && <li className="px-5 py-6 text-[11.5px] text-mutedink">No students match this search.</li>}
      </ul>
    </Surface>
  );
}