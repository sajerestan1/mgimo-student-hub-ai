import { createRequire } from 'node:module';

const stub = () => {};
const el = () => ({
  setAttribute: stub, getAttribute: () => null, appendChild: stub, removeChild: stub,
  addEventListener: stub, removeEventListener: stub, style: {}, dataset: {},
  classList: { add: stub, remove: stub, contains: () => false }, focus: stub, click: stub,
  querySelector: () => null, querySelectorAll: () => [], innerHTML: '', textContent: '',
});
globalThis.document = {
  createElement: el, createElementNS: el, createTextNode: el,
  head: el(), body: el(), documentElement: el(),
  getElementById: () => null, querySelector: () => null, querySelectorAll: () => [],
  addEventListener: stub, removeEventListener: stub, title: '', cookie: '',
};
Object.defineProperty(globalThis, 'navigator', { value: { userAgent: 'node' }, configurable: true, writable: true });
globalThis.window = globalThis;
globalThis.location = { href: 'https://app.test/', pathname: '/', search: '', hash: '', origin: 'https://app.test', assign: stub };
globalThis.history = { pushState: stub, replaceState: stub, state: null, length: 1 };
globalThis.matchMedia = () => ({ matches: false, addEventListener: stub, removeEventListener: stub, addListener: stub, removeListener: stub });
globalThis.requestAnimationFrame = (cb) => setTimeout(cb, 0);
globalThis.cancelAnimationFrame = stub;
globalThis.scrollTo = stub;
globalThis.localStorage = { getItem: () => null, setItem: stub, removeItem: stub, clear: stub, key: () => null, length: 0 };
globalThis.sessionStorage = { ...globalThis.localStorage };
globalThis.fetch = async () => ({ ok: true, json: async () => ({}), text: async () => '' });
globalThis.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
globalThis.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
globalThis.Image = el;
globalThis.SVGElement = el;

const { render } = await import('./out.mjs');

const PROF = { user: { id: 'u-prof', email: 'professor@digitaldean.edu', full_name: 'Ivan Petrova', role: 'professor' } };
const ADMIN = { user: { id: 'u-admin', email: 'admin@digitaldean.edu', full_name: 'Dean Sokolov', role: 'admin' } };

const probes = [
  ['/professor/dashboard', PROF],
  ['/student/dashboard', ADMIN],
  ['/admin/users', ADMIN],
];

for (const [path, session] of probes) {
  const { html, error, redirects } = render(path, session);
  const text = html
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x27;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
  console.log(`\n===== ${path} (redirects: ${redirects.join(',') || 'none'}) ${error ? `ERROR ${error}` : ''}`);
  console.log(text.slice(0, 700));
}