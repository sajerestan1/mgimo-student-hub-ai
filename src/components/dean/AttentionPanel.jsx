import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Info, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ALERTS } from '@/lib/demoUniversity';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';

const SEVERITY = {
  critical: { bar: 'bg-critical', chip: 'bg-[#FBECEC] text-[#A23B3B]', icon: AlertTriangle },
  warning: { bar: 'bg-warning', chip: 'bg-[#FCF3E4] text-[#8E6018]', icon: AlertTriangle },
  info: { bar: 'bg-brand', chip: 'bg-[#EDF1FE] text-[#3B5AE0]', icon: Info },
};

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'critical', label: 'Critical' },
  { key: 'warning', label: 'Warnings' },
];

export default function AttentionPanel() {
  const [filter, setFilter] = useState('all');
  const rows = ALERTS.filter((alert) => filter === 'all' || alert.severity === filter);
  const criticalCount = ALERTS.filter((alert) => alert.severity === 'critical').length;

  return (
    <section className="card-surface flex flex-col overflow-hidden">
      <header className="flex flex-wrap items-center justify-between gap-3 px-5 pb-3 pt-4">
        <div>
          <h2 className="text-[18px] font-semibold leading-tight tracking-[-0.01em] text-ink">Institutional alerts</h2>
          <p className="mt-1 text-[11.5px] text-mutedink">
            {criticalCount} critical signals need a decision this week
          </p>
        </div>
        <div className="flex rounded-lg border border-line bg-canvas p-0.5">
          {FILTERS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilter(item.key)}
              className={cn(
                'rounded-[6px] px-2.5 py-1 text-[11.5px] font-medium transition-colors',
                filter === item.key
                  ? 'bg-white text-ink shadow-[0_1px_2px_rgba(16,27,51,0.08)]'
                  : 'text-mutedink hover:text-ink'
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      <ul className="flex-1 divide-y divide-line border-t border-line">
        {rows.map((alert) => {
          const tone = SEVERITY[alert.severity] || SEVERITY.info;
          const Icon = tone.icon;
          return (
            <li key={alert.id} className="row-hover flex gap-3 px-5 py-3">
              <span className={cn('mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg', tone.chip)}>
                <Icon className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[12.5px] font-medium leading-snug text-ink">{alert.title}</p>
                  {alert.severity === 'critical' && (
                    <span className="chip bg-[#FBECEC] px-1.5 py-0 text-[10px] text-[#A23B3B]">Action needed</span>
                  )}
                </div>
                <p className="mt-1 text-[11.5px] leading-relaxed text-mutedink">{alert.detail}</p>
                <p className="mt-1 text-[10.5px] uppercase tracking-[0.06em] text-mutedink/80">{alert.meta}</p>
              </div>
            </li>
          );
        })}
        {rows.length === 0 && (
          <li className="px-5 py-10 text-center text-[12px] text-mutedink">No signals in this category.</li>
        )}
      </ul>

      <div className="mt-auto border-t border-line px-5 py-3">
        <Link to={P.dean.performance} className="link-quiet">
          Open academic analytics <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
}