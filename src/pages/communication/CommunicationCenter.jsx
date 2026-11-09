import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import PageTitle from '@/components/shell/PageTitle';
import ThreadList from '@/components/communication/ThreadList';
import ThreadView from '@/components/communication/ThreadView';
import GroupsView from '@/components/communication/GroupsView';
import DirectoryView from '@/components/communication/DirectoryView';
import NotificationsPanel from '@/components/communication/NotificationsPanel';
import ModerationPanel from '@/components/communication/ModerationPanel';
import CoordinatorPanel from '@/components/communication/CoordinatorPanel';
import { useCommunication } from '@/hooks/useCommunication';
import { cn } from '@/lib/utils';

const TABS = [
  { key: 'inbox', label: 'Inbox', path: '/communication' },
  { key: 'groups', label: 'Groups', path: '/communication/groups' },
  { key: 'directory', label: 'Directory', path: '/communication/directory' },
  { key: 'notifications', label: 'Notifications', path: '/communication/notifications' },
  { key: 'moderation', label: 'Moderation', path: '/communication/moderation', moderatorsOnly: true },
  { key: 'coordinators', label: 'Coordinators', path: '/communication/coordinators', governorsOnly: true },
];

export default function CommunicationCenter({ tab = 'inbox' }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { boot, counts, loading, error } = useCommunication();
  const [threadId, setThreadId] = useState(searchParams.get('thread') || '');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setThreadId(searchParams.get('thread') || '');
  }, [searchParams]);

  const openThread = (id) => {
    setThreadId(id);
    setSearchParams(id ? { thread: id } : {});
  };

  const visibleTabs = TABS.filter((entry) => {
    if (entry.moderatorsOnly && !boot?.canModerate) return false;
    if (entry.governorsOnly && !boot?.canGovern) return false;
    return true;
  });

  const description =
    boot?.role === 'student'
      ? 'Message classmates and your professors, follow your class group, and open an official enquiry with the Dean\u2019s Office.'
      : boot?.role === 'professor'
        ? 'Message your students and colleagues, post to your course groups, and correspond officially with the administration.'
        : 'Official institutional correspondence, group oversight, moderation and coordinator management.';

  return (
    <div>
      <PageTitle eyebrow="Communication Center" title="Communication" description={description} />

      <div className="mb-4 flex flex-wrap gap-1.5 border-b border-line pb-3">
        {visibleTabs.map((entry) => {
          const active = entry.key === tab;
          const badge =
            entry.key === 'inbox'
              ? counts.unreadMessages
              : entry.key === 'notifications'
                ? counts.unreadNotifications
                : 0;
          return (
            <Link
              key={entry.key}
              to={entry.path}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[14px] font-medium transition-colors',
                active ? 'bg-navy text-white' : 'text-mutedink hover:bg-canvas hover:text-ink',
              )}
            >
              {entry.label}
              {badge > 0 && (
                <span
                  className={cn(
                    'rounded-full px-1.5 py-px text-[11px] font-semibold',
                    active ? 'bg-white/20 text-white' : 'bg-[#FBECEC] text-[#A23B3B]',
                  )}
                >
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {loading && <div className="h-40 animate-pulse rounded-xl bg-[#EEF1F6]" />}

      {!loading && error && (
        <div className="card-surface p-5">
          <p className="text-[15px] font-semibold text-ink">Communication is unavailable</p>
          <p className="mt-1 text-[14px] text-mutedink">{error}</p>
        </div>
      )}

      {!loading && !error && boot && (
        <div key={reloadKey}>
          {tab === 'inbox' && (
            <div className={cn('grid gap-4', 'lg:grid-cols-[320px_1fr]')}>
              <div className={cn(threadId ? 'hidden lg:block' : 'block')}>
                <ThreadList
                  boot={boot}
                  selectedId={threadId}
                  onSelect={openThread}
                  onChanged={() => setReloadKey((value) => value + 1)}
                />
              </div>
              <div className={cn(threadId ? 'block' : 'hidden lg:block')}>
                {threadId ? (
                  <ThreadView
                    boot={boot}
                    threadId={threadId}
                    onBack={() => openThread('')}
                    onChanged={() => setReloadKey((value) => value + 1)}
                  />
                ) : (
                  <div className="card-surface flex min-h-[320px] flex-col items-center justify-center p-8 text-center">
                    <p className="text-[17px] font-semibold text-ink">Select a conversation</p>
                    <p className="mt-1 max-w-sm text-[14px] leading-[1.6] text-mutedink">
                      Your private conversations, group threads and official correspondence appear in the list. Start a
                      new conversation from the Directory.
                    </p>
                    <button type="button" className="btn-quiet mt-4" onClick={() => navigate('/communication/directory')}>
                      Open directory
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'groups' && (
            <GroupsView boot={boot} initialGroupId={searchParams.get('group') || ''} onChanged={() => setReloadKey((v) => v + 1)} />
          )}
          {tab === 'directory' && <DirectoryView boot={boot} onStarted={(id) => navigate(`/communication?thread=${id}`)} />}
          {tab === 'notifications' && <NotificationsPanel onChanged={() => setReloadKey((v) => v + 1)} />}
          {tab === 'moderation' && <ModerationPanel />}
          {tab === 'coordinators' && <CoordinatorPanel />}
        </div>
      )}
    </div>
  );
}