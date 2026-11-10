import { Link } from 'react-router-dom';
import { ListChecks } from 'lucide-react';
import Surface from '@/components/shell/Surface';
import StatusChip from '@/components/shell/StatusChip';
import PanelTitle from './PanelTitle';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';
import { dueLabel, daysUntil } from '@/lib/studentPortal';
import { useI18n } from '@/i18n/I18nProvider';

/**
 * The three most urgent real items: overdue work first, then the nearest
 * deadline, then a closing quiz.
 */
export default function PriorityTasks({ context }) {
  const { t } = useI18n();
  const rows = [];

  context.assignments
    .filter((row) => row.state === 'overdue')
    .slice(0, 2)
    .forEach((row) =>
      rows.push({
        id: `a-${row.id}`,
        title: row.title,
        meta: `${row.courseCode} · ${dueLabel(row.dueDate, t)}`,
        chip: { label: t('student.dashboard.chips.overdue'), tone: 'critical' },
        to: P.student.assignments,
      })
    );

  context.assignments
    .filter((row) => row.state === 'pending' && daysUntil(row.dueDate) !== null && daysUntil(row.dueDate) >= 0)
    .sort((a, b) => daysUntil(a.dueDate) - daysUntil(b.dueDate))
    .slice(0, 1)
    .forEach((row) =>
      rows.push({
        id: `a-${row.id}`,
        title: row.title,
        meta: `${row.courseCode} · ${dueLabel(row.dueDate, t)}`,
        chip: { label: t('student.dashboard.chips.dueSoon'), tone: 'warning' },
        to: P.student.assignments,
      })
    );

  context.quizzes
    .filter((quiz) => quiz.state !== 'graded' && daysUntil(quiz.availableUntil) !== null)
    .sort((a, b) => daysUntil(a.availableUntil) - daysUntil(b.availableUntil))
    .slice(0, 1)
    .forEach((quiz) =>
      rows.push({
        id: `q-${quiz.id}`,
        title: quiz.title,
        meta: t('student.dashboard.quizMeta', {
          code: quiz.courseCode,
          due: dueLabel(quiz.availableUntil, t),
        }),
        chip: { label: t('student.dashboard.chips.quiz'), tone: 'brand' },
        to: P.student.quizzes,
      })
    );

  const shown = rows.slice(0, 3);

  return (
    <Surface
      className="h-full"
      title={<PanelTitle icon={ListChecks} tone="warning">{t('student.dashboard.priorityTasks')}</PanelTitle>}
      action={
        <Link to={P.student.assignments} className="link-quiet text-[14px]">
          {t('student.dashboard.allWork')}
        </Link>
      }
      bodyClassName={shown.length ? 'px-0 pb-0 pt-0' : undefined}
    >
      {shown.length ? (
        <ul className="divide-y divide-line">
          {shown.map((row) => (
            <li key={row.id}>
              <Link to={row.to} className="row-hover flex items-start justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-medium text-ink">{row.title}</p>
                  <p className="mt-0.5 text-[13px] text-mutedink">{row.meta}</p>
                </div>
                <StatusChip tone={row.chip.tone}>{row.chip.label}</StatusChip>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[14px] leading-relaxed text-mutedink">{t('student.dashboard.nothingUrgent')}</p>
      )}
    </Surface>
  );
}