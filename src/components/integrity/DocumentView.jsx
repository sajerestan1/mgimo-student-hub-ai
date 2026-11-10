import { cn } from '@/lib/utils';

export default function DocumentView({ passages }) {
  if (!passages || !passages.length) {
    return <p className="text-[14px] text-mutedink">The analysed text is not available.</p>;
  }

  const flagged = passages.filter((passage) => passage.flagged).length;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-3 text-[12.5px] text-mutedink">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-[#FCF3E4] ring-1 ring-[#EBD9B4]" />
          Matching passage
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-white ring-1 ring-line" />
          Not matched
        </span>
        <span>
          {flagged} of {passages.length} passages flagged for review
        </span>
      </div>
      <div className="max-h-[520px] space-y-2 overflow-y-auto pe-1 scroll-thin">
        {passages.map((passage) => (
          <p
            key={passage.index}
            className={cn(
              'rounded-lg px-3 py-2 text-[15px] leading-[1.7] text-ink',
              passage.flagged ? 'bg-[#FCF3E4] ring-1 ring-[#EBD9B4]' : 'bg-white',
            )}
          >
            {passage.text}
          </p>
        ))}
      </div>
      <p className="mt-3 text-[12.5px] text-mutedink">
        The text is shown exactly as it was submitted. Highlighting follows paragraph boundaries; a highlighted
        paragraph contains at least one matching passage, not necessarily every word of it.
      </p>
    </div>
  );
}