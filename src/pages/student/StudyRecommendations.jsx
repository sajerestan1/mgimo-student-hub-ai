import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Sparkles } from 'lucide-react';
import PageTitle from '@/components/shell/PageTitle';
import Surface from '@/components/shell/Surface';
import KpiStrip from '@/components/shell/KpiStrip';
import StatusChip from '@/components/shell/StatusChip';
import RecommendationCard from '@/components/student/RecommendationCard';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { coursePath, loadStudentPortal } from '@/lib/studentPortal';
import {
  generateStudyPlan,
  hasGradedWork,
  loadRecommendations,
  savePlan,
} from '@/lib/studyRecommendations';

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

export default function StudyRecommendations() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [context, setContext] = useState(null);
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState('');
  const [generating, setGenerating] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.id) return;
    loadStudentPortal().then(setContext);
    loadRecommendations(user.id).then(setItems);
  }, [user?.id]);

  const courses = context?.courses || [];
  const materials = context?.materials || [];
  const ready = hasGradedWork(context);

  const weakest = useMemo(
    () =>
      courses
        .filter((course) => course.weighted !== null)
        .sort((a, b) => a.weighted - b.weighted)[0] || null,
    [courses]
  );

  const ordered = useMemo(
    () =>
      [...items].sort(
        (a, b) =>
          (a.status === 'done' ? 1 : 0) - (b.status === 'done' ? 1 : 0) ||
          (PRIORITY_ORDER[a.priority] ?? 1) - (PRIORITY_ORDER[b.priority] ?? 1)
      ),
    [items]
  );

  const open = items.filter((item) => item.status !== 'done');
  const completed = items.length - open.length;

  const generate = async () => {
    if (!context || !ready) return;
    setGenerating(true);
    setError('');
    try {
      const plan = await generateStudyPlan(context, materials);
      setSummary(plan?.summary || '');
      await savePlan({
        userId: user.id,
        studentName: context.profile.full_name,
        recommendations: plan?.recommendations,
        materials,
        courses,
      });
      setItems(await loadRecommendations(user.id));
    } catch {
      setError('The plan could not be built just now. Please try again in a moment.');
    } finally {
      setGenerating(false);
    }
  };

  const changeStatus = async (item, status) => {
    setBusyId(item.id);
    try {
      const updated = await base44.entities.StudyRecommendation.update(item.id, { status });
      setItems((prev) => prev.map((row) => (row.id === updated.id ? updated : row)));
    } finally {
      setBusyId(null);
    }
  };

  const openMaterial = (item) => {
    const course = courses.find((entry) => entry.code === item.course_code);
    if (course) navigate(coursePath(course.id));
  };

  if (!context) return <div className="h-64 animate-pulse rounded-xl bg-white" />;

  return (
    <div>
      <PageTitle
        eyebrow="Student workspace"
        title="Study recommendations"
        description="A plan built from your own marks, attendance and open work: the readings and tasks most likely to lift your weakest results."
        meta={[
          `${courses.length} courses analysed`,
          `${materials.length} published materials in scope`,
          'AI-generated guidance',
        ]}
        actions={
          <button
            type="button"
            onClick={generate}
            disabled={generating || !ready}
            className="btn-primary disabled:opacity-50"
          >
            {generating ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Building plan…
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" /> {items.length ? 'Refresh plan' : 'Build my plan'}
              </>
            )}
          </button>
        }
      />

      <KpiStrip
        className="mb-4"
        columns={4}
        items={[
          {
            label: 'Weighted average',
            value: context.summary.average === null ? '—' : context.summary.average.toFixed(1),
            delta: context.summary.averageLetter,
            tone: 'neutral',
            hint: context.summary.average === null ? 'No result recorded yet' : 'Drives the plan',
          },
          {
            label: 'Weakest course',
            value: weakest ? weakest.weighted.toFixed(1) : '—',
            delta: weakest ? weakest.code : '',
            tone: weakest ? 'critical' : 'neutral',
            hint: weakest ? `Grade ${weakest.letter}` : 'Not enough results',
          },
          { label: 'Steps to work through', value: open.length, hint: 'Suggested or in progress' },
          { label: 'Completed', value: completed, hint: 'Marked done by you' },
        ]}
      />

      {error && <p className="mb-3 text-[14px] text-critical">{error}</p>}

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <Surface
          title="Your plan"
          subtitle={summary || 'Each step names the exact reading or task to work through next.'}
          bodyClassName="px-0 pb-0 pt-0"
          action={
            items.length ? (
              <StatusChip tone="brand">{open.length} open</StatusChip>
            ) : (
              <StatusChip tone="neutral">Not built yet</StatusChip>
            )
          }
        >
          {!items.length && (
            <div className="px-5 py-10 text-center">
              <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-royal/10 text-royal">
                <Sparkles className="h-5 w-5" />
              </span>
              <p className="mt-3 text-[15px] font-medium text-ink">
                {generating ? 'Reading your record…' : ready ? 'No plan yet' : 'More academic activity needed'}
              </p>
              <p className="mx-auto mt-1 max-w-sm text-[14px] leading-relaxed text-mutedink">
                {ready
                  ? 'Your adviser reviews every course result, attendance record and open deadline, then proposes work you can start today.'
                  : 'A plan is built from graded work and recorded attendance. Once your first result is published in your courses, you can build one here.'}
              </p>
              {ready && !generating && (
                <button type="button" onClick={generate} className="btn-primary mx-auto mt-4">
                  <Sparkles className="h-3.5 w-3.5" /> Build my study plan
                </button>
              )}
            </div>
          )}

          {ordered.map((item) => (
            <RecommendationCard
              key={item.id}
              item={item}
              hasFile={Boolean(item.material_id)}
              busy={busyId === item.id}
              onStatus={changeStatus}
              onOpenMaterial={openMaterial}
            />
          ))}
        </Surface>

        <div className="space-y-4">
          <Surface title="Where the plan starts" subtitle="Recorded course results">
            {courses.length ? (
              <ul className="space-y-2">
                {[...courses]
                  .sort((a, b) => (a.weighted ?? 999) - (b.weighted ?? 999))
                  .map((course) => (
                    <li key={course.id} className="flex items-center justify-between gap-2 text-[14px]">
                      <span className="min-w-0 truncate text-ink">
                        <span className="font-medium">{course.code}</span>
                      </span>
                      <span className="shrink-0 tabular-nums text-mutedink">
                        {course.weighted === null ? 'not graded' : `${course.weighted.toFixed(1)} · ${course.letter}`}
                      </span>
                    </li>
                  ))}
              </ul>
            ) : (
              <p className="text-[14px] text-mutedink">No published courses yet.</p>
            )}
          </Surface>

          <Surface title="How this works">
            <ul className="space-y-1.5 text-[14px] leading-relaxed text-ink/80">
              <li>· Reads your own marks, attendance and open assignments</li>
              <li>· Recommends only materials published for your courses</li>
              <li>· Regenerating replaces the steps you have not started</li>
            </ul>
            <p className="mt-3 border-t border-line pt-3 text-[13px] leading-relaxed text-mutedink">
              These are AI-generated suggestions, not official academic decisions. Grades are changed only by your
              professors.
            </p>
          </Surface>
        </div>
      </div>
    </div>
  );
}