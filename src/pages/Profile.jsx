import { useEffect, useState } from 'react';
import { LogOut, Save, ShieldCheck, Mail, Building2, IdCard, UserRound } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { LoadingState, ErrorState } from '@/components/LoadingState';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useStudentData } from '@/lib/StudentDataContext';

export default function Profile() {
  const { loading, error, reload, profile, saveProfile, applications, grades } = useStudentData();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!profile) return;
    setForm({
      full_name: profile.full_name || '',
      program: profile.program || '',
      faculty: profile.faculty || '',
      year: profile.year || 1,
    });
  }, [profile]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!profile || !form) {
    return (
      <ErrorState
        message="Your student profile has not been created yet."
        onRetry={reload}
      />
    );
  }

  const initials = (profile.full_name || 'Student')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('');

  const yearLabel =
    ['1st', '2nd', '3rd', '4th'][Number(profile.year) - 1] || `${profile.year}th`;

  const submit = async (event) => {
    event.preventDefault();
    if (!form.full_name.trim()) {
      setFormError('Please enter your full name.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      await saveProfile({
        full_name: form.full_name.trim(),
        program: form.program.trim(),
        faculty: form.faculty.trim(),
        year: Number(form.year),
      });
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setFormError(err?.message || 'Your changes could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fade-up">
      <PageHeader
        eyebrow="Personal account"
        title="My profile"
        description="Your student record and account settings."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#153B68] via-[#123055] to-[#0F2A4A] p-6 text-white shadow-[0_24px_50px_-32px_rgba(16,42,76,0.8)] lg:col-span-1">
          <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-gold/20 blur-3xl" />
          <div className="relative">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 font-heading text-[22px] text-gold-light ring-1 ring-white/15">
              {initials}
            </div>
            <h2 className="mt-4 font-heading text-[21px] leading-tight">{profile.full_name}</h2>
            <p className="mt-1 text-[12px] text-white/55">
              {profile.program} · {yearLabel} year
            </p>

            <dl className="mt-6 space-y-3.5 text-[12px]">
              <div className="flex items-start gap-2.5">
                <IdCard className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold/80" />
                <div>
                  <dt className="text-[9.5px] uppercase tracking-[0.16em] text-white/35">Student ID</dt>
                  <dd className="text-white/90">{profile.student_id}</dd>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Building2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold/80" />
                <div>
                  <dt className="text-[9.5px] uppercase tracking-[0.16em] text-white/35">University</dt>
                  <dd className="text-white/90">{profile.university}</dd>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <UserRound className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold/80" />
                <div>
                  <dt className="text-[9.5px] uppercase tracking-[0.16em] text-white/35">Academic advisor</dt>
                  <dd className="text-white/90">{profile.advisor || 'Not assigned'}</dd>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold/80" />
                <div className="min-w-0">
                  <dt className="text-[9.5px] uppercase tracking-[0.16em] text-white/35">Email</dt>
                  <dd className="truncate text-white/90">{profile.email}</dd>
                </div>
              </div>
            </dl>

            <div className="mt-6 grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5">
                <p className="text-[9.5px] uppercase tracking-[0.14em] text-white/35">Applications</p>
                <p className="mt-0.5 font-heading text-[18px] text-white">{applications.length}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5">
                <p className="text-[9.5px] uppercase tracking-[0.14em] text-white/35">Results</p>
                <p className="mt-0.5 font-heading text-[18px] text-white">{grades.length}</p>
              </div>
            </div>
          </div>
        </section>

        <div className="space-y-6 lg:col-span-2">
          <section className="card-surface p-5 sm:p-6">
            <h2 className="font-heading text-[17px] text-navy-deep">Profile settings</h2>
            <p className="mt-1 text-[11.5px] text-slate-500">
              Update the details shown across your account.
            </p>

            <form onSubmit={submit} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="full_name" className="text-[12px] text-navy-deep">
                    Full name
                  </Label>
                  <Input
                    id="full_name"
                    value={form.full_name}
                    onChange={(event) => setForm({ ...form, full_name: event.target.value })}
                    className="text-[13px]"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="year" className="text-[12px] text-navy-deep">
                    Year of study
                  </Label>
                  <select
                    id="year"
                    value={form.year}
                    onChange={(event) => setForm({ ...form, year: Number(event.target.value) })}
                    className="w-full rounded-xl border border-[#E4E9F2] bg-white px-3 py-2 text-[13px] text-navy-deep outline-none transition-colors focus:border-navy-mid focus:ring-2 focus:ring-navy/10"
                  >
                    {[1, 2, 3, 4].map((year) => (
                      <option key={year} value={year}>
                        {['1st', '2nd', '3rd', '4th'][year - 1]} year
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="program" className="text-[12px] text-navy-deep">
                    Academic programme
                  </Label>
                  <Input
                    id="program"
                    value={form.program}
                    onChange={(event) => setForm({ ...form, program: event.target.value })}
                    className="text-[13px]"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="faculty" className="text-[12px] text-navy-deep">
                    Faculty
                  </Label>
                  <Input
                    id="faculty"
                    value={form.faculty}
                    onChange={(event) => setForm({ ...form, faculty: event.target.value })}
                    className="text-[13px]"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px] text-slate-400">Student ID</Label>
                  <Input value={profile.student_id || '—'} disabled className="bg-[#F7F9FD] text-[13px]" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px] text-slate-400">University</Label>
                  <Input value={profile.university || '—'} disabled className="bg-[#F7F9FD] text-[13px]" />
                </div>
              </div>

              {formError && (
                <p className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-[12px] text-rose-700">
                  {formError}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-navy text-[12.5px] hover:bg-navy-deep"
                >
                  <Save className="mr-1.5 h-3.5 w-3.5" /> {saving ? 'Saving…' : 'Save changes'}
                </Button>
                {saved && <span className="text-[11.5px] text-emerald-600">Profile updated.</span>}
              </div>
            </form>
          </section>

          <section className="card-surface p-5 sm:p-6">
            <h2 className="font-heading text-[17px] text-navy-deep">Account</h2>
            <div className="mt-4 flex flex-col gap-3 rounded-xl border border-[#EEF1F7] px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-navy-mid" strokeWidth={1.7} />
                <div>
                  <p className="text-[12.5px] font-medium text-navy-deep">Personal records protected</p>
                  <p className="mt-0.5 text-[11.5px] leading-relaxed text-slate-500">
                    Your schedule, results and applications are visible only to you and the dean’s
                    office account that reviews requests.
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => base44.auth.logout()}
                className="shrink-0 rounded-xl text-[12.5px]"
              >
                <LogOut className="mr-1.5 h-3.5 w-3.5" /> Sign out
              </Button>
            </div>

            <p className="mt-4 rounded-xl bg-[#F7F9FD] px-4 py-3 text-[11px] leading-relaxed text-slate-500">
              Independent AI Challenge Prototype. Not an official MGIMO University service. All
              student records and academic data are fictional.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}