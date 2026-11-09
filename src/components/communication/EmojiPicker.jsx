import { useEffect, useRef, useState } from 'react';
import { Smile, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

// A curated Unicode set rather than a dependency: enough range for academic
// correspondence, small enough to stay fast on a phone. Emoji are inserted as
// plain text, so they render natively in the saved message.
const GROUPS = [
  {
    label: 'Faces',
    emojis: ['😀', '😃', '😄', '😁', '😊', '🙂', '😉', '😍', '🤩', '😎', '🤔', '🙃', '😅', '😂', '🥳', '😴', '😢', '🙏'],
  },
  {
    label: 'Gestures',
    emojis: ['👍', '👎', '👏', '🙌', '💪', '👌', '✌️', '🤝', '👋', '🤞', '🫶', '🤙'],
  },
  {
    label: 'Symbols',
    emojis: ['❤️', '🧡', '💙', '💚', '💜', '✨', '⭐', '✅', '❗', '❓', '🔥', '🎉', '📌', '⏰', '💡', '🍀'],
  },
  {
    label: 'Study',
    emojis: ['🎓', '📚', '📝', '✏️', '📊', '📈', '🗓️', '💻', '🧪', '🏛️', '🌍', '☕'],
  },
];

export default function EmojiPicker({ onPick, disabled, compact, align = 'left' }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => {
      if (wrap.current && !wrap.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('touchstart', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('touchstart', close);
    };
  }, [open]);

  return (
    <div ref={wrap} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        disabled={disabled}
        aria-label="Add emoji"
        aria-expanded={open}
        className={cn(
          'inline-flex items-center justify-center text-ink/60 transition-colors hover:bg-canvas hover:text-ink disabled:opacity-40',
          compact ? 'h-6 w-6 rounded-md' : 'h-9 w-9 rounded-lg',
        )}
      >
        {compact ? <Plus className="h-3.5 w-3.5" /> : <Smile className="h-4 w-4" />}
      </button>

      {open && (
        <div
          className={cn(
            'absolute bottom-full z-30 mb-2 max-h-[260px] w-[min(300px,calc(100vw-2rem))] overflow-y-auto rounded-xl border border-line bg-white p-2 shadow-lg',
            align === 'right' ? 'right-0' : 'left-0',
          )}
        >
          {GROUPS.map((group) => (
            <div key={group.label} className="mb-1 last:mb-0">
              <p className="px-1 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-mutedink">{group.label}</p>
              <div className="grid grid-cols-8 gap-0.5">
                {group.emojis.map((emoji) => (
                  <button
                    key={`${group.label}-${emoji}`}
                    type="button"
                    onClick={() => {
                      onPick(emoji);
                      setOpen(false);
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-[18px] leading-none hover:bg-canvas"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}