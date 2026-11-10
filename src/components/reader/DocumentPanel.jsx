import SectionBody from './SectionBody';
import { languageLabel } from '@/lib/materialTranslation';

// Heading depth comes from the source (1-6). Without it every heading rendered at
// the same size, which flattened the document hierarchy.
const headingClass = (level, index) => {
  const depth = level || (index === 0 ? 1 : 2);
  if (depth <= 1) return 'text-[1.28rem] font-bold leading-[1.25] tracking-[-0.01em] text-ink';
  if (depth === 2) return 'text-[1.1rem] font-semibold leading-[1.3] text-ink';
  return 'text-[1rem] font-semibold leading-[1.4] text-ink/85';
};

// One side of the bilingual reader. Sections carry their document id as a data
// attribute, which is what the synchronised scrolling aligns on.
export default function DocumentPanel({
  side,
  language,
  direction,
  sections,
  activeId,
  onSelect,
  containerRef,
  onScroll,
  pendingLabel,
  emptyLabel,
  embedded = false,
}) {
  return (
    <div className={`flex flex-col bg-white ${embedded ? '' : 'h-full min-h-0'}`}>
      <div className="flex items-baseline justify-between gap-2 border-b border-line px-4 py-2">
        <p className="eyebrow">{side === 'original' ? 'Original' : 'Translation'}</p>
        <p className="text-[13px] font-medium text-mutedink">{languageLabel(language)}</p>
      </div>

      <div
        ref={containerRef}
        onScroll={onScroll}
        dir={direction}
        tabIndex={0}
        className={`scroll-thin px-4 pb-24 pt-4 focus-visible:outline-none sm:px-6 ${
          embedded ? '' : 'min-h-0 flex-1 overflow-y-auto'
        }`}
      >
        {!sections.length && <p className="py-8 text-center text-[14px] text-mutedink">{emptyLabel}</p>}

        <div className="space-y-5">
          {sections.map((section, index) => {
            const heading = side === 'original' ? section.heading : section.translated_heading || section.heading;
            const translated = String(section.translated || '').trim();
            const original = String(section.original || '').trim();
            // A section that has no translation yet keeps its readable original,
            // clearly labelled, instead of an empty box or invented text.
            const missing = side === 'translation' && !translated && Boolean(original);
            const body = side === 'original' ? original : translated || original;
            const active = activeId === section.id;

            return (
              <section
                key={`${side}-${section.id}`}
                data-section-id={section.id}
                role="button"
                tabIndex={0}
                aria-label={`Section ${section.id}`}
                onClick={() => onSelect(section.id, side)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onSelect(section.id, side);
                  }
                }}
                className={`rounded-lg px-2 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 ${
                  active ? 'bg-brand-soft/70 ring-1 ring-brand/25' : 'hover:bg-canvas'
                }`}
              >
                <div className="mb-1 flex items-start gap-1.5">
                  <span className="mt-1 shrink-0 rounded bg-canvas px-1.5 py-0.5 font-mono text-[11px] leading-tight text-mutedink">
                    {section.id}
                  </span>
                  {heading && <h3 className={`min-w-0 ${headingClass(section.level, index)}`}>{heading}</h3>}
                </div>

                {body ? <SectionBody kind={section.kind} text={body} muted={missing} /> : null}

                {missing && (
                  <p className="mt-1.5 inline-flex items-center rounded-md bg-canvas px-1.5 py-0.5 text-[12.5px] font-medium text-mutedink">
                    {pendingLabel} · showing the original
                  </p>
                )}

                {!body && side === 'translation' && !heading && (
                  <p className="text-[14px] italic text-mutedink">{pendingLabel}</p>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}