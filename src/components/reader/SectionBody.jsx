import ReactMarkdown from 'react-markdown';
import SectionTable from './SectionTable';

// Academic document typography for one section body. The stored text is Markdown,
// so it is parsed rather than printed literally: paragraphs, lists, quotations,
// bold and italic all render as structure instead of raw markers.
const COMPONENTS = {
  p: ({ node, ...props }) => <p className="mb-3 text-[16.5px] leading-[1.75] text-ink/85 last:mb-0" {...props} />,
  ul: ({ node, ...props }) => (
    <ul className="mb-3 list-disc space-y-1.5 ps-5 text-[16.5px] leading-[1.7] text-ink/85" {...props} />
  ),
  ol: ({ node, ...props }) => (
    <ol className="mb-3 list-decimal space-y-1.5 ps-5 text-[16.5px] leading-[1.7] text-ink/85" {...props} />
  ),
  li: ({ node, ...props }) => <li className="ps-0.5" {...props} />,
  blockquote: ({ node, ...props }) => (
    <blockquote
      className="mb-3 border-s-2 border-brand/40 bg-canvas px-3 py-2 text-[16px] italic leading-[1.75] text-ink/75"
      {...props}
    />
  ),
  strong: ({ node, ...props }) => <strong className="font-semibold text-ink" {...props} />,
  em: ({ node, ...props }) => <em className="italic" {...props} />,
  code: ({ node, ...props }) => (
    <code className="rounded bg-canvas px-1 py-0.5 font-mono text-[14.5px] text-ink" {...props} />
  ),
  a: ({ node, ...props }) => (
    <a className="text-brand underline underline-offset-2" target="_blank" rel="noreferrer" {...props} />
  ),
  h1: ({ node, ...props }) => <p className="mb-2 text-[1.1rem] font-semibold leading-[1.35] text-ink" {...props} />,
  h2: ({ node, ...props }) => <p className="mb-2 text-[1.05rem] font-semibold leading-[1.35] text-ink" {...props} />,
  h3: ({ node, ...props }) => <p className="mb-2 text-[1rem] font-semibold leading-[1.4] text-ink" {...props} />,
  hr: () => <div className="my-4 border-t border-line" />,
};

export default function SectionBody({ kind, text, muted = false }) {
  const value = String(text || '').trim();
  if (!value) return null;

  if (kind === 'table') return <SectionTable text={value} />;

  return (
    <div className={muted ? 'opacity-70' : undefined}>
      <ReactMarkdown components={COMPONENTS}>{value}</ReactMarkdown>
    </div>
  );
}