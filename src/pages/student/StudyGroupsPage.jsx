import { useCallback, useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import PageTitle from '@/components/shell/PageTitle';
import Surface from '@/components/shell/Surface';
import { useI18n } from '@/i18n/I18nProvider';
import { studyGroupsApi } from '@/lib/studyGroups';
import StudyGroupCard from '@/components/studyGroups/StudyGroupCard';
import StudyGroupForm from '@/components/studyGroups/StudyGroupForm';

// Peer-led study groups for the student's own courses. The board is resolved by
// the backend function from the account's enrolments, so a group for a course the
// student is not taking never reaches this page.
export default function StudyGroupsPage() {
  const { t } = useI18n();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [courseFilter, setCourseFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [busyId, setBusyId] = useState('');
  const [actionError, setActionError] = useState('');

  const load = useCallback(async () => {
    try {
      setData(await studyGroupsApi('list'));
      setError(null);
    } catch (caught) {
      setError({ message: caught.message || '' });
      setData({ courses: [], groups: [] });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (group, action) => {
    setBusyId(group.id);
    setActionError('');
    try {
      await studyGroupsApi(action, { group_id: group.id });
      await load();
    } catch (caught) {
      setActionError(
        caught.message ||
          t(action === 'join' ? 'student.studyGroups.joinError' : 'student.studyGroups.leaveError')
      );
    } finally {
      setBusyId('');
    }
  };

  if (!data) {
    return <div className="card-surface p-6 text-[13px] text-mutedink">{t('student.studyGroups.loading')}</div>;
  }

  const term = search.trim().toLowerCase();
  const groups = (data.groups || []).filter((group) => {
    if (courseFilter !== 'all' && group.course_id !== courseFilter) return false;
    if (!term) return true;
    return [group.name, group.course_code, group.course_title, group.description, group.leader_name]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(term);
  });

  const mine = (data.groups || []).filter((group) => group.is_member);
  const places = (data.groups || []).reduce(
    (total, group) => total + Math.max(0, (group.member_limit || 0) - (group.member_count || 0)),
    0
  );

  return (
    <div>
      <PageTitle
        eyebrow={t('student.studyGroups.eyebrow')}
        title={t('student.studyGroups.title')}
        description={t('student.studyGroups.description')}
        actions={
          <button
            type="button"
            onClick={() => setFormOpen(true)}
            disabled={!(data.courses || []).length}
            className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4" /> {t('student.studyGroups.create')}
          </button>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        {[
          [t('student.studyGroups.metrics.groups'), (data.groups || []).length, t('student.studyGroups.metrics.groupsHint')],
          [t('student.studyGroups.metrics.mine'), mine.length, t('student.studyGroups.metrics.mineHint')],
          [t('student.studyGroups.metrics.places'), places, t('student.studyGroups.metrics.placesHint')],
        ].map(([label, value, note]) => (
          <div key={label} className="card-surface px-4 py-3">
            <p className="text-[11px] text-mutedink">{label}</p>
            <p className="mt-1 text-[19px] font-semibold leading-none tabular-nums text-ink">{value}</p>
            <p className="mt-1 text-[11px] text-mutedink">{note}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mutedink" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('student.studyGroups.searchPlaceholder')}
            className="w-full rounded-lg border border-line bg-white py-2 pe-3 ps-9 text-[15px] text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25"
          />
        </div>
        <select
          value={courseFilter}
          onChange={(event) => setCourseFilter(event.target.value)}
          className="rounded-lg border border-line bg-white px-3 py-2 text-[15px] text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25 sm:w-64"
        >
          <option value="all">{t('student.studyGroups.allCourses')}</option>
          {(data.courses || []).map((course) => (
            <option key={course.id} value={course.id}>
              {course.code} — {course.title}
            </option>
          ))}
        </select>
      </div>

      {actionError && <p className="mb-3 text-[13px] text-critical">{actionError}</p>}

      {error && <p className="mb-3 text-[13px] text-critical">{error.message || t('student.studyGroups.error')}</p>}

      {!groups.length ? (
        <Surface title={t('student.studyGroups.empty.title')}>
          <p className="text-[13px] leading-relaxed text-mutedink">
            {(data.groups || []).length
              ? t('student.studyGroups.emptyFiltered')
              : t('student.studyGroups.empty.body')}
          </p>
        </Surface>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {groups.map((group) => (
            <StudyGroupCard
              key={group.id}
              group={group}
              busy={busyId === group.id}
              onJoin={(target) => act(target, 'join')}
              onLeave={(target) => act(target, 'leave')}
            />
          ))}
        </div>
      )}

      <StudyGroupForm
        open={formOpen}
        onOpenChange={setFormOpen}
        courses={data.courses || []}
        defaultCourseId={courseFilter === 'all' ? '' : courseFilter}
        onCreated={load}
      />
    </div>
  );
}