export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#DDE5F1] bg-white/60 px-6 py-12 text-center">
      {Icon && (
        <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#F1F5FB] text-navy-mid">
          <Icon className="h-5 w-5" strokeWidth={1.6} />
        </span>
      )}
      <p className="font-heading text-[16px] text-navy-deep">{title}</p>
      {description && (
        <p className="mt-1.5 max-w-sm text-[12.5px] leading-relaxed text-slate-500">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}