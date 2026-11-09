import { cn } from '@/lib/utils';
import EmojiPicker from './EmojiPicker';

// Reactions are stored on the message itself, so they survive reloads and are
// visible to every participant of the conversation.
export default function MessageReactions({ reactions = [], mine, onReact, canReact }) {
  const grouped = [];
  reactions.forEach((row) => {
    const found = grouped.find((entry) => entry.emoji === row.emoji);
    if (found) {
      found.count += 1;
      found.mine = found.mine || row.user_id === mine;
    } else {
      grouped.push({ emoji: row.emoji, count: 1, mine: row.user_id === mine });
    }
  });

  if (!grouped.length && !canReact) return null;

  return (
    <div className="mt-1 flex flex-wrap items-center gap-1">
      {grouped.map((entry) => (
        <button
          key={entry.emoji}
          type="button"
          onClick={() => canReact && onReact(entry.emoji)}
          title={entry.mine ? 'Remove your reaction' : 'Add this reaction'}
          className={cn(
            'inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[12px] leading-none',
            entry.mine ? 'border-brand/40 bg-brand-soft text-brand-deep' : 'border-line bg-white text-mutedink',
            canReact ? 'hover:border-[#D6DCE8]' : 'cursor-default',
          )}
        >
          <span className="text-[14px]">{entry.emoji}</span>
          <span>{entry.count}</span>
        </button>
      ))}
      {canReact && <EmojiPicker compact onPick={onReact} />}
    </div>
  );
}