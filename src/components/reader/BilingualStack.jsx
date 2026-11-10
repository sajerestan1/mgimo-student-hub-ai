import { languageLabel, dirFor } from '@/lib/materialTranslation';

// Narrow screens never get two squeezed columns: the bilingual view stacks the
// aligned sections instead, original first, translation directly beneath it.
export default function BilingualStack({ sections, target, source, activeId, onSelect, emptyLabel }) {
  if (!sections.length) {
    return <p className="px-4 py-10 text-center text-[14px] text-mutedink">{emptyLabel}</p>;
  }

  return (
    <div className="space-y-5 px-4 py-4">
      {sections.map((section) => (
        <article
          key={section.id}
          data-section-id={section.id}
          onClick={() => onSelect(section.id, 'stack')}
          className={`rounded-xl border p-3 transition-colors ${
            activeId === section.id ? 'border-brand/30 bg-brand-soft/50' : 'border-line bg-white'
          }`}
        >
          <p className="mb-2 flex items-center gap-1.5 font-mono text-[11px] text-mutedink">
            <span className="rounded bg-canvas px-1.5 py-0.5">{section.id}</span>
            {languageLabel(source)} → {languageLabel(target)}
          </p>

          <div dir={dirFor(source)}>
            {section.heading && (
              <h3 className="text-[17px] font-semibold leading-snug text-ink">{section.heading}</h3>
            )}
            {section.original && (
              <p
                className={`mt-1 text-[15.5px] leading-[1.7] text-ink/70 ${
                  section.kind === 'list' || section.kind === 'table' ? 'whitespace-pre-wrap' : ''
                }`}
              >
                {section.original}
              </p>
            )}
          </div>

          <div className="my-2 border-t border-dashed border-line" />

          <div dir={dirFor(target)}>
            {section.translated_heading && (
              <h3 className="text-[17px] font-semibold leading-snug text-ink">{section.translated_heading}</h3>
            )}
            {section.translated ? (
              <p
                className={`mt-1 text-[16px] leading-[1.75] text-ink ${
                  section.kind === 'list' || section.kind === 'table' ? 'whitespace-pre-wrap' : ''
                }`}
              >
                {section.translated}
              </p>
            ) : (
              <p className="mt-1 text-[14px] italic text-mutedink">
                {section.translated_heading ? '' : 'Awaiting translation'}
              </p>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}