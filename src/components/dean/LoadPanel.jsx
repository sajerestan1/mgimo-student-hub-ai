/**
 * Consistent loading and failure panel for every dean module, so a slow or
 * failed institutional read never renders as an empty screen.
 */
export default function LoadPanel({ loading, error, hasData, children }) {
  if (error) {
    return (
      <div className="card-surface border-[#F3D9D9] p-6">
        <p className="text-[length:var(--type-secondary)] font-medium text-critical">This section could not be opened</p>
        <p className="mt-1 text-[13px] leading-relaxed text-mutedink">{error}</p>
      </div>
    );
  }
  if (loading && !hasData) {
    return (
      <div className="card-surface flex items-center gap-2.5 p-6">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-line border-t-brand" />
        <p className="text-[length:var(--type-secondary)] text-mutedink">Reading the institutional dataset…</p>
      </div>
    );
  }
  return children;
}