const noop = () => {};
global.window = {
  location: { search: '', href: 'http://localhost/', pathname: '/' },
  matchMedia: () => ({ matches: false, addEventListener: noop, removeEventListener: noop }),
  addEventListener: noop, removeEventListener: noop,
  getComputedStyle: () => ({ getPropertyValue: () => '' }),
};
global.window.self = global.window;
global.window.top = global.window;
global.document = {
  addEventListener: noop, removeEventListener: noop,
  createElement: () => ({ style: {}, setAttribute: noop, appendChild: noop, classList: { add: noop, remove: noop } }),
  querySelector: () => null, querySelectorAll: () => [],
  head: { appendChild: noop }, body: { appendChild: noop, classList: { add: noop, remove: noop } },
  documentElement: { style: {}, classList: { add: noop, remove: noop } },
};
global.navigator = { userAgent: 'node' };
global.localStorage = { getItem: () => null, setItem: noop, removeItem: noop };
global.sessionStorage = { getItem: () => null, setItem: noop, removeItem: noop };
global.HTMLElement = class {};
global.Element = class {};
global.Node = class {};
require('/app/.check/page.cjs');