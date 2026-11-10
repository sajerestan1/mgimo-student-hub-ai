import { Link } from 'react-router-dom';
import { CalendarClock, Crown, MapPin, Users } from 'lucide-react';
import StatusChip from '@/components/shell/StatusChip';
import { useI18n } from '@/i18n/I18nProvider';
import { focusKey } from '@/lib/studyGroups';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';

// One peer-led group. Joining and leaving are the only actions here; the leader
// is shown so a student knows who organises the sessions.
export default function StudyGroupCard({ group, busy, onJoin, onLeave }) {
  const { t } = useI18n();
  const full = group.member_count >= group.member_limit || group.status === 'full';

  return (
    <section className="card-surface flex flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-mutedink">
            {group.course_code} · {t(focusKey(group.focus))}
          </p>
          <h2 className="mt-1 text-[19px] font-semibold leading-tight tracking-[-0.01em] text-ink">{group.name}</h2>
        </div>
        {group.is_leader && (
          <StatusChip tone="brand">
            <Crown className="h-3 w-3" /> {t('student.studyGroups.card.youLead')}
          </StatusChip>
        )}
      </div>

      {group.description && (
        <p className="mt-3 line-clamp-3 text-[11.5px] leading-relaxed text-mutedink">{group.description}</p>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        <StatusChip tone={full ? 'warning' : 'neutral'}>
          <Users className="h-3 w-3" />
          {t('student.studyGroups.card.members', { count: group.member_count, limit: group.member_limit })}
        </StatusChip>
        {group.schedule && (
          <StatusChip tone="neutral">
            <CalendarClock className="h-3 w-3" />
            {t('student.studyGroups.card.meets', { schedule: group.schedule })}
          </StatusChip>
        )}
        {group.location && (
          <StatusChip tone="neutral">
            <MapPin className="h-3 w-3" />
            {group.location}
          </StatusChip>
        )}
      </div>

      {group.is_member && (group.members || []).length > 0 && (
        <p className="mt-3 truncate text-[11px] text-mutedink">
          {group.members.map((member) => member.user_name).join(' · ')}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
        <div className="min-w-0">
          <p className="truncate text-[11px] text-mutedink">
            {t('student.studyGroups.card.leader', { name: group.leader_name || '—' })}
          </p>
          <Link to={`${P.student.courses}/${group.course_id}`} className="link-quiet mt-0.5 text-[11px]">
            {t('student.studyGroups.card.openCourse')}
          </Link>
        </div>

        {group.is_member ? (
          group.is_leader ? (
            <span className="text-[11px] text-mutedink">{t('student.studyGroups.card.joined')}</span>
          ) : (
            <button type="button" onClick={() => onLeave(group)} disabled={busy} className="btn-quiet btn-sm">
              {busy ? t('student.studyGroups.card.leaving') : t('student.studyGroups.card.leave')}
            </button>
          )
        ) : (
          <button
            type="button"
            onClick={() => onJoin(group)}
            disabled={busy || full}
            className="btn-primary btn-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            {full ? t('student.studyGroups.card.full') : busy ? t('student.studyGroups.card.joining') : t('student.studyGroups.card.join')}
          </button>
        )}
      </div>
    </section>
  );
}