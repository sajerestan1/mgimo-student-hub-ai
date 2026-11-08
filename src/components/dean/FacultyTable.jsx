import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import ProgressBar from '@/components/shell/ProgressBar';
import StatusChip from '@/components/shell/StatusChip';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';
import { FACULTIES } from '@/lib/demoUniversity';

function Trend({ value }) {
  if (Math.abs(value) < 0.5) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-mutedink">
        <Minus className="h-3 w-3" /> flat
      </span>
    );
  }
  const up = value > 0;
  return (
    <span className={cn('inline-flex items-center gap-0.5 text-[11px] font-medium', up ? 'text-positive' : 'text-critical')}>
      {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
      {Math.abs(value).toFixed(1)}
    </span>
  );
}

export default function FacultyTable() {
  return (
    <div className="overflow-x-auto">
      <table className="hidden w-full min-w-[620px] text-left sm:table">
        <thead>
          <tr className="border-b border-line">
            <th className="table-head px-5 py-2.5 font-semibold">Faculty</th>
            <th className="table-head px-3 py-2.5 text-right font-semibold">Students</th>
            <th className="table-head px-3 py-2.5 text-right font-semibold">GPA</th>
            <th className="table-head px-3 py-2.5 text-right font-semibold">Attendance</th>
            <th className="table-head px-3 py-2.5 text-right font-semibold">Support</th>
            <th className="table-head px-5 py-2.5 text-right font-semibold">Trend</th>
          </tr>
        </thead>
        <tbody>
          {FACULTIES.map((faculty) => (
            <tr key={faculty.id} className="row-hover border-b border-line last:border-0">
              <td className="px-5 py-3">
                <Link to={P.dean.faculties} className="text-[12.5px] font-medium text-ink hover:text-brand hover:underline">
                  {faculty.name}
                </Link>
                <p className="mt-0.5 text-[11px] text-mutedink">{faculty.dean}</p>
              </td>
              <td className="px-3 py-3 text-right text-[12.5px] tabular-nums text-ink">
                {faculty.students.toLocaleString()}
              </td>
              <td className="px-3 py-3 text-right">
                <span className="text-[12.5px] font-semibold tabular-nums text-ink">{faculty.gpa.toFixed(2)}</span>
                <span className="ml-1 text-[10.5px] text-mutedink">/ 5</span>
              </td>
              <td className="px-3 py-3">
                <div className="ml-auto w-24">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[12px] tabular-nums text-ink">{faculty.attendance}%</span>
                  </div>
                  <ProgressBar
                    value={faculty.attendance}
                    tone={faculty.attendance >= 90 ? 'positive' : 'warning'}
                    className="mt-1.5 h-1"
                  />
                </div>
              </td>
              <td className="px-3 py-3 text-right">
                <StatusChip tone={faculty.support > 60 ? 'critical' : 'neutral'} className="tabular-nums">
                  {faculty.support}
                </StatusChip>
              </td>
              <td className="px-5 py-3 text-right">
                <Trend value={faculty.trend} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="divide-y divide-line sm:hidden">
        {FACULTIES.map((faculty) => (
          <li key={faculty.id} className="px-4 py-3.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <Link to={P.dean.faculties} className="text-[13px] font-medium text-ink hover:text-brand">
                  {faculty.name}
                </Link>
                <p className="mt-0.5 text-[11px] text-mutedink">{faculty.dean}</p>
              </div>
              <Trend value={faculty.trend} />
            </div>
            <dl className="mt-2.5 grid grid-cols-4 gap-2 text-center">
              {[
                ['Students', faculty.students.toLocaleString()],
                ['GPA', faculty.gpa.toFixed(2)],
                ['Attend.', `${faculty.attendance}%`],
                ['Support', faculty.support],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg bg-canvas px-1 py-1.5">
                  <dt className="text-[10.5px] text-mutedink">{label}</dt>
                  <dd className="mt-0.5 text-[12px] font-medium tabular-nums text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </div>
  );
}