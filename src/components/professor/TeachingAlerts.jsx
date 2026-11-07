import { Link } from 'react-router-dom';
import Surface from '@/components/shell/Surface';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';

const TONES = {
  critical: 'bg-[#FBECEC] text-[#A23B3B]',
  warning: 'bg-[#FCF3E4] text-[#8E6018]',
  brand: 'bg-[#EDF1FE] text-[#3B5AE0]',
  neutral: 'bg-[#F2F4F8] text-[#5A6779]',
};

export default function TeachingAlerts({ alerts }) {
  return (
    <Surface title="Teaching notifications" subtitle="Derived from your live course records" bodyClassName="px-0 pb-0 pt-1">
      {alerts.length === 0 && <p className="px-5 py-6 text-[11.5px] text-mutedink">Nothing needs your attention.</p>}
      <ul className="divide-y divide-line">
        {alerts.map((alert) => (
          <li key={alert.id}>
            <Link to={alert.to} className="row-hover flex items-start gap-3 px-5 py-3">
              <span className={`mt-0.5 inline-flex shrink-0 items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.04em] ${TONES[alert.tone]}`}>
                {alert.tag}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[12px] font-medium text-ink">{alert.title}</span>
                <span className="mt-0.5 block truncate text-[10.5px] text-mutedink">{alert.detail}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Surface>
  );
}