const LANG = process.argv[2] || 'en';
const noop = () => {};
globalThis.localStorage = {
  getItem: (key) => (key === 'ai-language' ? LANG : null),
  setItem: noop,
  removeItem: noop,
};
globalThis.window = {
  location: { search: '', href: 'https://app.test/', pathname: '/', origin: 'https://app.test' },
  addEventListener: noop,
  removeEventListener: noop,
  matchMedia: () => ({ matches: false, addEventListener: noop, removeEventListener: noop }),
  requestAnimationFrame: noop,
  cancelAnimationFrame: noop,
  localStorage: globalThis.localStorage,
};
globalThis.document = {
  documentElement: { setAttribute: noop },
  head: { appendChild: noop, removeChild: noop },
  body: { appendChild: noop, removeChild: noop, classList: { add: noop, remove: noop } },
  createElement: () => ({ setAttribute: noop }),
  addEventListener: noop,
  removeEventListener: noop,
};

const { createElement: h } = await import('react');
const { renderToStaticMarkup } = await import('react-dom/server');
const { MemoryRouter } = await import('react-router-dom');
const { QueryClientProvider, QueryClient } = await import('@tanstack/react-query');
const { I18nProvider } = await import('./src/i18n/I18nProvider.jsx');
const { AuthProvider } = await import('./src/lib/AuthContext.jsx');
const Welcome = (await import('./src/pages/Welcome.jsx')).default;
const Login = (await import('./src/pages/Login.jsx')).default;
const PageNotFound = (await import('./src/lib/PageNotFound.jsx')).default;

const client = new QueryClient();
const wrap = (node, path) =>
  h(QueryClientProvider, { client },
    h(AuthProvider, null,
      h(I18nProvider, null,
        h(MemoryRouter, { initialEntries: [path] }, node))));

for (const [path, Page] of [['/', Welcome], ['/login', Login], ['/nope', PageNotFound]]) {
  try {
    const html = renderToStaticMarkup(wrap(h(Page), path));
    const marker = html.includes('dir="rtl"') ? 'rtl' : 'ltr';
    console.log(`  ok ${path} chars=${html.length} ${marker}`);
  } catch (error) {
    console.log(`  FAIL ${path}: ${error.message}`);
  }
}
