import { X } from 'lucide-react';

export default function SimpleModal({ open, onClose, title, subtitle, children, footer, width = 'max-w-xl' }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-[#0B2140]/50 p-4 backdrop-blur-sm sm:items-center">
      <div className={`w-full ${width} rounded-2xl bg-white shadow-2xl`}>
        <div className="flex items-start justify-between gap-3 border-b border-[#EEF2F8] px-5 py-3.5">
          <div>
            <h3 className="font-heading text-[17px] leading-tight text-ink">{title}</h3>
            {subtitle && <p className="mt-0.5 text-[11.5px] text-mutedink">{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-mutedink hover:bg-[#F1F5FB]" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[65vh] overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-[#EEF2F8] px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
}