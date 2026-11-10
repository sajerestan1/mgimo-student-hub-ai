// Route-resolution matrix: renders the real App (real router, real routes, real
// WorkspaceGuard) at each requested path, follows redirects, reports rendering.
const STUDENT = { user: { id: 'u-student', email: 'student@digitaldean.edu', full_name: 'Sajere Stanley', role: 'student' } };
const PROFESSOR = { user: { id: 'u-prof', email: 'professor@digitaldean.edu', full_name: 'Ivan Petrova', role: 'professor' } };
const ADMIN = { user: { id: 'u-admin', email: 'admin@digitaldean.edu', full_name: 'Dean Sokolov', role: 'admin' } };
const SIGNED_OUT = { user: null };

const DENIED = 'Access Denied';
const NOT_FOUND = 'Page Not Found';
const SHELL = 'Academic Intelligence by Digital Dean';
const LOGIN = 'Welcome back';

const STUDENT_PAGE = 'Student Workspace';
const PROFESSOR_PAGE = 'Loading your teaching workspace';
const DEAN_PAGE = 'University overview';

const cases = [
  { name: 'Student -> /workspace/student', path: '/workspace/student', session: STUDENT, allow: STUDENT_PAGE, home: '/student/dashboard' },
  { name: 'Student -> /workspace/professor', path: '/workspace/professor', session: STUDENT, denied: true },
  { name: 'Student -> /workspace/administration', path: '/workspace/administration', session: STUDENT, denied: true },
  { name: 'Professor -> /workspace/professor', path: '/workspace/professor', session: PROFESSOR, allow: PROFESSOR_PAGE, home: '/professor/dashboard' },
  { name: 'Professor -> /workspace/student', path: '/workspace/student', session: PROFESSOR, denied: true },
  { name: 'Professor -> /workspace/administration', path: '/workspace/administration', session: PROFESSOR, denied: true },
  { name: 'Admin -> /workspace/administration', path: '/workspace/administration', session: ADMIN, allow: DEAN_PAGE, home: '/dean/dashboard' },
  { name: 'Admin -> /workspace/student', path: '/workspace/student', session: ADMIN, allow: 'Inspecting the student workspace', home: '/student/dashboard' },
  { name: 'Admin -> /workspace/professor', path: '/workspace/professor', session: ADMIN, denied: true },
  { name: 'Student -> /workspace/Professor (case)', path: '/workspace/Professor', session: STUDENT, denied: true },
  { name: 'Student -> /workspace/trailing-slash', path: '/workspace/professor/', session: PROFESSOR, allow: PROFESSOR_PAGE, home: '/professor/dashboard' },
  { name: 'Student -> /workspace/nonsense', path: '/workspace/nonsense', session: STUDENT, notFound: true },
  { name: 'Signed out -> /workspace/professor', path: '/workspace/professor', session: SIGNED_OUT, login: true },
  { name: 'Signed out -> /workspace/administration', path: '/workspace/administration', session: SIGNED_OUT, login: true },
  { name: 'Student direct /student/dashboard', path: '/student/dashboard', session: STUDENT, allow: STUDENT_PAGE },
  { name: 'Professor direct /professor/dashboard', path: '/professor/dashboard', session: PROFESSOR, allow: PROFESSOR_PAGE },
  { name: 'Admin direct /dean/dashboard', path: '/dean/dashboard', session: ADMIN, allow: DEAN_PAGE },
  { name: 'Admin direct /student/dashboard', path: '/student/dashboard', session: ADMIN, allow: 'Inspecting the student workspace' },
  { name: 'Student direct /professor/dashboard', path: '/professor/dashboard', session: STUDENT, denied: true },
  { name: 'Student direct /dean/dashboard', path: '/dean/dashboard', session: STUDENT, denied: true },
  { name: 'Legacy /student (student)', path: '/student', session: STUDENT, allow: STUDENT_PAGE, home: '/student/dashboard' },
  { name: 'Legacy /professor (professor)', path: '/professor', session: PROFESSOR, allow: PROFESSOR_PAGE, home: '/professor/dashboard' },
  { name: 'Legacy /dean (admin)', path: '/dean', session: ADMIN, allow: DEAN_PAGE, home: '/dean/dashboard' },
  { name: 'Legacy /admin (admin)', path: '/admin', session: ADMIN, allow: DEAN_PAGE, home: '/dean/dashboard' },
  { name: 'Legacy /administration (admin)', path: '/administration', session: ADMIN, allow: DEAN_PAGE, home: '/dean/dashboard' },
  { name: 'Legacy /administration (student)', path: '/administration', session: STUDENT, denied: true },
  { name: 'Admin /admin/users', path: '/admin/users', session: ADMIN, allow: 'User management' },
  { name: 'Student /admin/users', path: '/admin/users', session: STUDENT, denied: true },
  { name: 'Unknown route /zebra', path: '/zebra', session: STUDENT, notFound: true },
];

function run(render) {
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
      checks.push(['correct page', html.includes(c.allow)]);
      checks.push(['not denied', !denied]);
      checks.push(['not a 404', !notFound]);
    }
    if (c.home) checks.push(['resolved to workspace home', hops.includes(c.home)]);

    const ok = !step.error && checks.every(([, v]) => v);
    if (ok) pass += 1;
    else failures.push({ name: c.name, error: step.error, failed: checks.filter(([, v]) => !v).map(([k]) => k) });

    console.log(
      `${ok ? 'PASS' : 'FAIL'}  ${c.name.padEnd(40)} ${hops.join(' -> ')}  [denied=${denied} 404=${notFound} shell=${shell} login=${login}]`
    );
  }

  console.log(`\n${pass}/${cases.length} routing cases passed`);
  if (failures.length) {
    console.log('\nFAILURE DETAIL');
    for (const f of failures) console.log(`- ${f.name}: ${f.error ? `error ${f.error}` : f.failed.join(', ')}`);
    process.exitCode = 1;
  }
}

module.exports = { run };