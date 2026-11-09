import PageTitle from '@/components/shell/PageTitle';
import TimetableExportPanel from '@/components/timetable/TimetableExportPanel';
import { useTimetable } from '@/lib/timetable/useTimetable';

export default function TimetablePage() {
  const timetable = useTimetable('student');

  return (
    <div>
      <PageTitle
        eyebrow="Student workspace"
        title="Timetable"
        description="Your enrolled classes for the selected week, saved on this device so it opens without a connection."
        meta={['Your own classes only', 'Read-only offline']}
      />
      <TimetableExportPanel timetable={timetable} title="Weekly timetable" slug="timetable" />
    </div>
  );
}