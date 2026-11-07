import { useEffect, useState } from 'react';
import Surface from '@/components/shell/Surface';
import StatusChip from '@/components/shell/StatusChip';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { loadStudentCourses, openPrivateFile, shortDate } from '@/lib/studentCourses';

export default function CourseMaterialsPanel() {
  const { user } = useAuth();
  const [materials, setMaterials] = useState(null);

  useEffect(() => {
    (async () => {
      const context = await loadStudentCourses(user?.id);
      if (!context.courseIds.length) {
        setMaterials([]);
        return;
      }
      const page = await base44.entities.CourseMaterial.filter(
        { course_id: { $in: context.courseIds }, published: true },
        { sort: '-uploaded_at', limit: 60 }
      );
      setMaterials(page.items || []);
    })();
  }, [user?.id]);

  if (!materials || !materials.length) return null;

  return (
    <div className="mb-4">
      <Surface title="Materials published by your professors" subtitle="Readings, notes and datasets for your courses" bodyClassName="px-0 pb-0 pt-1">
        <ul className="divide-y divide-line">
          {materials.map((material) => (
            <li key={material.id} className="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="truncate text-[12px] font-medium text-ink">{material.title}</p>
                <p className="mt-0.5 text-[10.5px] text-mutedink">
                  {material.course_code} · {material.topic || 'No topic'} · {material.type.replace('_', ' ')} · {shortDate(material.uploaded_at)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <StatusChip tone="brand">Published</StatusChip>
                {material.file_url && (
                  <button type="button" onClick={() => openPrivateFile(material.file_url)} className="btn-quiet btn-sm">
                    Open file
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Surface>
    </div>
  );
}