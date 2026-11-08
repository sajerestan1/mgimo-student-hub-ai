import { useCallback, useEffect, useState } from 'react';
import PageTitle from '@/components/shell/PageTitle';
import AssignmentList from '@/components/student/AssignmentList';
import { loadStudentPortal } from '@/lib/studentPortal';

const FILTERS = [
  { key: 'todo', label: 'To do', match: (row) => row.state === 'pending' || row.state === 'overdue' },
  { key: 'submitted', label: 'Submitted', match: (row) => row.state === 'submitted' },
  { key: 'graded', label: 'Graded', match: (row) => row.state === 'graded' },
  { key: 'all', label: 'All', match: () => true },
];

export default function AssignmentsPage() {
  const [context, setContext] = useState(null);
  const [filter, setFilter] = useState('todo');
  const [error, setError] = useState('');

  const load = useCallback(
    () =>
      loadStudentPortal({ fresh: true })
        .then(setContext)
        .catch(() => setError('Your assignments could not be loaded. Please refresh the page.')),
    []
  );

  useEffect(() => {
    load();
  }, [load]);

  if (error) return <p className="card-surface px-5 py-6 text-[15px] text-critical">{error}</p>;
  if (!context) return <div className="h-64 animate-pulse rounded-xl bg-white" />;

  const rows = context.assignments || [];
  const todoCount = (context.summary.pending || 0) + (context.summary.overdue || 0);
  const gradedCount = rows.filter((row) => row.state === 'graded').length;

  if (!context.linked) {
    return (
      <div>
        <PageTitle eyebrow="Student workspace" title="Assignments" />
        <p className="card-surface px-5 py-8 text-[15px] text-mutedink">
          {context.scopeNote || 'Your account is not linked to a student record yet.'}
        </p>
      </div>
    );
  }

  return (
    <div>
      <PageTitle
        eyebrow="Student workspace"
        title="Assignments"
        description="Every piece of coursework set for your enrolled courses, with its deadline and where your submission stands."
        meta={[`${todoCount} to do`, `${gradedCount} graded`, `${context.summary.overdue} overdue`]}
      />

      <div className="mb-4 flex flex-wrap gap-1.5">
        {FILTERS.map((item) => {
          const count = rows.filter(item.match).length;
          const active = filter === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilter(item.key)}
              className={`rounded-lg px-3 py-1.5 text-[14px] font-medium transition-colors ${
                active ? 'bg-royal text-white' : 'border border-line bg-white text-ink hover:bg-canvas'
              }`}
            >
              {item.label}
              <span className={`ml-1.5 ${active ? 'text-white/70' : 'text-mutedink'}`}>{count}</span>
            </button>
          );
        })}
      </div>

      <div className="card-surface overflow-hidden">
        {rows.length === 0 ? (
          <p className="px-5 py-8 text-center text-[15px] text-mutedink">
            No assignments have been published for your courses yet.
          </p>
        ) : (
          <AssignmentList
            rows={rows.filter(FILTERS.find((item) => item.key === filter).match)}
            profile={context.profile}
            onChanged={load}
          />
        )}
      </div>
    </div>
  );
}