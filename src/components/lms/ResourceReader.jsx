import ReactMarkdown from 'react-markdown';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { shortDate } from '@/lib/studentCourses';

export default function ResourceReader({ resource, onClose }) {
  return (
    <Dialog open={Boolean(resource)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <p className="eyebrow">
            {resource?.type?.replace('_', ' ')}
            {resource?.module_number ? ` · module ${resource.module_number}` : ''}
          </p>
          <DialogTitle className="text-[17px] leading-snug">{resource?.title}</DialogTitle>
          <p className="text-[11px] text-mutedink">
            Published {shortDate(resource?.published_date)} · {resource?.description}
          </p>
        </DialogHeader>

        <div className="prose-sm max-w-none text-[12.5px] leading-relaxed text-ink/85 [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-[14px] [&_h2]:font-semibold [&_h3]:mb-1 [&_h3]:mt-3 [&_h3]:text-[12.5px] [&_h3]:font-semibold [&_li]:ml-4 [&_li]:list-disc [&_li]:py-0.5 [&_p]:mb-2 [&_strong]:font-semibold">
          <ReactMarkdown>{resource?.content || 'This resource has no recorded content.'}</ReactMarkdown>
        </div>

        {!!resource?.reading_list?.length && (
          <div className="mt-2 rounded-lg border border-line bg-canvas p-3">
            <p className="eyebrow mb-1">Reading list</p>
            <ul className="space-y-0.5 text-[11.5px] text-ink/75">
              {resource.reading_list.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}