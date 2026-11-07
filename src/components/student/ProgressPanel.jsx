import { ArrowUpRight } from 'lucide-react';
import Surface from '@/components/shell/Surface';
import ProgressBar from '@/components/shell/ProgressBar';
import { StudentGpaChart } from '@/components/dean/DeanCharts';
import { DEMO_STUDENT } from '@/lib/demoUniversity';

export default function ProgressPanel() {
  const student = DEMO_STUDENT;
  const creditProgress = Math.round((student.creditsEarned / student.creditsRequired) * 100);

  return (
    <Surface title="Academic progress" subtitle="GPA across the last five terms" bodyClassName="px-5 pb-5 pt-2">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[30px] font-semibold leading-none tracking-[-0.03em] tabular-nums text-ink">{student.gpa.toFixed(2)}</p>
          <p className="mt-1.5 text-[11.5px] text-mutedink">
            <span className="inline-flex items-center gap-0.5 font-medium text-positive">
              <ArrowUpRight className="h-3.5 w-3.5" /> 0.04
            </span>{' '}
            vs Spring 26 · top 12% of cohort
          </p>
        </div>
        <span className="chip bg-[#E9F5EF] text-[#1D7A50]">On track</span>
      </div>

      <div className="-mx-1 mt-2">
        <StudentGpaChart data={student.progress} />
      </div>

      <dl className="mt-3 space-y-3 border-t border-line pt-3.5">
        <div>
          <div className="flex items-baseline justify-between text-[11.5px]">
            <dt className="text-mutedink">Credits completed</dt>
            <dd className="font-semibold tabular-nums text-ink">
              {student.creditsEarned}
              <span className="font-normal text-mutedink"> / {student.creditsRequired}</span>
            </dd>
          </div>
          <ProgressBar value={creditProgress} className="mt-2" />
        </div>
        <div>
          <div className="flex items-baseline justify-between text-[11.5px]">
            <dt className="text-mutedink">Attendance</dt>
            <dd className="font-semibold tabular-nums text-positive">{student.attendance}%</dd>
          </div>
          <ProgressBar value={student.attendance} tone="positive" className="mt-2" />
          <p className="mt-1.5 text-[10.5px] text-mutedink">Requirement is 85% per course</p>
        </div>
      </dl>
    </Surface>
  );
}