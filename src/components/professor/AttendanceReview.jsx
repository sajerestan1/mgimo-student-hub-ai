import { Link } from 'react-router-dom';
import { ArrowRight, AlertTriangle } from 'lucide-react';
import Surface from '@/components/shell/Surface';
import { DEMO_PROFESSOR } from '@/lib/demoUniversity';

export default function AttendanceReview() {
  return (
    <Surface
      title="Attendance to review"
      subtitle="Flagged by this week’s submissions"
      bodyClassName="px-5 pb-2 pt-1"
      footer={
        <Link to="/attendance" className="link-quiet">
          Review attendance <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      }
    >
      <ul>
        {DEMO_PROFESSOR.attendanceFlags.map((flag) => (
          <li key={flag.id} className="flex items-start gap-2.5 border-t border-line py-2.5 first:border-0">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
            <div className="min-w-0">
              <p className="text-[12.5px] font-medium text-ink">
                {flag.course} <span className="font-normal text-mutedink">· {flag.group}</span>
              </p>
              <p className="mt-0.5 text-[11.5px] leading-relaxed text-mutedink">{flag.detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </Surface>
  );
}