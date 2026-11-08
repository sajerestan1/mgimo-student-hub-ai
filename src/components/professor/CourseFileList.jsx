import { useMemo, useState } from 'react';
import {
  BookMarked,
  BookOpen,
  File as FileIcon,
  FileSpreadsheet,
  FileText,
  Presentation,
} from 'lucide-react';
import Surface from '@/components/shell/Surface';
import StatusChip from '@/components/shell/StatusChip';
import { dateLabel, openStoredFile } from '@/lib/professorData';
import { MATERIAL_TYPES, typeLabel } from '@/lib/materialTypes';

const ICONS = {
  lecture_notes: FileText,
  presentation: Presentation,
  syllabus: BookOpen,
  reading: BookMarked,
  dataset: FileSpreadsheet,
  other: FileIcon,
};

export default function CourseFileList({ materials, onToggle, onRemove, busyId }) {
  const [typeFilter, setTypeFilter] = useState('all');

  const filtered = typeFilter === 'all' ? materials : materials.filter((item) => item.type === typeFilter);

  const groups = useMemo(() => {
    const map = new Map();
    filtered.forEach((item) => {
      const key = item.course_code || 'Unassigned';
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(item);
    });
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  return (
    <Surface
      title="Course files"
      subtitle="Grouped by course — publish, open or remove each document"
      action={<StatusChip tone="brand">{filtered.length} files</StatusChip>}
      bodyClassName="px-0 pb-0 pt-0"
    >
      <div className="no-scrollbar flex gap-1 overflow-x-auto border-b border-line px-4 py-2">
        {[{ value: 'all', label: 'All' }, ...MATERIAL_TYPES].map((type) => {
          const count =
            type.value === 'all' ? materials.length : materials.filter((item) => item.type === type.value).length;
          return (
            <button
              key={type.value}
              type="button"
              onClick={() => setTypeFilter(type.value)}
              className={`shrink-0 rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                typeFilter === type.value ? 'bg-royal-soft text-royal' : 'text-mutedink hover:bg-canvas'
              }`}
            >
              {type.label}
              <span className="ml-1 tabular-nums opacity-70">{count}</span>
            </button>
          );
        })}
      </div>

      {!filtered.length && (
        <p className="px-5 py-8 text-[11.5px] text-mutedink">
          No documents in this filter yet — upload lecture notes, slides or a syllabus on the left.
        </p>
      )}

      {groups.map(([courseCode, rows]) => (
        <section key={courseCode}>
          <header className="flex items-center justify-between gap-2 border-b border-line bg-canvas/70 px-5 py-2">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-mutedink">{courseCode}</p>
            <p className="text-[10px] tabular-nums text-mutedink">{rows.length} files</p>
          </header>
          <ul className="divide-y divide-line">
            {rows.map((item) => {
              const Icon = ICONS[item.type] || FileIcon;
              return (
                <li key={item.id} className="flex flex-wrap items-start gap-2.5 px-5 py-3">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-canvas text-mutedink">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-medium text-ink">{item.title}</p>
                    <p className="mt-0.5 text-[10.5px] text-mutedink">
                      {typeLabel(item.type)} · {item.topic || 'No topic'} · {dateLabel(item.uploaded_at)} ·{' '}
                      {item.file_name || 'no file attached'}
                    </p>
                    {item.description && (
                      <p className="mt-0.5 line-clamp-2 text-[10.5px] leading-relaxed text-mutedink/90">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                    <StatusChip tone={item.published ? 'positive' : 'neutral'}>
                      {item.published ? 'Published' : 'Draft'}
                    </StatusChip>
                    {item.file_url && (
                      <button type="button" onClick={() => openStoredFile(item.file_url)} className="btn-quiet btn-sm">
                        Open
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onToggle(item)}
                      disabled={busyId === item.id}
                      className="btn-quiet btn-sm disabled:opacity-50"
                    >
                      {item.published ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemove(item)}
                      disabled={busyId === item.id}
                      className="btn-quiet btn-sm text-critical disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </Surface>
  );
}