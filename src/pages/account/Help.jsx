import { Link } from 'react-router-dom';
import { LifeBuoy, BookOpen, ShieldCheck, MessageCircle } from 'lucide-react';
import PageTitle from '@/components/shell/PageTitle';
import Surface from '@/components/shell/Surface';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useWorkspace } from '@/lib/workspaceRole';
import { useI18n } from '@/i18n/I18nProvider';

const FAQ_KEYS = ['1', '2', '3', '4'];

export default function Help() {
  const { workspace } = useWorkspace();
  const { t } = useI18n();

  return (
    <div className="mx-auto max-w-3xl">
      <PageTitle
        eyebrow={t('help.eyebrow')}
        title={t('help.title')}
        description={t('help.description')}
      />

      <Surface title={t('help.faqTitle')} bodyClassName="px-5 pb-1 pt-0">
        <Accordion type="single" collapsible className="w-full">
          {FAQ_KEYS.map((key) => (
            <AccordionItem key={key} value={`item-${key}`} className="border-b border-line last:border-0">
              <AccordionTrigger className="py-3.5 text-start text-[14px] font-medium text-ink hover:no-underline">
                {t(`help.q${key}`)}
              </AccordionTrigger>
              <AccordionContent className="pb-3.5 text-[13px] leading-relaxed text-mutedink">{t(`help.a${key}`)}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Surface>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div className="card-surface p-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
            <BookOpen className="h-4 w-4" />
          </span>
          <p className="mt-2 text-[14px] font-medium text-ink">{t('help.gettingStarted')}</p>
          <p className="mt-1 text-[13px] leading-relaxed text-mutedink">
            {t('help.gettingStartedBody', { workspace: t(workspace.label) })}
          </p>
        </div>
        <div className="card-surface p-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <p className="mt-2 text-[14px] font-medium text-ink">{t('help.accessTitle')}</p>
          <p className="mt-1 text-[13px] leading-relaxed text-mutedink">{t('help.accessBody')}</p>
        </div>
        <div className="card-surface p-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
            <MessageCircle className="h-4 w-4" />
          </span>
          <p className="mt-2 text-[14px] font-medium text-ink">{t('help.feedbackTitle')}</p>
          <p className="mt-1 text-[13px] leading-relaxed text-mutedink">{t('help.feedbackBody')}</p>
        </div>
      </div>

      <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-line bg-white px-5 py-3.5">
        <LifeBuoy className="mt-0.5 h-4 w-4 shrink-0 text-mutedink" />
        <p className="text-[13px] leading-relaxed text-mutedink">
          {t('help.footer')}{' '}
          <Link to={workspace.home} className="font-medium text-brand hover:underline">
            {t('help.backToWorkspace')}
          </Link>
        </p>
      </div>
    </div>
  );
}