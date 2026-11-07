export default function HeroOverview({ profile, average, activeApplications, unreadCount }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = (profile?.full_name || 'Student').split(' ')[0];
  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const yearLabel = profile?.year
    ? ['1st', '2nd', '3rd', '4th'][profile.year - 1] || `${profile.year}th`
    : null;

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#153B68] via-[#123055] to-[#0F2A4A] px-6 py-7 text-white shadow-[0_28px_60px_-34px_rgba(16,42,76,0.85)] sm:px-9 sm:py-9">
      <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-gold/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-[#245A91]/40 blur-3xl" />

      <div className="relative">
        <div className="flex flex-wrap items-center gap-2 text-[9.5px] uppercase tracking-[0.26em] text-gold">
          <span>Academic overview</span>
          <span className="h-1 w-1 rounded-full bg-gold/50" />
          <span className="normal-case tracking-normal text-white/45">{today}</span>
        </div>

        <h1 className="mt-3 font-heading text-[26px] leading-tight sm:text-[34px]">
          {greeting}, <span className="text-gold-light">{firstName}</span>
        </h1>
        <p className="mt-2 max-w-md text-[12.5px] leading-relaxed text-white/55">
          {[profile?.program, yearLabel && `${yearLabel} year`].filter(Boolean).join(' · ') ||
            'Your digital dean’s office is ready.'}
        </p>

        <div className="mt-7 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] sm:grid-cols-3">
          <div className="px-5 py-4">
            <p className="text-[9.5px] uppercase tracking-[0.2em] text-white/40">Academic average</p>
            <p className="mt-1.5 font-heading text-[26px] leading-none text-white">
              {average ? average.toFixed(2) : '—'}
              <span className="ml-1 font-body text-[11px] text-white/35">/ 5.00</span>
            </p>
          </div>
          <div className="border-t border-white/10 px-5 py-4 sm:border-l sm:border-t-0">
            <p className="text-[9.5px] uppercase tracking-[0.2em] text-white/40">Active applications</p>
            <p className="mt-1.5 font-heading text-[26px] leading-none text-white">
              {activeApplications}
            </p>
          </div>
          <div className="border-t border-white/10 px-5 py-4 sm:border-l sm:border-t-0">
            <p className="text-[9.5px] uppercase tracking-[0.2em] text-white/40">Unread notices</p>
            <p className="mt-1.5 font-heading text-[26px] leading-none text-gold-light">{unreadCount}</p>
          </div>
        </div>
      </div>
    </section>
  );
}