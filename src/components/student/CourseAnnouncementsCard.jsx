import { useEffect, useState } from 'react';
import { Megaphone } from 'lucide-react';
import Surface from '@/components/shell/Surface';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { loadStudentCourses, shortDate } from '@/lib/studentCourses';

export default function CourseAnnouncementsCard() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { courseIds } = await loadStudentCourses(user?.id);
        if (!courseIds.length) return;
        const page = await base44.entities.Announcement.filter(
          { course_id: { $in: courseIds }, status: 'published' },
          { sort: '-publish_date', limit: 8 }
        );
        if (alive) setItems(page.items || []);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [user?.id]);

  return (
    <Surface
      title="From your professors"
      subtitle="Course announcements posted for the courses you are enrolled in"
      bodyClassName="px-5 pb-5 pt-1"
    >
      {loading && <p className="py-3 text-[11.5px] text-mutedink">Loading announcements…</p>}
      {!loading && !items.length && (
        <p className="py-3 text-[11.5px] text-mutedink">No course announcements right now.</p>
      )}
      <ul className="divide-y divide-line">
        {items.map((item) => (
          <li key={item.id} className="py-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded bg-brand-soft px-1.5 py-0.5 text-[10px] font-medium text-brand">
                <Megaphone className="h-3 w-3" />
                {item.course_code || 'Course'}
              </span>
              <span className="text-[10.5px] text-mutedink">{shortDate(item.publish_date || item.created_date)}</span>
            </div>
            <p className="mt-1.5 text-[12.5px] font-medium text-ink">{item.title}</p>
            <p className="mt-0.5 whitespace-pre-line text-[11px] leading-relaxed text-mutedink">{item.body}</p>
            {item.author_name && <p className="mt-1 text-[10.5px] text-mutedink">— {item.author_name}</p>}
          </li>
        ))}
      </ul>
    </Surface>
  );
}