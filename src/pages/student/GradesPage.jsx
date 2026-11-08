import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageTitle from '@/components/shell/PageTitle';
import Surface from '@/components/shell/Surface';
import StatusChip from '@/components/shell/StatusChip';
import AssessmentRows from '@/components/student/AssessmentRows';
import TranscriptTable from '@/components/student/TranscriptTable';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';
import { loadStudentPortal } from '@/lib/studentPortal';
import { letterFor } from '@/lib/lms';

const COMPLETION = {
  completed: { label: 'Completed', tone: 'positive' },
  in_progress: { label: 'In progress', tone: 'brand' },
  not_started: { label: 'Not started', tone: 'neutral' },
};

const standingFor = (summary) => {
  if (summary.average === null) return 'No results yet';
  if (summary.average < 50) return 'Academic risk';
  if (summary.average < 60) return 'Needs attention';
  return 'Good standing';
};

export default function GradesPage() {
  const [context, setContext] = useState(null);

  useEffect(() => {
    let alive = true;
    loadStudentPortal().then((data) => {
      if (alive) setContext(data);
    });
    return () => { alive = false; };
  }, []);

  if (!context) return <p className="py-10 text-center text-[15px] text-mutedink">Loading your academic record…</p>;

  // One shape, one source: the same gradebook result the dashboard reads.
  const student = context.profile;
  const courses = context.courses.map((course) => ({
    course: { id: course.id, code: course.code, title: course.title },
    professor: course.professor,
    credits: course.credits,
    gradebook: {
      rows: course.rows,
      weighted: course.weighted,
      awaiting: course.awaiting,
      missing: course.missing,
      weightScored: course.weightScored,
      graded: course.graded,
    },
    moduleProgress: course.moduleProgress,
    completion: course.completion,
  }));
  const summary = {
    ...context.summary,
    assessmentsRecorded: context.summary.graded,
    missing: context.courses.reduce((sum, course) => sum + course.missing, 0),
    modulePercent: context.summary.modulesTotal
      ? Math.round((context.summary.modulesCompleted / context.summary.modulesTotal) * 100)
      : 0,
  };

  if (!student) {
    return (
      <Surface title="No student record">
        <p className="text-[12px] text-mutedink">Your account is not linked to a student record yet. Contact the student office.</p>
      </Surface>
    );
  }

  const standing = standingFor(summary);
  const transcriptRows = courses.map((entry) => ({
    code: entry.course.code,
    title: entry.course.title,
    professor: entry.professor,
    credits: entry.credits,
    score: entry.gradebook.weighted,
    completion: entry.completion,
  }));

  return (
    <div>
      <PageTitle
        eyebrow="Student workspace"
        title="Grades & transcript"
        description="Every assessment recorded in your enrolled courses, with the weighted result that feeds your academic standing."
        meta={[
          `${courses.length} enrolled courses`,
          `${summary.credits} credits this semester`,
          standing,
        ]}
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ['Weighted average', summary.average === null ? '—' : `${summary.average.toFixed(1)}`, `${summary.averageLetter} · credit-weighted`],
          ['Assessments recorded', String(summary.assessmentsRecorded), `${summary.awaiting} awaiting grade`],
          ['Credits this semester', String(summary.credits), `${summary.missing} missing item${summary.missing === 1 ? '' : 's'}`],
          ['Academic standing', standing, `${summary.modulePercent}% of modules completed`],
        ].map(([label, value, hint]) => (
          <div key={label} className="card-surface px-4 py-3.5">
            <p className="text-[11px] text-mutedink">{label}</p>
            <p className="mt-1 text-[18px] font-semibold leading-none tracking-[-0.02em] text-ink">{value}</p>
            <p className="mt-1.5 text-[10.5px] text-mutedink">{hint}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Surface title="Course record" subtitle="Assessments grouped by course" bodyClassName="px-0 pb-0 pt-1">
          {!courses.length && (
            <p className="px-5 py-6 text-[11.5px] text-mutedink">You are not enrolled in a published course yet.</p>
          )}
          <ul className="divide-y divide-line">
            {courses.map((entry) => {
              const completion = COMPLETION[entry.completion] || COMPLETION.not_started;
              return (
                <li key={entry.course.id} className="px-5 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[12.5px] font-semibold text-ink">
                        <span className="font-mono text-[10.5px] text-mutedink">{entry.course.code}</span>
                        <span className="mx-1.5 text-line">·</span>
                        {entry.course.title}
                      </p>
                      <p className="mt-0.5 text-[10.5px] text-mutedink">
                        {entry.professor} · {entry.credits} credits · {entry.moduleProgress.completed}/{entry.moduleProgress.total} modules ·{' '}
                        {entry.gradebook.weightScored}% of the weight assessed
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        <StatusChip tone={completion.tone}>{completion.label}</StatusChip>
                        {entry.gradebook.awaiting > 0 && (
                          <StatusChip tone="warning">{entry.gradebook.awaiting} awaiting grade</StatusChip>
                        )}
                        {entry.gradebook.missing > 0 && (
                          <StatusChip tone="critical">{entry.gradebook.missing} missing</StatusChip>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[15px] font-semibold tabular-nums text-ink">
                        {entry.gradebook.weighted === null ? '—' : entry.gradebook.weighted.toFixed(1)}
                      </p>
                      <p className="text-[10.5px] font-medium text-mutedink">
                        {entry.gradebook.weighted === null ? 'No grade yet' : letterFor(entry.gradebook.weighted)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <AssessmentRows rows={entry.gradebook.rows} />
                  </div>
                </li>
              );
            })}
          </ul>
        </Surface>

        <div className="space-y-4">
          <Surface title="Academic standing">
            <p className="text-[12.5px] leading-relaxed text-ink/80">
              Your standing is <span className="font-medium text-ink">{standing.toLowerCase()}</span>, calculated from the
              graded work recorded in your courses. Work that is still awaiting a grade is not counted, and missing work is
              listed rather than averaged in as zero.
            </p>
            <dl className="mt-3 space-y-2 border-t border-line pt-3 text-[11.5px]">
              <div className="flex items-center justify-between">
                <dt className="text-mutedink">Programme</dt>
                <dd className="text-right font-medium text-ink">{student.program || '—'}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-mutedink">Group</dt>
                <dd className="font-medium text-ink">{student.group_name || '—'}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-mutedink">Enrolment</dt>
                <dd className="font-medium capitalize text-ink">{(student.enrollment_status || 'active').replace(/_/g, ' ')}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-mutedink">Modules completed</dt>
                <dd className="font-medium text-ink">{summary.modulesCompleted} of {summary.modulesTotal}</dd>
              </div>
            </dl>
          </Surface>

          <Surface title="Grade weighting" subtitle="How the course result is calculated">
            <ul className="space-y-1.5 text-[11.5px] text-mutedink">
              <li>Assignments and coursework count for the largest share of each course result.</li>
              <li>Quizzes use your best attempt and are only counted once marked.</li>
              <li>Examinations are averaged separately where a course sets one.</li>
              <li>The result is re-weighted across the categories that have a recorded mark.</li>
            </ul>
          </Surface>
        </div>
      </div>

      <Surface
        className="mt-4"
        title="Semester results"
        subtitle={`${courses.length} courses · ${summary.credits} credits · weighted average ${
          summary.average === null ? '—' : summary.average.toFixed(1)
        } (${summary.averageLetter})`}
        bodyClassName="p-0"
        footer={
          <div className="flex flex-col gap-1.5 text-[11px] leading-relaxed text-mutedink sm:flex-row sm:items-center sm:justify-between">
            <span>
              These results come from the assessments recorded in your courses. The official transcript is issued by the
              student office as a signed document.
            </span>
            <Link to={P.student.applications} className="link-quiet shrink-0">
              Request official copy
            </Link>
          </div>
        }
      >
        <TranscriptTable rows={transcriptRows} />
      </Surface>
    </div>
  );
}