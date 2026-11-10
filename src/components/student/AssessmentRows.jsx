import StatusChip from '@/components/shell/StatusChip';
import { shortDate } from '@/lib/studentCourses';
import { useI18n } from '@/i18n/I18nProvider';

const STATUS = {
  graded: { labelKey: 'student.grades.states.graded', tone: 'positive' },
  awaiting_grading: { labelKey: 'student.grades.states.awaiting_grading', tone: 'warning' },
  missing: { labelKey: 'student.grades.states.missing', tone: 'critical' },
  not_submitted: { labelKey: 'student.grades.states.not_submitted', tone: 'neutral' },
};

const date = (value, language) =>
  value ? new Date(value).toLocaleDateString(language, { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

// One course's assessment records, exactly as the LMS gradebook calculates them.
export default function AssessmentRows({ rows }) {
  const { t, language } = useI18n();

  if (!rows.length) {
    return <p className="px-1 py-3 text-[13px] text-mutedink">{t('student.grades.rows.empty')}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[620px] text-start">
        <thead>
          <tr className="border-b border-line">
            <th className="table-head py-2 pe-3 text-start">{t('student.grades.rows.assessment')}</th>
            <th className="table-head px-3 py-2 text-start">{t('student.grades.rows.category')}</th>
            <th className="table-head px-3 py-2 text-end">{t('student.grades.rows.score')}</th>
            <th className="table-head px-3 py-2 text-end">{t('student.grades.rows.contribution')}</th>
            <th className="table-head px-3 py-2 text-start">{t('student.grades.rows.graded')}</th>
            <th className="table-head py-2 ps-3 text-start">{t('student.grades.rows.status')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const status = STATUS[row.status] || STATUS.not_submitted;
            return (
              <tr key={row.id} className="border-b border-line/70 last:border-b-0">
                <td className="py-2.5 pe-3">
                  <p className="text-[13px] text-ink">{row.title}</p>
                  {row.feedback && (
                    <p className="mt-0.5 max-w-sm text-[13px] leading-relaxed text-mutedink">{row.feedback}</p>
                  )}
                  {row.late && <p className="text-[13px] text-warning">{t('student.grades.rows.late')}</p>}
                </td>
                <td className="px-3 py-2.5 text-[13px] text-mutedink">{row.categoryLabel}</td>
                <td className="px-3 py-2.5 text-end text-[13px] tabular-nums text-ink">
                  {row.score === null ? '—' : `${row.score}/${row.max}`}
                </td>
                <td className="px-3 py-2.5 text-end text-[13px] tabular-nums text-mutedink">
                  {row.contribution === null ? '—' : t('student.grades.rows.points', { points: row.contribution })}
                </td>
                <td className="px-3 py-2.5 text-[13px] text-mutedink">{date(row.gradedAt, language)}</td>
                <td className="py-2.5 ps-3">
                  <StatusChip tone={status.tone}>{t(status.labelKey)}</StatusChip>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}