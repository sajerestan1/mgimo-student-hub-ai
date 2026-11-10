import { useState } from 'react';
import {
  ChevronDown,
  Download,
  FileText,
  Image as ImageIcon,
  Loader2,
  Printer,
  Share2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

// The four destinations are the existing export handlers: this menu only picks
// one of them, so PDF, PNG, print and share never fork into a second system.
const OPTIONS = [
  { kind: 'pdf', label: 'Export as PDF', hint: 'A4 landscape document', icon: FileText },
  { kind: 'png', label: 'Export as PNG', hint: 'High-resolution image', icon: ImageIcon },
  { kind: 'print', label: 'Print timetable', hint: 'One sheet, no interface', icon: Printer },
  { kind: 'share', label: 'Share timetable', hint: 'Send the image to a classmate', icon: Share2 },
];

export default function ExportMenu({ onExport, busy, disabled }) {
  const [open, setOpen] = useState(false);
  const running = Boolean(busy);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={disabled || running}
          className="group inline-flex w-full items-center justify-center gap-2 rounded-xl border border-navy bg-navy px-3 py-2 text-[14px] font-medium text-white transition-colors hover:border-navy-mid hover:bg-navy-mid focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white/15 text-white">
            {running ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
            )}
          </span>
          {running ? 'Preparing…' : 'Download timetable'}
          <ChevronDown
            className="h-4 w-4 text-white/70 transition-transform group-data-[state=open]:rotate-180"
            aria-hidden="true"
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={6}
        className="w-[17.5rem] max-w-[calc(100vw-1.5rem)] rounded-xl border-line p-1.5 shadow-xl"
      >
        <DropdownMenuLabel className="px-2 pb-1 pt-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-mutedink">
          Download &amp; share
        </DropdownMenuLabel>

        {OPTIONS.map((option, index) => {
          const Icon = option.icon;
          const active = busy === option.kind;
          return (
            <DropdownMenuItem
              key={option.kind}
              disabled={running}
              onSelect={() => onExport(option.kind)}
              className={cn(
                'flex cursor-pointer items-start gap-2.5 rounded-lg px-2 py-2 text-ink focus:bg-brand-soft focus:text-ink',
                index === 2 && 'mt-1 border-t border-line pt-2.5',
              )}
            >
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
                {active ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Icon className="h-4 w-4" aria-hidden="true" />
                )}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[14px] font-medium text-ink">{option.label}</span>
                <span className="block truncate text-[12.5px] text-mutedink">{option.hint}</span>
              </span>
            </DropdownMenuItem>
          );
        })}

        <p className="mt-1 border-t border-line px-2 pb-1 pt-2 text-[12px] text-mutedink">
          Always the week on screen — A4 landscape.
        </p>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}