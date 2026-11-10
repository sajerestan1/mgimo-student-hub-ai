export default function BrandMark({ className = 'h-10 w-10' }) {
  return (
    <svg viewBox="0 0 48 48" className={className} role="img" aria-label="Digital Dean Academic Intelligence insignia" fill="none">
      <defs>
        <linearGradient id="hubGold" x1="8" y1="4" x2="40" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#EBD9AC" />
          <stop offset="1" stopColor="#C8A45D" />
        </linearGradient>
      </defs>
      <path
        d="M24 3.5 41.5 10.5v13.2c0 9.6-7.2 16.6-17.5 19.8C13.7 40.3 6.5 33.3 6.5 23.7V10.5L24 3.5Z"
        stroke="url(#hubGold)"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M24 18.6c-2.7-2.1-5.8-3-9-3v14.2c3.2 0 6.3.9 9 3 2.7-2.1 5.8-3 9-3V15.6c-3.2 0-6.3.9-9 3Z"
        stroke="url(#hubGold)"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M24 18.6v14.2" stroke="url(#hubGold)" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="24" cy="11.4" r="1.7" fill="#EBD9AC" />
    </svg>
  );
}