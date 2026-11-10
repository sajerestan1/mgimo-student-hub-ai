import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

// CommonMark block starters. These already break a line on their own.
const BLOCK_START = /^\s*(?:[-*+•]\s|\d+[.)]\s|#{1,6}\s|>|```|\|)/;

/**
 * Model answers arrive as Markdown. Without this, the asterisks, hashes and
 * dashes are shown to the reader as characters.
 *
 * Only CommonMark is parsed. Raw HTML in a model answer is never rendered:
 * react-markdown drops it, so no dangerouslySetInnerHTML is involved anywhere.
 */
function normalize(value) {
  const raw = String(value ?? '')
    .replace(/\r\n?/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // CommonMark joins a single newline inside a paragraph with a space, but a
  // model that answers in plain lines means them as line breaks. A two-space
  // ending keeps that newline without touching lists, headings or fences.
  const lines = raw.split('\n');
  return lines
    .map((line, index) => {
      const next = lines[index + 1];
      if (!line.trim() || next === undefined || !next.trim()) return line;
      if (BLOCK_START.test(line) || BLOCK_START.test(next)) return line;
      return line.endsWith('  ') ? line : `${line}  `;
    })
    .join('\n');
}

export default function MarkdownMessage({ children, className }) {
  if (!children) return null;

  return (
    <div
      className={cn(
        'break-words',
        // Paragraph rhythm: one consistent gap, nothing after the last one.
        '[&_p]:mb-2 [&_p:last-child]:mb-0',
        '[&_strong]:font-semibold [&_em]:italic',
        // Section labels are the bold headings the assistant writes.
        '[&_h1]:mb-1.5 [&_h1]:mt-3 [&_h1]:text-[1.12em] [&_h1]:font-semibold [&_h1]:leading-snug',
        '[&_h2]:mb-1.5 [&_h2]:mt-3 [&_h2]:text-[1.08em] [&_h2]:font-semibold [&_h2]:leading-snug',
        '[&_h3]:mb-1 [&_h3]:mt-2.5 [&_h3]:font-semibold [&_h3]:leading-snug',
        '[&_h4]:mb-1 [&_h4]:mt-2.5 [&_h4]:font-semibold [&_h4]:leading-snug',
        '[&_ul]:mb-2 [&_ul]:list-disc [&_ul]:pl-5',
        '[&_ol]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5',
        '[&_li]:mb-1 [&_li:last-child]:mb-0 [&_li]:pl-0.5',
        '[&_li>p]:mb-1 [&_li>p:last-child]:mb-0',
        '[&_li>ul]:mb-1 [&_li>ul]:mt-1',
        '[&_a]:font-medium [&_a]:text-brand [&_a]:underline [&_a]:underline-offset-2',
        '[&_code]:rounded [&_code]:bg-ink/[0.06] [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.92em]',
        '[&_pre]:mb-2 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-ink/[0.06] [&_pre]:p-2.5 [&_pre]:font-mono [&_pre]:text-[0.92em]',
        '[&_pre_code]:bg-transparent [&_pre_code]:p-0',
        '[&_blockquote]:border-l-2 [&_blockquote]:border-line [&_blockquote]:pl-3 [&_blockquote]:text-mutedink',
        '[&_hr]:my-3 [&_hr]:border-line',
        // Nothing pushes the bubble open at the top or bottom.
        '[&>:first-child]:mt-0 [&>:last-child]:mb-0',
        className
      )}
    >
      <ReactMarkdown
        components={{
          a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />,
        }}
      >
        {normalize(children)}
      </ReactMarkdown>
    </div>
  );
}