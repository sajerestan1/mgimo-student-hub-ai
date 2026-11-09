import { useRef, useState } from 'react';
import Surface from '@/components/shell/Surface';
import StatusChip from '@/components/shell/StatusChip';
import TimetableToolbar from '@/components/timetable/TimetableToolbar';
import SyncStatus from '@/components/timetable/SyncStatus';
import TimetableSheet from '@/components/timetable/TimetableSheet';
import { exportPdf, exportPng, printSheet, shareSheet } from '@/lib/timetable/exportFile';
import { timeLabel, weekDays } from '@/lib/timetable/week';

const KIND = { lecture: 'Lecture', seminar: 'Seminar', practice: 'Practice' };

/**
 * The shared weekly timetable view: one visual language, one export path, in
 * every workspace. Data arrives already authorised from the server.
 */
export default function TimetableExportPanel({ timetable, title, slug }) {
  const { weekStart, setWeekStart, payload, syncedAt, source, error, loading, syncing, online, sync } = timetable;
  const sheetRef = useRef(null);
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState('');

  const sessions = payload?.sessions || [];
  const days = weekDays(weekStart);

  const handleExport = async (kind) => {
    if (!sheetRef.current || !payload) return;
    setBusy(kind);
    setMessage('');
    try {
      const options = { slug, weekStart };
      if (kind === 'pdf') await exportPdf(sheetRef.current, options);
      else if (kind === 'png') await exportPng(sheetRef.current, options);
      else if (kind === 'print') await printSheet(sheetRef.current);
      else if (kind === 'share') {
        const result = await shareSheet(sheetRef.current, { ...options, title });
        if (result === 'downloaded') {
          setMessage('Sharing is not available on this device — the image was downloaded instead.');
        }
      }
    } catch {
      setMessage('The export could not be created. Please try again.');
    } finally {
      setBusy('');
    }
  };

  return (
    <Surface
      title={title}
      subtitle={payload?.subtitle || 'Your scheduled week'}
      action={
        <StatusChip tone={payload?.scope_note ? 'neutral' : 'brand'}>
          {sessions.length} {sessions.length === 1 ? 'session' : 'sessions'}
        </StatusChip>
      }
      bodyClassName="px-0 pb-0 pt-0"
    >
      <TimetableToolbar weekStart={weekStart} onWeekChange={setWeekStart} onExport={handleExport} busy={busy} />
      <SyncStatus
        online={online}
        syncing={syncing}
        syncedAt={syncedAt}
        source={source}
        error={error}
        onSync={sync}
      />

      {message && (
        <p className="border-b border-line bg-[#FAFBFD] px-5 py-2 text-[12px] text-mutedink">{message}</p>
      )}

      <div className="divide-y divide-line">
        {loading && !payload && (
          <p className="px-5 py-10 text-center text-[14px] text-mutedink">Loading your timetable…</p>
        )}
        {!loading && !payload && !error && (
          <p className="px-5 py-10 text-center text-[14px] text-mutedink">No timetable is available for this week.</p>
        )}

        {(payload ? days : []).map((day) => {
          const items = sessions
            .filter((session) => session.date === day.iso)
            .sort((a, b) => String(a.start).localeCompare(String(b.start)));
          return (
            <div key={day.iso} className="px-5 py-3">
              <div className="flex items-baseline justify-between">
                <p className="text-[13px] font-semibold text-ink">
                  {day.weekday} <span className="text-mutedink">{day.day} {day.month}</span>
                </p>
                <p className="text-[11px] text-mutedink">{items.length ? `${items.length} scheduled` : 'Free'}</p>
              </div>
              {items.length ? (
                <ul className="mt-2 space-y-1.5">
                  {items.map((session) => (
                    <li key={session.id} className="flex items-start gap-3 rounded-lg border border-line px-3 py-2">
                      <span className="w-[74px] shrink-0 text-[12px] font-semibold tabular-nums text-ink">
                        {timeLabel(session.start)}
                        {session.end ? `–${timeLabel(session.end)}` : ''}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] font-medium text-ink">
                          {session.course_code ? `${session.course_code} · ` : ''}
                          {session.course_title}
                        </span>
                        <span className="mt-0.5 block text-[12px] text-mutedink">
                          {[KIND[session.kind] || session.kind, session.room, session.group_name, session.professor_name]
                            .filter(Boolean)
                            .join(' · ')}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1.5 text-[12px] text-mutedink">No classes scheduled.</p>
              )}
            </div>
          );
        })}
      </div>

      {payload?.scope_note && (
        <p className="border-t border-line px-5 py-2 text-[11px] text-mutedink">{payload.scope_note}</p>
      )}

      {/* Off-screen: the exact sheet that PDF, PNG, print and share render. */}
      <div aria-hidden="true" className="pointer-events-none fixed left-[-20000px] top-0">
        <div ref={sheetRef}>
          <TimetableSheet
            sessions={sessions}
            title={payload?.title || title}
            subtitle={payload?.subtitle || ''}
            identity={payload?.identity || ''}
            weekStart={weekStart}
          />
        </div>
      </div>
    </Surface>
  );
}