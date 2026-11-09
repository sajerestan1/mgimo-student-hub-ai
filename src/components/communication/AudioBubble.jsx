import { useState } from 'react';
import { Loader2, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { comm } from '@/lib/communication/api';

// A voice note plays from a short-lived signed link issued by the backend to a
// verified participant, so the audio is never available at a public URL.
export default function AudioBubble({ message, attachment, mine }) {
  const [state, setState] = useState({ url: '', loading: false, error: '' });

  const open = async () => {
    setState({ url: '', loading: true, error: '' });
    try {
      const data = await comm('downloadAttachment', { messageId: message.id, index: attachment.index });
      setState({ url: data.url, loading: false, error: '' });
    } catch (error) {
      setState({ url: '', loading: false, error: error.message });
    }
  };

  if (state.url) {
    return (
      <audio
        controls
        autoPlay
        src={state.url}
        className="mt-1 w-[min(260px,62vw)]"
        aria-label={attachment.name}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={open}
      className={cn(
        'mt-1 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13px]',
        mine ? 'bg-white/10 text-white' : 'bg-white text-ink',
      )}
    >
      {state.loading ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" /> : <Play className="h-4 w-4 shrink-0" />}
      <span className="truncate">{state.error || attachment.name}</span>
    </button>
  );
}