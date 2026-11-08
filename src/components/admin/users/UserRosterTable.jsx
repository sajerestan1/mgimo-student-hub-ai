import StatusChip from '@/components/shell/StatusChip';
import { accountRoleLabel, ROLE_TONES, STATUS_LABELS, STATUS_TONES, dateLabel, initialsOf } from '@/lib/accounts';

const cell = 'py-2.5 pr-3 align-middle text-[14px] text-ink';

export default function UserRosterTable({ users, faculties, onOpen }) {
  const facultyName = (id) => faculties.find((faculty) => faculty.id === id)?.name || '—';

  if (!users.length) {
    return <p className="px-5 py-10 text-center text-[14px] text-mutedink">No accounts match these filters.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] border-collapse">
        <thead>
          <tr className="border-b border-line bg-[#FAFBFD]">
            <th className="table-head py-2 pl-5 pr-3 text-left">Account</th>
            <th className="table-head py-2 pr-3 text-left">Role</th>
            <th className="table-head py-2 pr-3 text-left">Faculty</th>
            <th className="table-head py-2 pr-3 text-left">Class / group</th>
            <th className="table-head py-2 pr-3 text-left">Status</th>
            <th className="table-head py-2 pr-3 text-left">Profile</th>
            <th className="table-head py-2 pr-5 text-left">Created</th>
          </tr>
        </thead>
        <tbody>
          {users.map((account) => (
            <tr
              key={account.id}
              onClick={() => onOpen(account)}
              className="row-hover cursor-pointer border-b border-line/70 last:border-0"
            >
              <td className={`${cell} pl-5`}>
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-[13px] font-semibold text-brand">
                    {initialsOf(account.full_name) || '—'}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-semibold text-ink">{account.full_name || 'Unnamed account'}</p>
                    <p className="truncate text-[13px] text-mutedink">{account.email}</p>
                  </div>
                </div>
              </td>
              <td className={cell}>
                <StatusChip tone={ROLE_TONES[account.role] || 'neutral'}>{accountRoleLabel(account)}</StatusChip>
              </td>
              <td className={cell}>{facultyName(account.faculty_id)}</td>
              <td className={cell}>{account.group_name || '—'}</td>
              <td className={cell}>
                <StatusChip tone={STATUS_TONES[account.account_status] || 'neutral'}>
                  {STATUS_LABELS[account.account_status] || account.account_status}
                </StatusChip>
              </td>
              <td className={cell}>
                {account.profile_complete ? (
                  <span className="text-[13px] text-positive">Complete</span>
                ) : (
                  <span className="text-[13px] text-warning">Missing {account.missing.length}</span>
                )}
              </td>
              <td className={`${cell} pr-5 text-mutedink`}>{dateLabel(account.created_date)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}