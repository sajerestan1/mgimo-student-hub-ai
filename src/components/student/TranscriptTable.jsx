import StatusChip from '@/components/shell/StatusChip';
import { letterFor } from '@/lib/lms';
import { useI18n } from '@/i18n/I18nProvider';

const toneFor = (score) => (score === null ? 'neutral' : score >= 85 ? 'positive' : score >= 70 ? 'brand' : 'warning');

const COMPLETION = {
  completed: { labelKey: 'student.grades.completion.completed', tone: 'positive' },
  in_progress: { labelKey: 'student.grades.completion.inProgress', tone: 'brand' },
  not_started: { labelKey: 'student.grades.completion.notStarted', tone: 'neutral' },
};

// The student's own current-semester results, one row per enrolled course.
export default function TranscriptTable({ rows }) {
  const { t } = useI18n();

  if (!rows.length) {
    return <p className="px-5 py-6 text-[13px] text-mutedink">{t('student.grades.transcript.empty')}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse text-start">
        <thead>
          <tr className="border-y border-line bg-[#FAFBFD]">
            <th className="table-head px-5 py-2 text-start">{t('student.grades.transcript.course')}</th>
            <th className="table-head px-3 py-2 text-end">{t('student.grades.transcript.credits')}</th>
            <th className="table-head px-3 py-2 text-end">{t('student.grades.transcript.score')}</th>
            <th className="table-head px-3 py-2 text-end">{t('student.grades.transcript.grade')}</th>
            <th className="table-head px-5 py-2 text-start">{t('student.grades.transcript.status')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const completion = COMPLETION[row.completion] || COMPLETION.not_started;
            return (
              <tr key={row.code} className="row-hover border-b border-line/70 last:border-b-0">
                <td className="px-5 py-2">
                  <p className="text-[13px] text-ink">
                    <span className="font-mono text-[13px] text-mutedink">{row.code}</span>
                    <span className="mx-1.5 text-line">·</span>
                    {row.title}
                  </p>
                  <p className="text-[13px] text-mutedink">{row.professor}</p>
                </td>
                <td className="px-3 py-2 text-end text-[13px] tabular-nums text-mutedink">{row.credits}</td>
                <td className="px-3 py-2 text-end text-[13px] font-semibold tabular-nums text-ink">
                  {row.score === null ? '—' : row.score.toFixed(1)}
                </td>
                <td className="px-3 py-2 text-end">
                  <StatusChip tone={toneFor(row.score)}>{letterFor(row.score)}</StatusChip>
                </td>
                <td className="px-5 py-2">
                  <StatusChip tone={completion.tone}>{t(completion.labelKey)}</StatusChip>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}