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

Object.defineProperty(globalThis, 'navigator', {
  value: { userAgent: 'node', language: 'en-GB', languages: ['en-GB'] },
  configurable: true,
  writable: true,
});

globalThis.window = globalThis;
globalThis.location = { href: 'https://app.test/', pathname: '/', search: '', hash: '', origin: 'https://app.test', assign: stub };
globalThis.history = { pushState: stub, replaceState: stub, state: null, length: 1 };
globalThis.matchMedia = () => ({ matches: false, media: '', addEventListener: stub, removeEventListener: stub, addListener: stub, removeListener: stub });
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

const require = createRequire(import.meta.url);
const { run } = require('./runner.cjs');
const { render } = await import('./out.mjs');

run(render);