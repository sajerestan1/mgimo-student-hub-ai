import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Surface from '@/components/shell/Surface';
import { DEMO_STUDENT } from '@/lib/demoUniversity';

export default function AnnouncementsPanel() {
  return (
    <Surface
      title="Announcements"
      subtitle="University, faculty and course"
      action={
        <Link to="/announcements" className="link-quiet">
          All <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      }
      bodyClassName="px-5 pb-2 pt-1"
    >
      <ul>
        {DEMO_STUDENT.announcements.map((item) => (
          <li key={item.id} className="border-t border-line py-3 first:border-0">
            <div className="flex items-center gap-2">
              <span className="chip bg-[#EDF1FE] px-1.5 py-0 text-[10px] text-[#3B5AE0]">{item.scope}</span>
              <span className="ml-auto text-[10.5px] text-mutedink">{item.date}</span>
            </div>
            <p className="mt-1.5 text-[12.5px] font-medium leading-snug text-ink">{item.title}</p>
            <p className="mt-1 line-clamp-2 text-[11.5px] leading-relaxed text-mutedink">{item.body}</p>
          </li>
        ))}
      </ul>
    </Surface>
  );
}