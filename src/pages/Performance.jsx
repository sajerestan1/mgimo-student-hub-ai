import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { GraduationCap, BookOpen, Award, Layers } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { LoadingState, ErrorState } from '@/components/LoadingState';
import EmptyState from '@/components/EmptyState';
import { useStudentData } from '@/lib/StudentDataContext';
import { formatDateValue } from '@/lib/academic';
import { cn } from '@/lib/utils';

function StatTile({ icon: Icon, label, value, hint }) {
  return (
    <div className="card-surface flex items-start gap-3 p-4 sm:p-5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F1F5FB] text-navy-mid">
        <Icon className="h-4 w-4" strokeWidth={1.8} />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">{label}</p>
        <p className="mt-1 font-heading text-[22px] leading-none text-navy-deep">{value}</p>
        {hint && <p className="mt-1 text-[10.5px] text-slate-400">{hint}</p>}
      </div>
    </div>
  );
}

const TYPE_LABELS = { exam: 'Exam', credit: 'Credit', coursework: 'Coursework' };

function gradeTone(points) {
  if (points >= 5) return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
  if (points >= 4) return 'bg-blue-50 text-blue-700 ring-blue-200';
  return 'bg-amber-50 text-amber-700 ring-amber-200';
}

export default function Performance() {
  const { loading, error, reload, grades, courses, average, credits } = useStudentData();

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const chartData = [...grades]
    .sort((a, b) => (Number(b.grade_points) || 0) - (Number(a.grade_points) || 0))
    .map((grade) => ({
      name: grade.course_code || grade.title.slice(0, 12),
      fullTitle: grade.title,
      points: Number(grade.grade_points) || 0,
    }));

  const best = [...grades].sort(
    (a, b) => (Number(b.grade_points) || 0) - (Number(a.grade_points) || 0)
  )[0];

  const distribution = [5, 4, 3, 2].map((mark) => ({
    mark,
    count: grades.filter((grade) => Number(grade.grade_points) === mark).length,
  }));
  const maxCount = Math.max(1, ...distribution.map((row) => row.count));

  return (
    <div className="fade-up">
      <PageHeader
        eyebrow="Academic record"
        title="Academic performance"
        description="Grades, credits and examination results for the current academic year."
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          icon={Award}
          label="Academic average"
          value={average ? average.toFixed(2) : '—'}
          hint="out of 5.00"
        />
        <StatTile icon={Layers} label="Credits earned" value={credits} hint="across all assessments" />
        <StatTile icon={BookOpen} label="Courses this semester" value={courses.length} />
        <StatTile
          icon={GraduationCap}
          label="Best result"
          value={best ? best.grade : '—'}
          hint={best ? best.title : 'No results yet'}
        />
      </div>

      {grades.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={GraduationCap}
            title="No grades recorded yet"
            description="Results appear here as soon as the dean’s office publishes them."
          />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="card-surface p-5 sm:p-6 lg:col-span-2">
            <div className="mb-4 flex items-baseline justify-between gap-3">
              <h2 className="font-heading text-[17px] text-navy-deep">Grade points by course</h2>
              <span className="text-[10.5px] text-slate-400">Scale 3 — 5</span>
            </div>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                  <CartesianGrid stroke="#EEF1F7" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: '#7A899E' }}
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                    angle={chartData.length > 6 ? -30 : 0}
                    textAnchor={chartData.length > 6 ? 'end' : 'middle'}
                    height={chartData.length > 6 ? 52 : 30}
                  />
                  <YAxis
                    domain={[0, 5]}
                    tick={{ fontSize: 10, fill: '#7A899E' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(21,59,104,0.04)' }}
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid #E4E9F2',
                      fontSize: 12,
                      boxShadow: '0 12px 30px -18px rgba(16,42,76,0.45)',
                    }}
                    labelStyle={{ color: '#102A4C', fontWeight: 600 }}
                    formatter={(value, _name, entry) => [`${value} points`, entry.payload.fullTitle]}
                  />
                  <Bar dataKey="points" radius={[5, 5, 0, 0]} maxBarSize={46}>
                    {chartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.points >= 5 ? '#C8A45D' : '#245A91'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="card-surface p-5 sm:p-6">
            <h2 className="mb-4 font-heading text-[17px] text-navy-deep">Grade distribution</h2>
            <div className="space-y-3">
              {distribution.map((row) => (
                <div key={row.mark}>
                  <div className="mb-1 flex items-baseline justify-between text-[11.5px]">
                    <span className="font-medium text-navy-deep">Grade {row.mark}</span>
                    <span className="text-slate-400">
                      {row.count} {row.count === 1 ? 'course' : 'courses'}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#EEF1F7]">
                    <div
                      className={cn('h-full rounded-full', row.mark === 5 ? 'bg-gold' : 'bg-navy-mid')}
                      style={{ width: `${(row.count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-5 rounded-xl bg-[#F7F9FD] px-3.5 py-3 text-[11px] leading-relaxed text-slate-500">
              Fictional demonstration results. Official records are issued only by the dean’s office.
            </p>
          </section>
        </div>
      )}

      {grades.length > 0 && (
        <section className="card-surface mt-6 overflow-hidden">
          <div className="border-b border-[#EEF1F7] px-5 py-4 sm:px-6">
            <h2 className="font-heading text-[17px] text-navy-deep">Examination results</h2>
          </div>
          <ul className="divide-y divide-[#F1F4FA]">
            {grades.map((grade) => (
              <li
                key={grade.id}
                className="flex flex-col gap-2 px-5 py-3.5 transition-colors hover:bg-[#FCFDFF] sm:flex-row sm:items-center sm:gap-4 sm:px-6"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-medium text-navy-deep">{grade.title}</p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                    <span>{grade.course_code}</span>
                    <span>{grade.instructor}</span>
                    <span>{TYPE_LABELS[grade.type] || grade.type}</span>
                  </p>
                </div>
                <div className="flex items-center gap-3 sm:gap-5">
                  <span className="text-[11px] text-slate-400 sm:hidden">
                    {formatDateValue(grade.date)}
                  </span>
                  <span className="hidden w-[86px] text-right text-[11px] text-slate-400 sm:block">
                    {formatDateValue(grade.date)}
                  </span>
                  <span className="w-[54px] text-right text-[11.5px] font-medium text-navy-mid">
                    {grade.credits} cr
                  </span>
                  <span
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full text-[12.5px] font-semibold ring-1 ring-inset',
                      gradeTone(Number(grade.grade_points))
                    )}
                  >
                    {grade.grade}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}