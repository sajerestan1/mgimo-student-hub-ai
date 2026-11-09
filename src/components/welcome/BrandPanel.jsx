import { GraduationCap } from 'lucide-react';

// The institutional lockup at the top of the welcome screen.
export default function BrandPanel() {
  return (
    <section className="rounded-[24px] bg-white px-6 py-10 text-center sm:px-10 sm:py-12">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[18px] bg-welcome-red">
        <GraduationCap className="h-8 w-8 text-white" strokeWidth={1.8} aria-hidden="true" />
      </div>
      <h1 className="mt-6 text-[26px] font-bold leading-tight tracking-[-0.02em] text-welcome-navy sm:text-[34px]">
        Academic Intelligence
      </h1>
      <p className="mt-2 text-[14px] text-welcome-slate sm:text-[15px]">
        Your University. One Intelligent Platform.
      </p>
    </section>
  );
}