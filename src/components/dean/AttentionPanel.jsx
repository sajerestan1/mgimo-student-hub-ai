import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowUpRight, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ALERTS } from '@/lib/demoUniversity';

const SEVERITY = {
  critical: { dot: 'bg-critical', text: 'text-critical', icon: AlertTriangle, ring: 'bg-critical/10' },
  warning: { dot: 'bg-warning', text: 'text-warning', icon: AlertTriangle, ring: 'bg-warning/10' },
  info: { dot: 'bg-brand', text: 'text-brand', icon: Info, ring: 'bg-brand/10' },
};

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'critical', label: 'Critical' },
  { key: 'warning', label: 'Warnings' },
];

export default function AttentionPanel() {
  const [filter, setFilter] = useState('all');
  const rows = ALERTS.filter((alert) => filter === 'all' || alert.severity === filter);

  return (
    <section className="card-surface overflow-hidden">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EEF1F7] px-4 py-3">
        <div>
          <h2 className="text-[13px] font-semibold tracking-tight text-ink">Requires attention</h2>
          <p className="mt-0.5 text-[11px] text-mutedink">Signals raised from demonstration academic records</p>
        </div>
        <div className="flex rounded-lg bg-[#F4F6FB] p-0.5">
          {FILTERS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilter(item.key)}
              className={cn(
                'rounded-[7px] px-2.5 py-1 text-[11px] font-medium transition-colors',
                filter === item.key ? 'bg-white text-ink shadow-sm' : 'text-mutedink hover:text-ink'
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      <ul className="divide-y divide-[#F0F3F8]">
        {rows.map((alert) => {
          const tone = SEVERITY[alert.severity] || SEVERITY.info;
          const Icon = tone.icon;
          return (
            <li key={alert.id} className="flex gap-3 px-4 py-3">
              <span className={cn('mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md', tone.ring, tone.text)}>
                <Icon className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0">
                <p className="text-[12px] font-medium leading-snug text-ink">{alert.title}</p>
                <p className="mt-0.5 text-[11.5px] leading-relaxed text-mutedink">{alert.detail}</p>
                <p className="mt-1 text-[10.5px] text-mutedink/80">{alert.meta}</p>
              </div>
            </li>
          );
        })}
        {rows.length === 0 && <li className="px-4 py-8 text-center text-[12px] text-mutedink">No signals in this category.</li>}
      </ul>

      <div className="border-t border-[#EEF1F7] px-4 py-2.5">
        <Link to="/analytics" className="inline-flex items-center gap-1 text-[11.5px] font-medium text-brand hover:underline">
          Open academic analytics <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
    </section>
  );
}