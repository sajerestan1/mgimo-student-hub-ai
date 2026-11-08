import ReactMarkdown from 'react-markdown';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { openStoredFile } from '@/lib/professorData';
import { typeLabel } from '@/lib/contentTypes';

// Shows a resource exactly as students will read it, before it is published.
export default function ResourcePreviewDialog({ resource, onClose }) {
  const open = Boolean(resource);
  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[16px]">{resource?.title}</DialogTitle>
        </DialogHeader>
        <p className="text-[11px] text-mutedink">
          {resource ? typeLabel(resource.type) : ''} · Module {resource?.module_number || '—'} ·{' '}
          {resource?.visible_to_students ? 'Published to students' : 'Draft — students cannot see this yet'}
        </p>
        {resource?.description && (
          <p className="mt-3 rounded-lg border border-line bg-canvas px-3 py-2 text-[11.5px] leading-relaxed text-ink/80">
            {resource.description}
          </p>
        )}
        <div className="mt-3 text-[12px] leading-relaxed text-ink [&_h2]:mb-1 [&_h2]:mt-3 [&_h2]:text-[13px] [&_h2]:font-semibold [&_h3]:mb-1 [&_h3]:mt-2 [&_h3]:text-[12.5px] [&_h3]:font-semibold [&_li]:mb-0.5 [&_ol]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-2 [&_strong]:font-semibold [&_ul]:mb-2 [&_ul]:list-disc [&_ul]:pl-5">
          <ReactMarkdown>{resource?.content || '_No written content — the attached file is the resource._'}</ReactMarkdown>
        </div>
        {resource?.file_url && (
          <button type="button" onClick={() => openStoredFile(resource.file_url)} className="link-quiet mt-3">
            Open attached file
          </button>
        )}
      </DialogContent>
    </Dialog>
  );
}