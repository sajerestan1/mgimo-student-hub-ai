import { CloudOff, RefreshCw, ShieldCheck, Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n/I18nProvider';

const stamp = (iso) => {
  if (!iso) return 'never';
  const date = new Date(iso);
  return date.toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};

/**
 * Online/offline state, the last successful synchronisation, and an explicit
 * stale warning. Cached data is labelled as cached — never presented as live.
 */
export default function SyncStatus({ online, syncing, syncedAt, source, error, onSync }) {
  const { t } = useI18n();
  const offline = !online;
  const stale = source === 'cache' && !offline;
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-line px-5 py-2 text-[12px]',
        offline ? 'bg-[#FCF3E4] text-[#8E6018]' : 'bg-[#FAFBFD] text-mutedink',
      )}
    >
      <span className="inline-flex items-center gap-1.5 font-medium">
        {offline ? <CloudOff className="h-3.5 w-3.5" /> : <Wifi className="h-3.5 w-3.5" />}
        {offline ? t('office.timetable.offlineSaved') : t('office.timetable.online')}
      </span>
      <span>{t('office.timetable.lastSynced', { stamp: syncedAt ? stamp(syncedAt) : t('office.profile.notRecorded') })}</span>
      {source === 'cache' && <span>· {t('office.timetable.savedCopy')}</span>}
      {stale && !error && <span className="text-[#8E6018]">· {t('office.timetable.outOfDate')}</span>}
      {!offline && (
        <button type="button" onClick={onSync} disabled={syncing} className="ml-auto inline-flex items-center gap-1 font-medium text-brand hover:underline">
          <RefreshCw className={cn('h-3 w-3', syncing && 'animate-spin')} />
          {syncing ? t('office.timetable.syncing') : t('office.timetable.syncNow')}
        </button>
      )}
      {offline && (
        <span className="ml-auto inline-flex items-center gap-1">
          <ShieldCheck className="h-3 w-3" /> Read-only while offline
        </span>
      )}
      {error && <p className="w-full text-[12px] text-[#A23B3B]">{error}</p>}
    </div>
  );
}