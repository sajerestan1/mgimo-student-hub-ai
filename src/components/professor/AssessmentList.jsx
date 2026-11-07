import Surface from '@/components/shell/Surface';
import { DEMO_PROFESSOR } from '@/lib/demoUniversity';

export default function AssessmentList() {
  return (
    <Surface title="Upcoming assessments" subtitle="Next three in your courses" bodyClassName="px-5 pb-2 pt-1">
      <ul>
        {DEMO_PROFESSOR.assessments.map((item) => (
          <li key={item.id} className="flex items-center gap-3 border-t border-line py-2.5 first:border-0">
            <div className="w-11 shrink-0">
              <p className="text-[11.5px] font-semibold leading-none text-ink">{item.date.split(' ')[0]}</p>
              <p className="mt-1 text-[10px] uppercase leading-none tracking-[0.06em] text-mutedink">
                {item.date.split(' ')[1]}
              </p>
            </div>
            <span className="h-7 w-px shrink-0 bg-line" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12.5px] font-medium text-ink">{item.title}</p>
              <p className="mt-0.5 text-[11px] text-mutedink">{item.course}</p>
            </div>
            <span className="chip shrink-0 bg-[#F2F4F8] text-[#5A6779]">{item.type}</span>
          </li>
        ))}
      </ul>
    </Surface>
  );
}