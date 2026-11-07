import { Fragment } from 'react';
import StatusChip from '@/components/shell/StatusChip';
import { TRANSCRIPT, semesterStats } from '@/lib/studentTranscript';
import { letterFor } from '@/lib/studentWorkspace';

const toneFor = (score) => (score >= 85 ? 'positive' : score >= 70 ? 'brand' : 'warning');

export default function TranscriptTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[500px] border-collapse text-left">
        <thead>
          <tr className="border-y border-line bg-[#FAFBFD]">
            <th className="table-head px-5 py-2">Course</th>
            <th className="table-head px-3 py-2 text-right">Credits</th>
            <th className="table-head px-3 py-2 text-right">Score</th>
            <th className="table-head px-5 py-2 text-right">Grade</th>
          </tr>
        </thead>
        <tbody>
          {TRANSCRIPT.map((term) => {
            const stats = semesterStats(term);
            return (
              <Fragment key={term.term}>
                <tr>
                  <td colSpan={4} className="bg-canvas px-5 py-2">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <p className="text-[12px] font-semibold text-ink">{term.term}</p>
                      <p className="text-[10.5px] text-mutedink">
                        {stats.count} courses · {stats.credits} credits · average{' '}
                        <span className="font-medium tabular-nums text-ink">{stats.average.toFixed(1)}</span>
                      </p>
                    </div>
                  </td>
                </tr>
                {term.courses.map((course) => (
                  <tr key={course.code} className="row-hover border-b border-line/70 last:border-b-0">
                    <td className="px-5 py-2">
                      <p className="text-[12px] text-ink">
                        <span className="font-mono text-[10.5px] text-mutedink">{course.code}</span>
                        <span className="mx-1.5 text-line">·</span>
                        {course.title}
                      </p>
                    </td>
                    <td className="px-3 py-2 text-right text-[11.5px] tabular-nums text-mutedink">{course.credits}</td>
                    <td className="px-3 py-2 text-right text-[11.5px] font-semibold tabular-nums text-ink">
                      {course.score}
                    </td>
                    <td className="px-5 py-2 text-right">
                      <StatusChip tone={toneFor(course.score)}>{letterFor(course.score)}</StatusChip>
                    </td>
                  </tr>
                ))}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}