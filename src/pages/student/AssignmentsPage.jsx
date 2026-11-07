import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import PageTitle from '@/components/shell/PageTitle';
import StatusChip from '@/components/shell/StatusChip';
import { ASSIGNMENTS, openAssignments, gradedAssignments, formatDate, daysUntil, courseById } from '@/lib/studentWorkspace';

const FILTERS = [
  { key: 'open', label: 'Open', items: openAssignments },
  { key: 'graded', label: 'Graded', items: gradedAssignments },
  { key: 'all', label: 'All', items: [...ASSIGNMENTS].sort((a, b) => daysUntil(a.dueDate) - daysUntil(b.dueDate)) },
];

const STATUS = {
  not_started: { label: 'Not started', tone: 'warning' },
  in_progress: { label: 'In progress', tone: 'brand' },
  graded: { label: 'Graded', tone: 'positive' },
};

function dueLabel(dueDate) {
  const days = daysUntil(dueDate);
  if (days < 0) return `Due ${formatDate(dueDate)}`;
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  return `Due in ${days} days`;
}

export default function AssignmentsPage() {
  const [filter, setFilter] = useState('open');
  const [expanded, setExpanded] = useState(null);
  const active = FILTERS.find((item) => item.key === filter);

  return (
    <div>
      <PageTitle
        eyebrow="Student workspace"
        title="Assignments"
        description="Coursework for your enrolled courses, with the brief, the weighting and where each submission stands."
        meta={[`${openAssignments.length} open`, `${gradedAssignments.length} graded`, 'Fall Semester 2026']}
      />

      <div className="mb-4 flex flex-wrap gap-1.5">
        {FILTERS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setFilter(item.key)}
            className={`rounded-lg px-3 py-1.5 text-[11.5px] font-medium transition-colors ${
              filter === item.key
                ? 'bg-royal text-white'
                : 'border border-line bg-white text-ink hover:bg-canvas'
            }`}
          >
            {item.label}
            <span className={`ml-1.5 ${filter === item.key ? 'text-white/70' : 'text-mutedink'}`}>
              {item.items.length}
            </span>
          </button>
        ))}
      </div>

      <div className="card-surface divide-y divide-line overflow-hidden">
        {active.items.length === 0 ? (
          <p className="px-5 py-10 text-center text-[12px] text-mutedink">Nothing in this list.</p>
        ) : (
          active.items.map((item) => {
            const course = courseById(item.courseId);
            const status = STATUS[item.status];
            const isOpen = expanded === item.id;
            return (
              <div key={item.id} className="px-5 py-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-[12.5px] font-semibold text-ink">{item.title}</p>
                    <p className="mt-1 text-[11px] text-mutedink">
                      {course.code} · {course.title} · {item.weight}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <div className="text-right">
                      <p className="text-[11px] font-medium text-ink">{formatDate(item.dueDate)}</p>
                      <p className="text-[10.5px] text-mutedink">{dueLabel(item.dueDate)}</p>
                    </div>
                    <StatusChip tone={status.tone}>{status.label}</StatusChip>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : item.id)}
                  className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-brand transition-colors hover:text-brand-deep"
                  aria-expanded={isOpen}
                >
                  {isOpen ? 'Hide brief' : 'View brief'}
                  <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                  <p className="mt-2 rounded-lg bg-canvas px-3 py-2.5 text-[11.5px] leading-relaxed text-ink/80">
                    {item.brief}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>

      <p className="mt-4 rounded-lg border border-line bg-white px-4 py-3 text-[11px] leading-relaxed text-mutedink">
        File upload and online submission are not connected in this prototype — the brief and status shown here come
        from the demonstration academic record.
      </p>
    </div>
  );
}