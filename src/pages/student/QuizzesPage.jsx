import PageTitle from '@/components/shell/PageTitle';
import ProgressBar from '@/components/shell/ProgressBar';
import StatusChip from '@/components/shell/StatusChip';
import { upcomingAssessments, courseById, formatDate, daysUntil } from '@/lib/studentWorkspace';

export default function QuizzesPage() {
  return (
    <div>
      <PageTitle
        eyebrow="Student workspace"
        title="Quizzes & exams"
        description="Scheduled assessments for your courses, their format, and how far your preparation has progressed."
        meta={[`${upcomingAssessments.length} scheduled`, 'Next three weeks', 'Fall Semester 2026']}
      />

      <div className="card-surface divide-y divide-line overflow-hidden">
        {upcomingAssessments.map((assessment) => {
          const course = courseById(assessment.courseId);
          const days = daysUntil(assessment.date);
          return (
            <div key={assessment.id} className="px-5 py-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-royal/10 px-1.5 py-0.5 text-[10px] font-medium text-royal">
                      {assessment.kind}
                    </span>
                    <p className="text-[12.5px] font-semibold text-ink">{assessment.title}</p>
                  </div>
                  <p className="mt-1 text-[11px] text-mutedink">
                    {course.code} · {course.title} · {assessment.weight}
                  </p>
                  <p className="mt-0.5 text-[11px] text-mutedink">
                    {formatDate(assessment.date, { weekday: 'short', day: 'numeric', month: 'short' })} · {assessment.start} ·{' '}
                    {assessment.room}
                  </p>
                  <p className="mt-1 text-[10.5px] text-mutedink">{assessment.format}</p>
                </div>
                <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
                  <StatusChip tone={days <= 7 ? 'warning' : 'neutral'}>
                    {days === 0 ? 'Today' : `In ${days} days`}
                  </StatusChip>
                  <span className="text-[10.5px] text-mutedink">{assessment.preparation}% prepared</span>
                </div>
              </div>
              <ProgressBar
                value={assessment.preparation}
                tone={assessment.preparation >= 60 ? 'positive' : assessment.preparation >= 35 ? 'brand' : 'warning'}
                className="mt-3 h-1"
              />
            </div>
          );
        })}
      </div>

      <p className="mt-4 rounded-lg border border-line bg-white px-4 py-3 text-[11px] leading-relaxed text-mutedink">
        Dates and rooms are final for the demonstration semester. Preparation percentages are the student’s own
        tracker entries, not an automatic estimate.
      </p>
    </div>
  );
}