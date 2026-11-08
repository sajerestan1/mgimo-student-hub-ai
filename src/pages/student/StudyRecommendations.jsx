import { useEffect, useMemo, useState } from 'react';
import { RefreshCw, Sparkles } from 'lucide-react';
import PageTitle from '@/components/shell/PageTitle';
import Surface from '@/components/shell/Surface';
import KpiStrip from '@/components/shell/KpiStrip';
import StatusChip from '@/components/shell/StatusChip';
import RecommendationCard from '@/components/student/RecommendationCard';
import CourseSnapshot from '@/components/student/CourseSnapshot';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { COURSES, STUDENT, SUMMARY, courseAverage, letterFor } from '@/lib/studentWorkspace';
import { openPrivateFile } from '@/lib/studentCourses';
import {
  generateStudyPlan,
  loadPublishedMaterials,
  loadRecommendations,
  savePlan,
} from '@/lib/studyRecommendations';

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

export default function StudyRecommendations() {
  const { user } = useAuth();
  const [materials, setMaterials] = useState(null);
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState('');
  const [generating, setGenerating] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const [published, existing] = await Promise.all([
        loadPublishedMaterials(),
        loadRecommendations(user.id),
      ]);
      setMaterials(published);
      setItems(existing);
    })();
  }, [user?.id]);

  const weakest = useMemo(
    () =>
      COURSES.map((course) => ({ course, average: courseAverage(course.id) })).sort(
        (a, b) => a.average - b.average
      )[0],
    []
  );

  const materialFiles = useMemo(
    () => new Map((materials || []).map((material) => [material.id, Boolean(material.file_url)])),
    [materials]
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
    setGenerating(true);
    setError('');
    try {
      const published = materials || (await loadPublishedMaterials());
      setMaterials(published);
      const plan = await generateStudyPlan(published);
      setSummary(plan?.summary || '');
      await savePlan({
        userId: user.id,
        studentName: STUDENT.fullName,
        recommendations: plan?.recommendations,
        materials: published,
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

  const openMaterial = async (item) => {
    try {
      const material = await base44.entities.CourseMaterial.get(item.material_id);
      if (material?.file_url) await openPrivateFile(material.file_url);
      else setError('That file is no longer published.');
    } catch {
      setError('That file is no longer available.');
    }
  };

  return (
    <div>
      <PageTitle
        eyebrow="Student workspace"
        title="Study recommendations"
        description="A plan built from your own marks, attendance and open work: the readings and remedial tasks most likely to lift your weakest grades."
        meta={[
          STUDENT.semester,
          `${COURSES.length} courses analysed`,
          materials === null ? 'Loading materials…' : `${materials.length} published materials in scope`,
        ]}
        actions={
          <button type="button" onClick={generate} disabled={generating} className="btn-primary disabled:opacity-50">
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
            value: SUMMARY.averageMark.toFixed(1),
            delta: SUMMARY.averageLetter,
            tone: 'neutral',
            hint: 'Drives the plan',
          },
          {
            label: 'Weakest course',
            value: weakest.average.toFixed(1),
            delta: weakest.course.code,
            tone: 'critical',
            hint: `Grade ${letterFor(weakest.average)}`,
          },
          {
            label: 'Steps to work through',
            value: open.length,
            hint: 'Suggested or in progress',
          },
          {
            label: 'Completed',
            value: completed,
            hint: 'Marked done by you',
          },
        ]}
      />

      {error && <p className="mb-3 text-[11.5px] text-critical">{error}</p>}

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
              <p className="mt-3 text-[12.5px] font-medium text-ink">
                {generating ? 'Reading your record…' : 'No plan yet'}
              </p>
              <p className="mx-auto mt-1 max-w-sm text-[11.5px] leading-relaxed text-mutedink">
                The adviser reviews every course average, attendance record and open deadline, then proposes
                readings and remedial tasks you can start today.
              </p>
              {!generating && (
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
              hasFile={Boolean(materialFiles.get(item.material_id))}
              busy={busyId === item.id}
              onStatus={changeStatus}
              onOpenMaterial={openMaterial}
            />
          ))}
        </Surface>

        <div className="space-y-4">
          <Surface title="Where the plan starts" subtitle="Current course averages">
            <CourseSnapshot />
          </Surface>

          <Surface title="How this works">
            <ul className="space-y-1.5 text-[11.5px] leading-relaxed text-ink/80">
              <li>· Reads your marks, attendance and open assignments</li>
              <li>· Recommends only materials published for your courses</li>
              <li>· Regenerating replaces the steps you have not started</li>
            </ul>
            <p className="mt-3 border-t border-line pt-3 text-[10.5px] leading-relaxed text-mutedink">
              Suggestions are guidance, not a record: grades are changed only by your professors. Based on the
              demonstration academic record.
            </p>
          </Surface>
        </div>
      </div>
    </div>
  );
}