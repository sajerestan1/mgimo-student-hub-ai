import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, MessageSquare } from 'lucide-react';
import Surface from '@/components/shell/Surface';
import PanelTitle from './PanelTitle';
import { comm, formatStamp } from '@/lib/communication/api';
import { useI18n } from '@/i18n/I18nProvider';

const initialsOf = (value) =>
  (value || '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

const VISIBLE = 4;

/**
 * The newest messages and official notices from the account's own notification
 * feed. Reads the same server-scoped action the inbox uses, so it only ever
 * shows items addressed to this student; a failure here never affects the rest
 * of the dashboard.
 */
export default function CommunicationsPanel() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [state, setState] = useState({ loading: true, items: [], error: '' });

  useEffect(() => {
    let alive = true;
    comm('notifications')
      .then((data) => {
        if (!alive) return;
        setState({ loading: false, items: (data.items || []).slice(0, VISIBLE), error: '' });
      })
      .catch((error) => {
        if (!alive) return;
        setState({ loading: false, items: [], error: error.message });
      });
    return () => {
      alive = false;
    };
  }, []);

  const open = async (item) => {
    if (!item.is_read) await comm('notificationsRead', { notificationId: item.id }).catch(() => {});
    if (item.link) navigate(item.link);
  };

  return (
    <Surface
      className="h-full"
      title={
        <PanelTitle icon={MessageSquare} tone="brand">
          {t('student.dashboard.communications.title')}
        </PanelTitle>
      }
      subtitle={
        state.items.length ? t('student.dashboard.communications.subtitle') : undefined
      }
      action={
        <Link
          to="/communication"
          className="inline-flex shrink-0 items-center gap-1 text-[13px] font-medium text-[#2563EB] transition-colors hover:text-[#1D4ED8]"
        >
          {t('student.dashboard.communications.openInbox')}
          <ArrowRight className="dir-icon h-3.5 w-3.5" />
        </Link>
      }
      bodyClassName={state.items.length ? 'px-0 pb-0 pt-0' : undefined}
    >
      {state.loading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((key) => (
            <div key={key} className="h-12 animate-pulse rounded-lg bg-canvas" />
          ))}
        </div>
      ) : state.items.length ? (
        <ul className="divide-y divide-line">
          {state.items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => open(item)}
                className="row-hover flex w-full items-start gap-3 px-4 py-2.5 text-start"
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EFF6FF] text-[12px] font-semibold text-[#2563EB]">
                  {initialsOf(item.sender_name || item.conversation_name) || '·'}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="flex min-w-0 items-center gap-1.5">
                      <span className="truncate text-[14.5px] font-medium text-ink">
                        {item.sender_name || item.conversation_name || item.title}
                      </span>
                      {!item.is_read && (
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#2563EB]" />
                      )}
                    </span>
                    <span className="shrink-0 text-[12px] text-mutedink">{formatStamp(item.created_date)}</span>
                  </span>
                  <span className="mt-0.5 block truncate text-[13px] text-mutedink">
                    {item.body || item.title}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-6 text-center text-[14px] leading-relaxed text-mutedink">
          {state.error
            ? t('student.dashboard.communications.unavailable')
            : t('student.dashboard.communications.empty')}
        </p>
      )}
    </Surface>
  );
}