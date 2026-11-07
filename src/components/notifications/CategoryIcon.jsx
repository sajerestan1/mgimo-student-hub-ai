import { Megaphone, CalendarClock, FileCheck2, AlarmClock, CalendarX2 } from 'lucide-react';

const ICONS = {
  announcement: Megaphone,
  schedule: CalendarClock,
  application: FileCheck2,
  reminder: AlarmClock,
  deadline: CalendarX2,
};

export default function CategoryIcon({ category, className = 'h-3.5 w-3.5' }) {
  const Icon = ICONS[category] || Megaphone;
  return <Icon className={className} strokeWidth={1.7} />;
}