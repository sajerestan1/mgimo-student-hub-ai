import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, ShieldCheck, UserRound, Building2, Mail, GraduationCap } from 'lucide-react';
import PageTitle from '@/components/shell/PageTitle';
import Surface from '@/components/shell/Surface';
import PasswordCard from '@/components/account/PasswordCard';
import ProfilePhotoField from '@/components/account/ProfilePhotoField';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useWorkspace, WORKSPACES } from '@/lib/workspaceRole';
import { accountRoleLabel, initialsOf } from '@/lib/accounts';

function Row({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-line py-1.5 last:border-0">
      <dt className="text-[13px] text-mutedink">{label}</dt>
      <dd className="truncate text-[14px] font-medium text-ink">{value || '—'}</dd>
    </div>
  );
}

export default function Profile() {
  const { logout, checkUserAuth } = useAuth();
  const { user, role, displayName, workspace, canView } = useWorkspace();

  const [phone, setPhone] = useState(user?.phone || '');
  const [photo, setPhoto] = useState(user?.photo_uri || '');
  const [faculties, setFaculties] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const list = await base44.entities.Faculty.list('name', 40);
        if (alive) setFaculties(list);
      } catch {
        if (alive) setFaculties([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const facultyName = faculties.find((faculty) => faculty.id === user?.faculty_id)?.name;

  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setSaved(false);
    try {
      await base44.auth.updateMe({ phone: phone.trim(), photo_uri: photo });
      await checkUserAuth();
      setSaved(true);
    } catch (saveError) {
      setError(saveError?.message || 'Your details could not be saved.');
    } finally {
      setBusy(false);
    }
  };

  const field = 'mt-1 h-10 w-full rounded-lg border border-line bg-white px-3 text-[15px] text-ink';

  return (
    <div className="mx-auto max-w-4xl">
      <PageTitle
        eyebrow="Account"
        title="Profile"
        description="Your personal details, assigned role and the academic record the administration holds for you."
        actions={
          <button type="button" onClick={() => logout()} className="btn-quiet">
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Surface title="Identity" subtitle="Personal details you may keep up to date">
          <div className="mb-4 flex items-center gap-3">
            {user?.photo_uri ? (
              <span className="text-[13px] text-mutedink">Your photo is set.</span>
            ) : (
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-[15px] font-semibold text-brand">
                {initialsOf(displayName)}
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate text-[16px] font-semibold tracking-tight text-ink">{displayName}</p>
              <p className="truncate text-[14px] text-mutedink">{user?.email || 'No email on this account'}</p>
            </div>
          </div>

          <form onSubmit={save} className="space-y-3">
            <ProfilePhotoField value={photo} name={displayName} onChange={setPhoto} disabled={busy} />
            <div>
              <label className="text-[15px] font-medium text-ink" htmlFor="profile-phone">Phone number</label>
              <input
                id="profile-phone"
                className={field}
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+7 900 000 00 00"
              />
            </div>
            <div>
              <label className="text-[15px] font-medium text-ink" htmlFor="profile-email">Email address</label>
              <input
                id="profile-email"
                className={`${field} bg-canvas text-mutedink`}
                value={user?.contact_email || user?.email || ''}
                readOnly
              />
              <p className="mt-1 text-[13px] text-mutedink">Email and academic placement are changed by the administration.</p>
            </div>
            {error && <p className="rounded-lg bg-[#FBECEC] px-3 py-2 text-[14px] text-critical">{error}</p>}
            {saved && <p className="rounded-lg bg-[#E9F5EF] px-3 py-2 text-[14px] text-positive">Profile saved.</p>}
            <button type="submit" className="btn-primary" disabled={busy}>Save changes</button>
          </form>
        </Surface>

        <div className="grid gap-4">
          <Surface title="Academic record" subtitle="Maintained by the university">
            <dl>
              <Row label="Role" value={accountRoleLabel(user)} />
              <Row label="Student ID" value={user?.student_id} />
              <Row label="Professor ID" value={user?.professor_id} />
              <Row label="Faculty" value={facultyName} />
              <Row label="Class / group" value={user?.group_name} />
              <Row label="Programme" value={user?.programme} />
            </dl>
            <p className="mt-3 flex items-start gap-2 rounded-lg bg-canvas px-3 py-2.5 text-[13px] leading-relaxed text-mutedink">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Roles, identifiers and academic placement are assigned by the administration and cannot be changed here.
            </p>
          </Surface>

          <Surface title="Workspace">
            <dl>
              <Row label="Workspace" value={workspace.title} />
              <Row label="Sign-in method" value="Email & password" />
            </dl>
          </Surface>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <PasswordCard />

        <Surface title="Workspaces" subtitle="Available to your assigned role">
          <ul className="space-y-2">
            {Object.values(WORKSPACES).map((item) => (
              <li
                key={item.role}
                className={`rounded-lg border px-3 py-2.5 ${
                  item.role === role ? 'border-brand/30 bg-[#F7F9FF]' : 'border-[#EDF0F6]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="flex items-center gap-1.5 text-[14px] font-medium text-ink">
                    {item.role === 'student' ? (
                      <GraduationCap className="h-3.5 w-3.5 text-mutedink" />
                    ) : item.role === 'professor' ? (
                      <UserRound className="h-3.5 w-3.5 text-mutedink" />
                    ) : (
                      <Building2 className="h-3.5 w-3.5 text-mutedink" />
                    )}
                    {item.title}
                  </p>
                  {item.role === role && <span className="chip bg-[#EDF1FE] text-[#3B5AE0]">Yours</span>}
                </div>
                {canView(item.role) ? (
                  <Link to={item.home} className="link-quiet mt-1">
                    Open {item.label.toLowerCase()} workspace
                  </Link>
                ) : (
                  <p className="mt-1 text-[13px] text-mutedink">Not available with your assigned role</p>
                )}
              </li>
            ))}
          </ul>
          <p className="mt-3 flex items-center gap-1.5 text-[13px] text-mutedink">
            <Mail className="h-3.5 w-3.5" /> Institutional correspondence reaches your account email.
          </p>
        </Surface>
      </div>
    </div>
  );
}