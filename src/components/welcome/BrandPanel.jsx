import { GraduationCap } from 'lucide-react';
import { UNIVERSITY } from '@/lib/demoUniversity';

// The institutional lockup at the top of the welcome screen. It stays a single
// compact block so the workspace selection below it keeps its place on screen.
export default function BrandPanel() {
  return (
    <section className="rounded-[20px] bg-white px-6 py-6 text-center sm:px-10 sm:py-7">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[14px] bg-welcome-red">
        <GraduationCap className="h-6 w-6 text-white" strokeWidth={1.8} aria-hidden="true" />
      </div>
      <p className="mt-3 text-[12px] font-semibold uppercase tracking-[0.24em] text-welcome-slate">
        {UNIVERSITY.name}
      </p>
      <h1 className="mt-1.5 text-[22px] font-bold leading-tight tracking-[-0.02em] text-welcome-navy sm:text-[26px]">
        {UNIVERSITY.platform}
      </h1>
      <p className="mt-1.5 text-[14px] text-welcome-slate sm:text-[15px]">{UNIVERSITY.tagline}</p>
    </section>
  );
}