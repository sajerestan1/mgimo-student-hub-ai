import PageTitle from '@/components/shell/PageTitle';
import KpiStrip from '@/components/shell/KpiStrip';
import StatusChip from '@/components/shell/StatusChip';
import ProgressBar from '@/components/shell/ProgressBar';
import LoadPanel from '@/components/dean/LoadPanel';
import { gradeTone, nf, num, pct, rateTone, useDeanData } from '@/lib/deanApi';

function Metric({ label, value }) {
  return (
    <div>
      <p className="text-[11px] text-mutedink">{label}</p>
      <p className="mt-0.5 text-[15px] font-semibold tabular-nums text-ink">{value}</p>
    </div>
  );
}

export default function ProgrammesPage() {
  const { data, loading, error } = useDeanData('programmes');
  const rows = data?.rows || [];
  const students = rows.reduce((total, row) => total + row.students, 0);
  const atRisk = rows.reduce((total, row) => total + row.atRisk, 0);

  return (
    <div>
      <PageTitle
        eyebrow="Academic structure"
        title="Academic programmes"
        description="Each degree programme with its faculties, cohort size, year coverage and academic outcome. Programmes are derived from the programmes students are enrolled in."
        meta={[data?.scope ? `Scope: ${data.scope}` : 'Institutional scope', data?.gradeNote]}
      />

      <LoadPanel loading={loading} error={error} hasData={Boolean(data)}>
        {data && (
          <>
            <KpiStrip
              columns={4}
              items={[
                { label: 'Programmes', value: rows.length, hint: 'Offered in scope' },
                { label: 'Students', value: num(students), hint: 'Across all programmes' },
                { label: 'Students at risk', value: atRisk, hint: 'High-risk academic signals' },
                {
                  label: 'Groups',
                  value: rows.reduce((total, row) => total + row.groups, 0),
                  hint: 'Teaching groups in scope',
                },
              ]}
            />

            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {rows.map((programme) => (
                <section key={programme.id} className="card-surface flex flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="text-[17px] font-semibold leading-tight tracking-[-0.01em] text-ink">
                        {programme.name}
                      </h2>
                      <p className="mt-1 text-[12px] leading-snug text-mutedink">{programme.faculty_names}</p>
                    </div>
                    <StatusChip tone={gradeTone(programme.avgGrade)}>{nf(programme.avgGrade)}</StatusChip>
                  </div>

                  <div className="mt-3.5 grid grid-cols-3 gap-2">
                    <Metric label="Students" value={num(programme.students)} />
                    <Metric label="Groups" value={programme.groups} />
                    <Metric label="Years" value={programme.years.join(', ') || '—'} />
                  </div>

                  <div className="mt-3.5 space-y-2.5">
                    <div>
                      <div className="mb-1 flex items-baseline justify-between">
                        <p className="text-[11.5px] text-mutedink">Average grade</p>
                        <p className="text-[11.5px] font-medium tabular-nums text-ink">{nf(programme.avgGrade)}</p>
                      </div>
                      <ProgressBar value={programme.avgGrade || 0} tone={gradeTone(programme.avgGrade)} />
                    </div>
                    <div>
                      <div className="mb-1 flex items-baseline justify-between">
                        <p className="text-[11.5px] text-mutedink">Attendance</p>
                        <p className="text-[11.5px] font-medium tabular-nums text-ink">{pct(programme.attendanceRate)}</p>
                      </div>
                      <ProgressBar value={programme.attendanceRate || 0} tone={rateTone(programme.attendanceRate)} />
                    </div>
                  </div>

                  <div className="mt-3.5 flex flex-wrap items-center gap-1.5 border-t border-line pt-3">
                    <StatusChip tone={programme.atRisk ? 'critical' : 'positive'}>
                      {programme.atRisk} at risk
                    </StatusChip>
                    <StatusChip tone="neutral">{programme.monitoring} monitored</StatusChip>
                  </div>
                </section>
              ))}
            </div>

            {!rows.length && (
              <div className="card-surface mt-4 p-6 text-[length:var(--type-secondary)] text-mutedink">
                No programme is recorded in this scope yet.
              </div>
            )}
          </>
        )}
      </LoadPanel>
    </div>
  );
}