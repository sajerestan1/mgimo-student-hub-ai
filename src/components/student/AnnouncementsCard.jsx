import Surface from '@/components/shell/Surface';
import { ANNOUNCEMENTS, formatDate } from '@/lib/studentWorkspace';

const PRIORITY = {
  high: { label: 'Important', className: 'bg-[#FBECEC] text-[#A23B3B]' },
  normal: { label: 'Academic', className: 'bg-[#EEEBFE] text-[#5B4DEB]' },
  info: { label: 'Notice', className: 'bg-[#F2F4F8] text-[#5A6779]' },
};

export default function AnnouncementsCard() {
  return (
    <Surface title="Announcements" subtitle="From your faculty and the student office" bodyClassName="px-5 pb-5 pt-1">
      <ul className="divide-y divide-line">
        {ANNOUNCEMENTS.map((item) => {
          const priority = PRIORITY[item.priority] || PRIORITY.info;
          return (
            <li key={item.id} className="py-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${priority.className}`}>
                  {priority.label}
                </span>
                <span className="text-[10.5px] text-mutedink">{formatDate(item.date)}</span>
              </div>
              <p className="mt-1.5 text-[12.5px] font-medium text-ink">{item.title}</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-mutedink">{item.body}</p>
            </li>
          );
        })}
      </ul>
    </Surface>
  );
}