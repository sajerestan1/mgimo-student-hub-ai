import { Link } from 'react-router-dom';
import { Radar, ArrowUpRight } from 'lucide-react';
import Panel from '@/components/admin/Panel';
import { DonutBlock } from '@/components/charts/Charts';
import { RiskBadge } from '@/components/admin/StatusPill';

export default function RiskRadarPanel({ analytics }) {
  const { riskCounts } = analytics;
  const data = [
    { label: 'High', value: riskCounts.high },
    { label: 'Medium', value: riskCounts.medium },
    { label: 'Low', value: riskCounts.low },
    { label: 'No current risk', value: riskCounts.none },
  ];
  const total = data.reduce((sum, row) => sum + row.value, 0);

  return (
    <Panel
      title="Academic Risk Radar"
      subtitle="Decision-support indicators requiring human review"
      actions={
        <Link to="/intelligence" className="inline-flex items-center gap-1 text-[11px] font-medium text-navy hover:underline">
          Open <ArrowUpRight className="h-3 w-3" />
        </Link>
      }
      bodyClassName="p-4"
    >
      <div className="flex items-center gap-4">
        <div className="w-[44%] shrink-0">
          <DonutBlock
            data={data}
            height={150}
            colors={['#B05C5A', '#D8B66A', '#4C79A8', '#DCE4EF']}
            centerValue={riskCounts.high + riskCounts.medium}
            centerLabel="flagged"
          />
        </div>
        <ul className="flex-1 space-y-2">
          {data.map((row, index) => (
            <li key={row.label} className="flex items-center gap-2">
              <span
                className="h-2 w-2 shrink-0 rounded-sm"
                style={{ backgroundColor: ['#B05C5A', '#D8B66A', '#4C79A8', '#DCE4EF'][index] }}
              />
              <span className="flex-1 text-[11.5px] text-mutedink">{row.label}</span>
              <span className="text-[12px] font-semibold text-ink">{row.value}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-3 flex items-center justify-between rounded-lg bg-[#F7FAFD] px-3 py-2">
        <span className="inline-flex items-center gap-1.5 text-[10.5px] text-mutedink">
          <Radar className="h-3.5 w-3.5 text-navy" />
          {total} students analysed
        </span>
        <RiskBadge level={riskCounts.high > 0 ? 'high' : 'none'} />
      </div>
    </Panel>
  );
}