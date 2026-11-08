import { Search } from 'lucide-react';

/**
 * Search plus any number of selects, shared by every roster page. Each select
 * is a server filter: changing it re-queries the endpoint.
 */
export default function DeanToolbar({ query, onQuery, placeholder = 'Search', filters = [], actions, resultLabel }) {
  return (
    <div className="flex flex-col gap-2 border-b border-line px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        {onQuery && (
          <label className="relative w-full sm:max-w-[280px]">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-mutedink" />
            <input
              value={query}
              onChange={(event) => onQuery(event.target.value)}
              placeholder={placeholder}
              className="h-9 w-full rounded-lg border border-line bg-white pl-8 pr-3 text-[length:var(--type-secondary)] text-ink outline-none placeholder:text-mutedink focus:border-brand/50 focus:ring-2 focus:ring-brand/20"
            />
          </label>
        )}
        {filters.map((filter) => (
          <select
            key={filter.label}
            value={filter.value}
            onChange={(event) => filter.onChange(event.target.value)}
            aria-label={filter.label}
            className="h-9 rounded-lg border border-line bg-white px-2.5 text-[length:var(--type-secondary)] text-ink outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/20"
          >
            <option value="">{filter.label}</option>
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ))}
      </div>
      <div className="flex items-center justify-between gap-3 lg:justify-end">
        {resultLabel && <p className="text-[13px] text-mutedink">{resultLabel}</p>}
        {actions}
      </div>
    </div>
  );
}