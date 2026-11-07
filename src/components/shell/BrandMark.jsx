export default function BrandMark({ className = 'h-8 w-8' }) {
  return (
    <svg viewBox="0 0 32 32" className={className} role="img" aria-label="Academic Intelligence">
      <defs>
        <linearGradient id="aiMark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4F75FF" />
          <stop offset="100%" stopColor="#7666F5" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#aiMark)" />
      <path d="M9.5 22.5 16 9l6.5 13.5" fill="none" stroke="#fff" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.6 18.4h6.8" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" opacity="0.85" />
      <circle cx="16" cy="6.6" r="1.5" fill="#fff" opacity="0.9" />
    </svg>
  );
}