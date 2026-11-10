//#region smoke.mjs
var LANG = process.argv[2] || "en";
var noop = () => {};
globalThis.localStorage = {
	getItem: (key) => key === "ai-language" ? LANG : null,
	setItem: noop,
	removeItem: noop
};
globalThis.window = {
	location: {
		search: "",
		href: "https://app.test/",
		pathname: "/",
		origin: "https://app.test"
	},
	addEventListener: noop,
	removeEventListener: noop,
	matchMedia: () => ({
		matches: false,
		addEventListener: noop,
		removeEventListener: noop
	}),
	requestAnimationFrame: noop,
	cancelAnimationFrame: noop,
	localStorage: globalThis.localStorage
};
globalThis.document = {
	documentElement: { setAttribute: noop },
	head: {
		appendChild: noop,
		removeChild: noop
	},
	body: {
		appendChild: noop,
		removeChild: noop,
		classList: {
			add: noop,
			remove: noop
		}
	},
	createElement: () => ({ setAttribute: noop }),
	addEventListener: noop,
	removeEventListener: noop
};
var { createElement: h } = await import("react");
var { renderToStaticMarkup } = await import("react-dom/server");
var { MemoryRouter } = await import("react-router-dom");
var { QueryClientProvider, QueryClient } = await import("@tanstack/react-query");
var { I18nProvider } = await import("./assets/I18nProvider-D7UVkr0K.js");
var { AuthProvider } = await import("./assets/AuthContext-BhGhnrSo.js");
var Welcome = (await import("./assets/Welcome-JxCqYqKc.js")).default;
var Login = (await import("./assets/Login-CTsH9VNx.js")).default;
var PageNotFound = (await import("./assets/PageNotFound-0wqykGgZ.js")).default;
var client = new QueryClient();
var wrap = (node, path) => h(QueryClientProvider, { client }, h(AuthProvider, null, h(I18nProvider, null, h(MemoryRouter, { initialEntries: [path] }, node))));
for (const [path, Page] of [
	["/", Welcome],
	["/login", Login],
	["/nope", PageNotFound]
]) try {
	const html = renderToStaticMarkup(wrap(h(Page), path));
	const marker = html.includes("dir=\"rtl\"") ? "rtl" : "ltr";
	console.log(`  ok ${path} chars=${html.length} ${marker}`);
} catch (error) {
	console.log(`  FAIL ${path}: ${error.message}`);
}
//#endregion
export {};
