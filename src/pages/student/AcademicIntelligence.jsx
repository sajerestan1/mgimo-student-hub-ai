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
import { useI18n } from '@/i18n/I18nProvider';

export default function AcademicIntelligence() {
  const { t } = useI18n();
  const [intel, setIntel] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback((fresh = false) => {
    loadAcademicIntelligence({ fresh })
      .then(setIntel)
      .catch((caught) => setError(caught.message || t('intel.page.error')));
  }, [t]);

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
        <PageTitle eyebrow={t('student.common.studentWorkspace')} title={t('intel.page.title')} />
        <p className="card-surface px-5 py-8 text-[15px] leading-relaxed text-mutedink">
          {intel.scopeNote || t('intel.page.notLinked')}
        </p>
      </div>
    );
  }

  const { performance, attendance, policy, work } = intel;

  return (
    <div>
      <PageTitle
        eyebrow={t('student.common.studentWorkspace')}
        title={t('intel.page.title')}
        description={t('intel.page.description')}
        meta={[
          performance.semesterLabel,
          t('intel.page.metaCourses', { count: performance.courses.length }),
          t('intel.page.metaPolicy', { institution: policy.institution, limit: policy.absenceLimit }),
        ]}
      />

      <Surface title={t('intel.page.overallTitle')} subtitle={t('intel.page.overallSubtitle')}>
        <PerformanceOverview performance={performance} attendance={attendance} />
      </Surface>

      {intel.indicators.length > 0 && (
        <Surface className="mt-4" title={t('intel.page.riskTitle')} subtitle={t('intel.page.riskSubtitle')}>
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

      <Surface className="mt-4" title={t('intel.page.courseTitle')} subtitle={t('intel.page.courseSubtitle')}>
        <div className="grid gap-3 md:grid-cols-2">
          {performance.courses.map((course) => (
            <CoursePerformanceCard key={course.id} course={course} />
          ))}
        </div>
        {!performance.courses.length && (
          <p className="text-[14px] text-mutedink">{t('intel.page.noCourses')}</p>
        )}
      </Surface>

      <Surface className="mt-4" title={t('intel.page.attendanceTitle')} subtitle={t('intel.page.attendanceSubtitle')}>
        <AttendanceAllowance attendance={attendance} policy={policy} />
      </Surface>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Surface title={t('intel.page.workTitle')} subtitle={t('intel.page.workSubtitle')}>
          <UpcomingWork work={work} />
        </Surface>
        <Surface title={t('intel.page.advisorTitle')} subtitle={t('intel.page.advisorSubtitle')}>
          <PerformanceAdvisor />
        </Surface>
      </div>

      <Surface className="mt-4" title={t('intel.page.alertsTitle')} subtitle={t('intel.page.alertsSubtitle')}>
        <AlertPreferences preferences={intel.preferences} institution={intel.institution} onSaved={() => load(true)} />
      </Surface>
    </div>
  );
}