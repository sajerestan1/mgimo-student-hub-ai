import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CERTIFICATE_TYPES } from '@/lib/academic';

export default function ApplicationForm({ open, onOpenChange, initialType, onSubmit }) {
  const [type, setType] = useState(initialType || CERTIFICATE_TYPES[0].value);
  const [purpose, setPurpose] = useState('');
  const [neededBy, setNeededBy] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setType(initialType || CERTIFICATE_TYPES[0].value);
    setPurpose('');
    setNeededBy('');
    setError('');
  }, [open, initialType]);

  const save = async (status) => {
    if (purpose.trim().length < 10) {
      setError('Please describe the purpose of the request (at least 10 characters).');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSubmit({
        certificate_type: type,
        purpose: purpose.trim(),
        needed_by: neededBy || '',
        status,
      });
      onOpenChange(false);
    } catch (err) {
      setError(err?.message || 'The application could not be saved. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-[20px] text-navy-deep">
            New application
          </DialogTitle>
          <DialogDescription className="text-[12.5px] text-slate-500">
            Requests are sent to the dean’s office and tracked in your account.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="certificate-type" className="text-[12px] text-navy-deep">
              Certificate type
            </Label>
            <select
              id="certificate-type"
              value={type}
              onChange={(event) => setType(event.target.value)}
              className="w-full rounded-xl border border-[#E4E9F2] bg-white px-3 py-2.5 text-[13px] text-navy-deep outline-none transition-colors focus:border-navy-mid focus:ring-2 focus:ring-navy/10"
            >
              {CERTIFICATE_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="purpose" className="text-[12px] text-navy-deep">
              Purpose of the request
            </Label>
            <Textarea
              id="purpose"
              value={purpose}
              onChange={(event) => setPurpose(event.target.value)}
              rows={4}
              placeholder="Explain why you need this document and where it will be submitted."
              className="resize-none text-[13px]"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="needed-by" className="text-[12px] text-navy-deep">
              Needed by (optional)
            </Label>
            <Input
              id="needed-by"
              type="date"
              value={neededBy}
              onChange={(event) => setNeededBy(event.target.value)}
              className="text-[13px]"
            />
          </div>

          {error && (
            <p className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-[12px] text-rose-700">{error}</p>
          )}

          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => save('draft')}
              className="rounded-xl text-[12.5px]"
            >
              Save as draft
            </Button>
            <Button
              type="button"
              disabled={saving}
              onClick={() => save('submitted')}
              className="rounded-xl bg-navy text-[12.5px] hover:bg-navy-deep"
            >
              {saving ? 'Sending…' : 'Submit application'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}