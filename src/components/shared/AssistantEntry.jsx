import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

/**
 * Entry point to the role's AI assistant. The copy and the destination come
 * from the workspace, so students never land on the institutional assistant.
 */
export default function AssistantEntry({ eyebrow, title, description, prompts, to, ctaLabel }) {
  return (
    <section className="relative overflow-hidden rounded-xl border border-[#1B2A47] bg-[#0F1A31] text-white">
      <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-brand/20 blur-3xl" />
      <div className="relative flex flex-col gap-4 px-5 py-5 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">
            <Sparkles className="h-3.5 w-3.5 text-[#9FB6FF]" /> {eyebrow}
          </p>
          <h2 className="mt-2 text-[16px] font-semibold leading-snug tracking-[-0.01em] text-white">{title}</h2>
          <p className="mt-1 max-w-xl text-[11.5px] leading-relaxed text-white/50">{description}</p>
          {prompts?.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {prompts.map((prompt) => (
                <li
                  key={prompt}
                  className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[10.5px] text-white/60"
                >
                  {prompt}
                </li>
              ))}
            </ul>
          )}
        </div>
        <Link
          to={to}
          className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-lg bg-white px-3.5 py-2 text-[11.5px] font-medium text-[#0F1A31] transition-colors hover:bg-white/90 md:self-center"
        >
          {ctaLabel} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
}