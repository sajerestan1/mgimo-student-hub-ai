import Surface from '@/components/shell/Surface';
import StatusChip from '@/components/shell/StatusChip';
import { dateLabel } from '@/lib/professorData';

const TONES = { published: 'positive', draft: 'neutral', scheduled: 'warning', archived: 'neutral' };

export default function AnnouncementList({ items, onEdit, onToggle, onDelete }) {
  return (
    <Surface
      title="Course announcements"
      subtitle={`${items.length} announcement${items.length === 1 ? '' : 's'} across your courses`}
      bodyClassName="px-0 pb-0 pt-1"
    >
      {!items.length && (
        <p className="px-5 py-6 text-[11.5px] text-mutedink">
          Nothing written yet. Draft an announcement and publish it when you are ready.
        </p>
      )}
      <ul className="divide-y divide-line">
        {items.map((item) => (
          <li key={item.id} className="px-5 py-3.5">
            <div className="flex flex-wrap items-center gap-1.5">
              {item.course_code && <StatusChip tone="brand">{item.course_code}</StatusChip>}
              <StatusChip tone={TONES[item.status] || 'neutral'}>{item.status}</StatusChip>
              <span className="text-[10.5px] text-mutedink">
                {item.status === 'published' ? `Published ${dateLabel(item.publish_date)}` : 'Not visible to students yet'}
              </span>
            </div>
            <p className="mt-1.5 text-[12.5px] font-medium text-ink">{item.title}</p>
            <p className="mt-0.5 whitespace-pre-line text-[11.5px] leading-relaxed text-mutedink">{item.body}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => onToggle(item)} className="link-quiet">
                {item.status === 'published' ? 'Move to draft' : 'Publish now'}
              </button>
              <button type="button" onClick={() => onEdit(item)} className="link-quiet">
                Edit
              </button>
              <button type="button" onClick={() => onDelete(item)} className="text-[11.5px] font-medium text-critical hover:underline">
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </Surface>
  );
}