import { BookOpen, CalendarCheck, ClipboardList, GraduationCap } from 'lucide-react';

// Every figure is passed in from the student's own LMS records.
export default function SummaryCards({ summary }) {
  const next = summary.openAssignments[0];
  const days = next ? Math.round((new Date(next.dueDate) - new Date()) / 86400000) : 0;

  const cards = [
    {
      key: 'average',
      label: 'Average mark',
      icon: GraduationCap,
      tile: 'bg-[#EEEBFE] text-[#5B4DEB]',
      value: summary.average === null ? '—' : summary.average.toFixed(1),
      suffix: '/ 100',
      hint: `${summary.averageLetter} · credit-weighted across ${summary.courseCount} courses`,
      delta: `${summary.assessmentsRecorded} graded assessment${summary.assessmentsRecorded === 1 ? '' : 's'}`,
      deltaTone: 'text-mutedink',
    },
    {
      key: 'courses',
      label: 'Active courses',
      icon: BookOpen,
      tile: 'bg-[#EAF1FF] text-[#4F75FF]',
      value: String(summary.courseCount),
      suffix: '',
      hint: `${summary.credits} credits this semester`,
      delta: `${summary.modulesCompleted}/${summary.modulesTotal} modules completed`,
      deltaTone: 'text-mutedink',
    },
    {
      key: 'assignments',
      label: 'Assignments due',
      icon: ClipboardList,
      tile: 'bg-[#FEF3E6] text-[#C77C14]',
      value: String(summary.openAssignments.length),
      suffix: '',
      hint: next
        ? `Next in ${days} day${days === 1 ? '' : 's'} · ${next.courseId}`
        : 'Everything recorded so far has been submitted',
      delta: next ? next.title.slice(0, 34) : 'All clear',
      deltaTone: next ? 'text-warning' : 'text-positive',
    },
    {
      key: 'quizzes',
      label: 'Quiz completion',
      icon: CalendarCheck,
      tile: 'bg-[#E6F5F1] text-[#16A085]',
      value: `${summary.quizCompletion}`,
      suffix: '%',
      hint: `${summary.quizAttempted} of ${summary.quizTotal} course quizzes attempted`,
      delta: summary.quizAverage === null ? 'No attempts yet' : `Average ${summary.quizAverage}%`,
      deltaTone: 'text-positive',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <section key={card.key} className="card-surface flex flex-col gap-3 p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[11.5px] font-medium text-mutedink">{card.label}</p>
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${card.tile}`}>
                <Icon className="h-4 w-4" strokeWidth={1.9} />
              </span>
            </div>
            <div>
              <p className="flex items-baseline gap-1 text-[26px] font-semibold leading-none tracking-[-0.03em] tabular-nums text-ink">
                {card.value}
                {card.suffix && <span className="text-[12px] font-medium text-mutedink">{card.suffix}</span>}
              </p>
              <p className="mt-1.5 text-[11px] leading-snug text-mutedink">{card.hint}</p>
            </div>
            <p className={`mt-auto truncate text-[10.5px] font-medium ${card.deltaTone}`}>{card.delta}</p>
          </section>
        );
      })}
    </div>
  );
}