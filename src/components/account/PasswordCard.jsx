import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { KeyRound, Loader2 } from 'lucide-react';
import Surface from '@/components/shell/Surface';
import { useAuth } from '@/lib/AuthContext';
import { useI18n } from '@/i18n/I18nProvider';

// Password changes stay with the account holder: the platform verifies the
// current password and owns the credential. No password reaches this app's
// database.
export default function PasswordCard() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState('');

  const strength = (() => {
    const value = form.next;
    if (!value) return null;
    if (value.length < 8) return t('password.tooShort');
    if (!/[A-Za-z]/.test(value) || !/[0-9]/.test(value)) return t('password.mix');
    return null;
  })();

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setDone('');
    if (strength) {
      setError(strength);
      return;
    }
    if (form.next !== form.confirm) {
      setError(t('password.mismatch'));
      return;
    }
    setBusy(true);
    try {
      await base44.auth.changePassword({
        userId: user.id,
        currentPassword: form.current,
        newPassword: form.next,
      });
      setForm({ current: '', next: '', confirm: '' });
      setDone(t('password.updated'));
    } catch (changeError) {
      setError(changeError?.message || t('password.failed'));
    } finally {
      setBusy(false);
    }
  };

  const field = 'mt-1 h-10 w-full rounded-lg border border-line bg-white px-3 text-[15px] text-ink';

  return (
    <Surface title={t('password.title')} subtitle={t('password.subtitle')}>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="text-[15px] font-medium text-ink" htmlFor="current-password">{t('password.current')}</label>
          <input
            id="current-password"
            type="password"
            autoComplete="current-password"
            dir="ltr"
            className={field}
            value={form.current}
            onChange={(event) => setForm({ ...form, current: event.target.value })}
            required
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-[15px] font-medium text-ink" htmlFor="new-password">{t('password.next')}</label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              dir="ltr"
              className={field}
              value={form.next}
              onChange={(event) => setForm({ ...form, next: event.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-[15px] font-medium text-ink" htmlFor="confirm-password">{t('password.confirm')}</label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              dir="ltr"
              className={field}
              value={form.confirm}
              onChange={(event) => setForm({ ...form, confirm: event.target.value })}
              required
            />
          </div>
        </div>
        {strength && form.next && <p className="text-[13px] text-warning">{strength}</p>}
        {error && <p className="text-[13px] text-critical">{error}</p>}
        {done && <p className="text-[13px] text-positive">{done}</p>}
        <button type="submit" className="btn-primary" disabled={busy}>
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <KeyRound className="h-3.5 w-3.5" />}
          {t('password.update')}
        </button>
      </form>
    </Surface>
  );
}