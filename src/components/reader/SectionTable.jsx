import ReactMarkdown from 'react-markdown';

// A Markdown pipe table rendered as a real table, so the row and column structure
// of the source survives instead of appearing as a wall of "|" characters.
const splitRow = (line) =>
  line
    .replace(/^\s*\|/, '')
    .replace(/\|\s*$/, '')
    .split('|')
    .map((cell) => cell.trim());

const isDivider = (cells) => cells.length > 0 && cells.every((cell) => /^:?-{2,}:?$/.test(cell));

const inline = { p: ({ node, ...props }) => <span {...props} /> };

function Cell({ value, header = false }) {
  const Tag = header ? 'th' : 'td';
  return (
    <Tag
      className={
        header
          ? 'border border-line bg-canvas px-2.5 py-1.5 text-start text-[14.5px] font-semibold text-ink'
          : 'border border-line px-2.5 py-1.5 align-top text-[15px] leading-[1.6] text-ink/85'
      }
    >
      <ReactMarkdown components={inline}>{value}</ReactMarkdown>
    </Tag>
  );
}

export default function SectionTable({ text }) {
  const rows = String(text || '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.includes('|'))
    .map(splitRow)
    .filter((cells) => cells.length > 1 && !isDivider(cells));

  if (!rows.length) return null;
  const [head, ...body] = rows;

  return (
    <div className="scroll-thin mb-1 mt-1 overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {head.map((cell, index) => (
              <Cell key={`h-${index}`} value={cell} header />
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, rowIndex) => (
            <tr key={`r-${rowIndex}`}>
              {head.map((_, cellIndex) => (
                <Cell key={`c-${rowIndex}-${cellIndex}`} value={row[cellIndex] || ''} />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}