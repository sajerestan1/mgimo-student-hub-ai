export function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="h-[196px] animate-pulse rounded-3xl bg-[#E7EDF7]" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="h-64 animate-pulse rounded-2xl bg-white lg:col-span-2" />
        <div className="h-64 animate-pulse rounded-2xl bg-white" />
      </div>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="card-surface flex flex-col items-center justify-center px-6 py-14 text-center">
      <p className="font-heading text-[18px] text-navy-deep">Something interrupted the dean’s office</p>
      <p className="mt-2 max-w-sm text-[12.5px] leading-relaxed text-slate-500">
        {message || 'The academic record could not be loaded. Please try again.'}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 rounded-xl bg-navy px-4 py-2 text-[12.5px] font-medium text-white transition-colors hover:bg-navy-deep"
        >
          Try again
        </button>
      )}
    </div>
  );
}