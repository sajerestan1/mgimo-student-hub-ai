import { useMemo, useState } from 'react';
import { Check, CheckCheck } from 'lucide-react';
import Surface from '@/components/shell/Surface';
import StatusChip from '@/components/shell/StatusChip';
import { dateLabel } from '@/lib/professorData';

const TABS = [
  { key: 'open', label: 'Open' },
  { key: 'acknowledged', label: 'Acknowledged' },
  { key: 'resolved', label: 'Resolved' },
];

const EMPTY = {
  open: 'No student is below your threshold right now.',
  acknowledged: 'You have not acknowledged any alert yet.',
  resolved: 'No alert has been cleared yet.',
};

export default function AlertQueue({ alerts, onAcknowledge, onResolve, busyId }) {
  const [tab, setTab] = useState('open');

  const counts = useMemo(
    () => ({
      open: alerts.filter((alert) => alert.status === 'open').length,
      acknowledged: alerts.filter((alert) => alert.status === 'acknowledged').length,
      resolved: alerts.filter((alert) => alert.status === 'resolved').length,
    }),
    [alerts]
  );

  const visible = alerts.filter((alert) => alert.status === tab);

  return (
    <Surface
      title="Alert queue"
      subtitle="Every breach of the threshold, newest first"
      action={<StatusChip tone={counts.open ? 'critical' : 'positive'}>{counts.open} open</StatusChip>}
      bodyClassName="px-0 pb-0 pt-0"
    >
      <div className="flex gap-1 border-b border-line px-4 py-2">
        {TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
              tab === item.key ? 'bg-royal-soft text-royal' : 'text-mutedink hover:bg-canvas'
            }`}
          >
            {item.label}
            <span className="ml-1 tabular-nums opacity-70">{counts[item.key]}</span>
          </button>
        ))}
      </div>

      <ul className="divide-y divide-line">
        {visible.map((alert) => (
          <li key={alert.id} className="flex flex-wrap items-start gap-3 px-5 py-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <p className="text-[12px] font-medium text-ink">{alert.student_name}</p>
                <StatusChip tone={alert.severity === 'critical' ? 'critical' : 'warning'}>
                  {alert.grade}% avg
                </StatusChip>
              </div>
              <p className="mt-0.5 text-[10.5px] text-mutedink">
                {alert.course_code} · {alert.student_group || 'no group'} · {alert.shortfall} pts below the {alert.threshold}% threshold
              </p>
              <p className="mt-0.5 text-[10px] text-mutedink">
                Raised {dateLabel(alert.detected_at)}
                {alert.status === 'acknowledged' && alert.acknowledged_by ? ` · acknowledged by ${alert.acknowledged_by}` : ''}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              {alert.status === 'open' && (
                <button
                  type="button"
                  onClick={() => onAcknowledge(alert)}
                  disabled={busyId === alert.id}
                  className="btn-quiet btn-sm disabled:opacity-50"
                >
                  <Check className="h-3.5 w-3.5" /> Acknowledge
                </button>
              )}
              {alert.status !== 'resolved' && (
                <button
                  type="button"
                  onClick={() => onResolve(alert)}
                  disabled={busyId === alert.id}
                  className="btn-quiet btn-sm disabled:opacity-50"
                >
                  <CheckCheck className="h-3.5 w-3.5" /> Resolve
                </button>
              )}
            </div>
          </li>
        ))}
        {!visible.length && <li className="px-5 py-8 text-[11.5px] text-mutedink">{EMPTY[tab]}</li>}
      </ul>
    </Surface>
  );
}