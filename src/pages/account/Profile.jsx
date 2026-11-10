import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, ShieldCheck, UserRound, Building2, Mail, GraduationCap } from 'lucide-react';
import PageTitle from '@/components/shell/PageTitle';
import Surface from '@/components/shell/Surface';
import PasswordCard from '@/components/account/PasswordCard';
import ProfilePhotoField from '@/components/account/ProfilePhotoField';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useI18n } from '@/i18n/I18nProvider';
import { useWorkspace, WORKSPACES } from '@/lib/workspaceRole';
import { ROLE_LABELS } from '@/lib/roles';
import { initialsOf } from '@/lib/accounts';
import { loadStudentPortal } from '@/lib/studentPortal';

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
  const { t } = useI18n();

  const roleName = (value) => {
    const key = String(value || role).toLowerCase();
    return ROLE_LABELS[key] ? t(`roles.${key}`) : t('roles.user');
  };

  const [phone, setPhone] = useState(user?.phone || '');
  const [photo, setPhoto] = useState(user?.photo_uri || '');
  // The academic block below reads the same authoritative student record the
  // dashboard, timetable and register use — never the account's own copy.
  const [academic, setAcademic] = useState(null);

  useEffect(() => {
    if (role !== 'student') return undefined;
    let alive = true;
    loadStudentPortal()
      .then((data) => {
        if (alive) setAcademic(data.profile || null);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [role]);
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
      setError(saveError?.message || t('profile.saveFailed'));
    } finally {
      setBusy(false);
    }
  };

  const field = 'mt-1 h-10 w-full rounded-lg border border-line bg-white px-3 text-[15px] text-ink';

  return (
    <div className="mx-auto max-w-4xl">
      <PageTitle
        eyebrow={t('profile.eyebrow')}
        title={t('profile.title')}
        description={t('profile.description')}
        actions={
          <button type="button" onClick={() => logout()} className="btn-quiet">
            <LogOut className="h-3.5 w-3.5" /> {t('profile.signOut')}
          </button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Surface title={t('profile.identity')} subtitle={t('profile.identitySub')}>
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-[15px] font-semibold text-brand">
              {initialsOf(displayName)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[16px] font-semibold tracking-tight text-ink">{displayName}</p>
              <p className="truncate text-[14px] text-mutedink">{user?.email || t('profile.noEmail')}</p>
            </div>
          </div>

          <form onSubmit={save} className="space-y-3">
            <ProfilePhotoField value={photo} name={displayName} onChange={setPhoto} disabled={busy} />
            <div>
              <label className="text-[15px] font-medium text-ink" htmlFor="profile-phone">{t('profile.phone')}</label>
              <input
                id="profile-phone"
                className={field}
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+7 900 000 00 00"
                dir="ltr"
              />
            </div>
            <div>
              <label className="text-[15px] font-medium text-ink" htmlFor="profile-email">{t('profile.email')}</label>
              <input
                id="profile-email"
                className={`${field} bg-canvas text-mutedink`}
                value={user?.contact_email || user?.email || ''}
                readOnly
              />
              <p className="mt-1 text-[13px] text-mutedink">{t('profile.emailNote')}</p>
            </div>
            {error && <p className="rounded-lg bg-[#FBECEC] px-3 py-2 text-[14px] text-critical">{error}</p>}
            {saved && <p className="rounded-lg bg-[#E9F5EF] px-3 py-2 text-[14px] text-positive">{t('profile.saved')}</p>}
            <button type="submit" className="btn-primary" disabled={busy}>{t('profile.saveChanges')}</button>
          </form>
        </Surface>

        <div className="grid gap-4">
          <Surface title={t('profile.academicRecord')} subtitle={t('profile.academicRecordSub')}>
            <dl>
              <Row label={t('profile.role')} value={roleName(user?.role)} />
              <Row label={t('profile.studentId')} value={academic?.student_id || user?.student_id} />
              <Row label={t('profile.professorId')} value={user?.professor_id} />
              <Row label={t('profile.faculty')} value={facultyName} />
              <Row label={t('profile.group')} value={academic?.group_name || user?.group_name} />
              <Row label={t('profile.programme')} value={academic?.program || user?.programme} />
              {academic?.year ? (
                <Row label={t('profile.academicYear')} value={t('profile.yearValue', { year: academic.year })} />
              ) : null}
            </dl>
            <p className="mt-3 flex items-start gap-2 rounded-lg bg-canvas px-3 py-2.5 text-[13px] leading-relaxed text-mutedink">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {t('profile.academicNote')}
            </p>
          </Surface>

          <Surface title={t('profile.account')} subtitle={t('profile.accountSub')}>
            <dl>
              <Row label={t('profile.username')} value={user?.username} />
              <Row label={t('profile.registeredEmail')} value={user?.email} />
              <Row label={t('profile.role')} value={roleName(user?.role)} />
              <Row label={t('profile.workspace')} value={t(workspace.title)} />
              <Row label={t('profile.signInMethod')} value={t('profile.emailPassword')} />
            </dl>
            <p className="mt-3 text-[13px] leading-relaxed text-mutedink">{t('profile.usernameNote')}</p>
          </Surface>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <PasswordCard />

        <Surface title={t('profile.workspaces')} subtitle={t('profile.workspacesSub')}>
          <ul className="space-y-2">
            {Object.values(WORKSPACES).map((item) => (
              <li
                key={item.role}
                className={`rounded-lg border px-3 py-2.5 ${
                  item.role === role ? 'border-brand/30 bg-[#F7F9FF]' : 'border-[#EDF0F6]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="flex items-center gap-1.5 text-[14px] font-medium text-ink">
                    {item.role === 'student' ? (
                      <GraduationCap className="h-3.5 w-3.5 text-mutedink" />
                    ) : item.role === 'professor' ? (
                      <UserRound className="h-3.5 w-3.5 text-mutedink" />
                    ) : (
                      <Building2 className="h-3.5 w-3.5 text-mutedink" />
                    )}
                    {t(item.title)}
                  </p>
                  {item.role === role && <span className="chip bg-[#EDF1FE] text-[#3B5AE0]">{t('profile.yours')}</span>}
                </div>
                {canView(item.role) ? (
                  <Link to={item.home} className="link-quiet mt-1">
                    {t('profile.openWorkspace', { workspace: t(item.label) })}
                  </Link>
                ) : (
                  <p className="mt-1 text-[13px] text-mutedink">{t('profile.notAvailable')}</p>
                )}
              </li>
            ))}
          </ul>
          <p className="mt-3 flex items-center gap-1.5 text-[13px] text-mutedink">
            <Mail className="h-3.5 w-3.5" /> {t('profile.correspondence')}
          </p>
        </Surface>
      </div>
    </div>
  );
}