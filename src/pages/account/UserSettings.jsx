import { useEffect, useState } from 'react';
import PageTitle from '@/components/shell/PageTitle';
import Surface from '@/components/shell/Surface';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import LanguageSelector from '@/i18n/LanguageSelector';
import { useI18n } from '@/i18n/I18nProvider';
import { useWorkspace } from '@/lib/workspaceRole';

const STORAGE_KEY = 'ai-preferences';

const PREFERENCES = [
  { key: 'emailUpdates', labelKey: 'settings.emailUpdates', hintKey: 'settings.emailUpdatesHint' },
  { key: 'weeklyDigest', labelKey: 'settings.weeklyDigest', hintKey: 'settings.weeklyDigestHint' },
  { key: 'riskAlerts', labelKey: 'settings.priorityAlerts', hintKey: 'settings.priorityAlertsHint' },
  { key: 'compactTables', labelKey: 'settings.compactTables', hintKey: 'settings.compactTablesHint' },
];

const DEFAULTS = { emailUpdates: true, weeklyDigest: true, riskAlerts: false, compactTables: false };

export default function UserSettings() {
  const { toast } = useToast();
  const { workspace } = useWorkspace();
  const { t } = useI18n();
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
    toast({ title: t(value ? 'settings.enabled' : 'settings.disabled', { label }) });
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageTitle
        eyebrow={t('settings.eyebrow')}
        title={t('settings.title')}
        description={t('settings.description', { workspace: t(workspace.label) })}
      />

      <Surface title={t('settings.languageTitle')} subtitle={t('settings.languageSub')}>
        <LanguageSelector />
      </Surface>

      <Surface className="mt-4" title={t('settings.preferences')} subtitle={t('settings.preferencesSub')} bodyClassName="p-0">
        <ul className="divide-y divide-line border-t border-line">
          {PREFERENCES.map((item) => (
            <li key={item.key} className="flex items-start justify-between gap-4 px-5 py-3.5">
              <div className="min-w-0">
                <p className="text-[14px] font-medium text-ink">{t(item.labelKey)}</p>
                <p className="mt-0.5 text-[13px] leading-relaxed text-mutedink">{t(item.hintKey)}</p>
              </div>
              <Switch
                checked={preferences[item.key]}
                onCheckedChange={(value) => toggle(item.key, t(item.labelKey), value)}
                aria-label={t(item.labelKey)}
              />
            </li>
          ))}
        </ul>
      </Surface>

      <Surface className="mt-4" title={t('settings.roleAndAccess')} subtitle={t('settings.roleAndAccessSub')}>
        <p className="text-[14px] leading-relaxed text-mutedink">
          {t('settings.roleBody', { workspace: t(workspace.label) })}
        </p>
      </Surface>
    </div>
  );
}