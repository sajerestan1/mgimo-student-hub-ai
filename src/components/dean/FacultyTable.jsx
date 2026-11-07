import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FACULTIES } from '@/lib/demoUniversity';

function Trend({ value }) {
  if (Math.abs(value) < 0.5) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10.5px] text-mutedink">
        <Minus className="h-3 w-3" /> flat
      </span>
    );
  }
  const up = value > 0;
  return (
    <span className={cn('inline-flex items-center gap-0.5 text-[10.5px] font-medium', up ? 'text-positive' : 'text-critical')}>
      {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {Math.abs(value).toFixed(1)}
    </span>
  );
}

export default function FacultyTable() {
  return (
    <div>
      <table className="hidden w-full text-left sm:table">
        <thead>
          <tr className="border-b border-[#EEF1F7] text-[10.5px] font-medium text-mutedink">
            <th className="px-4 py-2 font-medium">Faculty</th>
            <th className="px-3 py-2 text-right font-medium">Students</th>
            <th className="px-3 py-2 text-right font-medium">GPA</th>
            <th className="px-3 py-2 text-right font-medium">Attendance</th>
            <th className="px-3 py-2 text-right font-medium">Support needed</th>
            <th className="px-4 py-2 text-right font-medium">Trend</th>
          </tr>
        </thead>
        <tbody>
          {FACULTIES.map((faculty) => (
            <tr key={faculty.id} className="border-b border-[#F3F5FA] last:border-0">
              <td className="px-4 py-2.5">
                <p className="text-[12px] font-medium text-ink">{faculty.name}</p>
                <p className="text-[10.5px] text-mutedink">{faculty.dean}</p>
              </td>
              <td className="px-3 py-2.5 text-right text-[12px] text-ink">{faculty.students.toLocaleString()}</td>
              <td className="px-3 py-2.5 text-right text-[12px] font-medium text-ink">{faculty.gpa.toFixed(2)}</td>
              <td className="px-3 py-2.5 text-right text-[12px] text-ink">{faculty.attendance}%</td>
              <td className="px-3 py-2.5 text-right text-[12px] text-ink">{faculty.support}</td>
              <td className="px-4 py-2.5 text-right">
                <Trend value={faculty.trend} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="divide-y divide-[#F3F5FA] sm:hidden">
        {FACULTIES.map((faculty) => (
          <li key={faculty.id} className="px-4 py-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[12.5px] font-medium text-ink">{faculty.name}</p>
                <p className="text-[10.5px] text-mutedink">{faculty.dean}</p>
              </div>
              <Trend value={faculty.trend} />
            </div>
            <dl className="mt-2 grid grid-cols-4 gap-1 text-center">
              <div className="rounded-lg bg-[#F6F8FC] px-1 py-1.5">
                <dt className="text-[9.5px] text-mutedink">Students</dt>
                <dd className="text-[11.5px] font-medium text-ink">{faculty.students}</dd>
              </div>
              <div className="rounded-lg bg-[#F6F8FC] px-1 py-1.5">
                <dt className="text-[9.5px] text-mutedink">GPA</dt>
                <dd className="text-[11.5px] font-medium text-ink">{faculty.gpa.toFixed(2)}</dd>
              </div>
              <div className="rounded-lg bg-[#F6F8FC] px-1 py-1.5">
                <dt className="text-[9.5px] text-mutedink">Attend.</dt>
                <dd className="text-[11.5px] font-medium text-ink">{faculty.attendance}%</dd>
              </div>
              <div className="rounded-lg bg-[#F6F8FC] px-1 py-1.5">
                <dt className="text-[9.5px] text-mutedink">Support</dt>
                <dd className="text-[11.5px] font-medium text-ink">{faculty.support}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </div>
  );
}