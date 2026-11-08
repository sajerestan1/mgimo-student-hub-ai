import { useEffect, useState } from 'react';
import PageTitle from '@/components/shell/PageTitle';
import AnnouncementComposer from '@/components/professor/AnnouncementComposer';
import AnnouncementList from '@/components/professor/AnnouncementList';
import { base44 } from '@/api/base44Client';
import { useProfessorContext, todayIso } from '@/lib/professorData';
import { withRetry } from '@/lib/apiRetry';

export default function ProfessorAnnouncementsPage() {
  const { professor, courses } = useProfessorContext();
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);

  const reload = async (professorId) => {
    const page = await withRetry(() =>
      base44.entities.Announcement.filter({ professor_id: professorId }, { sort: '-created_date', limit: 100 })
    );
    setItems(page.items || []);
  };

  useEffect(() => {
    if (professor) reload(professor.id);
  }, [professor?.id]);

  const handleSave = async ({ id, title, body, course, status }) => {
    const payload = {
      title,
      body,
      status,
      audience_type: 'students',
      publish_date: status === 'published' ? todayIso() : '',
      author_name: professor.full_name,
      course_id: course.id,
      course_code: course.code,
      course_title: course.title,
      professor_id: professor.id,
      faculty_id: professor.faculty_id,
      department_id: professor.department_id,
    };
    if (id) await base44.entities.Announcement.update(id, payload);
    else await base44.entities.Announcement.create(payload);
    setEditing(null);
    await reload(professor.id);
  };

  const handleToggle = async (item) => {
    const next = item.status === 'published' ? 'draft' : 'published';
    await base44.entities.Announcement.update(item.id, {
      status: next,
      publish_date: next === 'published' ? todayIso() : '',
    });
    if (editing?.id === item.id) setEditing({ ...item, status: next });
    await reload(professor.id);
  };

  const handleDelete = async (item) => {
    await base44.entities.Announcement.delete(item.id);
    if (editing?.id === item.id) setEditing(null);
    await reload(professor.id);
  };

  const published = items.filter((item) => item.status === 'published').length;

  if (!professor) return <p className="py-10 text-center text-[12px] text-mutedink">Loading your courses…</p>;

  return (
    <div>
      <PageTitle
        eyebrow="Professor workspace"
        title="Course announcements"
        description="Draft a message for one of your courses and publish it to the students enrolled in it. Published announcements are waiting for them on their dashboard."
        meta={[`${items.length} total`, `${published} live`]}
      />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        <AnnouncementComposer
          courses={courses}
          editing={editing}
          onSave={handleSave}
          onCancelEdit={() => setEditing(null)}
        />
        <AnnouncementList
          items={items}
          onEdit={setEditing}
          onToggle={handleToggle}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}