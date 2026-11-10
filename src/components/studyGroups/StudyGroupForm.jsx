import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useI18n } from '@/i18n/I18nProvider';
import { FOCUS_OPTIONS, focusKey, studyGroupsApi } from '@/lib/studyGroups';

const EMPTY = {
  course_id: '',
  name: '',
  description: '',
  focus: 'general',
  schedule: '',
  location: '',
  member_limit: 8,
};

// Creating a group only asks for what a coursemate needs to decide whether to
// join it: the course, what the group works on, and when it meets.
export default function StudyGroupForm({ open, onOpenChange, courses, defaultCourseId, onCreated }) {
  const { t } = useI18n();
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setForm({ ...EMPTY, course_id: defaultCourseId || courses?.[0]?.id || '' });
    setError('');
  }, [open, defaultCourseId, courses]);

  const set = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError('');
    try {
      await studyGroupsApi('create', {
        ...form,
        member_limit: Number(form.member_limit) || 8,
      });
      setSaving(false);
      onOpenChange(false);
      onCreated();
    } catch (caught) {
      setError(caught.message || t('student.studyGroups.form.error'));
      setSaving(false);
    }
  };

  const fieldClass =
    'mt-1.5 w-full rounded-lg border border-line bg-white px-3 py-2 text-[15px] text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[length:var(--type-card)] font-semibold text-ink">
            {t('student.studyGroups.form.title')}
          </DialogTitle>
        </DialogHeader>
        <p className="-mt-1 text-[13px] leading-relaxed text-mutedink">{t('student.studyGroups.form.hint')}</p>

        <form onSubmit={submit} className="mt-2 space-y-3">
          <div>
            <Label htmlFor="sg-course">{t('student.studyGroups.form.course')}</Label>
            <select id="sg-course" value={form.course_id} onChange={set('course_id')} className={fieldClass} required>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.code} — {course.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="sg-name">{t('student.studyGroups.form.name')}</Label>
            <Input
              id="sg-name"
              value={form.name}
              onChange={set('name')}
              maxLength={80}
              required
              minLength={3}
              placeholder={t('student.studyGroups.form.namePlaceholder')}
            />
          </div>

          <div>
            <Label htmlFor="sg-description">{t('student.studyGroups.form.description')}</Label>
            <Textarea
              id="sg-description"
              value={form.description}
              onChange={set('description')}
              maxLength={600}
              rows={3}
              placeholder={t('student.studyGroups.form.descriptionPlaceholder')}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="sg-focus">{t('student.studyGroups.form.focus')}</Label>
              <select id="sg-focus" value={form.focus} onChange={set('focus')} className={fieldClass}>
                {FOCUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {t(focusKey(option))}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="sg-limit">{t('student.studyGroups.form.limit')}</Label>
              <Input
                id="sg-limit"
                type="number"
                min={3}
                max={20}
                value={form.member_limit}
                onChange={set('member_limit')}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="sg-schedule">{t('student.studyGroups.form.schedule')}</Label>
              <Input
                id="sg-schedule"
                value={form.schedule}
                onChange={set('schedule')}
                maxLength={140}
                placeholder={t('student.studyGroups.form.schedulePlaceholder')}
              />
            </div>
            <div>
              <Label htmlFor="sg-location">{t('student.studyGroups.form.location')}</Label>
              <Input
                id="sg-location"
                value={form.location}
                onChange={set('location')}
                maxLength={140}
                placeholder={t('student.studyGroups.form.locationPlaceholder')}
              />
            </div>
          </div>

          {error && <p className="text-[13px] text-critical">{error}</p>}

          <div className="flex items-center justify-end gap-2 border-t border-line pt-3">
            <button type="button" onClick={() => onOpenChange(false)} className="btn-quiet btn-sm">
              {t('student.studyGroups.form.cancel')}
            </button>
            <button type="submit" disabled={saving || !form.course_id || !form.name.trim()} className="btn-primary btn-sm disabled:opacity-50">
              {saving ? t('student.studyGroups.form.saving') : t('student.studyGroups.form.submit')}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}