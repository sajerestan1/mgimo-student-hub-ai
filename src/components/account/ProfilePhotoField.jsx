import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Upload } from 'lucide-react';
import { initialsOf } from '@/lib/accounts';

// Profile photos live in private storage: the file URI is stored on the account
// and a short-lived signed URL is requested only to render the preview.
export default function ProfilePhotoField({ value, name, onChange, disabled = false }) {
  const [preview, setPreview] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!value) {
        setPreview('');
        return;
      }
      if (String(value).startsWith('http')) {
        setPreview(value);
        return;
      }
      try {
        const { signed_url: signedUrl } = await base44.integrations.Core.CreateFileSignedUrl({
          file_uri: value,
          expires_in: 600,
        });
        if (alive) setPreview(signedUrl || '');
      } catch {
        if (alive) setPreview('');
      }
    })();
    return () => {
      alive = false;
    };
  }, [value]);

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type)) {
      setError('Choose a PNG, JPEG or WebP image.');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setError('The image must be smaller than 3 MB.');
      return;
    }
    setError('');
    setBusy(true);
    try {
      const { file_uri: fileUri } = await base44.integrations.Core.UploadPrivateFile({ file });
      onChange?.(fileUri);
    } catch (uploadError) {
      setError(uploadError.message || 'The photo could not be uploaded.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3">
        {preview ? (
          <img src={preview} alt="Profile photo" className="h-16 w-16 rounded-full object-cover ring-1 ring-line" />
        ) : (
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand/10 text-[17px] font-semibold text-brand">
            {initialsOf(name) || '—'}
          </span>
        )}
        <div>
          <label
            className={`btn-quiet cursor-pointer ${disabled || busy ? 'pointer-events-none opacity-60' : ''}`}
            htmlFor="profile-photo-input"
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            {value ? 'Replace photo' : 'Upload photo'}
          </label>
          <input
            id="profile-photo-input"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handleFile}
            disabled={disabled || busy}
          />
          <p className="mt-1 text-[13px] text-mutedink">PNG, JPEG or WebP, up to 3 MB. Stored privately.</p>
        </div>
      </div>
      {error && <p className="mt-2 text-[13px] text-critical">{error}</p>}
    </div>
  );
}