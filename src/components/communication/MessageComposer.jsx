import { useRef, useState } from 'react';
import { Paperclip, Send, Mic, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import EmojiPicker from './EmojiPicker';
import VoiceRecorder from './VoiceRecorder';
import { ATTACHMENT_LIMIT } from '@/lib/communication/api';

// The one composer used by private, class-group and Dean's Office conversations.
// Desktop keeps a single roomy row; on a phone the text sits above a wrapping
// action row so the microphone and send button never leave the screen and the
// block never scrolls sideways.
export default function MessageComposer({
  value,
  onChange,
  canPost,
  onSend,
  onAttach,
  files,
  onRemoveFile,
  reply,
  onClearReply,
  sending,
  notice,
  threadId,
  onAssistant,
}) {
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [aiNotice, setAiNotice] = useState('');
  const textarea = useRef(null);

  // Insert at the caret, not at the end, so an emoji lands where the user is typing.
  const insertEmoji = (emoji) => {
    const field = textarea.current;
    if (!field) {
      onChange(`${value}${emoji}`);
      return;
    }
    const start = field.selectionStart ?? value.length;
    const end = field.selectionEnd ?? value.length;
    onChange(`${value.slice(0, start)}${emoji}${value.slice(end)}`);
    requestAnimationFrame(() => {
      field.focus();
      const caret = start + emoji.length;
      field.setSelectionRange(caret, caret);
    });
  };

  const sendVoiceNote = async ({ body, attachments }) => {
    setAiNotice('');
    await onSend({ body, attachments, closeVoice: true });
    setVoiceOpen(false);
  };

  return (
    <div className="border-t border-line px-3 py-3 sm:px-4">
      {reply && (
        <div className="mb-2 flex items-start gap-2 rounded-lg bg-[#F4F6FA] px-2 py-1.5">
          <p className="min-w-0 flex-1 truncate text-[13px] text-mutedink">
            Replying to {reply.sender_name}: {reply.body || 'Attachment'}
          </p>
          <button type="button" onClick={onClearReply} className="icon-btn h-6 w-6" aria-label="Cancel reply">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {!!files.length && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {files.map((file) => (
            <span key={file.file_uri} className="inline-flex max-w-full items-center gap-1 rounded-md bg-canvas px-2 py-1 text-[12px] text-mutedink">
              <span className="truncate">{file.name}</span>
              <button type="button" onClick={() => onRemoveFile(file)} aria-label={`Remove ${file.name}`}>
                <X className="h-3 w-3 shrink-0" />
              </button>
            </span>
          ))}
        </div>
      )}

      {voiceOpen ? (
        <VoiceRecorder
          threadId={threadId}
          canPost={canPost}
          onCancel={() => setVoiceOpen(false)}
          onSend={sendVoiceNote}
        />
      ) : (
        <div className="flex flex-col gap-2">
          <textarea
            ref={textarea}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                onSend().catch(() => {});
              }
            }}
            rows={2}
            placeholder={
              canPost ? 'Write a message — emoji and voice notes welcome' : 'You can read this conversation but not post'
            }
            disabled={!canPost}
            className="min-h-[46px] w-full resize-y rounded-lg border border-line px-3 py-2 text-[15px] outline-none focus:border-brand disabled:bg-[#F6F8FB]"
          />

          <div className="flex flex-wrap items-center gap-1.5">
            <EmojiPicker onPick={insertEmoji} disabled={!canPost} />
            <label
              className={cn(
                'btn-quiet cursor-pointer',
                (!canPost || files.length >= ATTACHMENT_LIMIT) && 'pointer-events-none opacity-50',
              )}
              title="Attach a file"
            >
              <Paperclip className="h-4 w-4" />
              <input type="file" multiple hidden onChange={onAttach} />
            </label>
            <button
              type="button"
              onClick={() => {
                setAiNotice('');
                setVoiceOpen(true);
              }}
              disabled={!canPost}
              className="btn-quiet disabled:opacity-50"
              title="Record a voice note"
              aria-label="Record a voice note"
            >
              <Mic className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onAssistant}
              disabled={!canPost}
              className="btn-quiet disabled:opacity-50"
              title="AI writing assistant"
              aria-label="AI writing assistant"
            >
              <Sparkles className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onSend().catch(() => {})}
              disabled={sending || !canPost}
              className="btn-primary ml-auto disabled:opacity-60"
            >
              <Send className="h-4 w-4" /> {sending ? 'Sending…' : 'Send'}
            </button>
          </div>
        </div>
      )}

      {aiNotice && <p className="mt-2 text-[13px] text-mutedink">{aiNotice}</p>}
      {notice && <p className="mt-2 text-[13px] text-[#A23B3B]">{notice}</p>}
    </div>
  );
}