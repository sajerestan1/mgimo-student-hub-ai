import PageTitle from '@/components/shell/PageTitle';
import TimetableExportPanel from '@/components/timetable/TimetableExportPanel';
import { useTimetable } from '@/lib/timetable/useTimetable';

export default function DeanTimetablePage() {
  const timetable = useTimetable('administration');

  return (
    <div>
      <PageTitle
        eyebrow="Administration workspace"
        title="Institutional timetable"
        description="The teaching schedule inside your administrative scope. Export or print the selected week; the register stays the source of truth."
        meta={['Weekly view', 'Scoped to your office', 'Read-only']}
      />
      <TimetableExportPanel timetable={timetable} title="Institutional timetable" slug="institution-timetable" />
    </div>
  );
}