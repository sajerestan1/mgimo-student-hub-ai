import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import Surface from '@/components/shell/Surface';
import { DEMO_STUDENT } from '@/lib/demoUniversity';

export default function SchedulePanel() {
  const sessions = DEMO_STUDENT.schedule;
  const remaining = sessions.filter((session) => session.state !== 'later').length;

  return (
    <Surface
      title="Today’s schedule"
      subtitle="Thursday, 7 November"
      action={<span className="chip bg-[#EDF1FE] text-[#3B5AE0]">{remaining} of 4 remaining</span>}
      bodyClassName="px-5 pb-3 pt-1"
    >
      <ol>
        {sessions.map((session, index) => {
          const isNow = session.state === 'now';
          const [start, end] = session.time.split(' – ');
          return (
            <li key={session.id} className="flex gap-3.5">
              <div className="w-[54px] shrink-0 pt-2.5 text-right">
                <p className="text-[12.5px] font-semibold tabular-nums leading-none text-ink">{start}</p>
                <p className="mt-1 text-[11px] tabular-nums leading-none text-mutedink">{end}</p>
              </div>
              <div className="flex flex-col items-center pt-3">
                <span
                  className={cn(
                    'h-2 w-2 shrink-0 rounded-full',
                    isNow ? 'bg-brand ring-4 ring-brand/15' : 'bg-[#D5DBE8]'
                  )}
                />
                {index < sessions.length - 1 && <span className="mt-1.5 w-px flex-1 bg-line" />}
              </div>
              <div
                className={cn(
                  'mb-2 min-w-0 flex-1 rounded-lg px-3 py-2.5 transition-colors',
                  isNow ? 'bg-[#F5F8FF]' : 'hover:bg-[#FAFBFD]'
                )}
              >
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <p className="truncate text-[13px] font-medium text-ink">{session.course}</p>
                  {isNow && <span className="chip bg-brand px-1.5 py-0 text-[10px] text-white">Now</span>}
                  {session.state === 'next' && (
                    <span className="chip bg-[#F2F4F8] px-1.5 py-0 text-[10px] text-[#5A6779]">Next</span>
                  )}
                </div>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-mutedink">
                  <span className="font-medium text-ink/60">{session.code}</span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {session.room}
                  </span>
                  <span className="truncate">{session.professor}</span>
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </Surface>
  );
}