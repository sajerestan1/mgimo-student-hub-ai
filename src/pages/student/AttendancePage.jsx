import PageTitle from '@/components/shell/PageTitle';
import Surface from '@/components/shell/Surface';
import ProgressBar from '@/components/shell/ProgressBar';
import {
  ATTENDANCE,
  ATTENDANCE_REQUIREMENT,
  COURSES,
  STUDENT,
  attendanceRate,
  courseAttendance,
} from '@/lib/studentWorkspace';

export default function AttendancePage() {
  return (
    <div>
      <PageTitle
        eyebrow="Student workspace"
        title="Attendance"
        description="Your register for each course this semester. The requirement is 85% per course to sit the assessment."
        meta={[`${attendanceRate}% overall`, `${ATTENDANCE_REQUIREMENT}% required`, STUDENT.semester]}
      />

      <div className="card-surface mb-4 flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] text-mutedink">Overall attendance</p>
          <p className="mt-1 text-[26px] font-semibold leading-none tabular-nums text-ink">
            {attendanceRate}
            <span className="text-[13px] font-medium text-mutedink">%</span>
          </p>
        </div>
        <div className="w-full sm:max-w-md">
          <ProgressBar
            value={attendanceRate}
            tone={attendanceRate >= ATTENDANCE_REQUIREMENT ? 'positive' : 'warning'}
          />
          <p className="mt-1.5 text-[10.5px] text-mutedink">
            Present, late and excused sessions all count as attendance. Absences without a document do not.
          </p>
        </div>
      </div>

      <Surface title="By course" subtitle="Counters from the course register" bodyClassName="px-0 pb-0 pt-1">
        <ul className="divide-y divide-line">
          {COURSES.map((course) => {
            const record = ATTENDANCE[course.id];
            const rate = courseAttendance(course.id);
            const below = rate < ATTENDANCE_REQUIREMENT;
            return (
              <li key={course.id} className="px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[12.5px] font-semibold text-ink">
                      {course.code} · {course.title}
                    </p>
                    <p className="mt-0.5 text-[10.5px] text-mutedink">
                      {record.present} present · {record.late} late · {record.absent} absent · {record.excused} excused
                    </p>
                  </div>
                  <p
                    className={`text-[15px] font-semibold tabular-nums ${below ? 'text-warning' : 'text-positive'}`}
                  >
                    {rate}%
                  </p>
                </div>
                <ProgressBar value={rate} tone={below ? 'warning' : 'positive'} className="mt-2 h-1" />
                {below && (
                  <p className="mt-2 rounded-md bg-[#FEF3E6] px-2 py-1.5 text-[10.5px] leading-relaxed text-[#8A5A11]">
                    Below the {ATTENDANCE_REQUIREMENT}% requirement — speak to the course lecturer before the
                    assessment period.
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </Surface>
    </div>
  );
}