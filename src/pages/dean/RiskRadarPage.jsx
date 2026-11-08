import { useState } from 'react';
import { Radar, ShieldAlert } from 'lucide-react';
import PageTitle from '@/components/shell/PageTitle';
import KpiStrip from '@/components/shell/KpiStrip';
import Surface from '@/components/shell/Surface';
import StatusChip from '@/components/shell/StatusChip';
import DataTable from '@/components/dean/DataTable';
import DeanToolbar from '@/components/dean/DeanToolbar';
import LoadPanel from '@/components/dean/LoadPanel';
import StudentDetail from '@/components/dean/StudentDetail';
import { RiskFacultyChart } from '@/components/dean/InstitutionCharts';
import { RISK_LABELS, RISK_TONES, nf, num, pct, useDeanData } from '@/lib/deanApi';

const COLUMNS = [
  {
    key: 'full_name',
    label: 'Student',
    render: (row) => (
      <div>
        <p className="font-medium text-ink">{row.full_name}</p>
        <p className="mt-0.5 text-[12.5px] text-mutedink">
          {row.student_id} · {row.group_name} · {row.faculty_code}
        </p>
      </div>
    ),
  },
  {
    key: 'signals',
    label: 'Support signals',
    render: (row) => (
      <ul className="space-y-0.5">
        {row.labels.map((label) => (
          <li key={label} className="text-[12.5px] text-mutedink">
            {label}
          </li>
        ))}
      </ul>
    ),
  },
  {
    key: 'avgGrade',
    label: 'Avg grade',
    align: 'right',
    render: (row) => <StatusChip tone={row.riskLevel === 'high' ? 'critical' : 'warning'}>{nf(row.avgGrade)}</StatusChip>,
  },
  { key: 'attendanceRate', label: 'Attendance', align: 'right', render: (row) => pct(row.attendanceRate) },
  {
    key: 'riskLevel',
    label: 'Severity',
    align: 'right',
    render: (row) => <StatusChip tone={RISK_TONES[row.riskLevel]}>{RISK_LABELS[row.riskLevel]}</StatusChip>,
  },
];

export default function RiskRadarPage() {
  const { data, loading, error } = useDeanData('risk');
  const [faculty, setFaculty] = useState('');
  const [level, setLevel] = useState('');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);

  const all = data?.rows || [];
  const needle = query.trim().toLowerCase();
  const rows = all.filter((row) => {
    if (faculty && row.faculty_id !== faculty) return false;
    if (level && row.riskLevel !== level) return false;
    if (!needle) return true;
    return [row.full_name, row.student_id, row.group_name, row.programme].join(' ').toLowerCase().includes(needle);
  });

  const counts = data?.counts || { high: 0, medium: 0, low: 0, monitoring: 0, total: 0 };

  return (
    <div>
      <PageTitle
        eyebrow="Intelligence"
        title="Academic risk radar"
        description="Students whose recorded average or attendance has crossed an institutional threshold, ranked by severity. Each signal names the measure that triggered it."
        meta={[
          data?.scope ? `Scope: ${data.scope}` : 'Institutional scope',
          'Grade floor 60 · attendance floor 75%',
          'Signals, not decisions',
        ]}
      />

      <LoadPanel loading={loading} error={error} hasData={Boolean(data)}>
        {data && (
          <>
            <KpiStrip
              columns={4}
              items={[
                { label: 'High risk', value: num(counts.high), hint: 'Below the grade or attendance floor' },
                { label: 'Watch list', value: num(counts.medium), hint: 'Close to a threshold' },
                { label: 'Monitored', value: num(counts.monitoring), hint: 'Already under intervention' },
                {
                  label: 'Share of register',
                  value: pct(counts.total ? ((counts.high + counts.medium) / counts.total) * 100 : 0),
                  hint: `${num(counts.high + counts.medium)} of ${num(counts.total)} students`,
                },
              ]}
            />

            <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
              <Surface title="Risk by faculty" subtitle="High-risk and watch-list students per school" bodyClassName="px-3 pb-3 pt-2">
                <RiskFacultyChart rows={data.byFaculty} />
              </Surface>

              <Surface title="Signals behind the flags" subtitle="Each student can carry more than one">
                <div className="space-y-2.5">
                  {data.byReason.map((reason) => (
                    <div key={reason.flag} className="flex items-center justify-between gap-3 border-b border-line pb-2 last:border-0 last:pb-0">
                      <span className="inline-flex items-center gap-1.5 text-[13px] text-ink">
                        <ShieldAlert className="h-3.5 w-3.5 text-mutedink" />
                        {reason.label}
                      </span>
                      <span className="text-[13px] font-medium tabular-nums text-ink">{num(reason.count)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-lg border border-line bg-canvas px-3 py-2.5">
                  <p className="flex items-center gap-1.5 text-[12px] font-semibold text-ink">
                    <Radar className="h-3.5 w-3.5 text-brand" /> How this is computed
                  </p>
                  <p className="mt-1 text-[12px] leading-relaxed text-mutedink">
                    A student is high risk at an average below {60} or attendance below 65%, and on the watch list
                    between 60–70 or 65–75% attendance. Every figure is recomputed from academic and attendance records
                    each time this page opens.
                  </p>
                </div>
              </Surface>
            </div>

            <Surface className="mt-4" bodyClassName="p-0" title="Students needing support" subtitle={`${num(all.length)} flagged`}>
              <DeanToolbar
                query={query}
                onQuery={setQuery}
                placeholder="Search student, ID or group"
                filters={[
                  {
                    label: 'All faculties',
                    value: faculty,
                    onChange: setFaculty,
                    options: (data.byFaculty || []).map((item) => ({ value: item.id, label: item.name })),
                  },
                  {
                    label: 'Any severity',
                    value: level,
                    onChange: setLevel,
                    options: [
                      { value: 'high', label: RISK_LABELS.high },
                      { value: 'medium', label: RISK_LABELS.medium },
                    ],
                  },
                ]}
                resultLabel={`${num(rows.length)} students`}
              />
              <DataTable
                columns={COLUMNS}
                rows={rows}
                minWidth={900}
                onRowClick={(row) => setSelected(row.id)}
                empty="No student currently carries a risk signal in this scope."
              />
            </Surface>
          </>
        )}
      </LoadPanel>

      {selected && <StudentDetail studentId={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}