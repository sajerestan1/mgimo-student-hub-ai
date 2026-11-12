import PageTitle from '@/components/shell/PageTitle';
import TimetableExportPanel from '@/components/timetable/TimetableExportPanel';
import { useTimetable } from '@/lib/timetable/useTimetable';
import { useI18n } from '@/i18n/I18nProvider';

export default function TimetablePage() {
  const timetable = useTimetable('student');
  const { t } = useI18n();

  return (
    <div>
      <PageTitle
        eyebrow={t('student.common.studentWorkspace')}
        title={t('office.timetable.title')}
        description={t('office.timetable.description')}
        meta={[t('office.timetable.metaOwn'), t('office.timetable.metaOffline')]}
      />
      <TimetableExportPanel timetable={timetable} title={t('office.timetable.sheetTitle')} slug="timetable" />
    </div>
  );
}