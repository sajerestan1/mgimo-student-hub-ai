import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PageTitle from '@/components/shell/PageTitle';
import { comm } from '@/lib/communication/api';

export default function InvitationJoin() {
  const params = useParams();
  const token = params.token || '';
  const [state, setState] = useState({ loading: true, preview: null, error: '', joining: false, joined: null });

  useEffect(() => {
    comm('invitationPreview', { token })
      .then((data) => setState({ loading: false, preview: data, error: '', joining: false, joined: null }))
      .catch((error) => setState({ loading: false, preview: null, error: error.message, joining: false, joined: null }));
  }, [token]);

  const join = async () => {
    setState((current) => ({ ...current, joining: true, error: '' }));
    try {
      const result = await comm('acceptInvitation', { token });
      setState((current) => ({ ...current, joining: false, joined: result }));
    } catch (error) {
      setState((current) => ({ ...current, joining: false, error: error.message }));
    }
  };

  const preview = state.preview;

  return (
    <div className="mx-auto max-w-xl">
      <PageTitle eyebrow="Group invitation" title="Join a student subgroup" />
      {state.loading && <div className="h-24 animate-pulse rounded-xl bg-[#EEF1F6]" />}
      {!state.loading && (
        <div className="card-surface p-6">
          {state.joined ? (
            <>
              <p className="text-[17px] font-semibold text-ink">
                {state.joined.status === 'pending' ? 'Request sent' : 'You joined the group'}
              </p>
              <p className="mt-2 text-[15px] text-mutedink">
                {state.joined.status === 'pending'
                  ? 'The coordinator will review your request before you can post.'
                  : 'The group now appears in your Communication Center.'}{' '}
                {state.joined.group?.name}
              </p>
              <a href="/communication" className="btn-primary mt-5">
                Open Communication Center
              </a>
            </>
          ) : preview?.valid ? (
            <>
              <p className="eyebrow mb-1">Invitation</p>
              <h2 className="text-[22px] font-bold tracking-[-0.02em] text-ink">{preview.group.name}</h2>
              <p className="mt-2 text-[15px] leading-[1.6] text-mutedink">
                {preview.group.description || 'No description was provided for this subgroup.'}
              </p>
              <p className="mt-3 text-[13px] text-mutedink">
                Academic group {preview.group.academic_group_id || '—'}
                {preview.group.approval_required ? ' · membership needs coordinator approval' : ''}
              </p>
              {!preview.eligible_group && (
                <p className="mt-3 rounded-lg bg-[#FBECEC] px-3 py-2 text-[13px] text-[#A23B3B]">
                  This invitation belongs to another academic group and cannot be used from your account.
                </p>
              )}
              {state.error && <p className="mt-3 text-[13px] text-[#A23B3B]">{state.error}</p>}
              <button
                type="button"
                onClick={join}
                disabled={state.joining || !preview.eligible_group}
                className="btn-primary mt-5 disabled:opacity-60"
              >
                {state.joining ? 'Joining…' : 'Accept invitation'}
              </button>
            </>
          ) : (
            <>
              <p className="text-[17px] font-semibold text-ink">This invitation is not available</p>
              <p className="mt-2 text-[15px] text-mutedink">
                {preview?.state === 'expired'
                  ? 'The link has expired. Ask the coordinator for a new invitation.'
                  : preview?.state === 'revoked'
                    ? 'The coordinator revoked this link.'
                    : preview?.state === 'exhausted'
                      ? 'This link has reached its maximum number of uses.'
                      : state.error || 'The link is invalid.'}
              </p>
              <a href="/communication" className="btn-quiet mt-5">
                Go to Communication
              </a>
            </>
          )}
        </div>
      )}
    </div>
  );
}