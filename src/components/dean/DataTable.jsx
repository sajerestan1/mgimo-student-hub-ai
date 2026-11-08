import { cn } from '@/lib/utils';

/**
 * One table treatment for every dean roster: hairline rows, right-aligned
 * numbers, and an optional row click for the record drill-down.
 */
export default function DataTable({ columns, rows, onRowClick, minWidth = 720, empty = 'No records match these filters.' }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left" style={{ minWidth }}>
        <thead>
          <tr className="border-b border-line">
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  'table-head whitespace-nowrap px-4 py-2.5 font-semibold',
                  column.align === 'right' && 'text-right',
                )}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={row.id || index}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn(
                'row-hover border-b border-line last:border-0',
                onRowClick && 'cursor-pointer',
              )}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn(
                    'px-4 py-3 align-middle text-[length:var(--type-secondary)] text-ink',
                    column.align === 'right' && 'text-right tabular-nums',
                  )}
                >
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length && <p className="px-4 py-7 text-[length:var(--type-secondary)] text-mutedink">{empty}</p>}
    </div>
  );
}