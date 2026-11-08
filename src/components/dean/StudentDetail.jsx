import { AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import StatusChip from '@/components/shell/StatusChip';
import DataTable from '@/components/dean/DataTable';
import { RISK_LABELS, RISK_TONES, STATUS_LABELS, gradeTone, nf, pct, useDeanData } from '@/lib/deanApi';

const COURSE_COLUMNS = [
  { key: 'code', label: 'Course', render: (row) => <span className="font-medium text-ink">{row.code}</span> },
  { key: 'title', label: 'Title', render: (row) => <span className="text-mutedink">{row.title}</span> },
  { key: 'professor', label: 'Instructor' },
  { key: 'assessments', label: 'Marks', align: 'right' },
  { key: 'avgGrade', label: 'Average', align: 'right', render: (row) => nf(row.avgGrade) },
  { key: 'attendanceRate', label: 'Attendance', align: 'right', render: (row) => pct(row.attendanceRate) },
];

const RECENT_COLUMNS = [
  { key: 'course', label: 'Course' },
  { key: 'assessment', label: 'Assessment' },
  { key: 'grade', label: 'Mark', align: 'right', render: (row) => nf(row.grade) },
  { key: 'term', label: 'Term' },
  { key: 'date', label: 'Recorded', align: 'right' },
];

/**
 * A student's connected academic record: profile, derived performance, the
 * courses they are enrolled in and their most recent marks.
 */
export default function StudentDetail({ studentId, onClose }) {
  const { data, loading, error } = useDeanData('studentDetail', { studentId });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[88vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{data?.student?.full_name || 'Student record'}</DialogTitle>
          <DialogDescription>
            {data?.student
              ? `${data.student.student_id} · ${data.student.programme} · group ${data.student.group_name}`
              : 'Loading the academic record'}
          </DialogDescription>
        </DialogHeader>

        {loading && <p className="py-8 text-center text-[length:var(--type-secondary)] text-mutedink">Loading record…</p>}
        {error && <p className="py-8 text-center text-[length:var(--type-secondary)] text-critical">{error}</p>}

        {data?.student && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-4">
              {[
                ['Average grade', nf(data.student.avgGrade)],
                ['Attendance', pct(data.student.attendanceRate)],
                ['Courses', data.student.enrolledCourses],
                ['Marks recorded', data.student.gradedAssessments],
              ].map(([label, value]) => (
                <div key={label} className="bg-white px-3 py-2.5">
                  <p className="text-[11px] text-mutedink">{label}</p>
                  <p className="mt-0.5 text-[16px] font-semibold tabular-nums text-ink">{value}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <StatusChip tone={RISK_TONES[data.student.riskLevel]}>{RISK_LABELS[data.student.riskLevel]}</StatusChip>
              <StatusChip tone="neutral">{data.student.faculty}</StatusChip>
              <StatusChip tone="neutral">{data.student.department}</StatusChip>
              <StatusChip tone="neutral">Year {data.student.year || '—'}</StatusChip>
              <StatusChip tone={data.student.enrollment_status === 'active' ? 'positive' : 'warning'}>
                {STATUS_LABELS[data.student.enrollment_status] || data.student.enrollment_status}
              </StatusChip>
              <StatusChip tone="neutral">
                {STATUS_LABELS[data.student.intervention_status] || data.student.intervention_status}
              </StatusChip>
            </div>

            {data.student.riskReasons?.length > 0 && (
              <div className="rounded-lg border border-[#F3DFC0] bg-[#FCF7EE] px-3 py-2.5">
                <p className="flex items-center gap-1.5 text-[12px] font-semibold text-[#8E6018]">
                  <AlertTriangle className="h-3.5 w-3.5" /> Support signals
                </p>
                <ul className="mt-1 space-y-0.5">
                  {data.student.riskReasons.map((reason) => (
                    <li key={reason} className="text-[12.5px] text-[#7A5716]">
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <p className="mb-1.5 text-[13px] font-semibold text-ink">Enrolled courses</p>
              <div className="card-surface overflow-hidden">
                <DataTable columns={COURSE_COLUMNS} rows={data.courses} minWidth={560} empty="No course enrolments recorded." />
              </div>
            </div>

            <div>
              <p className="mb-1.5 text-[13px] font-semibold text-ink">Recent assessments</p>
              <div className="card-surface overflow-hidden">
                <DataTable columns={RECENT_COLUMNS} rows={data.recent} minWidth={520} empty="No marks recorded yet." />
              </div>
            </div>

            <p className="text-[11.5px] text-mutedink">
              {data.gradeNote} Contact details are limited to the institutional record; the dean’s office reads this
              profile under its administrative role.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}