import { useCallback, useEffect, useState } from 'react';
import PageTitle from '@/components/shell/PageTitle';
import Surface from '@/components/shell/Surface';
import PerformanceOverview from '@/components/intelligence/PerformanceOverview';
import CoursePerformanceCard from '@/components/intelligence/CoursePerformanceCard';
import AttendanceAllowance from '@/components/intelligence/AttendanceAllowance';
import PerformanceAdvisor from '@/components/intelligence/PerformanceAdvisor';
import AlertPreferences from '@/components/intelligence/AlertPreferences';
import UpcomingWork from '@/components/intelligence/UpcomingWork';
import { loadAcademicIntelligence } from '@/lib/academicIntelligence';

export default function AcademicIntelligence() {
  const [intel, setIntel] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback((fresh = false) => {
    loadAcademicIntelligence({ fresh })
      .then(setIntel)
      .catch((caught) => setError(caught.message || 'Your academic intelligence could not be loaded.'));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (error) return <p className="card-surface px-5 py-6 text-[15px] text-critical">{error}</p>;

  if (!intel) {
    return (
      <div className="space-y-4">
        <div className="h-16 animate-pulse rounded-xl bg-white" />
        <div className="h-28 animate-pulse rounded-xl bg-white" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-56 animate-pulse rounded-xl bg-white" />
          <div className="h-56 animate-pulse rounded-xl bg-white" />
        </div>
      </div>
    );
  }

  if (!intel.linked) {
    return (
      <div>
        <PageTitle eyebrow="Student workspace" title="Academic intelligence" />
        <p className="card-surface px-5 py-8 text-[15px] leading-relaxed text-mutedink">
          {intel.scopeNote || 'Your account is not linked to a student record yet, so there are no results to analyse.'}
        </p>
      </div>
    );
  }

  const { performance, attendance, policy, work } = intel;

  return (
    <div>
      <PageTitle
        eyebrow="Student workspace"
        title="Academic intelligence"
        description="Your recorded results, calculated averages and attendance allowance, explained from your own academic record."
        meta={[
          performance.semesterLabel,
          `${performance.courses.length} enrolled courses`,
          `${policy.institution} · ${policy.absenceLimit} permitted absences`,
        ]}
      />

      <Surface title="Overall performance" subtitle="Recorded results and calculated averages, kept separate">
        <PerformanceOverview performance={performance} attendance={attendance} />
      </Surface>

      {intel.indicators.length > 0 && (
        <Surface className="mt-4" title="Academic risk indicators" subtitle="Each one follows from a recorded value below">
          <ul className="divide-y divide-line">
            {intel.indicators.slice(0, 6).map((indicator) => (
              <li key={`${indicator.level}-${indicator.label}`} className="flex items-start gap-2 py-2">
                <span
                  className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                    indicator.level === 'critical' ? 'bg-critical' : indicator.level === 'warning' ? 'bg-warning' : 'bg-brand'
                  }`}
                />
                <div className="min-w-0">
                  <p className="text-[13.5px] font-medium text-ink">{indicator.label}</p>
                  <p className="text-[12.5px] text-mutedink">{indicator.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </Surface>
      )}

      <Surface className="mt-4" title="Course performance" subtitle="Averages are calculated from graded items in each course">
        <div className="grid gap-3 md:grid-cols-2">
          {performance.courses.map((course) => (
            <CoursePerformanceCard key={course.id} course={course} />
          ))}
        </div>
        {!performance.courses.length && (
          <p className="text-[14px] text-mutedink">You are not enrolled in a published course yet.</p>
        )}
      </Surface>

      <Surface className="mt-4" title="Attendance and absence allowance" subtitle="Counted from the official class register">
        <AttendanceAllowance attendance={attendance} policy={policy} />
      </Surface>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Surface title="Upcoming and overdue" subtitle="Published assessments only">
          <UpcomingWork work={work} />
        </Surface>
        <Surface title="AI academic advisor" subtitle="Grounded in your own recorded results">
          <PerformanceAdvisor />
        </Surface>
      </div>

      <Surface className="mt-4" title="Alerts and preferences" subtitle="Which academic alerts you receive, and where">
        <AlertPreferences preferences={intel.preferences} institution={intel.institution} onSaved={() => load(true)} />
      </Surface>
    </div>
  );
}