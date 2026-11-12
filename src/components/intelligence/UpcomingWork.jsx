import { Link } from 'react-router-dom';
import { Clock, FileWarning } from 'lucide-react';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';
import { dueLabel } from '@/lib/studentPortal';
import { useI18n } from '@/i18n/I18nProvider';

function Row({ label, meta, to }) {
  const { t } = useI18n();
  return (
    <li className="flex items-start justify-between gap-3 py-2">
      <div className="min-w-0">
        <p className="truncate text-[13.5px] font-medium text-ink">{label}</p>
        <p className="mt-0.5 text-[12.5px] text-mutedink">{meta}</p>
      </div>
      <Link to={to} className="shrink-0 text-[12.5px] font-medium text-brand hover:underline">{t('intel.work.open')}</Link>
    </li>
  );
}

export default function UpcomingWork({ work }) {
  const { t } = useI18n();
  return (
    <div className="space-y-4">
      <div>
        <p className="flex items-center gap-1.5 text-[12.5px] font-semibold uppercase tracking-[0.08em] text-critical">
          <FileWarning className="h-3.5 w-3.5" /> {t('intel.work.overdue', { count: work.overdue.length })}
        </p>
        {work.overdue.length ? (
          <ul className="mt-1 divide-y divide-line">
            {work.overdue.slice(0, 4).map((row) => (
              <Row key={row.id} label={`${row.courseCode} · ${row.title}`} meta={dueLabel(row.dueDate)} to={P.student.assignments} />
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-[13px] text-mutedink">{t('intel.work.nothingOverdue')}</p>
        )}
      </div>

      <div>
        <p className="flex items-center gap-1.5 text-[12.5px] font-semibold uppercase tracking-[0.08em] text-mutedink">
          <Clock className="h-3.5 w-3.5" /> {t('intel.work.upcomingAssignments', { count: work.upcomingAssignments.length })}
        </p>
        {work.upcomingAssignments.length ? (
          <ul className="mt-1 divide-y divide-line">
            {work.upcomingAssignments.slice(0, 4).map((row) => (
              <Row key={row.id} label={`${row.courseCode} · ${row.title}`} meta={`${row.type} · ${dueLabel(row.dueDate)}`} to={P.student.assignments} />
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-[13px] text-mutedink">{t('intel.work.noUpcoming')}</p>
        )}
      </div>

      <div>
        <p className="flex items-center gap-1.5 text-[12.5px] font-semibold uppercase tracking-[0.08em] text-mutedink">
          <Clock className="h-3.5 w-3.5" /> {t('intel.work.upcomingAssessments', { count: work.upcomingAssessments.length })}
        </p>
        {work.upcomingAssessments.length ? (
          <ul className="mt-1 divide-y divide-line">
            {work.upcomingAssessments.slice(0, 4).map((quiz) => (
              <Row
                key={quiz.id}
                label={`${quiz.courseCode} · ${quiz.title}`}
                meta={`${t('intel.work.attempts', { done: quiz.attempts, limit: quiz.attemptLimit })} · ${quiz.availableUntil ? dueLabel(quiz.availableUntil) : t('intel.work.noClosingDate')}`}
                to={P.student.quizzes}
              />
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-[13px] text-mutedink">{t('intel.work.noAssessments')}</p>
        )}
      </div>
    </div>
  );
}