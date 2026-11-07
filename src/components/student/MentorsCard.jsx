import { useState } from 'react';
import { ChevronDown, GraduationCap } from 'lucide-react';
import Surface from '@/components/shell/Surface';
import { MENTORS } from '@/lib/studentWorkspace';

function initials(name) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('');
}

export default function MentorsCard() {
  const [open, setOpen] = useState(null);

  return (
    <Surface
      title="Peer mentoring"
      subtitle="Trained students from your faculty"
      bodyClassName="px-5 pb-4 pt-1"
      footer={
        <p className="text-[10.5px] leading-relaxed text-mutedink">
          Introductions are arranged by the student office. Mentor matching requests open in the next stage.
        </p>
      }
    >
      <ul className="divide-y divide-line">
        {MENTORS.map((mentor) => {
          const expanded = open === mentor.id;
          return (
            <li key={mentor.id} className="py-3">
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-royal/10 text-[10.5px] font-semibold text-royal">
                  {initials(mentor.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12.5px] font-medium text-ink">{mentor.name}</p>
                  <p className="truncate text-[11px] text-mutedink">{mentor.programme}</p>
                  <p className="mt-1 flex items-center gap-1 text-[10.5px] text-mutedink">
                    <GraduationCap className="h-3 w-3" /> {mentor.subjects}
                  </p>
                  {expanded && (
                    <div className="mt-2 space-y-2">
                      <ul className="flex flex-wrap gap-1.5">
                        {mentor.topics.map((topic) => (
                          <li
                            key={topic}
                            className="rounded-md bg-canvas px-1.5 py-0.5 text-[10.5px] text-ink/75"
                          >
                            {topic}
                          </li>
                        ))}
                      </ul>
                      <p className="text-[10.5px] text-mutedink">{mentor.matches}</p>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(expanded ? null : mentor.id)}
                  className="inline-flex shrink-0 items-center gap-1 rounded-md border border-line px-2 py-1 text-[10.5px] font-medium text-ink transition-colors hover:bg-canvas"
                  aria-expanded={expanded}
                >
                  {expanded ? 'Close' : 'Explore'}
                  <ChevronDown className={`h-3 w-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </Surface>
  );
}