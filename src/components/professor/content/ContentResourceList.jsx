import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import Surface from '@/components/shell/Surface';
import StatusChip from '@/components/shell/StatusChip';
import { typeLabel } from '@/lib/contentTypes';

// The learning resources that sit inside the modules.
export default function ContentResourceList({ resources, modules, scopeLabel, onNew, onPreview, onEdit, onToggle, onDelete }) {
  return (
    <Surface
      title="Learning resources"
      subtitle={`${resources.length} in ${scopeLabel}`}
      bodyClassName="px-0 pb-0 pt-1"
      action={
        <button type="button" onClick={onNew} className="btn-quiet btn-sm">
          <Plus className="h-3.5 w-3.5" /> Resource
        </button>
      }
    >
      {!resources.length && (
        <p className="px-5 py-6 text-[11.5px] text-mutedink">No resources in this module yet. Create one to give students something to read.</p>
      )}
      <ul className="divide-y divide-line">
        {resources.map((resource) => {
          const module = modules.find((m) => m.id === resource.module_id);
          return (
            <li key={resource.id} className="px-5 py-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-[12.5px] font-medium text-ink">{resource.title}</p>
                  <p className="mt-0.5 text-[10.5px] text-mutedink">
                    {typeLabel(resource.type)} · {module ? `Module ${module.module_number}` : 'No module'} ·{' '}
                    {(resource.content || '').length} characters
                    {resource.file_name ? ` · ${resource.file_name}` : ''}
                  </p>
                </div>
                <StatusChip tone={resource.visible_to_students ? 'positive' : 'warning'}>
                  {resource.visible_to_students ? 'Published' : 'Draft'}
                </StatusChip>
              </div>

              {resource.description && (
                <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-mutedink">{resource.description}</p>
              )}

              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <button type="button" onClick={() => onPreview(resource)} className="btn-quiet btn-sm">
                  <Eye className="h-3.5 w-3.5" /> Preview
                </button>
                <button type="button" onClick={() => onEdit(resource)} className="btn-quiet btn-sm">
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                <button type="button" onClick={() => onToggle(resource)} className="btn-quiet btn-sm">
                  {resource.visible_to_students ? 'Unpublish' : 'Publish'}
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(resource)}
                  className="btn-quiet btn-sm text-critical hover:border-critical/40"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </Surface>
  );
}