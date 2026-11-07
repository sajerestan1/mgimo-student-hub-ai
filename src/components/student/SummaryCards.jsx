import { BookOpen, CalendarCheck, ClipboardList, GraduationCap } from 'lucide-react';
import { SUMMARY, daysUntil } from '@/lib/studentWorkspace';

const CARDS = [
  {
    key: 'average',
    label: 'Average mark',
    icon: GraduationCap,
    tile: 'bg-[#EEEBFE] text-[#5B4DEB]',
    value: `${SUMMARY.averageMark.toFixed(1)}`,
    suffix: '/ 100',
    hint: `${SUMMARY.averageLetter} · weighted across ${SUMMARY.activeCourses} courses`,
    delta: '+6.2 vs Spring 26',
    deltaTone: 'text-positive',
  },
  {
    key: 'courses',
    label: 'Active courses',
    icon: BookOpen,
    tile: 'bg-[#EAF1FF] text-[#4F75FF]',
    value: String(SUMMARY.activeCourses),
    suffix: '',
    hint: 'Fall Semester 2026 · 19 credits',
    delta: 'Week 10 of 16',
    deltaTone: 'text-mutedink',
  },
  {
    key: 'assignments',
    label: 'Assignments due',
    icon: ClipboardList,
    tile: 'bg-[#FEF3E6] text-[#C77C14]',
    value: String(SUMMARY.assignmentsDue),
    suffix: '',
    hint: SUMMARY.nextDeadline
      ? `Closest in ${daysUntil(SUMMARY.nextDeadline.dueDate)} days`
      : 'Nothing outstanding',
    delta: SUMMARY.nextDeadline ? SUMMARY.nextDeadline.courseId : 'All clear',
    deltaTone: 'text-warning',
  },
  {
    key: 'attendance',
    label: 'Attendance',
    icon: CalendarCheck,
    tile: 'bg-[#E6F5F1] text-[#16A085]',
    value: `${SUMMARY.attendanceRate}`,
    suffix: '%',
    hint: 'Requirement is 85% per course',
    delta: 'All courses above 80%',
    deltaTone: 'text-positive',
  },
];

export default function SummaryCards() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {CARDS.map((card) => {
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
            <p className={`mt-auto text-[10.5px] font-medium ${card.deltaTone}`}>{card.delta}</p>
          </section>
        );
      })}
    </div>
  );
}