export default function FilterSelect({ label, value, onChange, options, className }) {
  return (
    <label className={`flex flex-col gap-1 ${className || ''}`}>
      {label && <span className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-mutedink">{label}</span>}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 w-full rounded-lg border border-[#E1E8F2] bg-white px-2.5 text-[11.5px] text-ink focus:border-navy/40 focus:outline-none focus:ring-2 focus:ring-navy/10"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}