import { useCallback, useEffect, useMemo, useState } from 'react';
import PageTitle from '@/components/shell/PageTitle';
import KpiStrip from '@/components/shell/KpiStrip';
import Surface from '@/components/shell/Surface';
import ModuleForm from '@/components/professor/content/ModuleForm';
import ResourceForm from '@/components/professor/content/ResourceForm';
import ContentModuleList from '@/components/professor/content/ContentModuleList';
import ContentResourceList from '@/components/professor/content/ContentResourceList';
import ResourcePreviewDialog from '@/components/professor/content/ResourcePreviewDialog';
import { base44 } from '@/api/base44Client';
import { useProfessorContext, todayIso } from '@/lib/professorData';

// Course content management, writing straight into the LMS module and
// resource records the student workspace reads.
export default function ProfessorMaterialsPage() {
  const { professor, courses } = useProfessorContext();
  const taught = useMemo(() => courses.filter((course) => course.status !== 'archived'), [courses]);

  const [courseId, setCourseId] = useState('');
  const [modules, setModules] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moduleForm, setModuleForm] = useState(null);
  const [resourceForm, setResourceForm] = useState(null);
  const [selectedModule, setSelectedModule] = useState('all');
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!courseId && taught.length) setCourseId(taught[0].id);
  }, [taught, courseId]);

  const course = taught.find((row) => row.id === courseId) || null;

  const load = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    const [modulePage, resourcePage] = await Promise.all([
      base44.entities.CourseModule.filter({ course_id: courseId }, { sort: 'module_number', limit: 60 }),
      base44.entities.LearningResource.filter({ course_id: courseId }, { sort: 'module_number', limit: 200 }),
    ]);
    setModules(modulePage.items || []);
    setResources(resourcePage.items || []);
    setLoading(false);
  }, [courseId]);

  useEffect(() => {
    load();
  }, [load]);

  const nextNumber = useMemo(
    () => (modules.length ? Math.max(...modules.map((m) => m.module_number || 0)) + 1 : 1),
    [modules]
  );

  const scopedResources = selectedModule === 'all' ? resources : resources.filter((r) => r.module_id === selectedModule);
  const scopeModule = modules.find((m) => m.id === selectedModule);

  const saveModule = async (values) => {
    if (!course) return;
    setBusy(true);
    try {
      if (moduleForm?.initial) {
        await base44.entities.CourseModule.update(moduleForm.initial.id, values);
      } else {
        await base44.entities.CourseModule.create({
          ...values,
          course_id: course.id,
          course_code: course.code,
          course_title: course.title,
          professor_id: course.professor_id || professor?.id,
          is_demo: false,
        });
      }
      setModuleForm(null);
      await load();
    } finally {
      setBusy(false);
    }
  };

  const deleteModule = async (module) => {
    if (resources.some((r) => r.module_id === module.id)) {
      window.alert('This module still holds resources. Move or delete them first.');
      return;
    }
    if (!window.confirm(`Delete module ${module.module_number} — ${module.title}?`)) return;
    await base44.entities.CourseModule.delete(module.id);
    if (selectedModule === module.id) setSelectedModule('all');
    await load();
  };

  const saveResource = async (values) => {
    if (!course) return;
    setBusy(true);
    try {
      const payload = {
        ...values,
        course_id: course.id,
        course_code: course.code,
        professor_id: course.professor_id || professor?.id,
        published_date: values.visible_to_students ? todayIso() : null,
      };
      if (resourceForm?.initial) {
        await base44.entities.LearningResource.update(resourceForm.initial.id, payload);
      } else {
        await base44.entities.LearningResource.create({ ...payload, is_demo: false });
      }
      setResourceForm(null);
      await load();
    } finally {
      setBusy(false);
    }
  };

  const toggleResource = async (resource) => {
    await base44.entities.LearningResource.update(resource.id, {
      visible_to_students: !resource.visible_to_students,
      published_date: resource.visible_to_students ? null : todayIso(),
    });
    await load();
  };

  const deleteResource = async (resource) => {
    if (!window.confirm(`Delete “${resource.title}”? Students will lose access immediately.`)) return;
    await base44.entities.LearningResource.delete(resource.id);
    await load();
  };

  if (!professor) return <p className="py-10 text-center text-[12px] text-mutedink">Loading your courses…</p>;

  return (
    <div>
      <PageTitle
        eyebrow="Professor workspace"
        title="Course content"
        description="Edit the modules and learning resources students see in their course workspace. Drafts stay private until you publish them."
        meta={[
          course ? `${course.code} · ${course.title}` : 'No course selected',
          `${modules.length} modules`,
          `${resources.filter((r) => r.visible_to_students).length} of ${resources.length} resources published`,
        ]}
        actions={
          <select
            value={courseId}
            onChange={(event) => { setCourseId(event.target.value); setSelectedModule('all'); setModuleForm(null); setResourceForm(null); }}
            className="rounded-lg border border-line bg-white px-2.5 py-1.5 text-[11.5px] text-ink"
          >
            {taught.map((row) => (
              <option key={row.id} value={row.id}>{row.code} · {row.title}</option>
            ))}
          </select>
        }
      />

      {!taught.length && (
        <Surface title="No courses assigned">
          <p className="text-[11.5px] text-mutedink">No published course is assigned to your profile yet.</p>
        </Surface>
      )}

      {course && (
        <>
          <KpiStrip
            className="mb-4"
            columns={4}
            items={[
              { label: 'Modules', value: modules.length, hint: 'Course structure' },
              { label: 'Resources', value: resources.length, hint: 'All modules' },
              { label: 'Published', value: resources.filter((r) => r.visible_to_students).length, hint: 'Visible to students' },
              { label: 'Drafts', value: resources.filter((r) => !r.visible_to_students).length, hint: 'Hidden until published' },
            ]}
          />

          <div className="grid items-start gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
            <div className="space-y-4">
              <ContentModuleList
                modules={modules}
                resources={resources}
                selectedId={selectedModule}
                onSelect={(id) => { setSelectedModule(id); setResourceForm(null); }}
                onNew={() => setModuleForm({ initial: null })}
                onEdit={(module) => setModuleForm({ initial: module })}
                onDelete={deleteModule}
              />
              {moduleForm && (
                <ModuleForm
                  initial={moduleForm.initial}
                  nextNumber={nextNumber}
                  busy={busy}
                  onCancel={() => setModuleForm(null)}
                  onSubmit={saveModule}
                />
              )}
            </div>

            <div className="space-y-4">
              {loading ? (
                <Surface><p className="text-[11.5px] text-mutedink">Loading course content…</p></Surface>
              ) : (
                <ContentResourceList
                  resources={scopedResources}
                  modules={modules}
                  scopeLabel={scopeModule ? `module ${scopeModule.module_number}` : 'this course'}
                  onNew={() => setResourceForm({ initial: null })}
                  onPreview={setPreview}
                  onEdit={(resource) => setResourceForm({ initial: resource })}
                  onToggle={toggleResource}
                  onDelete={deleteResource}
                />
              )}
              {resourceForm && (
                <ResourceForm
                  initial={resourceForm.initial}
                  modules={modules}
                  defaultModuleId={selectedModule === 'all' ? modules[0]?.id : selectedModule}
                  busy={busy}
                  onCancel={() => setResourceForm(null)}
                  onSubmit={saveResource}
                />
              )}
            </div>
          </div>
        </>
      )}

      <ResourcePreviewDialog resource={preview} onClose={() => setPreview(null)} />
    </div>
  );
}