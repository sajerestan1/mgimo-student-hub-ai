import { useEffect, useState } from 'react';
import { BellRing } from 'lucide-react';
import Surface from '@/components/shell/Surface';
import StatusChip from '@/components/shell/StatusChip';
import { Switch } from '@/components/ui/switch';
import { DEFAULT_THRESHOLD } from '@/lib/gradeAlerts';

export default function AlertRuleCard({ rule, courses, onSave, busy }) {
  const [threshold, setThreshold] = useState(rule?.threshold ?? DEFAULT_THRESHOLD);
  const [scope, setScope] = useState(rule?.course_scope || 'all');
  const [active, setActive] = useState(rule ? rule.is_active : true);

  useEffect(() => {
    if (!rule) return;
    setThreshold(rule.threshold);
    setScope(rule.course_scope || 'all');
    setActive(rule.is_active);
  }, [rule?.id, rule?.threshold, rule?.is_active, rule?.course_scope]);

  const value = Number(threshold);
  const valid = Number.isFinite(value) && value >= 0 && value <= 100;

  return (
    <Surface
      title="Alert rule"
      subtitle="Checked automatically against every recorded mark in your courses"
      action={<StatusChip tone={active ? 'positive' : 'neutral'}>{active ? 'Monitoring' : 'Paused'}</StatusChip>}
      footer={
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10.5px] leading-snug text-mutedink">
            {rule ? 'Saved rules re-check on every visit.' : 'No rule yet — save one to start monitoring.'}
          </p>
          <button
            type="button"
            onClick={() => onSave({ threshold: value, courseScope: scope, isActive: active })}
            disabled={busy || !valid}
            className="btn-primary disabled:opacity-50"
          >
            {busy ? 'Saving…' : rule ? 'Save rule' : 'Start monitoring'}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-[11px] font-medium text-ink" htmlFor="alert-threshold">
            Alert when a student’s average falls below
          </label>
          <div className="flex items-center gap-2">
            <input
              id="alert-threshold"
              type="number"
              min="0"
              max="100"
              value={threshold}
              onChange={(event) => setThreshold(event.target.value)}
              className="w-20 rounded-lg border border-line bg-white px-2.5 py-1.5 text-[12px] tabular-nums text-ink focus:border-royal/40 focus:outline-none focus:ring-2 focus:ring-royal/10"
            />
            <span className="text-[12px] text-mutedink">%</span>
            <div className="ml-auto flex gap-1.5">
              {[50, 60, 75].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setThreshold(preset)}
                  className={`rounded-md border px-2 py-1 text-[10.5px] font-medium transition-colors ${
                    value === preset
                      ? 'border-royal/30 bg-royal-soft text-royal'
                      : 'border-line bg-white text-mutedink hover:bg-canvas'
                  }`}
                >
                  {preset}%
                </button>
              ))}
            </div>
          </div>
          {!valid && <p className="mt-1.5 text-[10.5px] text-critical">Enter a threshold between 0 and 100.</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-[11px] font-medium text-ink" htmlFor="alert-scope">
            Courses watched
          </label>
          <select
            id="alert-scope"
            value={scope}
            onChange={(event) => setScope(event.target.value)}
            className="w-full rounded-lg border border-line bg-white px-2.5 py-1.5 text-[11.5px] text-ink"
          >
            <option value="all">All my courses</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.code} · {course.title}
              </option>
            ))}
          </select>
          {scope !== 'all' && (
            <p className="mt-1.5 text-[10.5px] leading-snug text-mutedink">
              Alerts are raised for grades in the selected course only.
            </p>
          )}
        </div>

        <div className="flex items-start justify-between gap-3 rounded-lg border border-line bg-canvas px-3 py-2.5">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-[11.5px] font-medium text-ink">
              <BellRing className="h-3.5 w-3.5 text-royal" /> Monitoring active
            </p>
            <p className="mt-0.5 text-[10.5px] leading-snug text-mutedink">
              Breaches land in your alert queue and stay until you acknowledge them.
            </p>
          </div>
          <Switch checked={active} onCheckedChange={setActive} aria-label="Toggle monitoring" />
        </div>
      </div>
    </Surface>
  );
}