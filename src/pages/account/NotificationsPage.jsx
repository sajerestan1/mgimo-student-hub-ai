import { useEffect, useMemo, useState } from 'react';
import PageTitle from '@/components/shell/PageTitle';
import StatusChip from '@/components/shell/StatusChip';
import { loadStudentPortal, shortDate } from '@/lib/studentPortal';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'announcement', label: 'Announcements' },
  { key: 'grade', label: 'Grades' },
  { key: 'material', label: 'Materials' },
];

const KIND = {
  announcement: { label: 'Announcement', tone: 'brand' },
  grade: { label: 'Grade', tone: 'positive' },
  material: { label: 'Material', tone: 'neutral' },
};

/** The full feed behind the dashboard's short activity preview. */
export default function NotificationsPage() {
  const [context, setContext] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadStudentPortal().then(setContext);
  }, []);

  const entries = useMemo(() => {
    if (!context) return [];
    const rows = [];

    (context.announcements || []).forEach((item) =>
      rows.push({
        id: `a-${item.id}`,
        kind: 'announcement',
        title: item.title,
        meta: `${item.author} · ${shortDate(item.date, { day: 'numeric', month: 'short', year: 'numeric' })}`,
        body: item.body,
        date: item.date,
      })
    );

    (context.recentGrades || []).forEach((grade) =>
      rows.push({
        id: `g-${grade.courseCode}-${grade.title}`,
        kind: 'grade',
        title: grade.title,
        meta: `${grade.courseCode} · ${grade.score}/${grade.max}`,
        body: grade.feedback,
        date: grade.gradedAt,
      })
    );

    (context.materials || []).slice(0, 12).forEach((material) =>
      rows.push({
        id: `m-${material.id}`,
        kind: 'material',
        title: material.title,
        meta: `${material.courseCode} · ${String(material.type).replace(/_/g, ' ')}`,
        body: '',
        date: material.publishedDate,
      })
    );

    return rows.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  }, [context]);

  const visible = filter === 'all' ? entries : entries.filter((entry) => entry.kind === filter);

  if (!context) return <div className="h-64 animate-pulse rounded-xl bg-white" />;

  if (!context.linked) {
    return (
      <div>
        <PageTitle eyebrow="Account" title="Notifications" />
        <p className="card-surface px-5 py-8 text-[15px] leading-relaxed text-mutedink">
          This feed shows a student's own announcements, grades and course materials. Staff notifications are not
          connected to this feed yet.
        </p>
      </div>
    );
  }

  return (
    <div>
      <PageTitle
        eyebrow="Student workspace"
        title="Notifications"
        description="Announcements published to you, grades released in your courses and newly published course materials."
        meta={[`${entries.length} updates`]}
      />

      <div className="mb-4 flex flex-wrap gap-1.5">
        {FILTERS.map((item) => {
          const active = filter === item.key;
          const count = item.key === 'all' ? entries.length : entries.filter((entry) => entry.kind === item.key).length;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilter(item.key)}
              className={`rounded-lg px-3 py-1.5 text-[14px] font-medium transition-colors ${
                active ? 'bg-royal text-white' : 'border border-line bg-white text-ink hover:bg-canvas'
              }`}
            >
              {item.label}
              <span className={`ml-1.5 ${active ? 'text-white/70' : 'text-mutedink'}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <p className="card-surface px-5 py-8 text-[15px] text-mutedink">
          Nothing has been published to you yet in this category.
        </p>
      ) : (
        <div className="card-surface divide-y divide-line overflow-hidden">
          {visible.map((entry) => {
            const kind = KIND[entry.kind];
            return (
              <article key={entry.id} className="px-5 py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <StatusChip tone={kind.tone}>{kind.label}</StatusChip>
                  <span className="text-[13px] text-mutedink">{entry.meta}</span>
                </div>
                <h3 className="mt-2 text-[15px] font-semibold text-ink">{entry.title}</h3>
                {entry.body && (
                  <p className="mt-1 text-[14px] leading-relaxed text-ink/80">{entry.body}</p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}