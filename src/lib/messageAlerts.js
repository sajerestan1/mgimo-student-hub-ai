// Native browser alerts for incoming messages.
//
// Permission is requested only when the reader switches this on themselves; the
// choice is remembered per device, so a refusal is never re-prompted by the app
// (and a browser that has been denied will not prompt again anyway). Everything
// here is an addition on top of the in-app toast — if the browser refuses, the
// in-app alert is the one that still runs.
const ENABLED_KEY = 'comm.alerts.enabled';

export function browserAlertsSupported() {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function permissionState() {
  if (!browserAlertsSupported()) return 'unsupported';
  return Notification.permission; // granted | denied | default
}

export function alertsEnabled() {
  if (!browserAlertsSupported() || Notification.permission !== 'granted') return false;
  return window.localStorage.getItem(ENABLED_KEY) === '1';
}

export async function enableBrowserAlerts() {
  if (!browserAlertsSupported()) return 'unsupported';
  const result = await Notification.requestPermission();
  window.localStorage.setItem(ENABLED_KEY, result === 'granted' ? '1' : '0');
  return result;
}

export function disableBrowserAlerts() {
  window.localStorage.setItem(ENABLED_KEY, '0');
}

// One alert per notification: the tag carries the notification id, so a repeat
// replaces the previous alert instead of stacking a duplicate beside it.
export function showBrowserAlert({ id, title, body, onOpen }) {
  if (!alertsEnabled()) return null;
  try {
    const alert = new Notification(title, { body: body || '', tag: id });
    alert.onclick = () => {
      window.focus();
      onOpen?.();
      alert.close();
    };
    return alert;
  } catch {
    // Some browsers only allow this from a service worker; the toast covers it.
    return null;
  }
}