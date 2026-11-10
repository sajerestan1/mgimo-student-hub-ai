import { ShieldAlert, LogOut, RefreshCw } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useI18n } from '@/i18n/I18nProvider';

// Full-page state for accounts that must not reach the workspace at all.
export default function AccountStateScreen({ title, body, tone = 'critical', onRetry }) {
  const { logout } = useAuth();
  const { t } = useI18n();
  const accent = tone === 'warning' ? 'text-warning' : 'text-critical';
  const ring = tone === 'warning' ? 'bg-[#FCF3E4]' : 'bg-[#FBECEC]';

  return (
    <div className="flex min-h-dvh items-center justify-center bg-canvas px-4 py-10">
      <div className="card-surface w-full max-w-lg p-7">
        <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${ring}`}>
          <ShieldAlert className={`h-5 w-5 ${accent}`} />
        </span>
        <h1 className="mt-4 text-[22px] font-bold leading-tight tracking-[-0.02em] text-ink">{title}</h1>
        <p className="mt-2 text-[15px] leading-[1.6] text-mutedink">{body}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {onRetry && (
            <button type="button" onClick={onRetry} className="btn-quiet">
              <RefreshCw className="h-3.5 w-3.5" /> {t('accountState.tryAgain')}
            </button>
          )}
          <button type="button" onClick={() => logout()} className="btn-primary">
            <LogOut className="h-3.5 w-3.5" /> {t('accountState.signOut')}
          </button>
        </div>
        <p className="mt-5 text-[13px] leading-relaxed text-mutedink">{t('accountState.footer')}</p>
      </div>
    </div>
  );
}