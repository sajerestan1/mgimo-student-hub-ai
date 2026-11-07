import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Surface from '@/components/shell/Surface';
import { DEMO_STUDENT } from '@/lib/demoUniversity';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';

export default function GradesPanel() {
  const grades = DEMO_STUDENT.grades;

  return (
    <Surface
      title="Recent grades"
      subtitle="Current term results released so far"
      action={
        <Link to={P.student.grades} className="link-quiet">
          Full grade book <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      }
      bodyClassName="p-0"
    >
      <table className="w-full text-left">
        <thead>
          <tr className="border-y border-line">
            <th className="table-head px-5 py-2 font-semibold">Course</th>
            <th className="table-head hidden px-3 py-2 font-semibold sm:table-cell">Code</th>
            <th className="table-head px-3 py-2 text-right font-semibold">Credits</th>
            <th className="table-head px-5 py-2 text-right font-semibold">Grade</th>
          </tr>
        </thead>
        <tbody>
          {grades.map((grade) => (
            <tr key={grade.code} className="row-hover border-b border-line last:border-0">
              <td className="px-5 py-2.5 text-[12.5px] text-ink">{grade.course}</td>
              <td className="hidden px-3 py-2.5 text-[11.5px] text-mutedink sm:table-cell">{grade.code}</td>
              <td className="px-3 py-2.5 text-right text-[12px] tabular-nums text-mutedink">{grade.credits}</td>
              <td className="px-5 py-2.5 text-right">
                <span className="text-[12.5px] font-semibold text-ink">{grade.grade}</span>
                <span className="ml-1.5 text-[10.5px] tabular-nums text-mutedink">{grade.points.toFixed(1)}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Surface>
  );
}