import React from "react";
import BrandMark from "@/components/shell/BrandMark";
import { UNIVERSITY } from "@/lib/demoUniversity";
import { useI18n } from "@/i18n/I18nProvider";

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  const { t } = useI18n();
  const points = [
    t("auth.points.experiences"),
    t("auth.points.record"),
    t("auth.points.roles"),
  ];

  return (
    <div className="flex min-h-dvh bg-white">
      <aside className="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-navy px-10 py-12 lg:flex xl:px-14">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-brand/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-violet/20 blur-3xl" />

        <div className="relative flex items-center gap-2.5">
          <BrandMark className="h-9 w-9" />
          <div>
            <p className="text-[13px] font-semibold tracking-tight text-white">{t("common.appName")}</p>
            <p className="text-[10.5px] text-white/45">{UNIVERSITY.name}</p>
          </div>
        </div>

        <div className="relative">
          <h2 className="max-w-sm text-[28px] font-semibold leading-[1.18] tracking-[-0.02em] text-white xl:text-[32px]">
            {t("auth.headline")}
          </h2>
          <p className="mt-3 max-w-sm text-[12.5px] leading-relaxed text-white/55">
            {t("auth.headlineBody")}
          </p>
          <ul className="mt-6 space-y-2.5">
            {points.map((point) => (
              <li key={point} className="flex items-center gap-2 text-[12px] text-white/70">
                <span className="h-1.5 w-1.5 rounded-full bg-brand" /> {point}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative max-w-sm text-[10px] leading-relaxed text-white/35">{UNIVERSITY.disclaimer}</p>
      </aside>

      <main className="flex flex-1 items-start justify-center px-4 py-4 sm:items-center sm:px-8 sm:py-10">
        <div className="w-full max-w-[400px]">
          <div className="mb-4 flex items-center gap-2.5 sm:mb-6 lg:hidden">
            <BrandMark className="h-8 w-8" />
            <p className="text-[13px] font-semibold tracking-tight text-ink">{t("common.appName")}</p>
          </div>

          <div className="mb-4 flex items-start gap-3 sm:mb-5">
            {Icon && (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
            )}
            <div className="min-w-0">
              <h1 className="text-[21px] font-semibold leading-tight tracking-[-0.02em] text-ink">{title}</h1>
              {subtitle && <p className="mt-1 text-[12.5px] text-mutedink">{subtitle}</p>}
            </div>
          </div>

          <div className="card-surface p-4 sm:p-6">{children}</div>

          {footer && <p className="mt-4 text-center text-[12px] text-mutedink sm:mt-5">{footer}</p>}

          <p className="mt-4 text-center text-[10px] leading-relaxed text-mutedink/80 sm:mt-5">{UNIVERSITY.disclaimer}</p>
        </div>
      </main>
    </div>
  );
}
