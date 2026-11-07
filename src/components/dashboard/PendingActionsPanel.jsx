import { Link } from 'react-router-dom';
import { ArrowUpRight, ClipboardList, CheckSquare } from 'lucide-react';
import Panel from '@/components/admin/Panel';
import { StatusByValue } from '@/components/admin/StatusPill';

export default function PendingActionsPanel({ analytics, requests, tasks }) {
  const pending = requests.filter((request) => ['submitted', 'under_review', 'awaiting_information'].includes(request.status));
  const openTasks = tasks.filter((task) => task.status !== 'done');

  return (
    <Panel
      title="Pending Actions"
      subtitle="Requests awaiting a decision and open administrative tasks"
      actions={
        <Link to="/requests" className="inline-flex items-center gap-1 text-[11px] font-medium text-navy hover:underline">
          All requests <ArrowUpRight className="h-3 w-3" />
        </Link>
      }
      bodyClassName="p-4"
    >
      <div className="mb-3 flex items-center justify-between rounded-lg bg-[#F7FAFD] px-3 py-2">
        <span className="inline-flex items-center gap-1.5 text-[10.5px] text-mutedink">
          <ClipboardList className="h-3.5 w-3.5 text-navy" /> Awaiting decision
        </span>
        <span className="rounded bg-gold/20 px-1.5 py-0.5 text-[10.5px] font-bold text-[#8A6C26]">{pending.length}</span>
      </div>

      <ul className="space-y-1.5">
        {pending.slice(0, 4).map((request) => (
          <li key={request.id} className="flex items-center justify-between gap-2 rounded-lg border border-[#EEF2F8] px-2.5 py-2">
            <div className="min-w-0">
              <p className="truncate text-[11.5px] font-medium text-ink">{request.category}</p>
              <p className="truncate text-[10px] text-mutedink">{request.student_name} · due {request.due_date}</p>
            </div>
            <StatusByValue value={request.status} />
          </li>
        ))}
        {pending.length === 0 && <li className="py-3 text-center text-[11.5px] text-mutedink">No requests awaiting decision.</li>}
      </ul>

      <div className="mt-3 border-t border-[#EEF2F8] pt-3">
        <p className="mb-1.5 inline-flex items-center gap-1.5 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-mutedink">
          <CheckSquare className="h-3 w-3" /> Open tasks ({openTasks.length})
        </p>
        <ul className="space-y-1">
          {openTasks.slice(0, 3).map((task) => (
            <li key={task.id} className="flex items-center justify-between gap-2 text-[11px]">
              <span className="truncate text-ink">{task.title}</span>
              <span className="shrink-0 text-[10px] text-mutedink">{task.due_date}</span>
            </li>
          ))}
          {openTasks.length === 0 && <li className="text-[11px] text-mutedink">No open tasks.</li>}
        </ul>
      </div>
    </Panel>
  );
}