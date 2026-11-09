import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Link2, Plus, Users, ShieldCheck, LogOut, Check } from 'lucide-react';
import { comm } from '@/lib/communication/api';
import { cn } from '@/lib/utils';

const VISIBILITY = [
  { value: 'group_only', label: 'Academic group only' },
  { value: 'discoverable', label: 'Discoverable in my academic group' },
  { value: 'invite_only', label: 'Invitation only' },
  { value: 'private', label: 'Private (coordinator invites)' },
];

export default function GroupsView({ boot, initialGroupId, onChanged }) {
  const navigate = useNavigate();
  const [groups, setGroups] = useState({ loading: true, items: [], error: '' });
  const [selected, setSelected] = useState(initialGroupId || '');
  const [detail, setDetail] = useState(null);
  const [notice, setNotice] = useState('');
  const [invite, setInvite] = useState(null);
  const [invitations, setInvitations] = useState([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', visibility: 'group_only', membershipPolicy: 'invite' });

  const loadGroups = async () => {
    const data = await comm('groups');
    setGroups({ loading: false, items: data.items, error: '' });
    if (!selected && data.items.length) setSelected(data.items[0].id);
  };

  useEffect(() => {
    loadGroups().catch((error) => setGroups({ loading: false, items: [], error: error.message }));
  }, []);

  useEffect(() => {
    if (!selected) return;
    setDetail(null);
    comm('groupMembers', { groupId: selected })
      .then((data) => setDetail(data))
      .catch((error) => setNotice(error.message));
  }, [selected]);

  const openThread = (threadId) => navigate(`/communication?thread=${threadId}`);

  const createInvite = async () => {
    setNotice('');
    try {
      const data = await comm('invite', { groupId: selected, expiresInHours: 72, maximumUses: 25 });
      setInvite({ path: data.path, token: data.token });
      const list = await comm('invitations', { groupId: selected });
      setInvitations(list.items);
    } catch (error) {
      setNotice(error.message);
    }
  };

  const loadInvitations = async () => {
    try {
      const data = await comm('invitations', { groupId: selected });
      setInvitations(data.items);
    } catch (error) {
      setInvitations([]);
    }
  };

  const revoke = async (invitationId) => {
    try {
      await comm('revokeInvitation', { invitationId });
      await loadInvitations();
    } catch (error) {
      setNotice(error.message);
    }
  };

  const approve = async (memberId) => {
    try {
      await comm('approveMember', { memberId });
      const data = await comm('groupMembers', { groupId: selected });
      setDetail(data);
      onChanged?.();
    } catch (error) {
      setNotice(error.message);
    }
  };

  const leave = async () => {
    try {
      await comm('leaveGroup', { groupId: selected });
      setDetail(null);
      await loadGroups();
      onChanged?.();
    } catch (error) {
      setNotice(error.message);
    }
  };

  const createSubgroup = async () => {
    setNotice('');
    try {
      const data = await comm('createSubgroup', form);
      setCreateOpen(false);
      setForm({ name: '', description: '', visibility: 'group_only', membershipPolicy: 'invite' });
      await loadGroups();
      setSelected(data.group.id);
      onChanged?.();
    } catch (error) {
      setNotice(error.message);
    }
  };

  const mine = groups.items.filter((group) => group.membership_status === 'active');
  const discoverable = groups.items.filter((group) => group.joinable || group.oversight);

  return (
    <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
      <section className="card-surface overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <h2 className="text-[15px] font-semibold text-ink">My groups</h2>
          <button type="button" onClick={() => setCreateOpen((value) => !value)} className="btn-quiet btn-sm">
            <Plus className="h-3.5 w-3.5" /> Subgroup
          </button>
        </div>
        <div className="scroll-thin max-h-[520px] divide-y divide-line/70 overflow-y-auto">
          {groups.loading && <div className="p-3"><div className="h-14 animate-pulse rounded-lg bg-[#F3F5F9]" /></div>}
          {groups.error && <p className="p-4 text-[13px] text-[#A23B3B]">{groups.error}</p>}
          {mine.map((group) => (
            <button
              key={group.id}
              type="button"
              onClick={() => setSelected(group.id)}
              className={cn('flex w-full items-center gap-2 px-4 py-3 text-left', selected === group.id ? 'bg-[#F4F7FF]' : 'hover:bg-[#FAFBFD]')}
            >
              <Users className="h-4 w-4 shrink-0 text-mutedink" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-medium text-ink">{group.name}</span>
                <span className="block truncate text-[12px] text-mutedink">
                  {group.type === 'class' ? 'Class group' : 'Subgroup'} · {group.member_count} members
                </span>
              </span>
              {group.is_coordinator && <ShieldCheck className="h-3.5 w-3.5 text-[#5B4DEB]" />}
              {group.unread > 0 && <span className="h-2 w-2 rounded-full bg-brand" />}
            </button>
          ))}
          {!groups.loading && !mine.length && (
            <p className="px-4 py-5 text-[13px] leading-relaxed text-mutedink">
              No groups yet. Your class group is created automatically once your academic group is set.
            </p>
          )}
          {!!discoverable.length && (
            <>
              <p className="bg-[#FAFBFD] px-4 py-2 text-[12px] font-semibold uppercase tracking-wide text-mutedink">
                {boot?.staff ? 'Oversight' : 'Discoverable'}
              </p>
              {discoverable.map((group) => (
                <button
                  key={`d-${group.id}`}
                  type="button"
                  onClick={() => setSelected(group.id)}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left hover:bg-[#FAFBFD]"
                >
                  <Users className="h-4 w-4 text-mutedink" />
                  <span className="truncate text-[13px] text-ink">{group.name}</span>
                </button>
              ))}
            </>
          )}
        </div>
      </section>

      <section className="space-y-3">
        {createOpen && (
          <div className="card-surface p-4">
            <h3 className="text-[15px] font-semibold text-ink">Create a subgroup</h3>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Subgroup name"
                className="rounded-lg border border-line px-2 py-1.5 text-[14px] sm:col-span-2"
              />
              <textarea
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                placeholder="What is this group for?"
                rows={2}
                className="rounded-lg border border-line px-2 py-1.5 text-[14px] sm:col-span-2"
              />
              <select
                value={form.visibility}
                onChange={(event) => setForm((current) => ({ ...current, visibility: event.target.value }))}
                className="rounded-lg border border-line px-2 py-1.5 text-[14px]"
              >
                {VISIBILITY.map((entry) => <option key={entry.value} value={entry.value}>{entry.label}</option>)}
              </select>
              <select
                value={form.membershipPolicy}
                onChange={(event) => setForm((current) => ({ ...current, membershipPolicy: event.target.value }))}
                className="rounded-lg border border-line px-2 py-1.5 text-[14px]"
              >
                <option value="invite">Invitation link</option>
                <option value="approval">Invitation with approval</option>
              </select>
            </div>
            <div className="mt-2 flex gap-2">
              <button type="button" onClick={createSubgroup} className="btn-primary btn-sm">Create subgroup</button>
              <button type="button" onClick={() => setCreateOpen(false)} className="btn-quiet btn-sm">Cancel</button>
            </div>
          </div>
        )}

        {!detail && !createOpen && (
          <div className="card-surface p-6 text-[14px] text-mutedink">Select a group to see its members and messages.</div>
        )}

        {detail && (
          <div className="card-surface overflow-hidden">
            <div className="border-b border-line px-4 py-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <h2 className="text-[17px] font-semibold text-ink">{detail.group.name}</h2>
                  <p className="mt-0.5 text-[13px] text-mutedink">
                    {detail.group.type === 'class' ? 'Class group' : 'Subgroup'} · coordinator{' '}
                    {detail.group.coordinator_name || 'not appointed'} · {detail.group.academic_group_id || '—'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {detail.group.thread_id && (
                    <button type="button" onClick={() => openThread(detail.group.thread_id)} className="btn-primary btn-sm">
                      Open group chat
                    </button>
                  )}
                  {detail.group.canInvite && (
                    <button type="button" onClick={createInvite} className="btn-quiet btn-sm">
                      <Link2 className="h-3.5 w-3.5" /> Invite link
                    </button>
                  )}
                  {detail.group.type === 'subgroup' && (
                    <button type="button" onClick={leave} className="btn-quiet btn-sm">
                      <LogOut className="h-3.5 w-3.5" /> Leave
                    </button>
                  )}
                </div>
              </div>
              {detail.group.description && <p className="mt-2 text-[13px] leading-relaxed text-mutedink">{detail.group.description}</p>}
            </div>

            {invite && (
              <div className="border-b border-line bg-[#F6F9F6] px-4 py-3">
                <p className="text-[13px] font-semibold text-ink">Invitation link created</p>
                <div className="mt-1 flex items-center gap-2">
                  <code className="min-w-0 flex-1 truncate rounded bg-white px-2 py-1 text-[12px] text-ink">
                    {`${window.location.origin}${invite.path}`}
                  </code>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard?.writeText(`${window.location.origin}${invite.path}`)}
                    className="btn-quiet btn-sm"
                  >
                    <Copy className="h-3.5 w-3.5" /> Copy
                  </button>
                </div>
                <p className="mt-1 text-[12px] text-mutedink">
                  Only the hash is stored. The link can be revoked at any time and stops working after its expiry or use limit.
                </p>
              </div>
            )}

            {!!invitations.length && (
              <div className="border-b border-line px-4 py-3">
                <p className="text-[13px] font-semibold text-ink">Invitations</p>
                <ul className="mt-1.5 space-y-1">
                  {invitations.map((row) => (
                    <li key={row.id} className="flex items-center gap-2 text-[12px] text-mutedink">
                      <span className="uppercase">{row.status}</span>
                      <span>· {row.usage_count}/{row.maximum_uses} uses</span>
                      <span>· expires {new Date(row.expires_at).toLocaleDateString('en-GB')}</span>
                      {row.status === 'active' && (
                        <button type="button" onClick={() => revoke(row.id)} className="ml-auto text-[#A23B3B] hover:underline">
                          Revoke
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="px-4 py-3">
              <p className="text-[13px] font-semibold text-ink">Members ({detail.members.filter((row) => row.status === 'active').length})</p>
              <ul className="mt-1.5 divide-y divide-line/60">
                {detail.members.map((member) => (
                  <li key={member.id} className="flex items-center gap-2 py-1.5 text-[13px]">
                    <span className="min-w-0 flex-1 truncate text-ink">{member.name}</span>
                    {member.role === 'coordinator' && (
                      <span className="rounded bg-[#EFEAFE] px-1.5 py-px text-[11px] font-medium text-[#5B4DEB]">coordinator</span>
                    )}
                    {member.status === 'pending' && (
                      <>
                        <span className="rounded bg-[#FCF3E4] px-1.5 py-px text-[11px] font-medium text-[#8E6018]">pending</span>
                        {detail.group.canInvite && (
                          <button type="button" onClick={() => approve(member.id)} className="btn-quiet btn-sm">
                            <Check className="h-3 w-3" /> Approve
                          </button>
                        )}
                      </>
                    )}
                    {member.status === 'left' && <span className="text-[11px] text-mutedink">left</span>}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        {notice && <p className="text-[13px] text-[#A23B3B]">{notice}</p>}
      </section>
    </div>
  );
}