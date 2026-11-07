import { useEffect, useState } from 'react';
import { Lock } from 'lucide-react';
import Surface from '@/components/shell/Surface';

const DIMENSIONS = [
  { key: 'academic', label: 'Academic stress', low: 'Calm', high: 'Overloaded' },
  { key: 'social', label: 'Social connection', low: 'Isolated', high: 'Supported' },
  { key: 'mental', label: 'Mental wellbeing', low: 'Low', high: 'Good' },
  { key: 'financial', label: 'Financial confidence', low: 'Worried', high: 'Confident' },
  { key: 'overall', label: 'Overall this week', low: 'Struggling', high: 'Thriving' },
];

const STORAGE_KEY = 'ai_student_wellbeing';
const EMPTY = { academic: null, social: null, mental: null, financial: null, overall: null };

const read = () => {
  try {
    return { ...EMPTY, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') };
  } catch {
    return EMPTY;
  }
};

export default function WellbeingCard() {
  const [answers, setAnswers] = useState(EMPTY);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setAnswers(read());
  }, []);

  const choose = (key, value) => {
    const next = { ...answers, [key]: value };
    setAnswers(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setSaved(true);
    } catch {
      setSaved(false);
    }
  };

  return (
    <Surface
      title="How are you feeling today?"
      subtitle="A private check-in — not an assessment of your academic performance"
      bodyClassName="px-5 pb-5 pt-1"
    >
      <ul className="space-y-2.5">
        {DIMENSIONS.map((dimension) => (
          <li key={dimension.key} className="flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[12px] font-medium text-ink">{dimension.label}</p>
              <p className="text-[10px] text-mutedink">
                {dimension.low} → {dimension.high}
              </p>
            </div>
            <div className="flex items-center gap-1" role="group" aria-label={dimension.label}>
              {[1, 2, 3, 4, 5].map((value) => {
                const selected = answers[dimension.key] === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => choose(dimension.key, value)}
                    aria-pressed={selected}
                    className={`h-7 w-7 rounded-md text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-royal/30 ${
                      selected
                        ? 'bg-royal text-white'
                        : 'bg-canvas text-mutedink hover:bg-[#EBEFF7] hover:text-ink'
                    }`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-start gap-2 rounded-lg bg-canvas px-3 py-2.5">
        <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-mutedink" />
        <p className="text-[10.5px] leading-relaxed text-mutedink">
          {saved ? 'Saved on this device only. ' : 'Stored on this device only. '}
          Wellbeing answers are never shown to lecturers and never feed into grades, attendance or academic risk
          scoring. Support services are available through the student office if you would like to talk to someone.
        </p>
      </div>
    </Surface>
  );
}