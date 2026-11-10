import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { MODULE_PATHS as P } from '@/lib/moduleRoutes';
import { coursePath } from '@/lib/studentPortal';
import { useI18n } from '@/i18n/I18nProvider';

/**
 * Quick search over the academic context this page has already loaded: the
 * student's own courses, assignments, quizzes and materials. It filters local
 * records only and opens the page that owns the match.
 */
export default function DashboardSearch({ context }) {
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const needle = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!needle) return [];
    const hits = [];
    const add = (label, meta, to) => hits.push({ key: `${to}|${label}`, label, meta, to });

    (context?.courses || []).forEach((course) => {
      if (`${course.code} ${course.title}`.toLowerCase().includes(needle)) {
        add(`${course.code} · ${course.title}`, t('nav.items.courses'), coursePath(course.id));
      }
    });
    (context?.assignments || []).forEach((row) => {
      if (String(row.title || '').toLowerCase().includes(needle)) {
        add(row.title, `${row.courseCode} · ${t('nav.items.assignments')}`, P.student.assignments);
      }
    });
    (context?.quizzes || []).forEach((row) => {
      if (String(row.title || '').toLowerCase().includes(needle)) {
        add(row.title, `${row.courseCode} · ${t('nav.items.quizzes')}`, P.student.quizzes);
      }
    });
    (context?.materials || []).forEach((row) => {
      if (String(row.title || '').toLowerCase().includes(needle)) {
        add(row.title, `${row.courseCode} · ${t('nav.items.library')}`, coursePath(row.courseId));
      }
    });

    return hits.slice(0, 6);
  }, [needle, context, t]);

  const open = focused && Boolean(needle);

  return (
    <div className="relative w-full">
      <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mutedink" />
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => window.setTimeout(() => setFocused(false), 120)}
        placeholder={t('shell.searchStudent')}
        aria-label={t('shell.globalSearch')}
        className="h-10 w-full rounded-xl border border-line bg-white ps-9 pe-3 text-[14px] text-ink placeholder:text-mutedink/80 focus:border-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/15"
      />

      {open && (
        <div className="absolute inset-x-0 top-[calc(100%+6px)] z-40 overflow-hidden rounded-xl border border-line bg-white shadow-[0_18px_40px_-24px_rgba(16,27,51,0.45)]">
          {results.length ? (
            <ul className="max-h-72 divide-y divide-line overflow-y-auto scroll-thin">
              {results.map((result) => (
                <li key={result.key}>
                  <Link
                    to={result.to}
                    onClick={() => setQuery('')}
                    className="row-hover block px-3 py-2"
                  >
                    <p className="truncate text-[length:var(--type-secondary)] font-medium text-ink">{result.label}</p>
                    <p className="mt-0.5 truncate text-[length:var(--type-meta)] text-mutedink">{result.meta}</p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-3 py-3 text-[length:var(--type-meta)] text-mutedink">{t('student.assignments.emptyFilter')}</p>
          )}
        </div>
      )}
    </div>
  );
}