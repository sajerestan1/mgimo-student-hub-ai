import { Link } from 'react-router-dom';
import { CalendarDays, GraduationCap, FileText, BookOpen, Bell, Sparkles } from 'lucide-react';

const QUICK_ACTIONS = [
  { to: '/schedule', label: 'View schedule', icon: CalendarDays },
  { to: '/performance', label: 'View grades', icon: GraduationCap },
  { to: '/applications', label: 'Request certificate', icon: FileText },
  { to: '/applications', label: 'Submit application', icon: BookOpen },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/assistant', label: 'Ask AI assistant', icon: Sparkles },
];

export default function QuickActions() {
  return (
    <section className="card-surface p-5 sm:p-6">
      <h2 className="mb-4 font-heading text-[17px] text-navy-deep">Quick actions</h2>
      <div className="grid grid-cols-2 gap-2.5">
        {QUICK_ACTIONS.map(({ to, label, icon: Icon }) => (
          <Link
            key={label}
            to={to}
            className="group flex flex-col gap-2 rounded-xl border border-[#E9EEF6] bg-white px-3 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-[0_10px_24px_-18px_rgba(16,42,76,0.5)]"
          >
            <Icon
              className="h-[18px] w-[18px] text-navy-mid transition-colors group-hover:text-gold"
              strokeWidth={1.7}
            />
            <span className="text-[11.5px] font-medium leading-tight text-navy-deep">{label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}