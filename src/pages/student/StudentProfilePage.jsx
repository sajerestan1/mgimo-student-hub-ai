import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageTitle from '@/components/shell/PageTitle';
import Surface from '@/components/shell/Surface';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';
import { loadStudentPortal } from '@/lib/studentPortal';

export default function StudentProfilePage() {
  const [context, setContext] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStudentPortal()
      .then(setContext)
      .catch(() => setError('Your profile could not be loaded. Please refresh the page.'));
  }, []);

  if (error) return <p className="card-surface px-5 py-6 text-[15px] text-critical">{error}</p>;
  if (!context) return <div className="h-64 animate-pulse rounded-xl bg-white" />;

  const profile = context.profile;
  if (!profile) {
    return (
      <div>
        <PageTitle eyebrow="Student workspace" title="Profile" />
        <p className="card-surface px-5 py-8 text-[15px] text-mutedink">
          {context.scopeNote || 'Your account is not linked to a student record yet.'}
        </p>
      </div>
    );
  }

  const initials = (profile.full_name || '')
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const rows = [
    ['Student ID', profile.student_id || '—'],
    ['Programme', profile.program || '—'],
    ['Faculty', profile.faculty || '—'],
    ['Department', profile.department || '—'],
    ['Year', profile.year ? `Year ${profile.year}` : '—'],
    ['Group', profile.group_name || '—'],
    ['Enrolment', (profile.enrollment_status || 'active').replace(/_/g, ' ')],
  ];

  return (
    <div>
      <PageTitle
        eyebrow="Student workspace"
        title="Profile"
        description="Your academic identity as the register holds it. Academic fields are maintained by the student office."
        actions={
          <Link to="/settings" className="btn-quiet">
            Account settings
          </Link>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <Surface title="Academic record">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-royal/10 text-[15px] font-semibold text-royal">
              {initials || '—'}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[16px] font-semibold tracking-[-0.01em] text-ink">{profile.full_name}</p>
              <p className="truncate text-[13px] text-mutedink">{profile.email}</p>
            </div>
          </div>

          <dl className="mt-4 space-y-2 text-[14px]">
            {rows.map(([label, value]) => (
              <div
                key={label}
                className="flex items-start justify-between gap-3 border-b border-line pb-2 last:border-0 last:pb-0"
              >
                <dt className="text-mutedink">{label}</dt>
                <dd className="max-w-[60%] text-right font-medium capitalize text-ink">{value}</dd>
              </div>
            ))}
          </dl>
        </Surface>

        <div className="space-y-4">
          <Surface title="Academic standing">
            {context.summary.average === null ? (
              <p className="text-[14px] leading-relaxed text-mutedink">
                No result has been recorded yet, so no standing is shown. Your average appears once graded work is
                published in your courses.
              </p>
            ) : (
              <>
                <p className="text-[26px] font-semibold leading-none tracking-[-0.02em] tabular-nums text-ink">
                  {context.summary.average.toFixed(1)}
                  <span className="ml-2 text-[15px] font-medium text-mutedink">{context.summary.averageLetter}</span>
                </p>
                <p className="mt-2 text-[14px] leading-relaxed text-mutedink">
                  Credit-weighted across your enrolled courses. Work awaiting a grade is not counted.
                </p>
                <Link to={P.student.grades} className="link-quiet mt-3 inline-flex text-[14px]">
                  Open grades &amp; transcript
                </Link>
              </>
            )}
          </Surface>

          <Surface title="Course load">
            <dl className="space-y-2 text-[14px]">
              {[
                ['Active courses', String(context.summary.courseCount)],
                ['Credits', String(context.summary.credits)],
                [
                  'Modules completed',
                  `${context.summary.modulesCompleted} of ${context.summary.modulesTotal}`,
                ],
                ['Attendance', context.summary.attendanceRate === null ? 'Not recorded' : `${context.summary.attendanceRate}%`],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between border-b border-line pb-2 last:border-0 last:pb-0">
                  <dt className="text-mutedink">{label}</dt>
                  <dd className="font-medium text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </Surface>
        </div>
      </div>
    </div>
  );
}