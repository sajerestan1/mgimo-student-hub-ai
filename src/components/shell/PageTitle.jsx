export default function PageTitle({ eyebrow, title, description, actions, meta }) {
  return (
    <div className="mb-6 flex flex-col gap-4 border-b border-line pb-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h1 className="text-[length:var(--type-title)] font-bold leading-[1.14] tracking-[-0.025em] text-ink">
          {title}
        </h1>
        {description && <p className="mt-2 max-w-2xl text-[15px] leading-[1.6] text-mutedink">{description}</p>}
        {meta && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {Array.isArray(meta) ? (
              meta.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center rounded-md border border-line bg-white px-2 py-0.5 text-[13px] text-mutedink"
                >
                  {item}
                </span>
              ))
            ) : (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-mutedink">{meta}</div>
            )}
          </div>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 lg:shrink-0">{actions}</div>}
    </div>
  );
}