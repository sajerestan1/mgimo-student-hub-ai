import { ArrowLeft, BookOpen, Clock, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatusChip from '@/components/shell/StatusChip';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';
import { shortDate } from '@/lib/studentCourses';
import { letterFor } from '@/lib/lms';

export default function CourseHeader({ course, professorName, progress, weighted }) {
  return (
    <div className="mb-5">
      <Link to={P.student.courses} className="link-quiet">
        <ArrowLeft className="h-3 w-3" /> All courses
      </Link>

      <div className="mt-3 card-surface p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="eyebrow">
              {course.code} · {course.level || 'intermediate'} · {course.semester}
            </p>
            <h1 className="mt-1.5 text-[22px] font-semibold leading-tight tracking-[-0.02em] text-ink sm:text-[24px]">
              {course.title}
            </h1>
            <p className="mt-1 text-[15px] text-mutedink">
              {professorName || 'Course instructor'} · {course.credits} credits · Year {course.year_level}
            </p>
            <p className="mt-3 max-w-3xl text-[15px] leading-[1.65] text-mutedink">{course.description}</p>
          </div>

          <div className="grid shrink-0 grid-cols-2 gap-x-5 gap-y-3 border-line lg:border-l lg:pl-5">
            <div>
              <p className="text-[10.5px] text-mutedink">Course progress</p>
              <p className="mt-0.5 text-[19px] font-semibold tabular-nums text-ink">{progress.percent}%</p>
              <p className="text-[10.5px] text-mutedink">
                {progress.completed} of {progress.total} modules
              </p>
            </div>
            <div>
              <p className="text-[10.5px] text-mutedink">Weighted grade</p>
              <p className="mt-0.5 text-[19px] font-semibold tabular-nums text-ink">
                {weighted === null ? '—' : weighted.toFixed(1)}
                <span className="ml-1 text-[10.5px] font-medium text-mutedink">{letterFor(weighted)}</span>
              </p>
              <p className="text-[10.5px] text-mutedink">Assessed work only</p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-line pt-3">
          <StatusChip tone="brand">
            <BookOpen className="h-3 w-3" /> {course.objectives?.length || 0} learning objectives
          </StatusChip>
          <StatusChip tone="neutral">
            <Clock className="h-3 w-3" /> {course.credits} credits
          </StatusChip>
          <StatusChip tone="neutral">
            <Users className="h-3 w-3" /> {course.department_id ? 'Department course' : 'Elective'}
          </StatusChip>
          {course.prerequisites?.length ? (
            <StatusChip tone="warning">Prerequisite: {course.prerequisites[0]}</StatusChip>
          ) : (
            <StatusChip tone="positive">No prerequisites</StatusChip>
          )}
          <span className="ml-auto text-[10.5px] text-mutedink">Semester ends {shortDate('2026-12-20')}</span>
        </div>
      </div>
    </div>
  );
}