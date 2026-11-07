export default function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-[9.5px] uppercase tracking-[0.28em] text-gold">{eyebrow}</p>
        )}
        <h1 className="mt-1.5 font-heading text-[25px] leading-tight text-navy-deep sm:text-[30px]">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 max-w-xl text-[12.5px] leading-relaxed text-slate-500">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}