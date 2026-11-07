import Surface from '@/components/shell/Surface';
import ProgressBar from '@/components/shell/ProgressBar';
import StatusChip from '@/components/shell/StatusChip';
import { DEMO_STUDENT } from '@/lib/demoUniversity';

const GPA_ROWS = (student) => [
  { label: 'Current GPA', value: student.gpa, hint: 'Fall Semester 2026' },
  { label: 'Cumulative GPA', value: student.cumulativeGpa, hint: 'All completed terms' },
];

/** Personal academic standing: GPA, standing decision and credit accumulation. */
export default function StandingPanel() {
  const student = DEMO_STUDENT;
  const creditProgress = Math.round((student.creditsEarned / student.creditsRequired) * 100);

  return (
    <Surface
      title="Academic standing"
      subtitle="Personal record · visible only to you"
      action={<StatusChip tone="positive">{student.standing}</StatusChip>}
      bodyClassName="px-5 pb-5 pt-1"
    >
      <dl className="grid grid-cols-2 gap-3">
        {GPA_ROWS(student).map((row) => (
          <div key={row.label} className="rounded-lg bg-canvas px-3 py-2.5">
            <dt className="text-[11px] text-mutedink">{row.label}</dt>
            <dd className="mt-1 text-[21px] font-semibold leading-none tabular-nums text-ink">
              {row.value.toFixed(2)}
              <span className="ml-1 text-[11px] font-normal text-mutedink">/ 5.00</span>
            </dd>
            <p className="mt-1 text-[10.5px] text-mutedink">{row.hint}</p>
          </div>
        ))}
      </dl>

      <div className="mt-4">
        <div className="flex items-baseline justify-between text-[11.5px]">
          <span className="text-mutedink">Credits completed</span>
          <span className="font-semibold tabular-nums text-ink">
            {student.creditsEarned}
            <span className="font-normal text-mutedink"> / {student.creditsRequired}</span>
          </span>
        </div>
        <ProgressBar value={creditProgress} className="mt-2" />
        <div className="mt-1.5 flex items-center justify-between text-[10.5px] text-mutedink">
          <span>{creditProgress}% of the degree</span>
          <span>{student.creditsRemaining} credits remaining</span>
        </div>
      </div>
    </Surface>
  );
}