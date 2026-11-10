import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, History } from 'lucide-react';
import Surface from '@/components/shell/Surface';
import PanelTitle from './PanelTitle';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';
import { recentActivity } from '@/lib/studentPortal';
import { useI18n } from '@/i18n/I18nProvider';

export default function RecentActivity({ context }) {
  const { t, language } = useI18n();
  const entries = recentActivity(context, t, language);
  const [openId, setOpenId] = useState(null);

  return (
    <Surface
      className="h-full"
      title={<PanelTitle icon={History} tone="neutral">{t('student.dashboard.recentActivity')}</PanelTitle>}
      action={
        <Link
          to={P.student.notifications}
          className="inline-flex shrink-0 items-center gap-1 text-[13px] font-medium text-[#2563EB] transition-colors hover:text-[#1D4ED8]"
        >
          {t('student.dashboard.allUpdates')}
        </Link>
      }
      bodyClassName={entries.length ? 'px-0 pb-0 pt-0' : undefined}
    >
      {entries.length ? (
        <ul className="divide-y divide-line">
          {entries.map((entry) => {
            const expanded = openId === entry.id && entry.detail;
            const content = (
              <>
                <div className="flex items-baseline justify-between gap-3">
                  <p className="truncate text-[15px] font-medium text-ink">{entry.title}</p>
                  <span className="shrink-0 text-[12px] text-mutedink">{entry.label}</span>
                </div>
                <p className="mt-0.5 truncate text-[13px] text-mutedink">{entry.meta}</p>
                {expanded && (
                  <p className="mt-1.5 line-clamp-4 text-[13px] leading-relaxed text-ink/80">{entry.detail}</p>
                )}
              </>
            );

            return (
              <li key={entry.id}>
                {entry.to ? (
                  <Link to={entry.to} className="row-hover block px-4 py-2.5">
                    {content}
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => setOpenId(expanded ? null : entry.id)}
                    className="row-hover flex w-full items-start justify-between gap-2 px-4 py-2.5 text-start"
                    aria-expanded={Boolean(expanded)}
                  >
                    <div className="min-w-0">{content}</div>
                    {entry.detail && (
                      <ChevronDown
                        className={`mt-1 h-3.5 w-3.5 shrink-0 text-mutedink transition-transform ${
                          expanded ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-[14px] leading-relaxed text-mutedink">{t('student.dashboard.noActivity')}</p>
      )}
    </Surface>
  );
}