export default function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1 text-[9.5px] font-semibold uppercase tracking-[0.2em] text-[#9A7B33]">{eyebrow}</p>
        )}
        <h1 className="font-heading text-[24px] leading-tight text-ink sm:text-[27px]">{title}</h1>
        {description && (
          <p className="mt-1 max-w-2xl text-[12.5px] leading-relaxed text-mutedink">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}