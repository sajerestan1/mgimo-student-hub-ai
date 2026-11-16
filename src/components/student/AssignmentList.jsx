import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import StatusChip from '@/components/shell/StatusChip';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { ASSIGNMENT_STATE, dueLabel, shortDate, addDemoSubmission } from '@/lib/studentPortal';
import { useI18n } from '@/i18n/I18nProvider';

const field =
  'w-full rounded-lg border border-line bg-white px-3 py-2 text-[15px] text-ink focus:border-royal/40 focus:outline-none focus:ring-2 focus:ring-royal/10';

/** One authoritative list of the student's assignments, with submission. */
export default function AssignmentList({ rows, profile, onChanged }) {
  const { user } = useAuth();
  const { t, language } = useI18n();
  const [openId, setOpenId] = useState(null);
  const [form, setForm] = useState('');
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (row) => {
    if (!form.trim()) {
      setError(t('student.assignments.noteRequired'));
      return;
    }
    setBusy(true);
    setError('');
    try {
      let stored = {};
      if (file && import.meta.env.VITE_DEMO_MODE !== 'true') {
        const uploaded = await base44.integrations.Core.UploadPrivateFile({ file });
        stored = { file_url: uploaded.file_uri };
      }
      const submission = {
        assignment_id: row.id,
        course_id: row.courseId,
        course_code: row.courseCode,
        student_id: profile.id,
        student_user_id: user.id,
        student_name: profile.full_name,
        student_group: profile.group_name,
        submitted_at: new Date().toISOString().slice(0, 10),
        content: form.trim(),
        status: 'submitted',
        ...stored,
      };
      if (import.meta.env.VITE_DEMO_MODE === 'true') addDemoSubmission(submission);
      else await base44.entities.Submission.create(submission);
      setOpenId(null);
      setForm('');
      setFile(null);
      await onChanged();
    } catch {
      setError(t('student.assignments.uploadError'));
    } finally {
      setBusy(false);
    }
  };

  if (!rows.length) {
    return <p className="px-5 py-8 text-center text-[15px] text-mutedink">{t('student.assignments.emptyFilter')}</p>;
  }

  return (
    <ul className="divide-y divide-line">
      {rows.map((row) => {
        const state = ASSIGNMENT_STATE[row.state] || ASSIGNMENT_STATE.pending;
        const isForm = openId === `submit-${row.id}`;
        const isBrief = openId === `brief-${row.id}`;
        return (
          <li key={row.id} className="px-5 py-3.5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-[15px] font-medium text-ink">{row.title}</p>
                <p className="mt-0.5 text-[13px] text-mutedink">
                  {row.courseCode} · {row.type} · {shortDate(row.dueDate, undefined, language)} · {dueLabel(row.dueDate, t)}
                </p>
                {row.state === 'graded' && row.feedback && (
                  <p className="mt-1.5 text-[13px] leading-relaxed text-ink/75">
                    <span className="font-medium text-ink">{t('student.assignments.feedback')}</span> {row.feedback}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <StatusChip tone={state.tone}>
                  {row.state === 'graded' ? `${row.score}/${row.maxScore}` : t(state.labelKey)}
                </StatusChip>
                {(row.state === 'pending' || row.state === 'overdue') && (
                  <button
                    type="button"
                    onClick={() => {
                      setOpenId(isForm ? null : `submit-${row.id}`);
                      setError('');
                    }}
                    className="btn-quiet btn-sm"
                  >
                    {isForm ? t('student.assignments.cancel') : t('student.assignments.submit')}
                  </button>
                )}
                {row.instructions && (
                  <button
                    type="button"
                    onClick={() => {
                      setOpenId(isBrief ? null : `brief-${row.id}`);
                      setError('');
                    }}
                    className="icon-btn"
                    aria-label={t('student.assignments.showBrief')}
                    aria-expanded={isBrief}
                  >
                    <ChevronDown className={`h-4 w-4 transition-transform ${isBrief ? 'rotate-180' : ''}`} />
                  </button>
                )}
              </div>
            </div>

            {isBrief && row.instructions && (
              <p className="mt-2 rounded-lg bg-canvas px-3 py-2.5 text-[14px] leading-relaxed text-ink/80">
                {row.instructions}
              </p>
            )}

            {isForm && (
              <div className="mt-3 space-y-2 rounded-lg border border-line bg-canvas px-3 py-3">
                <textarea
                  rows={3}
                  value={form}
                  onChange={(event) => setForm(event.target.value)}
                  className={field}
                  placeholder={t('student.assignments.answerPlaceholder')}
                />
                <input
                  type="file"
                  onChange={(event) => setFile(event.target.files?.[0] || null)}
                  className="w-full text-[13px] text-mutedink"
                />
                {error && <p className="text-[13px] text-critical">{error}</p>}
                <button
                  type="button"
                  onClick={() => submit(row)}
                  disabled={busy}
                  className="btn-primary disabled:opacity-60"
                >
                  {busy ? t('student.assignments.submitting') : t('student.assignments.submitAssignment')}
                </button>
                <p className="text-[12px] text-mutedink">{t('student.assignments.privateNote')}</p>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}