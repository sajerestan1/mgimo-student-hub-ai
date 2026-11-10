import { useState } from 'react';
import { BellRing } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import {
  alertsEnabled,
  browserAlertsSupported,
  disableBrowserAlerts,
  enableBrowserAlerts,
  permissionState,
} from '@/lib/messageAlerts';

/**
 * The only place the browser's notification permission is ever requested: the
 * reader asks for it by turning this on, and a refusal is left alone from then on.
 */
export default function BrowserAlertsToggle() {
  const [state, setState] = useState(() => ({
    supported: browserAlertsSupported(),
    permission: permissionState(),
    enabled: alertsEnabled(),
  }));
  const [busy, setBusy] = useState(false);

  if (!state.supported) return null;

  // Denied is final until the reader changes it in the browser: no prompt is
  // shown again, and the app says where to undo it.
  if (state.permission === 'denied') {
    return (
      <p className="flex items-start gap-2 px-3 py-2 text-[12.5px] leading-[1.45] text-mutedink">
        <BellRing className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Browser alerts are blocked for this site. Allow notifications in your browser settings to turn them on; in-app
        alerts keep working.
      </p>
    );
  }

  const toggle = async (next) => {
    if (!next) {
      disableBrowserAlerts();
      setState((current) => ({ ...current, enabled: false }));
      return;
    }
    setBusy(true);
    try {
      const result = await enableBrowserAlerts();
      setState({
        supported: browserAlertsSupported(),
        permission: result === 'granted' ? 'granted' : permissionState(),
        enabled: result === 'granted',
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2">
      <span className="flex items-start gap-2 text-[13px] leading-[1.45] text-ink">
        <BellRing className="mt-0.5 h-3.5 w-3.5 shrink-0 text-mutedink" />
        Desktop alerts for new messages
      </span>
      <Switch
        checked={state.enabled}
        disabled={busy}
        onCheckedChange={toggle}
        aria-label="Desktop alerts for new messages"
      />
    </div>
  );
}