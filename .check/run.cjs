// Route-resolution harness: renders the real App (real router, real routes,
// real WorkspaceGuard) in memory for each requested path, follows any
// redirect, and reports what actually rendered.
const fs = require('fs');

const stub = () => {};
const el = () => ({
  setAttribute: stub, getAttribute: () => null, appendChild: stub, removeChild: stub,
  addEventListener: stub, removeEventListener: stub, style: {}, dataset: {},
  classList: { add: stub, remove: stub, contains: () => false }, focus: stub, click: stub,
  querySelector: () => null, querySelectorAll: () => [], innerHTML: '', textContent: '',
});

global.document = {
  createElement: el, createElementNS: el, createTextNode: el,
  head: el(), body: el(), documentElement: el(),
  getElementById: () => null, querySelector: () => null, querySelectorAll: () => [],
  addEventListener: stub, removeEventListener: stub, title: '', cookie: '',
};

global.navigator = { userAgent: 'node', language: 'en-GB', languages: ['en-GB'] };

global.window = global;
global.location = { href: 'https://app.test/', pathname: '/', search: '', hash: '', origin: 'https://app.test' };
global.history = { pushState: stub, replaceState: stub, state: null, length: 1 };
global.matchMedia = () => ({ matches: false, media: '', addEventListener: stub, removeEventListener: stub, addListener: stub, removeListener: stub });
global.requestAnimationFrame = (cb) => setTimeout(cb, 0);
global.cancelAnimationFrame = stub;
global.scrollTo = stub;
global.localStorage = { getItem: () => null, setItem: stub, removeItem: stub, clear: stub, key: () => null, length: 0 };
global.sessionStorage = { ...global.localStorage };
global.fetch = async () => ({ ok: true, json: async () => ({}), text: async () => '' });
global.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
global.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
global.Image = el;
global.SVGElement = el;

const { render } = require('./out.cjs');

const STUDENT = { user: { id: 'u-student', email: 'student@digitaldean.edu', full_name: 'Sajere Stanley', role: 'student' } };
const PROFESSOR = { user: { id: 'u-prof', email: 'professor@digitaldean.edu', full_name: 'Ivan Petrova', role: 'professor' } };
const ADMIN = { user: { id: 'u-admin', email: 'admin@digitaldean.edu', full_name: 'Dean Sokolov', role: 'admin' } };
const SIGNED_OUT = { user: null };

const DENIED = 'Access Denied';
const NOT_FOUND = 'Page Not Found';
const SHELL = 'Academic Intelligence by Digital Dean';
const LOGIN = 'Welcome back';

