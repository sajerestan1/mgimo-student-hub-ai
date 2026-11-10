import { useCallback, useEffect, useState } from 'react';
import PageTitle from '@/components/shell/PageTitle';
import AssignmentList from '@/components/student/AssignmentList';
import { loadStudentPortal } from '@/lib/studentPortal';
import { useI18n } from '@/i18n/I18nProvider';

const FILTERS = [
  { key: 'todo', keyLabel: 'student.assignments.filters.todo', match: (row) => row.state === 'pending' || row.state === 'overdue' },
  { key: 'submitted', keyLabel: 'student.assignments.filters.submitted', match: (row) => row.state === 'submitted' },
  { key: 'graded', keyLabel: 'student.assignments.filters.graded', match: (row) => row.state === 'graded' },
  { key: 'all', keyLabel: 'student.assignments.filters.all', match: () => true },
];

export default function AssignmentsPage() {
  const { t } = useI18n();
  const [context, setContext] = useState(null);
  const [filter, setFilter] = useState('todo');
  const [failed, setFailed] = useState(false);

  const load = useCallback(
    () =>
      loadStudentPortal({ fresh: true })
        .then(setContext)
        .catch(() => setFailed(true)),
    []
  );

  useEffect(() => {
    load();
  }, [load]);

  if (failed) {
    return <p className="card-surface px-5 py-6 text-[15px] text-critical">{t('student.assignments.error')}</p>;
  }
  if (!context) return <div className="h-64 animate-pulse rounded-xl bg-white" />;

  const rows = context.assignments || [];
  const todoCount = (context.summary.pending || 0) + (context.summary.overdue || 0);
  const gradedCount = rows.filter((row) => row.state === 'graded').length;

  if (!context.linked) {
    return (
      <div>
        <PageTitle eyebrow={t('student.assignments.eyebrow')} title={t('student.assignments.title')} />
        <p className="card-surface px-5 py-8 text-[15px] text-mutedink">
          {context.scopeNote || t('student.common.notLinked')}
        </p>
      </div>
    );
  }

  return (
    <div>
      <PageTitle
        eyebrow={t('student.assignments.eyebrow')}
        title={t('student.assignments.title')}
        description={t('student.assignments.description')}
        meta={[
          t('student.assignments.metaTodo', { count: todoCount }),
          t('student.assignments.metaGraded', { count: gradedCount }),
          t('student.assignments.metaOverdue', { count: context.summary.overdue }),
        ]}
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
              {t(item.keyLabel)}
              <span className={`ms-1.5 ${active ? 'text-white/70' : 'text-mutedink'}`}>{count}</span>
            </button>
          );
        })}
      </div>

      <div className="card-surface overflow-hidden">
        {rows.length === 0 ? (
          <p className="px-5 py-8 text-center text-[15px] text-mutedink">{t('student.assignments.empty')}</p>
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