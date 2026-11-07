import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, Menu, CalendarRange } from 'lucide-react';
import { useAdminData } from '@/lib/AdminDataContext';
import { roleLabel } from '@/lib/roles';
import { CURRENT_TERM } from '@/lib/adminMetrics';

export default function TopBar({ onOpenMenu }) {
  const { students, requests, faculties, me, role, analytics } = useAdminData();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const studentHits = students
      .filter((student) => student.full_name.toLowerCase().includes(q) || (student.student_id || '').toLowerCase().includes(q))
      .slice(0, 5)
      .map((student) => ({ key: `s-${student.id}`, label: student.full_name, meta: `${student.student_id} · Student`, to: `/students/${student.id}` }));
    const requestHits = requests
      .filter((request) => (request.subject || '').toLowerCase().includes(q))
      .slice(0, 3)
      .map((request) => ({ key: `r-${request.id}`, label: request.subject, meta: `${request.category} · Request`, to: '/requests' }));
    const facultyHits = faculties
      .filter((faculty) => faculty.name.toLowerCase().includes(q) || (faculty.code || '').toLowerCase().includes(q))
      .slice(0, 3)
      .map((faculty) => ({ key: `f-${faculty.id}`, label: faculty.name, meta: 'Faculty', to: '/faculties' }));
    return [...studentHits, ...requestHits, ...facultyHits].slice(0, 8);
  }, [query, students, requests, faculties]);

  const go = (path) => {
    setQuery('');
    navigate(path);
  };

  const initials = (me?.full_name || 'Dean')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('');

  return (
    <header className="sticky top-0 z-30 border-b border-[#E4EAF3] bg-white/95 backdrop-blur">
      <div className="flex items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onOpenMenu}
          className="rounded-lg p-2 text-navy hover:bg-[#F1F5FB] lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="relative hidden flex-1 sm:block sm:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mutedink" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && query.trim().length > 1) go(`/students?q=${encodeURIComponent(query.trim())}`);
            }}
            placeholder="Search students, requests, faculties"
            className="h-9 w-full rounded-full border border-[#E1E8F2] bg-[#F7F9FC] pl-9 pr-3 text-[12.5px] text-ink placeholder:text-mutedink/80 focus:border-navy/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy/10"
          />
          {results.length > 0 && (
            <div className="absolute left-0 right-0 top-11 overflow-hidden rounded-xl border border-[#E1E8F2] bg-white shadow-xl">
              {results.map((result) => (
                <button
                  key={result.key}
                  type="button"
                  onClick={() => go(result.to)}
                  className="flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left transition-colors hover:bg-[#F5F8FC]"
                >
                  <span className="truncate text-[12.5px] font-medium text-ink">{result.label}</span>
                  <span className="shrink-0 text-[10.5px] text-mutedink">{result.meta}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full border border-[#E1E8F2] bg-[#F7F9FC] px-3 py-1.5 text-[11.5px] font-medium text-ink md:inline-flex">
            <CalendarRange className="h-3.5 w-3.5 text-navy" />
            {CURRENT_TERM}
          </span>
          <Link
            to="/requests"
            className="relative rounded-full border border-[#E1E8F2] p-2 text-navy transition-colors hover:bg-[#F1F5FB]"
            aria-label="Pending requests"
          >
            <Bell className="h-4 w-4" />
            {analytics.kpis.pendingRequests > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[9.5px] font-bold text-[#102D50]">
                {analytics.kpis.pendingRequests}
              </span>
            )}
          </Link>
          <div className="flex items-center gap-2 rounded-full border border-[#E1E8F2] bg-white py-1 pl-1 pr-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-navy text-[10.5px] font-semibold text-gold-light">
              {initials}
            </span>
            <span className="hidden text-[11.5px] font-medium leading-tight text-ink sm:block">
              {me?.full_name || 'Dean’s Office'}
              <span className="block text-[9.5px] font-normal uppercase tracking-[0.12em] text-mutedink">{roleLabel(role)}</span>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}