import PageTitle from '@/components/shell/PageTitle';
import Surface from '@/components/shell/Surface';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';
import { useWorkspace } from '@/lib/workspaceRole';
import { STUDENT, SUMMARY, creditsProgress, formatDate } from '@/lib/studentWorkspace';
import { Link } from 'react-router-dom';

export default function StudentProfilePage() {
  const { displayName, user } = useWorkspace();

  return (
    <div>
      <PageTitle
        eyebrow="Student workspace"
        title="Profile & settings"
        description="Your personal and academic record as the university holds it. Academic fields are maintained by the student office."
        actions={
          <Link to="/settings" className="btn-quiet">
            Account settings
          </Link>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <Surface title="Academic record">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-royal/10 text-[14px] font-semibold text-royal">
              {STUDENT.initials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold tracking-[-0.01em] text-ink">
                {displayName || STUDENT.fullName}
              </p>
              <p className="truncate text-[11.5px] text-mutedink">{user?.email || STUDENT.email}</p>
            </div>
          </div>

          <dl className="mt-4 space-y-2 text-[12px]">
            {[
              ['Student ID', STUDENT.studentId],
              ['Programme', STUDENT.programme],
              ['Faculty', STUDENT.faculty],
              ['Department', STUDENT.department],
              ['Year / group', `Year ${STUDENT.year} · ${STUDENT.group}`],
              ['Academic advisor', STUDENT.advisor],
              ['Semester', STUDENT.semester],
              ['Academic standing', STUDENT.standing],
            ].map(([label, value]) => (
              <div key={label} className="flex items-start justify-between gap-3 border-b border-line pb-2 last:border-0 last:pb-0">
                <dt className="text-mutedink">{label}</dt>
                <dd className="max-w-[62%] text-right font-medium text-ink">{value}</dd>
              </div>
            ))}
          </dl>
        </Surface>

        <div className="space-y-4">
          <Surface title="Progress at a glance">
            <dl className="grid grid-cols-2 gap-3">
              <div>
                <dt className="text-[10.5px] text-mutedink">Credits earned</dt>
                <dd className="mt-0.5 text-[17px] font-semibold tabular-nums text-ink">
                  {STUDENT.creditsEarned}
                  <span className="text-[11px] font-medium text-mutedink"> / {STUDENT.creditsRequired}</span>
                </dd>
              </div>
              <div>
                <dt className="text-[10.5px] text-mutedink">Degree progress</dt>
                <dd className="mt-0.5 text-[17px] font-semibold tabular-nums text-ink">{creditsProgress}%</dd>
              </div>
              <div>
                <dt className="text-[10.5px] text-mutedink">Weighted average</dt>
                <dd className="mt-0.5 text-[17px] font-semibold tabular-nums text-ink">
                  {SUMMARY.averageMark.toFixed(1)}
                </dd>
              </div>
              <div>
                <dt className="text-[10.5px] text-mutedink">Attendance</dt>
                <dd className="mt-0.5 text-[17px] font-semibold tabular-nums text-ink">{SUMMARY.attendanceRate}%</dd>
              </div>
            </dl>
            <div className="mt-3 space-y-1.5 border-t border-line pt-3 text-[11px]">
              <Link to={P.student.grades} className="link-quiet block">
                Grades &amp; transcript
              </Link>
              <Link to={P.student.applications} className="link-quiet block">
                Applications &amp; certificates
              </Link>
              {SUMMARY.nextAssessment && (
                <p className="pt-1 text-[10.5px] text-mutedink">
                  Next assessment: {SUMMARY.nextAssessment.title} on {formatDate(SUMMARY.nextAssessment.date)}.
                </p>
              )}
            </div>
          </Surface>

          <Surface title="What you can change">
            <p className="text-[11.5px] leading-relaxed text-mutedink">
              You can change your display name, password and notification preferences in account settings. Programme,
              group, grades and attendance are official records: contact the student office if something is wrong.
            </p>
            <p className="mt-2 text-[10.5px] leading-relaxed text-mutedink">
              Course and result data on this page is fictional demonstration data for the MGIMO AI Challenge prototype.
            </p>
          </Surface>
        </div>
      </div>
    </div>
  );
}