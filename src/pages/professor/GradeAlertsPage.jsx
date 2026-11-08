import { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import PageTitle from '@/components/shell/PageTitle';
import KpiStrip from '@/components/shell/KpiStrip';
import AlertRuleCard from '@/components/professor/AlertRuleCard';
import AlertQueue from '@/components/professor/AlertQueue';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useProfessorContext, dateLabel } from '@/lib/professorData';
import {
  DEFAULT_THRESHOLD,
  loadAlertRule,
  loadAlerts,
  saveAlertRule,
  runAlertScan,
} from '@/lib/gradeAlerts';

export default function GradeAlertsPage() {
  const { user } = useAuth();
  const { professor, courses } = useProfessorContext();
  const [rule, setRule] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [summary, setSummary] = useState('');

  const scan = useCallback(
    async (activeRule) => {
      if (!professor || !activeRule?.is_active) return;
      setScanning(true);
      try {
        const result = await runAlertScan({ rule: activeRule, professor, user, courses });
        setAlerts(await loadAlerts(professor.id));
        setSummary(
          `${result.checked} students checked · ${result.raised} new alert${result.raised === 1 ? '' : 's'}` +
            (result.cleared ? ` · ${result.cleared} cleared` : '')
        );
      } finally {
        setScanning(false);
      }
    },
    [professor, user, courses]
  );

  useEffect(() => {
    if (!professor) return;
    let alive = true;
    (async () => {
      const [loadedRule, loadedAlerts] = await Promise.all([
        loadAlertRule(professor.id),
        loadAlerts(professor.id),
      ]);
      if (!alive) return;
      setRule(loadedRule);
      setAlerts(loadedAlerts);
      setReady(true);
      if (loadedRule?.is_active) await scan(loadedRule);
    })();
    return () => {
      alive = false;
    };
  }, [professor?.id, courses.length]);

  const handleSave = async (values) => {
    setSaving(true);
    try {
      const saved = await saveAlertRule({ rule, professor, user, ...values });
      setRule(saved);
      if (!saved.is_active) {
        setSummary('Monitoring paused — no new alerts will be raised.');
      } else {
        await scan(saved);
      }
    } finally {
      setSaving(false);
    }
  };

  const setStatus = async (alert, status) => {
    setBusyId(alert.id);
    try {
      const updated = await base44.entities.GradeAlert.update(alert.id, {
        status,
        ...(status === 'acknowledged'
          ? { acknowledged_at: new Date().toISOString(), acknowledged_by: user?.full_name || professor?.full_name }
          : {}),
      });
      setAlerts((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    } finally {
      setBusyId(null);
    }
  };

  if (!ready) return <p className="py-10 text-center text-[12px] text-mutedink">Loading grade alerts…</p>;

  const open = alerts.filter((alert) => alert.status === 'open');
  const acknowledged = alerts.filter((alert) => alert.status === 'acknowledged');
  const flagged = new Set(alerts.filter((alert) => alert.status !== 'resolved').map((alert) => alert.student_id));
  const threshold = rule?.threshold ?? DEFAULT_THRESHOLD;

  return (
    <div>
      <PageTitle
        eyebrow="Professor workspace"
        title="Grade alerts"
        description="Set a mark threshold once and the workspace watches your gradebook: every student who falls below it is raised here automatically, until you acknowledge the alert."
        meta={[
          `Threshold ${threshold}%`,
          rule?.last_checked_at ? `Last check ${dateLabel(rule.last_checked_at)}` : 'Not checked yet',
          rule?.is_active ? 'Monitoring on' : 'Monitoring off',
        ]}
        actions={
          <button
            type="button"
            onClick={() => scan(rule)}
            disabled={!rule?.is_active || scanning}
            className="btn-quiet disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${scanning ? 'animate-spin' : ''}`} />
            {scanning ? 'Checking…' : 'Run check now'}
          </button>
        }
      />

      <KpiStrip
        className="mb-4"
        columns={4}
        items={[
          {
            label: 'Open alerts',
            value: open.length,
            delta: open.filter((alert) => alert.severity === 'critical').length
              ? `${open.filter((alert) => alert.severity === 'critical').length} critical`
              : null,
            tone: 'critical',
            hint: 'Awaiting your review',
          },
          {
            label: 'Acknowledged',
            value: acknowledged.length,
            hint: 'Seen, support in progress',
          },
          {
            label: 'Students flagged',
            value: flagged.size,
            hint: 'Below the threshold now',
          },
          {
            label: 'Threshold',
            value: `${threshold}%`,
            hint: rule?.course_scope && rule.course_scope !== 'all' ? 'Single course' : 'All my courses',
          },
        ]}
      />

      {summary && <p className="mb-3 text-[11px] text-mutedink">{summary}</p>}

      <div className="grid items-start gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <AlertRuleCard rule={rule} courses={courses} onSave={handleSave} busy={saving} />
        <AlertQueue
          alerts={alerts}
          busyId={busyId}
          onAcknowledge={(alert) => setStatus(alert, 'acknowledged')}
          onResolve={(alert) => setStatus(alert, 'resolved')}
        />
      </div>
    </div>
  );
}