const cases = [
  // workspace entry routes
  { name: 'Student -> /workspace/student', path: '/workspace/student', session: STUDENT, allow: true, marker: 'Student workspace', home: '/student/dashboard' },
  { name: 'Student -> /workspace/professor', path: '/workspace/professor', session: STUDENT, denied: true },
  { name: 'Student -> /workspace/administration', path: '/workspace/administration', session: STUDENT, denied: true },
  { name: 'Professor -> /workspace/professor', path: '/workspace/professor', session: PROFESSOR, allow: true, marker: 'Teaching notes', home: '/professor/dashboard' },
  { name: 'Professor -> /workspace/student', path: '/workspace/student', session: PROFESSOR, denied: true },
  { name: 'Professor -> /workspace/administration', path: '/workspace/administration', session: PROFESSOR, denied: true },
  { name: 'Admin -> /workspace/administration', path: '/workspace/administration', session: ADMIN, allow: true, marker: 'University overview', home: '/dean/dashboard' },
  { name: 'Admin -> /workspace/student', path: '/workspace/student', session: ADMIN, allow: true, marker: 'Student workspace', home: '/student/dashboard' },
  { name: 'Admin -> /workspace/professor', path: '/workspace/professor', session: ADMIN, denied: true },
  { name: 'Student -> /workspace/Professor (case)', path: '/workspace/Professor', session: STUDENT, denied: true },
  { name: 'Student -> /workspace/nonsense (404)', path: '/workspace/nonsense', session: STUDENT, notFound: true },
  { name: 'Signed out -> /workspace/professor', path: '/workspace/professor', session: SIGNED_OUT, login: true },
  // direct + refresh of the workspace home, and legacy aliases
  { name: 'Student direct /student/dashboard', path: '/student/dashboard', session: STUDENT, allow: true, marker: 'Student workspace' },
  { name: 'Professor direct /professor/dashboard', path: '/professor/dashboard', session: PROFESSOR, allow: true, marker: 'Teaching notes' },
  { name: 'Admin direct /dean/dashboard', path: '/dean/dashboard', session: ADMIN, allow: true, marker: 'University overview' },
  { name: 'Student direct /professor/dashboard', path: '/professor/dashboard', session: STUDENT, denied: true },
  { name: 'Student direct /dean/dashboard', path: '/dean/dashboard', session: STUDENT, denied: true },
  { name: 'Legacy /student (student)', path: '/student', session: STUDENT, allow: true, marker: 'Student workspace', home: '/student/dashboard' },
  { name: 'Legacy /professor (professor)', path: '/professor', session: PROFESSOR, allow: true, marker: 'Teaching notes', home: '/professor/dashboard' },
  { name: 'Legacy /dean (admin)', path: '/dean', session: ADMIN, allow: true, marker: 'University overview', home: '/dean/dashboard' },
  { name: 'Legacy /admin (admin)', path: '/admin', session: ADMIN, allow: true, marker: 'University overview', home: '/dean/dashboard' },
  { name: 'Legacy /administration (admin)', path: '/administration', session: ADMIN, allow: true, marker: 'University overview', home: '/dean/dashboard' },
  { name: 'Admin /admin/users', path: '/admin/users', session: ADMIN, allow: true, marker: 'Users' },
  { name: 'Student /admin/users', path: '/admin/users', session: STUDENT, denied: true },
  { name: 'Unknown route /zebra', path: '/zebra', session: STUDENT, notFound: true },
];

let pass = 0;
const failures = [];

for (const c of cases) {
  let step = render(c.path, c.session);
  const hops = [c.path];
  let guard = 0;
  while (step.redirects.length && guard < 3) {
    hops.push(step.redirects[0]);
    step = render(step.redirects[0], c.session);
    guard += 1;
  }

  const html = step.html || '';
  const denied = html.includes(DENIED);
  const notFound = html.includes(NOT_FOUND);
  const shell = html.includes(SHELL);
  const login = html.includes(LOGIN);

  const checks = [];
  if (c.denied) {
    checks.push(['denied page', denied]);
    checks.push(['no workspace shell', !shell]);
    checks.push(['not a 404', !notFound]);
  }
  if (c.notFound) {
    checks.push(['404 page', notFound]);
    checks.push(['not access denied', !denied]);
  }
  if (c.login) {
    checks.push(['login page', login]);
    checks.push(['not a 404', !notFound]);
  }
  if (c.allow) {
    checks.push(['workspace shell', shell]);
    checks.push(['correct page content', html.includes(c.marker)]);
    checks.push(['not denied', !denied]);
    checks.push(['not a 404', !notFound]);
  }
  if (c.home) checks.push(['resolved to home', hops.includes(c.home)]);

  const ok = !step.error && checks.every(([, v]) => v);
  if (ok) pass += 1;
  else failures.push({ name: c.name, error: step.error, failed: checks.filter(([, v]) => !v).map(([k]) => k), html: html.slice(0, 400) });

  console.log(
    `${ok ? 'PASS' : 'FAIL'}  ${c.name.padEnd(42)} -> ${hops.join(' -> ')}` +
      `  [denied=${denied} 404=${notFound} shell=${shell} login=${login}]`
  );
}

console.log(`\n${pass}/${cases.length} routing cases passed`);
if (failures.length) {
  console.log('\nFAILURE DETAIL');
  for (const f of failures) {
    console.log(`- ${f.name}: ${f.error ? `error: ${f.error}` : `failed: ${f.failed.join(', ')}`}`);
    console.log(`  ${f.html.replace(/\s+/g, ' ').slice(0, 260)}`);
  }
  process.exitCode = 1;
}