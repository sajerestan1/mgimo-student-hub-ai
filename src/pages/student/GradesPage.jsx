import PageTitle from '@/components/shell/PageTitle';
import Surface from '@/components/shell/Surface';
import {
  COURSES,
  GRADES,
  STUDENT,
  SUMMARY,
  courseAverage,
  courseAttendance,
  letterFor,
  formatDate,
} from '@/lib/studentWorkspace';

export default function GradesPage() {
  return (
    <div>
      <PageTitle
        eyebrow="Student workspace"
        title="Grades & transcript"
        description="Every assessment recorded this semester, with the course average that feeds your academic standing."
        meta={[STUDENT.semester, `${STUDENT.creditsEarned} credits earned`, STUDENT.standing]}
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ['Weighted average', `${SUMMARY.averageMark.toFixed(1)}`, `${SUMMARY.averageLetter} · 0–100 scale`],
          ['Assessments recorded', String(GRADES.length), 'This semester'],
          ['Credits earned', String(STUDENT.creditsEarned), `of ${STUDENT.creditsRequired} required`],
          ['Academic standing', STUDENT.standing, 'No flags on record'],
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
          <ul className="divide-y divide-line">
            {COURSES.map((course) => {
              const rows = GRADES.filter((grade) => grade.courseId === course.id);
              const average = courseAverage(course.id);
              return (
                <li key={course.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[12.5px] font-semibold text-ink">
                        {course.code} · {course.title}
                      </p>
                      <p className="mt-0.5 text-[10.5px] text-mutedink">
                        {course.credits} credits · attendance {courseAttendance(course.id)}%
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[15px] font-semibold tabular-nums text-ink">{average.toFixed(1)}</p>
                      <p className="text-[10.5px] font-medium text-mutedink">{letterFor(average)}</p>
                    </div>
                  </div>
                  <ul className="mt-2 space-y-1">
                    {rows.map((grade) => (
                      <li key={grade.id} className="flex items-center justify-between gap-3 text-[11.5px]">
                        <span className="truncate text-ink/75">
                          {grade.title}
                          <span className="ml-1 text-[10px] text-mutedink">· {formatDate(grade.date)}</span>
                        </span>
                        <span className="shrink-0 tabular-nums text-ink">
                          {grade.score}
                          <span className="ml-1 text-[10px] text-mutedink">{letterFor(grade.score)}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        </Surface>

        <div className="space-y-4">
          <Surface title="Academic standing">
            <p className="text-[12.5px] leading-relaxed text-ink/80">
              You are in <span className="font-medium text-ink">{STUDENT.standing.toLowerCase()}</span>. No academic
              warnings, no outstanding resits, and all courses are above the 85% attendance requirement except where
              listed on the attendance page.
            </p>
            <dl className="mt-3 space-y-2 border-t border-line pt-3 text-[11.5px]">
              <div className="flex items-center justify-between">
                <dt className="text-mutedink">Programme</dt>
                <dd className="text-right font-medium text-ink">{STUDENT.programme}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-mutedink">Group</dt>
                <dd className="font-medium text-ink">{STUDENT.group}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-mutedink">Advisor</dt>
                <dd className="font-medium text-ink">{STUDENT.advisor}</dd>
              </div>
            </dl>
          </Surface>

          <Surface title="Official transcript">
            <p className="text-[11.5px] leading-relaxed text-mutedink">
              The official transcript is issued by the student office as a signed document. You can request an English
              or Russian copy from Applications &amp; Certificates; a PDF export from this page will arrive in the next
              stage.
            </p>
          </Surface>
        </div>
      </div>
    </div>
  );
}