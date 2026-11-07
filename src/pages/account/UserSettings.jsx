import { useEffect, useState } from 'react';
import PageTitle from '@/components/shell/PageTitle';
import Surface from '@/components/shell/Surface';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { useWorkspace } from '@/lib/workspaceRole';

const STORAGE_KEY = 'ai-preferences';

const PREFERENCES = [
  { key: 'emailUpdates', label: 'Email notifications', hint: 'Institutional announcements and deadline reminders.' },
  { key: 'weeklyDigest', label: 'Weekly academic digest', hint: 'A Monday summary of your workspace activity.' },
  { key: 'riskAlerts', label: 'Priority alerts', hint: 'Immediate notice when an academic risk signal appears.' },
  { key: 'compactTables', label: 'Compact tables', hint: 'Tighter row spacing in long record lists.' },
];

const DEFAULTS = { emailUpdates: true, weeklyDigest: true, riskAlerts: false, compactTables: false };

export default function UserSettings() {
  const { toast } = useToast();
  const { workspace } = useWorkspace();
  const [preferences, setPreferences] = useState(DEFAULTS);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (stored) setPreferences({ ...DEFAULTS, ...stored });
    } catch (error) {
      /* fall back to defaults */
    }
  }, []);

  const toggle = (key, label, value) => {
    const next = { ...preferences, [key]: value };
    setPreferences(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    toast({ title: `${label} ${value ? 'enabled' : 'disabled'}` });
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageTitle
        eyebrow="Account"
        title="Settings"
        description={`Preferences for the ${workspace.label.toLowerCase()} workspace. Saved on this device in this prototype.`}
      />

      <Surface title="Preferences" subtitle="Saved on this device in this prototype" bodyClassName="p-0">
        <ul className="divide-y divide-line border-t border-line">
          {PREFERENCES.map((item) => (
            <li key={item.key} className="flex items-start justify-between gap-4 px-5 py-3.5">
              <div className="min-w-0">
                <p className="text-[12.5px] font-medium text-ink">{item.label}</p>
                <p className="mt-0.5 text-[11.5px] leading-relaxed text-mutedink">{item.hint}</p>
              </div>
              <Switch
                checked={preferences[item.key]}
                onCheckedChange={(value) => toggle(item.key, item.label, value)}
                aria-label={item.label}
              />
            </li>
          ))}
        </ul>
      </Surface>

      <Surface className="mt-4" title="Role and access" subtitle="Managed by the university, not self-service">
        <p className="text-[12.5px] leading-relaxed text-mutedink">
          Your workspace is determined by the role assigned to your account ({workspace.label}). Changing roles, faculties or
          departments is an administrative action and is intentionally unavailable here.
        </p>
      </Surface>
    </div>
  );
}