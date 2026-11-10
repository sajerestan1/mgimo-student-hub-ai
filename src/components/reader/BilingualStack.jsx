import SectionBody from './SectionBody';
import { languageLabel, dirFor } from '@/lib/materialTranslation';

// Narrow screens never get two squeezed columns: the bilingual view stacks the
// aligned sections instead, original first, translation directly beneath it.
export default function BilingualStack({ sections, target, source, activeId, onSelect, emptyLabel }) {
  if (!sections.length) {
    return <p className="px-4 py-10 text-center text-[14px] text-mutedink">{emptyLabel}</p>;
  }

  return (
    <div className="space-y-5 px-4 pb-24 pt-4">
      {sections.map((section) => {
        const translated = String(section.translated || '').trim();
        return (
          <article
            key={section.id}
            data-section-id={section.id}
            onClick={() => onSelect(section.id, 'stack')}
            className={`rounded-xl border p-3.5 transition-colors ${
              activeId === section.id ? 'border-brand/30 bg-brand-soft/50' : 'border-line bg-white'
            }`}
          >
            <p className="mb-2 flex items-center gap-1.5 font-mono text-[11px] text-mutedink">
              <span className="rounded bg-canvas px-1.5 py-0.5">{section.id}</span>
              {languageLabel(source)} → {languageLabel(target)}
            </p>

            <div dir={dirFor(source)} className="text-ink/60">
              {section.heading && (
                <h3 className="text-[16px] font-semibold leading-snug text-ink/75">{section.heading}</h3>
              )}
              {section.original ? <SectionBody kind={section.kind} text={section.original} muted /> : null}
            </div>

            <div className="my-3 border-t border-dashed border-line" />

            <div dir={dirFor(target)}>
              {section.translated_heading && (
                <h3 className="text-[17px] font-semibold leading-snug text-ink">{section.translated_heading}</h3>
              )}
              {translated ? (
                <SectionBody kind={section.kind} text={translated} />
              ) : (
                <p className="text-[14px] italic text-mutedink">Awaiting translation</p>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}