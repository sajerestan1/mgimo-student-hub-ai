import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import PageTitle from '@/components/shell/PageTitle';
import Surface from '@/components/shell/Surface';
import ProfilePhotoField from '@/components/account/ProfilePhotoField';
import { useAuth } from '@/lib/AuthContext';
import { accountRoleLabel, missingProfileFields } from '@/lib/accounts';

export default function CompleteProfile() {
  const { user, checkUserAuth } = useAuth();
  const { session, refreshSession } = useOutletContext() || {};
  const navigate = useNavigate();

  const [phone, setPhone] = useState(user?.phone || '');
  const [photo, setPhoto] = useState(user?.photo_uri || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const profile = session?.profile || {};
  const role = session?.role || user?.role || 'student';

  const missing = missingProfileFields({
    role,
    phone,
    photo_uri: photo,
    contact_email: profile.contact_email || user?.email,
    faculty_id: profile.faculty_id || user?.faculty_id,
    group_name: profile.group_name || user?.group_name,
  });
  const outstanding = missing.filter((item) => item.owner === 'self');
  const assignedByOffice = missing.filter((item) => item.owner === 'admin');

  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setSaved(false);
    try {
      await base44.auth.updateMe({ phone: phone.trim(), photo_uri: photo });
      await checkUserAuth();
      await refreshSession?.();
      setSaved(true);
    } catch (saveError) {
      setError(saveError?.message || 'Your profile could not be saved.');
    } finally {
      setBusy(false);
    }
  };

  const field = 'mt-1 h-10 w-full rounded-lg border border-line bg-white px-3 text-[15px] text-ink';

  return (
    <div className="mx-auto max-w-3xl">
      <PageTitle
        eyebrow="Account"
        title="Complete my profile"
        description="Your role needs a few compulsory details before the rest of the platform opens. They are stored on your account and can be corrected at any time."
        meta={[accountRoleLabel({ role, admin_level: session?.admin_level })]}
      />

      <div className="grid gap-4">
        <Surface title="Required details">
          {outstanding.length > 0 ? (
            <ul className="mb-4 space-y-1.5">
              {outstanding.map((item) => (
                <li key={item.key} className="flex items-center gap-2 text-[14px] text-ink">
                  <span className="h-1.5 w-1.5 rounded-full bg-warning" />
                  {item.label} is still required
                </li>
              ))}
            </ul>
          ) : (
            <p className="mb-4 flex items-center gap-2 rounded-lg bg-[#E9F5EF] px-3 py-2 text-[14px] text-positive">
              <CheckCircle2 className="h-4 w-4" /> Everything you are responsible for is in place.
            </p>
          )}

          <form onSubmit={save} className="space-y-4">
            <ProfilePhotoField value={photo} name={user?.full_name} onChange={setPhoto} disabled={busy} />
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-[15px] font-medium text-ink" htmlFor="profile-phone">Phone number</label>
                <input
                  id="profile-phone"
                  className={field}
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="+7 900 000 00 00"
                  required
                />
              </div>
              <div>
                <label className="text-[15px] font-medium text-ink" htmlFor="profile-email">Email address</label>
                <input
                  id="profile-email"
                  className={`${field} bg-canvas text-mutedink`}
                  value={profile.contact_email || user?.email || ''}
                  readOnly
                />
                <p className="mt-1 text-[13px] text-mutedink">Changed by the administration only.</p>
              </div>
            </div>

            {error && <p className="rounded-lg bg-[#FBECEC] px-3 py-2 text-[14px] text-critical">{error}</p>}
            {saved && !outstanding.length && (
              <p className="rounded-lg bg-[#E9F5EF] px-3 py-2 text-[14px] text-positive">
                Saved. Your profile is complete.
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              <button type="submit" className="btn-primary" disabled={busy}>
                {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Save profile
              </button>
              <button
                type="button"
                className="btn-quiet"
                onClick={() => navigate('/dashboard')}
                disabled={outstanding.length > 0}
              >
                Continue to my dashboard <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </form>
        </Surface>

        {assignedByOffice.length > 0 && (
          <Surface title="Assigned by the university" subtitle="These fields can only be set by an administrator">
            <ul className="space-y-1.5">
              {assignedByOffice.map((item) => (
                <li key={item.key} className="flex items-center justify-between border-b border-line py-1.5 text-[14px] last:border-0">
                  <span className="text-mutedink">{item.label}</span>
                  <span className="text-warning">Awaiting the student office</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[13px] leading-relaxed text-mutedink">
              Your dashboard stays available while these are pending. Contact your faculty administrator to have them
              assigned.
            </p>
          </Surface>
        )}
      </div>
    </div>
  );
}