import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { AlertCircle } from 'lucide-react';
import PageTitle from '@/components/shell/PageTitle';
import Surface from '@/components/shell/Surface';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { loadStudentCourses } from '@/lib/studentCourses';
import { loadCourseWorkspace, buildGradebook, courseProgress } from '@/lib/lms';
import CourseHeader from '@/components/lms/CourseHeader';
import ModuleList from '@/components/lms/ModuleList';
import ResourceReader from '@/components/lms/ResourceReader';
import CourseAssignments from '@/components/lms/CourseAssignments';
import CourseQuizRunner from '@/components/lms/CourseQuizRunner';
import CourseDiscussion from '@/components/lms/CourseDiscussion';
import CourseGradebook from '@/components/lms/CourseGradebook';

const TABS = [
  ['overview', 'Overview'],
  ['modules', 'Modules'],
  ['materials', 'Resources'],
  ['assignments', 'Assignments'],
  ['quizzes', 'Quizzes'],
  ['discussions', 'Discussion'],
  ['gradebook', 'Gradebook'],
];

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const [state, setState] = useState(null);
  const [student, setStudent] = useState(null);
  const [professor, setProfessor] = useState(null);
  const [tab, setTab] = useState('overview');
  const [resource, setResource] = useState(null);
  const [error, setError] = useState('');

  const refresh = async () => {
    const workspace = await loadCourseWorkspace(courseId, user?.id);
    setState(workspace);
    return workspace;
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const context = await loadStudentCourses(user?.id);
        if (!active) return;
        setStudent(context.student);
        const workspace = await loadCourseWorkspace(courseId, user?.id);
        if (!active) return;
        setState(workspace);
        if (workspace.course?.professor_id) {
          const prof = await base44.entities.Professor.get(workspace.course.professor_id).catch(() => null);
          if (active) setProfessor(prof);
        }
      } catch {
        if (active) setError('This course could not be opened.');
      }
    })();
    return () => { active = false; };
  }, [courseId, user?.id]);

  if (error) {
    return (
      <div className="card-surface flex items-center gap-2 p-5 text-[12.5px] text-critical">
        <AlertCircle className="h-4 w-4" /> {error}
      </div>
    );
  }

  if (!state) {
    return <div className="card-surface p-6 text-[12.5px] text-mutedink">Opening course…</div>;
  }

  const { course, modules, resources, assignments, quizzes, questions, attempts, submissions, discussions, progress } = state;
  const progressSummary = courseProgress(modules, progress);
  const gradebook = buildGradebook({ course, assignments, submissions, quizzes, attempts });

  const toggleModule = async (module, completed) => {
    try {
      if (completed) {
        await base44.entities.ModuleProgress.create({
          student_user_id: user?.id,
          student_id: student?.id,
          course_id: course.id,
          course_code: course.code,
          module_id: module.id,
          module_number: module.module_number,
          completed: true,
          completed_at: new Date().toISOString().slice(0, 10),
        });
      } else {
        const existing = progress.find((p) => p.module_id === module.id);
        if (existing) await base44.entities.ModuleProgress.delete(existing.id);
      }
      await refresh();
    } catch {
      setError('Your progress could not be saved.');
    }
  };

  return (
    <div>
      <CourseHeader
        course={course}
        professorName={professor?.full_name}
        progress={progressSummary}
        weighted={gradebook.weighted}
      />

      <div className="mb-4 flex gap-1 overflow-x-auto border-b border-line pb-2">
        {TABS.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors ${
              tab === key ? 'bg-navy text-white' : 'text-mutedink hover:bg-canvas hover:text-ink'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <Surface title="Syllabus" subtitle={`${course.code} · ${course.semester}`}>
            <div className="prose-sm max-w-none text-[12px] leading-relaxed text-ink/80 [&_h1]:mb-2 [&_h1]:text-[14px] [&_h1]:font-semibold [&_h2]:mb-1.5 [&_h2]:mt-4 [&_h2]:text-[12.5px] [&_h2]:font-semibold [&_li]:ml-4 [&_li]:list-disc [&_p]:mb-2 [&_strong]:font-semibold">
              <ReactMarkdown>{course.syllabus || course.description}</ReactMarkdown>
            </div>
          </Surface>

          <div className="space-y-4">
            <Surface title="Learning objectives">
              <ul className="space-y-1.5">
                {(course.objectives || []).map((objective) => (
                  <li key={objective} className="text-[11.5px] leading-relaxed text-ink/80">• {objective}</li>
                ))}
              </ul>
            </Surface>
            <Surface title="Assessment structure">
              <ul className="space-y-1.5 text-[11.5px] text-ink/80">
                <li className="flex justify-between gap-2"><span>Assignments</span><span className="tabular-nums text-mutedink">{course.weight_assignments}%</span></li>
                <li className="flex justify-between gap-2"><span>Quizzes</span><span className="tabular-nums text-mutedink">{course.weight_quizzes}%</span></li>
                <li className="flex justify-between gap-2"><span>Midterm assessment</span><span className="tabular-nums text-mutedink">{course.weight_midterm}%</span></li>
                <li className="flex justify-between gap-2"><span>Final examination</span><span className="tabular-nums text-mutedink">{course.weight_final}%</span></li>
              </ul>
            </Surface>
            <Surface title="Prerequisites">
              <p className="text-[11.5px] leading-relaxed text-ink/80">
                {course.prerequisites?.length ? course.prerequisites.join(', ') : 'None — this course assumes no prior specialist study.'}
              </p>
            </Surface>
          </div>
        </div>
      )}

      {tab === 'modules' && (
        <ModuleList
          modules={modules}
          resources={resources}
          progress={progressSummary}
          assignments={assignments}
          quizzes={quizzes}
          onToggle={toggleModule}
          onOpenResource={setResource}
        />
      )}

      {tab === 'materials' && (
        <Surface title="Learning resources" subtitle={`${resources.length} resources across ${modules.length} modules`} bodyClassName="px-0 pb-0 pt-1">
          <ul className="divide-y divide-line">
            {resources.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setResource(item)}
                  className="row-hover flex w-full items-start gap-3 px-5 py-3 text-left"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[12.5px] font-medium text-ink">{item.title}</p>
                    <p className="mt-0.5 text-[11px] text-mutedink">{item.description}</p>
                  </div>
                  <span className="shrink-0 text-[10px] uppercase tracking-[0.06em] text-mutedink">
                    {item.type.replace(/_/g, ' ')}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Surface>
      )}

      {tab === 'assignments' && (
        <CourseAssignments
          course={course}
          assignments={assignments}
          submissions={submissions}
          student={student}
          onRefresh={refresh}
        />
      )}

      {tab === 'quizzes' && (
        <CourseQuizRunner
          course={course}
          quizzes={quizzes}
          questions={questions}
          attempts={attempts}
          student={student}
          onRefresh={refresh}
        />
      )}

      {tab === 'discussions' && (
        <CourseDiscussion
          course={course}
          discussions={discussions}
          student={student}
          user={user}
          onRefresh={refresh}
        />
      )}

      {tab === 'gradebook' && <CourseGradebook course={course} gradebook={gradebook} />}

      <ResourceReader resource={resource} onClose={() => setResource(null)} />
    </div>
  );
}