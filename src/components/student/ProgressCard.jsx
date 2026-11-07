import { Link } from 'react-router-dom';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import Surface from '@/components/shell/Surface';
import ProgressBar from '@/components/shell/ProgressBar';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';
import { COURSES, PERFORMANCE_TREND, STUDENT, courseAverage, creditsProgress, letterFor } from '@/lib/studentWorkspace';

export default function ProgressCard() {
  return (
    <Surface
      title="Academic progress"
      subtitle={`${STUDENT.programme} · Year ${STUDENT.year}`}
      action={
        <Link to={P.student.grades} className="link-quiet">
          Transcript
        </Link>
      }
      bodyClassName="px-5 pb-5 pt-1"
    >
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[10.5px] uppercase tracking-[0.1em] text-mutedink">Degree progress</p>
          <p className="mt-1 text-[19px] font-semibold leading-none tabular-nums text-ink">
            {STUDENT.creditsEarned}
            <span className="text-[12px] font-medium text-mutedink"> / {STUDENT.creditsRequired} credits</span>
          </p>
        </div>
        <span className="rounded-md bg-[#EEEBFE] px-2 py-1 text-[10.5px] font-medium text-royal">
          {creditsProgress}% complete
        </span>
      </div>
      <ProgressBar value={creditsProgress} tone="brand" className="mt-2.5" />

      <div className="mt-4 rounded-lg border border-line px-3 pb-1 pt-3">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-medium text-ink">Average mark by term</p>
          <p className="text-[10.5px] text-mutedink">0–100 scale</p>
        </div>
        <div className="h-[92px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={PERFORMANCE_TREND} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="avgFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5B4DEB" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="#5B4DEB" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="term"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: '#6B7280' }}
              />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #E7EAF2', fontSize: 11 }}
                labelStyle={{ color: '#172033' }}
              />
              <Area
                type="monotone"
                dataKey="average"
                stroke="#5B4DEB"
                strokeWidth={2}
                fill="url(#avgFill)"
                dot={{ r: 2.5, fill: '#5B4DEB', strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-[11px] font-medium text-ink">Performance by course</p>
        <ul className="mt-2 space-y-2">
          {COURSES.map((course) => {
            const average = courseAverage(course.id);
            return (
              <li key={course.id}>
                <div className="flex items-baseline justify-between gap-2 text-[11.5px]">
                  <span className="truncate text-ink/80">
                    {course.code} · {course.title}
                  </span>
                  <span className="shrink-0 tabular-nums text-mutedink">
                    {average.toFixed(1)} · {letterFor(average)}
                  </span>
                </div>
                <ProgressBar
                  value={average}
                  tone={average >= 85 ? 'positive' : average >= 75 ? 'brand' : 'warning'}
                  className="mt-1 h-1"
                />
              </li>
            );
          })}
        </ul>
      </div>
    </Surface>
  );
}