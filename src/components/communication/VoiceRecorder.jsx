import { useEffect, useRef, useState } from 'react';
import { Mic, Pause, Play, Square, Trash2, Sparkles, Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { comm, uploadVoiceNote, formatDuration, VOICE_SECONDS, VOICE_BYTES } from '@/lib/communication/api';

// Records, reviews, then either sends the audio or asks the existing AI service
// for a transcript the user can correct before sending.
export default function VoiceRecorder({ threadId, onCancel, onSend, canPost }) {
  const [status, setStatus] = useState('idle'); // idle | recording | paused | review | transcribing | transcript
  const [seconds, setSeconds] = useState(0);
  const [blob, setBlob] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [keepAudio, setKeepAudio] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');

  const recorder = useRef(null);
  const stream = useRef(null);
  const chunks = useRef([]);
  const cancelled = useRef(false);
  const timer = useRef(null);
  const urlRef = useRef('');

  const teardown = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    stream.current?.getTracks().forEach((track) => track.stop());
    stream.current = null;
    recorder.current = null;
  };

  useEffect(() => () => {
    teardown();
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
  }, []);

  useEffect(() => {
    if (status !== 'recording') {
      if (timer.current) clearInterval(timer.current);
      timer.current = null;
      return undefined;
    }
    timer.current = setInterval(() => {
      setSeconds((current) => {
        const next = current + 1;
        if (next >= VOICE_SECONDS) recorder.current?.state === 'recording' && recorder.current.stop();
        return next;
      });
    }, 1000);
    return () => {
      if (timer.current) clearInterval(timer.current);
      timer.current = null;
    };
  }, [status]);

  const start = async () => {
    setError('');
    setAttachment(null);
    setTranscript('');
    if (!navigator.mediaDevices?.getUserMedia || typeof window.MediaRecorder === 'undefined') {
      setError('Recording is not supported in this browser. Type your message instead.');
      return;
    }
    try {
      const media = await navigator.mediaDevices.getUserMedia({ audio: true });
      const preferred = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'];
      const chosen = preferred.find((type) => window.MediaRecorder.isTypeSupported?.(type)) || '';
      const instance = chosen ? new MediaRecorder(media, { mimeType: chosen }) : new MediaRecorder(media);
      chunks.current = [];
      cancelled.current = false;

      instance.ondataavailable = (event) => {
        if (event.data?.size) chunks.current.push(event.data);
      };
      instance.onstop = () => {
        teardown();
        if (cancelled.current) {
          setStatus('idle');
          setSeconds(0);
          return;
        }
        const mime = String(instance.mimeType || 'audio/webm').split(';')[0];
        const recorded = new Blob(chunks.current, { type: mime });
        if (!recorded.size) {
          setError('Nothing was recorded. Try again.');
          setStatus('idle');
          return;
        }
        if (recorded.size > VOICE_BYTES) {
          setError('That recording is larger than 10 MB. Record a shorter note.');
          setStatus('idle');
          return;
        }
        if (urlRef.current) URL.revokeObjectURL(urlRef.current);
        urlRef.current = URL.createObjectURL(recorded);
        setPreviewUrl(urlRef.current);
        setBlob(recorded);
        setStatus('review');
      };

      instance.start();
      recorder.current = instance;
      stream.current = media;
      setSeconds(0);
      setStatus('recording');
    } catch (err) {
      setError(
        err?.name === 'NotAllowedError' || err?.name === 'SecurityError'
          ? 'Microphone access was blocked. Allow the microphone in your browser settings, or type your message instead.'
          : 'No microphone was available. You can type your message instead.',
      );
      setStatus('idle');
    }
  };

  const pause = () => {
    if (recorder.current?.state === 'recording') {
      recorder.current.pause();
      setStatus('paused');
    }
  };

  const resume = () => {
    if (recorder.current?.state === 'paused') {
      recorder.current.resume();
      setStatus('recording');
    }
  };

  const finish = () => {
    if (recorder.current && recorder.current.state !== 'inactive') recorder.current.stop();
  };

  const cancel = () => {
    cancelled.current = true;
    if (recorder.current && recorder.current.state !== 'inactive') recorder.current.stop();
    teardown();
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = '';
    setBlob(null);
    setPreviewUrl('');
    setAttachment(null);
    setTranscript('');
    setSeconds(0);
    setStatus('idle');
    onCancel();
  };

  const ensureUpload = async () => {
    if (attachment) return attachment;
    const uploaded = await uploadVoiceNote(blob, seconds);
    setAttachment(uploaded);
    return uploaded;
  };

  const sendVoice = async () => {
    if (!canPost || !blob) return;
    setBusy('voice');
    setError('');
    try {
      const uploaded = await ensureUpload();
      await onSend({ body: '', attachments: [uploaded] });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy('');
    }
  };

  const transcribe = async () => {
    if (!blob) return;
    setBusy('transcribe');
    setError('');
    setStatus('transcribing');
    try {
      const uploaded = await ensureUpload();
      const data = await comm('transcribe', { threadId, file_uri: uploaded.file_uri });
      setTranscript(data.transcript);
      setStatus('transcript');
    } catch (err) {
      setError(err.message);
      setStatus('review');
    } finally {
      setBusy('');
    }
  };

  const sendTranscript = async () => {
    if (!transcript.trim()) {
      setError('Write the message before sending.');
      return;
    }
    setBusy('transcript');
    setError('');
    try {
      await onSend({ body: transcript.trim(), attachments: keepAudio && attachment ? [attachment] : [] });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy('');
    }
  };

  const live = status === 'recording' || status === 'paused';

  return (
    <div className="rounded-xl border border-line bg-[#FAFBFD] p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[13px] font-semibold text-ink">Voice note</span>
        {live && (
          <span className="inline-flex items-center gap-1 text-[13px] text-mutedink">
            <span className={cn('h-2 w-2 rounded-full', status === 'recording' ? 'animate-pulse bg-[#D64545]' : 'bg-[#8E6018]')} />
            {formatDuration(seconds)}
            {status === 'paused' && ' · paused'}
          </span>
        )}
        {status === 'review' && <span className="text-[13px] text-mutedink">{formatDuration(seconds)} recorded</span>}
      </div>

      {status === 'idle' && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <button type="button" onClick={start} disabled={!canPost} className="btn-primary btn-sm">
            <Mic className="h-4 w-4" /> Start recording
          </button>
          <button type="button" onClick={cancel} className="btn-quiet btn-sm">Close</button>
        </div>
      )}

      {live && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {status === 'recording' ? (
            <button type="button" onClick={pause} className="btn-quiet btn-sm"><Pause className="h-4 w-4" /> Pause</button>
          ) : (
            <button type="button" onClick={resume} className="btn-quiet btn-sm"><Play className="h-4 w-4" /> Resume</button>
          )}
          <button type="button" onClick={finish} className="btn-primary btn-sm"><Square className="h-4 w-4" /> Finish</button>
          <button type="button" onClick={cancel} className="btn-quiet btn-sm"><Trash2 className="h-4 w-4" /> Cancel</button>
        </div>
      )}

      {(status === 'review' || status === 'transcribing') && (
        <>
          <audio controls src={previewUrl} className="mt-2 w-full max-w-[320px]" />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button type="button" onClick={sendVoice} disabled={!canPost || !!busy} className="btn-primary btn-sm">
              <Send className="h-4 w-4" /> {busy === 'voice' ? 'Sending…' : 'Send voice note'}
            </button>
            <button type="button" onClick={transcribe} disabled={!!busy} className="btn-quiet btn-sm">
              {status === 'transcribing' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {status === 'transcribing' ? 'Transcribing…' : 'Transcribe with AI'}
            </button>
            <button type="button" onClick={cancel} disabled={!!busy} className="btn-quiet btn-sm">Discard</button>
          </div>
        </>
      )}

      {status === 'transcript' && (
        <div className="mt-2">
          <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-mutedink">
            AI transcript · edit before sending
          </p>
          <textarea
            value={transcript}
            onChange={(event) => setTranscript(event.target.value)}
            rows={4}
            className="mt-1 w-full resize-y rounded-lg border border-line px-3 py-2 text-[15px] outline-none focus:border-brand"
          />
          <label className="mt-1.5 flex items-center gap-2 text-[13px] text-mutedink">
            <input type="checkbox" checked={keepAudio} onChange={(event) => setKeepAudio(event.target.checked)} />
            Also send the original voice note
          </label>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button type="button" onClick={sendTranscript} disabled={!!busy} className="btn-primary btn-sm">
              <Send className="h-4 w-4" /> {busy === 'transcript' ? 'Sending…' : 'Send transcript'}
            </button>
            <button type="button" onClick={() => setStatus('review')} disabled={!!busy} className="btn-quiet btn-sm">
              Back
            </button>
            <button type="button" onClick={cancel} disabled={!!busy} className="btn-quiet btn-sm">Discard</button>
          </div>
        </div>
      )}

      {error && <p className="mt-2 text-[13px] text-[#A23B3B]">{error}</p>}
    </div>
  );
}