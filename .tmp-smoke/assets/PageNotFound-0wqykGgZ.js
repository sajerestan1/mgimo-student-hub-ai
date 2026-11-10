import { r as base44 } from "./AuthContext-CccTkmRb.js";
import { r as useI18n } from "./I18nProvider-Daxyjg61.js";
import { useEffect } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
//#region src/lib/PageNotFound.jsx
function PageNotFound({}) {
	const location = useLocation();
	const { t } = useI18n();
	const pageName = location.pathname.substring(1);
	useEffect(() => {
		const tag = document.createElement("meta");
		tag.setAttribute("name", "prerender-status-code");
		tag.setAttribute("content", "404");
		document.head.appendChild(tag);
		return () => {
			document.head.removeChild(tag);
		};
	}, []);
	const { data: authData, isFetched } = useQuery({
		queryKey: ["user"],
		queryFn: async () => {
			try {
				return {
					user: await base44.auth.me(),
					isAuthenticated: true
				};
			} catch (error) {
				return {
					user: null,
					isAuthenticated: false
				};
			}
		}
	});
	return /* @__PURE__ */ jsx("div", {
		className: "min-h-screen flex items-center justify-center p-6 bg-slate-50",
		children: /* @__PURE__ */ jsx("div", {
			className: "max-w-md w-full",
			children: /* @__PURE__ */ jsxs("div", {
				className: "text-center space-y-6",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ jsx("h1", {
							className: "text-7xl font-light text-slate-300",
							children: "404"
						}), /* @__PURE__ */ jsx("div", { className: "h-0.5 w-16 bg-slate-200 mx-auto" })]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "space-y-3",
						children: [/* @__PURE__ */ jsx("h2", {
							className: "text-2xl font-medium text-slate-800",
							children: t("notFound.title")
						}), /* @__PURE__ */ jsx("p", {
							className: "text-slate-600 leading-relaxed",
							children: t("notFound.body", { page: pageName })
						})]
					}),
					isFetched && authData.isAuthenticated && authData.user?.role === "admin" && /* @__PURE__ */ jsx("div", {
						className: "mt-8 p-4 bg-slate-100 rounded-lg border border-slate-200",
						children: /* @__PURE__ */ jsxs("div", {
							className: "flex items-start space-x-3",
							children: [/* @__PURE__ */ jsx("div", {
								className: "flex-shrink-0 w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center mt-0.5",
								children: /* @__PURE__ */ jsx("div", { className: "w-2 h-2 rounded-full bg-orange-400" })
							}), /* @__PURE__ */ jsxs("div", {
								className: "text-start space-y-1",
								children: [/* @__PURE__ */ jsx("p", {
									className: "text-sm font-medium text-slate-700",
									children: t("notFound.adminNote")
								}), /* @__PURE__ */ jsx("p", {
									className: "text-sm text-slate-600 leading-relaxed",
									children: t("notFound.adminBody")
								})]
							})]
						})
					}),
					/* @__PURE__ */ jsx("div", {
						className: "pt-6",
						children: /* @__PURE__ */ jsxs("button", {
							onClick: () => window.location.href = "/",
							className: "inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500",
							children: [/* @__PURE__ */ jsx("svg", {
								className: "w-4 h-4 me-2",
								fill: "none",
								stroke: "currentColor",
								viewBox: "0 0 24 24",
								children: /* @__PURE__ */ jsx("path", {
									strokeLinecap: "round",
									strokeLinejoin: "round",
									strokeWidth: 2,
									d: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
								})
							}), t("notFound.goHome")]
						})
					})
				]
			})
		})
	});
}
//#endregion
export { PageNotFound as default };
