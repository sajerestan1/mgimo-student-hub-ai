import { languageLabel } from '@/lib/materialTranslation';

const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function Highlighted({ text, term }) {
  if (!term) return text;
  const parts = String(text).split(new RegExp(`(${escape(term)})`, 'gi'));
  return parts.map((part, index) =>
    part.toLowerCase() === term.toLowerCase() ? (
      <mark key={`${part}-${index}`} className="rounded bg-gold-light px-0.5 text-ink">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

const BODY_CLASS = {
  heading: 'text-[length:var(--type-card)] font-semibold leading-[1.35] text-ink',
  list: 'whitespace-pre-wrap text-[length:var(--type-reading)] leading-[var(--leading-reading)] text-ink/85',
  table: 'overflow-x-auto whitespace-pre font-mono text-[13px] leading-[1.7] text-ink/85',
  paragraph: 'text-[length:var(--type-reading)] leading-[var(--leading-reading)] text-ink/85',
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
  search,
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
        className={`scroll-thin px-4 py-4 focus-visible:outline-none sm:px-6 ${
          embedded ? '' : 'min-h-0 flex-1 overflow-y-auto'
        }`}
      >
        {!sections.length && (
          <p className="py-8 text-center text-[14px] text-mutedink">{emptyLabel}</p>
        )}

        <div className="space-y-4">
          {sections.map((section) => {
            const heading = side === 'original' ? section.heading : section.translated_heading || section.heading;
            const body = side === 'original' ? section.original : section.translated;
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
                className={`rounded-lg px-3 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 ${
                  active ? 'bg-brand-soft/70 ring-1 ring-brand/25' : 'hover:bg-canvas'
                }`}
              >
                <div className="mb-1 flex items-center gap-1.5">
                  <span className="rounded bg-canvas px-1.5 py-0.5 font-mono text-[11px] text-mutedink">
                    {section.id}
                  </span>
                  {heading && (
                    <h3 className="min-w-0 text-[length:var(--type-card)] font-semibold leading-tight text-ink">
                      <Highlighted text={heading} term={search} />
                    </h3>
                  )}
                </div>

                {body ? (
                  <div className={BODY_CLASS[section.kind] || BODY_CLASS.paragraph}>
                    <Highlighted text={body} term={search} />
                  </div>
                ) : side === 'translation' && !heading ? (
                  <p className="text-[14px] italic text-mutedink">{pendingLabel}</p>
                ) : null}
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}