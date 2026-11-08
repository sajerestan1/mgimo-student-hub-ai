import { useEffect, useState } from 'react';
import PageTitle from '@/components/shell/PageTitle';
import KpiStrip from '@/components/shell/KpiStrip';
import MaterialUploadForm from '@/components/professor/MaterialUploadForm';
import CourseFileList from '@/components/professor/CourseFileList';
import { base44 } from '@/api/base44Client';
import { useProfessorContext } from '@/lib/professorData';

export default function ProfessorMaterialsPage() {
  const { professor, courses } = useProfessorContext();
  const [materials, setMaterials] = useState(null);
  const [courseId, setCourseId] = useState('all');
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    if (!professor) return;
    const page = await base44.entities.CourseMaterial.filter(
      { professor_id: professor.id },
      { sort: '-uploaded_at', limit: 100 }
    );
    setMaterials(page.items || []);
  };

  useEffect(() => {
    load();
  }, [professor?.id]);

  const toggle = async (material) => {
    setBusyId(material.id);
    try {
      await base44.entities.CourseMaterial.update(material.id, { published: !material.published });
      await load();
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (material) => {
    setBusyId(material.id);
    try {
      await base44.entities.CourseMaterial.delete(material.id);
      await load();
    } finally {
      setBusyId(null);
    }
  };

  if (!materials) return <p className="py-10 text-center text-[12px] text-mutedink">Loading course files…</p>;

  const scoped = courseId === 'all' ? materials : materials.filter((item) => item.course_id === courseId);
  const countOf = (type) => scoped.filter((item) => item.type === type).length;
  const selectedCourse = courses.find((course) => course.id === courseId);

  return (
    <div>
      <PageTitle
        eyebrow="Professor workspace"
        title="Course files"
        description="Upload and manage lecture notes, slides and syllabus documents for each course. Published files are visible to enrolled students; drafts stay with you."
        meta={[
          `${materials.length} documents in total`,
          `${materials.filter((item) => item.published).length} published`,
          selectedCourse ? `${selectedCourse.code} · ${selectedCourse.title}` : 'All courses',
        ]}
        actions={
          <select
            value={courseId}
            onChange={(event) => setCourseId(event.target.value)}
            className="rounded-lg border border-line bg-white px-2.5 py-1.5 text-[11.5px] text-ink"
          >
            <option value="all">All my courses</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.code} · {course.title}
              </option>
            ))}
          </select>
        }
      />

      <KpiStrip
        className="mb-4"
        columns={4}
        items={[
          { label: 'Documents', value: scoped.length, hint: 'In this course scope' },
          { label: 'Lecture notes', value: countOf('lecture_notes'), hint: 'Handouts and notes' },
          { label: 'Slide decks', value: countOf('presentation'), hint: 'Presentations' },
          { label: 'Syllabi', value: countOf('syllabus'), hint: 'Course outlines' },
        ]}
      />

      <div className="grid items-start gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
        <MaterialUploadForm
          professor={professor}
          courses={courses}
          defaultCourseId={courseId}
          onSaved={load}
        />
        <CourseFileList materials={scoped} busyId={busyId} onToggle={toggle} onRemove={remove} />
      </div>
    </div>
  );
}