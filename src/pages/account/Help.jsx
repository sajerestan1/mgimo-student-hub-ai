import { Link } from 'react-router-dom';
import { LifeBuoy, BookOpen, ShieldCheck, MessageCircle } from 'lucide-react';
import PageTitle from '@/components/shell/PageTitle';
import Surface from '@/components/shell/Surface';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useWorkspace } from '@/lib/workspaceRole';

const FAQ = [
  {
    q: 'What is available in this stage?',
    a: 'Stage 1 delivers the application shell, role-aware navigation and the student, professor and dean dashboards. Modules such as courses, the learning platform and analytics open a description of what Stage 2 will build.',
  },
  {
    q: 'Why can’t I open another workspace?',
    a: 'Your workspace follows the role assigned to your account. Student and professor dashboards run on fictional demonstration data, so the dean may preview them; the command center is limited to dean accounts.',
  },
  {
    q: 'Is this connected to a real university?',
    a: 'No. This is an independent prototype built for the MGIMO AI Challenge 2026. It is not an official MGIMO service, and every student, professor and record shown is fictional.',
  },
  {
    q: 'When will the AI assistant be live?',
    a: 'The risk radar and assistant entry points are designed, but the analysis layer is not implemented in Stage 1. Nothing in the interface claims a live AI analysis.',
  },
];

export default function Help() {
  const { workspace } = useWorkspace();

  return (
    <div className="mx-auto max-w-3xl">
      <PageTitle
        eyebrow="Support"
        title="Help & support"
        description="Guidance for the prototype and the workspace you are currently using."
      />

      <Surface title="Frequently asked questions" bodyClassName="px-5 pb-1 pt-0">
        <Accordion type="single" collapsible className="w-full">
          {FAQ.map((item, index) => (
            <AccordionItem key={item.q} value={`item-${index}`} className="border-b border-line last:border-0">
              <AccordionTrigger className="py-3.5 text-left text-[13px] font-medium text-ink hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="pb-3.5 text-[12px] leading-relaxed text-mutedink">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Surface>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div className="card-surface p-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
            <BookOpen className="h-4 w-4" />
          </span>
          <p className="mt-2 text-[12.5px] font-medium text-ink">Getting started</p>
          <p className="mt-1 text-[11px] leading-relaxed text-mutedink">
            Start from your {workspace.label.toLowerCase()} dashboard, then use the sidebar groups to reach each area.
          </p>
        </div>
        <div className="card-surface p-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <p className="mt-2 text-[12.5px] font-medium text-ink">Access & privacy</p>
          <p className="mt-1 text-[11px] leading-relaxed text-mutedink">
            Workspaces follow the role on your account. Record-level permissions are prepared for Stage 2.
          </p>
        </div>
        <div className="card-surface p-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
            <MessageCircle className="h-4 w-4" />
          </span>
          <p className="mt-2 text-[12.5px] font-medium text-ink">Feedback</p>
          <p className="mt-1 text-[11px] leading-relaxed text-mutedink">
            This is a competition prototype — feedback shapes what gets built in the next stage.
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-line bg-white px-5 py-3.5">
        <LifeBuoy className="mt-0.5 h-4 w-4 shrink-0 text-mutedink" />
        <p className="text-[11px] leading-relaxed text-mutedink">
          Independent academic technology prototype developed for the MGIMO AI Challenge 2026. Not an official MGIMO service.{' '}
          <Link to={workspace.home} className="font-medium text-brand hover:underline">
            Back to my workspace
          </Link>
        </p>
      </div>
    </div>
  );
}