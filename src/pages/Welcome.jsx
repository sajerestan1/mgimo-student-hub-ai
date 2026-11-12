import { GraduationCap, Presentation, Landmark } from 'lucide-react';
import BrandPanel from '@/components/welcome/BrandPanel';
import RoleCard from '@/components/welcome/RoleCard';
import LanguageMenu from '@/i18n/LanguageMenu';
import { useAuth } from '@/lib/AuthContext';
import { useI18n } from '@/i18n/I18nProvider';

// Each card is a request to enter one workspace. It grants nothing: a signed-in
// request is checked against the role on the authenticated account, and the
// sign-in flow decides the role on the server for a new session.
const WORKSPACES = [
  { key: 'student', label: 'welcome.student', icon: GraduationCap, tone: 'blue' },
  { key: 'professor', label: 'welcome.professor', icon: Presentation, tone: 'red' },
  { key: 'administration', label: 'welcome.administration', icon: Landmark, tone: 'navy' },
];

export default function Welcome() {
  const { user } = useAuth();
  const { t } = useI18n();
  const destination = (key) => (user ? `/workspace/${key}` : `/login?workspace=${key}`);

  return (
    <main className="flex min-h-dvh flex-col bg-welcome-canvas px-4 py-5 sm:px-6 sm:py-7">
      {/* The column is centred in whatever height is left, so a desktop
          viewport shows the whole selection without scrolling, while a short
          or narrow screen still scrolls naturally. */}
      <div className="mx-auto flex w-full max-w-[1040px] flex-1 flex-col justify-center">
        <div className="mb-2.5 flex justify-end">
          <div className="rounded-lg border border-[#E3E8EF] bg-white px-1">
            <LanguageMenu />
          </div>
        </div>

        <BrandPanel />

        <div className="mt-5 text-center sm:mt-6">
          <h2 className="text-[23px] font-bold leading-tight tracking-[-0.02em] text-welcome-navy sm:text-[26px]">
            {t('welcome.title')}
          </h2>
          <p className="mt-1.5 text-[15px] text-welcome-slate">{t('welcome.selectWorkspace')}</p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:mt-6 sm:gap-4 md:grid-cols-3">
          <RoleCard
            label={t(WORKSPACES[0].label)}
            icon={WORKSPACES[0].icon}
            tone={WORKSPACES[0].tone}
            to={destination(WORKSPACES[0].key)}
          />
          <RoleCard
            label={t(WORKSPACES[1].label)}
            icon={WORKSPACES[1].icon}
            tone={WORKSPACES[1].tone}
            to={destination(WORKSPACES[1].key)}
          />
          <RoleCard
            label={t(WORKSPACES[2].label)}
            icon={WORKSPACES[2].icon}
            tone={WORKSPACES[2].tone}
            to={destination(WORKSPACES[2].key)}
            className="col-span-2 md:col-span-1"
          />
        </div>

        <p className="mt-5 text-center text-[13px] text-welcome-slate sm:mt-6">
          {t('welcome.secureAccess')}
        </p>
      </div>
    </main>
  );
}