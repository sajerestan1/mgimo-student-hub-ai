import { FileText, Sparkles } from 'lucide-react';
import StatusChip from '@/components/shell/StatusChip';

const CARDS = [
  {
    icon: FileText,
    title: 'Plagiarism & Similarity',
    body: 'Word-sequence comparison of this submission against the submissions already analysed in this workspace. No external plagiarism database is connected.',
    chip: 'Internal similarity check',
    tone: 'brand',
  },
  {
    icon: Sparkles,
    title: 'AI-Writing Detection',
    body: 'A language-model screening pass that describes stylistic signals for a human reviewer. It produces no probability and is not a validated detector.',
    chip: 'Screening prototype',
    tone: 'warning',
  },
];

export default function AnalysisCards() {
  return (
    <div className="mb-4 grid gap-3 md:grid-cols-2">
      {CARDS.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.title} className="card-surface p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EDF1FE] text-brand">
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-[15.5px] font-semibold leading-tight text-ink">{card.title}</h2>
                  <StatusChip tone={card.tone}>{card.chip}</StatusChip>
                </div>
                <p className="mt-1.5 text-[13.5px] leading-[1.55] text-mutedink">{card.body}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}