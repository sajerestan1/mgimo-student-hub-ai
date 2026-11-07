import { cn } from '@/lib/utils';

export default function DataTable({ columns, rows, onRowClick, emptyLabel = 'No records available.', dense, className }) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full min-w-[540px] border-collapse text-left">
        <thead>
          <tr className="border-b border-[#E9EFF7]">
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  'whitespace-nowrap px-3 py-2 text-[9.5px] font-semibold uppercase tracking-[0.12em] text-mutedink',
                  column.align === 'right' && 'text-right',
                  column.align === 'center' && 'text-center'
                )}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-3 py-8 text-center text-[12px] text-mutedink">
                {emptyLabel}
              </td>
            </tr>
          )}
          {rows.map((row, index) => (
            <tr
              key={row.id || index}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn(
                'border-b border-[#F1F5FA] transition-colors last:border-0',
                onRowClick && 'cursor-pointer hover:bg-[#F7FAFD]'
              )}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn(
                    'px-3 align-middle text-[12px] text-ink',
                    dense ? 'py-2' : 'py-2.5',
                    column.align === 'right' && 'text-right',
                    column.align === 'center' && 'text-center',
                    column.className
                  )}
                >
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}