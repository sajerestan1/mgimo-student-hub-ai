import { useNavigate } from 'react-router-dom';
import { Lightbulb, ShieldAlert, ListChecks } from 'lucide-react';
import { BarBlock, LineBlock, DonutBlock, ChartLegend } from '@/components/charts/Charts';

export default function AiAnswer({ response }) {
  const navigate = useNavigate();
  const { answer, findings, actions, visualization, table, limitations } = response;

  const drill = (label) => {
    if (!label) return;
    navigate(`/students?q=${encodeURIComponent(label)}`);
  };

  return (
    <div className="space-y-3">
      {answer && <p className="whitespace-pre-line text-[12.5px] leading-relaxed text-ink">{answer}</p>}

      {visualization && (
        <div className="rounded-xl border border-[#E9EFF7] bg-white p-3">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-mutedink">{visualization.title}</p>
          {visualization.type === 'bar' && <BarBlock data={visualization.data} height={190} onSelect={drill} />}
          {visualization.type === 'line' && <LineBlock data={visualization.data} height={190} />}
          {visualization.type === 'pie' && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="w-full sm:w-[52%]">
                <DonutBlock data={visualization.data} height={170} />
              </div>
              <div className="flex-1">
                <ChartLegend data={visualization.data} />
              </div>
            </div>
          )}
        </div>
      )}

      {table && (
        <div className="overflow-hidden rounded-xl border border-[#E9EFF7]">
          <p className="border-b border-[#E9EFF7] bg-[#F7FAFD] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-mutedink">
            {table.title}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-[11.5px]">
              <thead>
                <tr className="border-b border-[#EEF2F8]">
                  {table.columns.map((column) => (
                    <th key={column} className="px-3 py-1.5 text-[9.5px] font-semibold uppercase tracking-[0.1em] text-mutedink">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    onClick={() => drill(row[0])}
                    className="cursor-pointer border-b border-[#F3F6FA] last:border-0 hover:bg-[#F7FAFD]"
                  >
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className={`px-3 py-1.5 ${cellIndex === 0 ? 'font-medium text-ink' : 'text-mutedink'}`}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {findings.length > 0 && (
        <div className="rounded-xl border border-[#E9EFF7] bg-[#FBFCFE] p-3">
          <p className="mb-1.5 inline-flex items-center gap-1.5 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-mutedink">
            <Lightbulb className="h-3 w-3 text-[#9A7B33]" /> Findings
          </p>
          <ul className="space-y-1">
            {findings.map((finding) => (
              <li key={finding} className="flex gap-2 text-[11.5px] leading-relaxed text-ink">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gold" />
                {finding}
              </li>
            ))}
          </ul>
        </div>
      )}

      {actions.length > 0 && (
        <div className="rounded-xl border border-[#E9EFF7] p-3">
          <p className="mb-1.5 inline-flex items-center gap-1.5 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-mutedink">
            <ListChecks className="h-3 w-3 text-navy" /> Recommended follow-up
          </p>
          <ul className="space-y-1">
            {actions.map((action) => (
              <li key={action} className="text-[11.5px] leading-relaxed text-ink">
                · {action}
              </li>
            ))}
          </ul>
        </div>
      )}

      {limitations && (
        <p className="inline-flex items-start gap-1.5 rounded-lg bg-[#FCF3DF]/60 px-2.5 py-1.5 text-[10.5px] leading-relaxed text-[#8A6C26]">
          <ShieldAlert className="mt-0.5 h-3 w-3 shrink-0" />
          {limitations}
        </p>
      )}
    </div>
  );
}