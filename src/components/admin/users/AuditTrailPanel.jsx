import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';
import Surface from '@/components/shell/Surface';
import StatusChip from '@/components/shell/StatusChip';

const OUTCOME_TONES = { success: 'positive', failure: 'critical', denied: 'warning' };

const ACTION_LABELS = {
  account_created: 'Account created',
  account_provisioned: 'Account provisioned',
  account_activated: 'Account activated',
  account_suspended: 'Account suspended',
  account_deactivated: 'Account deactivated',
  account_reactivated: 'Account reactivated',
  role_changed: 'Role changed',
  email_changed: 'Email changed',
  password_reset_initiated: 'Password reset initiated',
  profile_updated: 'Profile updated',
  faculty_assigned: 'Faculty assigned',
  group_assigned: 'Class / group assigned',
  status_changed: 'Status changed',
};

export default function AuditTrailPanel({ version }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const response = await base44.functions.invoke('adminUsers', { action: 'audit', limit: 150 });
        const data = response?.data || {};
        if (data.error) throw new Error(data.error);
        if (alive) setLogs(data.logs || []);
      } catch (loadError) {
        if (alive) setError(loadError?.message || 'The audit log could not be loaded.');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [version]);

  return (
    <Surface
      title="Administrative audit log"
      subtitle="Security-sensitive actions, who performed them, and their outcome"
      bodyClassName="px-0 pb-0 pt-1"
    >
      {loading ? (
        <p className="flex items-center gap-2 px-5 py-8 text-[14px] text-mutedink">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading the audit trail…
        </p>
      ) : error ? (
        <p className="px-5 py-8 text-[14px] text-critical">{error}</p>
      ) : logs.length === 0 ? (
        <p className="px-5 py-8 text-[14px] text-mutedink">No administrative actions recorded yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] border-collapse">
            <thead>
              <tr className="border-b border-line bg-[#FAFBFD]">
                <th className="table-head py-2 pl-5 pr-3 text-left">When</th>
                <th className="table-head py-2 pr-3 text-left">Action</th>
                <th className="table-head py-2 pr-3 text-left">Administrator</th>
                <th className="table-head py-2 pr-3 text-left">Target</th>
                <th className="table-head py-2 pr-3 text-left">Details</th>
                <th className="table-head py-2 pr-5 text-left">Outcome</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-line/70 last:border-0 align-top">
                  <td className="py-2.5 pl-5 pr-3 text-[13px] text-mutedink">
                    {log.logged_at ? new Date(log.logged_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
                  </td>
                  <td className="py-2.5 pr-3 text-[14px] font-medium text-ink">
                    {ACTION_LABELS[log.action] || log.action}
                  </td>
                  <td className="py-2.5 pr-3 text-[13px] text-ink">
                    {log.actor_name || '—'}
                    <span className="block text-[13px] text-mutedink">{log.actor_role || ''}</span>
                  </td>
                  <td className="py-2.5 pr-3 text-[13px] text-ink">{log.target || '—'}</td>
                  <td className="max-w-[320px] py-2.5 pr-3 text-[13px] leading-relaxed text-mutedink">{log.details || '—'}</td>
                  <td className="py-2.5 pr-5">
                    <StatusChip tone={OUTCOME_TONES[log.outcome] || 'neutral'}>{log.outcome || 'success'}</StatusChip>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Surface>
  );
}