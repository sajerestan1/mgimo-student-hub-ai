import { Pencil, Plus, Trash2 } from 'lucide-react';
import Surface from '@/components/shell/Surface';
import StatusChip from '@/components/shell/StatusChip';

// The course structure itself: the modules students work through.
export default function ContentModuleList({ modules, resources, selectedId, onSelect, onNew, onEdit, onDelete }) {
  return (
    <Surface
      title="Course modules"
      subtitle={`${modules.length} modules in this course`}
      bodyClassName="px-0 pb-0 pt-1"
      action={
        <button type="button" onClick={onNew} className="btn-quiet btn-sm">
          <Plus className="h-3.5 w-3.5" /> Module
        </button>
      }
    >
      <button
        type="button"
        onClick={() => onSelect('all')}
        className={`flex w-full items-center justify-between gap-2 border-b border-line px-5 py-2.5 text-left text-[11.5px] ${
          selectedId === 'all' ? 'bg-[#FAFBFD] font-medium text-ink' : 'text-mutedink hover:bg-[#FAFBFD]'
        }`}
      >
        All modules
        <span className="text-[10.5px] text-mutedink">{resources.length} resources</span>
      </button>
      <ul className="divide-y divide-line">
        {modules.map((module) => {
          const own = resources.filter((r) => r.module_id === module.id);
          const published = own.filter((r) => r.visible_to_students).length;
          return (
            <li
              key={module.id}
              className={`flex items-start justify-between gap-2 px-5 py-2.5 ${selectedId === module.id ? 'bg-[#FAFBFD]' : ''}`}
            >
              <button type="button" onClick={() => onSelect(module.id)} className="min-w-0 flex-1 text-left">
                <p className="truncate text-[12px] text-ink">
                  <span className="mr-1.5 font-mono text-[10.5px] text-mutedink">M{module.module_number}</span>
                  {module.title}
                </p>
                <p className="mt-0.5 text-[10.5px] text-mutedink">
                  {own.length} resources · {published} published
                </p>
                {module.status === 'draft' && (
                  <StatusChip tone="warning" className="mt-1">Draft — hidden from students</StatusChip>
                )}
              </button>
              <div className="flex shrink-0 items-center gap-0.5">
                <button type="button" onClick={() => onEdit(module)} className="icon-btn h-7 w-7" aria-label="Edit module">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => onDelete(module)} className="icon-btn h-7 w-7" aria-label="Delete module">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          );
        })}
        {!modules.length && <li className="px-5 py-6 text-[11.5px] text-mutedink">No modules yet — create the first one.</li>}
      </ul>
    </Surface>
  );
}