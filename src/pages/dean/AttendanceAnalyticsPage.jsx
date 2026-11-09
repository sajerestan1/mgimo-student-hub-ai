import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageTitle from '@/components/shell/PageTitle';
import KpiStrip from '@/components/shell/KpiStrip';
import Surface from '@/components/shell/Surface';
import StatusChip from '@/components/shell/StatusChip';
import ProgressBar from '@/components/shell/ProgressBar';
import DataTable from '@/components/dean/DataTable';
import LoadPanel from '@/components/dean/LoadPanel';
import StudentDetail from '@/components/dean/StudentDetail';
import AttendancePolicyPanel from '@/components/intelligence/AttendancePolicyPanel';
import { WeeklyAttendanceChart } from '@/components/dean/InstitutionCharts';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';
import { nf, num, pct, rateTone, useDeanData } from '@/lib/deanApi';

const STATUS_COLORS = {
  present: 'bg-positive',
  late: 'bg-warning',
  excused: 'bg-[#98A2B3]',
  absent: 'bg-critical',
};

const DEPARTMENT_COLUMNS = [
  { key: 'name', label: 'Department', render: (row) => <span className="font-medium text-ink">{row.name}</span> },
  { key: 'faculty', label: 'Faculty', align: 'right' },
  { key: 'students', label: 'Students', align: 'right' },
  {
    key: 'rate',
    label: 'Attendance',
    align: 'right',
    render: (row) => <StatusChip tone={rateTone(row.rate)}>{pct(row.rate)}</StatusChip>,
  },
];

const STUDENT_COLUMNS = [
  {
    key: 'full_name',
    label: 'Student',
    render: (row) => (
      <div>
        <p className="font-medium text-ink">{row.full_name}</p>
        <p className="mt-0.5 text-[12.5px] text-mutedink">
          {row.student_id} · {row.group_name}
        </p>
      </div>
    ),
  },
  { key: 'faculty', label: 'Faculty', render: (row) => <span className="text-mutedink">{row.faculty}</span> },
  { key: 'sessions', label: 'Sessions', align: 'right' },
  {
    key: 'attendanceRate',
    label: 'Attendance',
    align: 'right',
    render: (row) => <StatusChip tone={rateTone(row.attendanceRate)}>{pct(row.attendanceRate)}</StatusChip>,
  },
  { key: 'avgGrade', label: 'Avg grade', align: 'right', render: (row) => nf(row.avgGrade) },
];

export default function AttendanceAnalyticsPage() {
  const { data, loading, error } = useDeanData('attendance');
  const [selected, setSelected] = useState(null);

  return (
    <div>
      <PageTitle
        eyebrow="Intelligence"
        title="Attendance analytics"
        description="Session attendance across the institution: rate by week, faculty and department, the mix of register outcomes, and the students below the attendance requirement."
        meta={[data?.scope ? `Scope: ${data.scope}` : 'Institutional scope', 'Late arrivals count as attended']}
        actions={
          <Link to={`${P.dean.students}?risk=high`} className="btn-quiet">
            Open at-risk students
          </Link>
        }
      />

      <AttendancePolicyPanel />

      <LoadPanel loading={loading} error={error} hasData={Boolean(data)}>
        {data && (
          <>
            <KpiStrip
              columns={4}
              items={[
                { label: 'Attendance rate', value: pct(data.overall.rate), hint: 'Present or late' },
                { label: 'Register entries', value: num(data.overall.records), hint: 'Recorded attendance rows' },
                {
                  label: 'Students below floor',
                  value: num(data.overall.belowFloor),
                  hint: `Under ${data.overall.floor}% with three or more sessions`,
                },
                { label: 'Students tracked', value: num(data.overall.studentsTracked), hint: 'In the academic register' },
              ]}
            />

            <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
              <Surface title="Weekly attendance" subtitle="Last ten weeks of recorded sessions" bodyClassName="px-3 pb-3 pt-2">
                <WeeklyAttendanceChart rows={data.weeks} />
              </Surface>

              <Surface title="Register outcome mix" subtitle="Share of every recorded session entry">
                <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-line">
                  {data.statusMix.map((item) => (
                    <div
                      key={item.status}
                      className={STATUS_COLORS[item.status] || 'bg-ink/20'}
                      style={{ width: `${item.share}%` }}
                      title={`${item.status}: ${item.share}%`}
                    />
                  ))}
                </div>
                <div className="mt-3 space-y-2">
                  {data.statusMix.map((item) => (
                    <div key={item.status} className="flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-2 text-[13px] capitalize text-ink">
                        <span className={`h-1.5 w-1.5 rounded-full ${STATUS_COLORS[item.status] || 'bg-ink/20'}`} />
                        {item.status}
                      </span>
                      <span className="text-[13px] tabular-nums text-mutedink">
                        {num(item.count)} · {pct(item.share)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 border-t border-line pt-3">
                  <p className="text-[11.5px] text-mutedink">Attendance by faculty</p>
                  <div className="mt-2 space-y-2">
                    {data.byFaculty.map((faculty) => (
                      <div key={faculty.code}>
                        <div className="mb-1 flex items-baseline justify-between">
                          <span className="text-[12.5px] text-ink">{faculty.name}</span>
                          <span className="text-[12px] font-medium tabular-nums text-ink">{pct(faculty.rate)}</span>
                        </div>
                        <ProgressBar value={faculty.rate || 0} tone={rateTone(faculty.rate)} />
                      </div>
                    ))}
                  </div>
                </div>
              </Surface>
            </div>

            <Surface className="mt-4" bodyClassName="p-0" title="Attendance by department">
              <DataTable
                columns={DEPARTMENT_COLUMNS}
                rows={data.byDepartment}
                minWidth={620}
                empty="No department attendance in scope."
              />
            </Surface>

            <Surface
              className="mt-4"
              bodyClassName="p-0"
              title="Students below the attendance requirement"
              subtitle={`Under ${data.overall.floor}% with at least three recorded sessions`}
            >
              <DataTable
                columns={STUDENT_COLUMNS}
                rows={data.belowFloor}
                minWidth={760}
                onRowClick={(row) => setSelected(row.id)}
                empty="Every student with recorded sessions meets the attendance requirement."
              />
            </Surface>
            <p className="mt-2 px-1 text-[11.5px] text-mutedink">
              Select a student to open their full record. Faculty access follows the caller’s scope.
            </p>
          </>
        )}
      </LoadPanel>

      {selected && <StudentDetail studentId={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}