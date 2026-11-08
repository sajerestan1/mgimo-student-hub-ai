import { useState } from 'react';
import { BookOpen, CheckCircle2, Circle, FileText, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Surface from '@/components/shell/Surface';
import StatusChip from '@/components/shell/StatusChip';

export default function ModuleList({ modules, resources, progress, onToggle, onOpenResource, assignments, quizzes }) {
  const [openId, setOpenId] = useState(modules[0]?.id || null);

  return (
    <Surface
      title="Weekly learning modules"
      subtitle={`${modules.length} modules · ${progress.completed} completed`}
      bodyClassName="px-0 pb-0 pt-1"
    >
      <ul className="divide-y divide-line">
        {modules.map((module) => {
          const isOpen = openId === module.id;
          const done = progress.done.has(module.id);
          const materials = resources.filter((r) => r.module_id === module.id);
          const work = assignments.filter((a) => a.module_id === module.id);
          const checks = quizzes.filter((q) => q.module_number === module.module_number);

          return (
            <li key={module.id}>
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : module.id)}
                className="row-hover flex w-full items-start gap-3 px-5 py-3.5 text-left"
              >
                {done ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-positive" strokeWidth={2} />
                ) : (
                  <Circle className="mt-0.5 h-4 w-4 shrink-0 text-[#C3CBDA]" strokeWidth={2} />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-mutedink">
                    Module {module.module_number}
                  </p>
                  <p className="mt-1 text-[18px] font-semibold leading-snug text-ink">{module.title}</p>
                  <p className="mt-0.5 text-[11px] text-mutedink">
                    {materials.length} resources · {work.length + checks.length} assessed items · {module.duration_hours}h study
                  </p>
                </div>
                <span className="shrink-0 pt-0.5 text-[11px] text-brand">{isOpen ? 'Close' : 'Open'}</span>
              </button>

              {isOpen && (
                <div className="space-y-4 bg-canvas px-5 py-4">
                  <p className="text-[length:var(--type-body)] leading-[1.7] text-ink/80">{module.introduction}</p>

                  <div>
                    <p className="eyebrow mb-1.5">Learning objectives</p>
                    <ul className="space-y-1">
                      {(module.objectives || []).map((objective) => (
                        <li key={objective} className="flex items-start gap-1.5 text-[15px] leading-[1.65] text-ink/75">
                          <Target className="mt-0.5 h-3 w-3 shrink-0 text-brand" strokeWidth={2} /> {objective}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-lg border border-line bg-white p-3.5">
                    <p className="eyebrow mb-1.5">Lecture — {module.lecture_topic}</p>
                    <p className="whitespace-pre-wrap text-[length:var(--type-reading)] leading-[var(--leading-reading)] text-ink/85">{module.lecture_notes}</p>
                  </div>

                  {materials.length > 0 && (
                    <div>
                      <p className="eyebrow mb-1.5">Reading and materials</p>
                      <ul className="space-y-1">
                        {materials.map((resource) => (
                          <li key={resource.id}>
                            <button
                              type="button"
                              onClick={() => onOpenResource(resource)}
                              className="flex w-full items-center gap-2 rounded-md border border-line bg-white px-3 py-2.5 text-left text-[15px] text-ink transition-colors hover:border-brand/40"
                            >
                              <FileText className="h-3.5 w-3.5 shrink-0 text-brand" />
                              <span className="min-w-0 flex-1 truncate">{resource.title}</span>
                              <span className="shrink-0 text-[10px] uppercase tracking-[0.06em] text-mutedink">
                                {resource.type.replace('_', ' ')}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <p className="eyebrow mb-1.5">Learning activity</p>
                    <p className="text-[15px] leading-[1.65] text-ink/75">{module.activity}</p>
                  </div>

                  {(work.length > 0 || checks.length > 0) && (
                    <div className="flex flex-wrap gap-1.5">
                      {work.map((assignment) => (
                        <StatusChip key={assignment.id} tone="warning">
                          <BookOpen className="h-3 w-3" /> {assignment.title}
                        </StatusChip>
                      ))}
                      {checks.map((quiz) => (
                        <StatusChip key={quiz.id} tone="brand">
                          Quiz: {quiz.title}
                        </StatusChip>
                      ))}
                    </div>
                  )}

                  <Button
                    type="button"
                    variant={done ? 'outline' : 'default'}
                    size="sm"
                    onClick={() => onToggle(module, !done)}
                  >
                    {done ? 'Mark as not complete' : 'Mark module complete'}
                  </Button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {!modules.length && <p className="px-5 py-6 text-[12px] text-mutedink">No modules published for this course yet.</p>}
    </Surface>
  );
}