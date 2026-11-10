import { n as useAuth } from "./AuthContext-CccTkmRb.js";
import { r as useI18n } from "./I18nProvider-Daxyjg61.js";
import { n as cn, t as UNIVERSITY } from "./demoUniversity-D66gyDl8.js";
import * as React from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import { Check, ChevronRight, Circle, Globe, GraduationCap, Landmark, Presentation } from "lucide-react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
//#region src/components/welcome/BrandPanel.jsx
function BrandPanel() {
	return /* @__PURE__ */ jsxs("section", {
		className: "rounded-[24px] bg-white px-6 py-10 text-center sm:px-10 sm:py-12",
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "mx-auto flex h-16 w-16 items-center justify-center rounded-[18px] bg-welcome-red",
				children: /* @__PURE__ */ jsx(GraduationCap, {
					className: "h-8 w-8 text-white",
					strokeWidth: 1.8,
					"aria-hidden": "true"
				})
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mt-5 text-[12px] font-semibold uppercase tracking-[0.24em] text-welcome-slate",
				children: UNIVERSITY.name
			}),
			/* @__PURE__ */ jsx("h1", {
				className: "mt-2 text-[26px] font-bold leading-tight tracking-[-0.02em] text-welcome-navy sm:text-[34px]",
				children: UNIVERSITY.platform
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mt-2 text-[14px] text-welcome-slate sm:text-[15px]",
				children: UNIVERSITY.tagline
			})
		]
	});
}
//#endregion
//#region src/components/welcome/RoleCard.jsx
var TONES = {
	blue: "bg-welcome-blue hover:bg-welcome-blueDeep",
	red: "bg-welcome-red hover:bg-welcome-redDeep",
	navy: "bg-welcome-navy hover:bg-[#16283C]"
};
/**
* A workspace entry point. It is navigation only: the destination is the
* sign-in flow, which never assigns a role or a permission.
*/
function RoleCard({ label, icon: Icon, tone = "blue", to, className }) {
	return /* @__PURE__ */ jsxs(Link, {
		to,
		className: cn("flex min-h-[150px] flex-col items-center justify-center gap-4 rounded-[20px] px-4 py-7 text-center transition-colors duration-150", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-welcome-navy/50 focus-visible:ring-offset-2 focus-visible:ring-offset-welcome-canvas", "sm:min-h-[190px]", TONES[tone], className),
		children: [/* @__PURE__ */ jsx(Icon, {
			className: "h-9 w-9 text-white sm:h-10 sm:w-10",
			strokeWidth: 1.6,
			"aria-hidden": "true"
		}), /* @__PURE__ */ jsx("span", {
			className: "text-[12px] font-semibold uppercase tracking-[0.14em] text-white sm:text-[13px]",
			children: label
		})]
	});
}
//#endregion
//#region src/components/ui/dropdown-menu.jsx
var DropdownMenu = DropdownMenuPrimitive.Root;
var DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
var DropdownMenuSubTrigger = React.forwardRef(({ className, inset, children, ...props }, ref) => /* @__PURE__ */ jsxs(DropdownMenuPrimitive.SubTrigger, {
	ref,
	className: cn("flex cursor-default gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", inset && "pl-8", className),
	...props,
	children: [children, /* @__PURE__ */ jsx(ChevronRight, { className: "ml-auto" })]
}));
DropdownMenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName;
var DropdownMenuSubContent = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(DropdownMenuPrimitive.SubContent, {
	ref,
	className: cn("z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", className),
	...props
}));
DropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName;
var DropdownMenuContent = React.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsx(DropdownMenuPrimitive.Portal, { children: /* @__PURE__ */ jsx(DropdownMenuPrimitive.Content, {
	ref,
	sideOffset,
	className: cn("z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md", "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", className),
	...props
}) }));
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;
var DropdownMenuItem = React.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ jsx(DropdownMenuPrimitive.Item, {
	ref,
	className: cn("relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0", inset && "pl-8", className),
	...props
}));
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;
var DropdownMenuCheckboxItem = React.forwardRef(({ className, children, checked, ...props }, ref) => /* @__PURE__ */ jsxs(DropdownMenuPrimitive.CheckboxItem, {
	ref,
	className: cn("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className),
	checked,
	...props,
	children: [/* @__PURE__ */ jsx("span", {
		className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center",
		children: /* @__PURE__ */ jsx(DropdownMenuPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }) })
	}), children]
}));
DropdownMenuCheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName;
var DropdownMenuRadioItem = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(DropdownMenuPrimitive.RadioItem, {
	ref,
	className: cn("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className),
	...props,
	children: [/* @__PURE__ */ jsx("span", {
		className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center",
		children: /* @__PURE__ */ jsx(DropdownMenuPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsx(Circle, { className: "h-2 w-2 fill-current" }) })
	}), children]
}));
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;
var DropdownMenuLabel = React.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ jsx(DropdownMenuPrimitive.Label, {
	ref,
	className: cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className),
	...props
}));
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;
var DropdownMenuSeparator = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(DropdownMenuPrimitive.Separator, {
	ref,
	className: cn("-mx-1 my-1 h-px bg-muted", className),
	...props
}));
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;
var DropdownMenuShortcut = ({ className, ...props }) => {
	return /* @__PURE__ */ jsx("span", {
		className: cn("ml-auto text-xs tracking-widest opacity-60", className),
		...props
	});
};
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";
//#endregion
//#region src/i18n/LanguageMenu.jsx
/**
* The one compact language control in the application navigation. It shows the
* current language and switches it in place: the session, workspace and page
* all stay exactly where they are.
*/
function LanguageMenu() {
	const { language, languages, setLanguage, t } = useI18n();
	const current = languages.find((item) => item.code === language) || languages[0];
	return /* @__PURE__ */ jsxs(DropdownMenu, { children: [/* @__PURE__ */ jsx(DropdownMenuTrigger, {
		asChild: true,
		children: /* @__PURE__ */ jsxs("button", {
			type: "button",
			className: "flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[14px] font-medium text-ink/70 transition-colors hover:bg-canvas hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25",
			"aria-label": `${t("common.language")}: ${current.nativeName}`,
			children: [/* @__PURE__ */ jsx(Globe, {
				className: "h-[17px] w-[17px]",
				"aria-hidden": "true"
			}), /* @__PURE__ */ jsx("span", {
				className: "hidden max-w-[92px] truncate sm:inline",
				children: current.nativeName
			})]
		})
	}), /* @__PURE__ */ jsxs(DropdownMenuContent, {
		align: "end",
		className: "w-56",
		children: [
			/* @__PURE__ */ jsx(DropdownMenuLabel, {
				className: "pb-1",
				children: t("common.language")
			}),
			/* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
			languages.map((item) => /* @__PURE__ */ jsxs(DropdownMenuItem, {
				onSelect: () => setLanguage(item.code),
				className: "justify-between gap-2",
				children: [/* @__PURE__ */ jsx("span", {
					className: "truncate",
					children: item.nativeName
				}), /* @__PURE__ */ jsx(Check, {
					className: cn("h-4 w-4 shrink-0", item.code === language ? "text-brand" : "opacity-0"),
					"aria-hidden": "true"
				})]
			}, item.code))
		]
	})] });
}
//#endregion
//#region src/pages/Welcome.jsx
var WORKSPACES = [
	{
		key: "student",
		label: "welcome.student",
		icon: GraduationCap,
		tone: "blue"
	},
	{
		key: "professor",
		label: "welcome.professor",
		icon: Presentation,
		tone: "red"
	},
	{
		key: "administration",
		label: "welcome.administration",
		icon: Landmark,
		tone: "navy"
	}
];
function Welcome() {
	const { user } = useAuth();
	const { t } = useI18n();
	const destination = (key) => user ? `/workspace/${key}` : `/login?workspace=${key}`;
	return /* @__PURE__ */ jsx("main", {
		className: "flex min-h-dvh flex-col items-center bg-welcome-canvas px-4 py-10 sm:px-6 sm:py-16",
		children: /* @__PURE__ */ jsxs("div", {
			className: "w-full max-w-[760px]",
			children: [
				/* @__PURE__ */ jsx("div", {
					className: "mb-4 flex justify-end",
					children: /* @__PURE__ */ jsx("div", {
						className: "rounded-lg border border-[#E3E8EF] bg-white px-1",
						children: /* @__PURE__ */ jsx(LanguageMenu, {})
					})
				}),
				/* @__PURE__ */ jsx(BrandPanel, {}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-10 text-center sm:mt-12",
					children: [/* @__PURE__ */ jsx("h2", {
						className: "text-[28px] font-bold leading-tight tracking-[-0.02em] text-welcome-navy sm:text-[34px]",
						children: t("welcome.title")
					}), /* @__PURE__ */ jsx("p", {
						className: "mt-2 text-[15px] text-welcome-slate",
						children: t("welcome.selectWorkspace")
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-7 grid grid-cols-2 gap-4 sm:mt-9 sm:gap-5",
					children: [
						/* @__PURE__ */ jsx(RoleCard, {
							label: t(WORKSPACES[0].label),
							icon: WORKSPACES[0].icon,
							tone: WORKSPACES[0].tone,
							to: destination(WORKSPACES[0].key)
						}),
						/* @__PURE__ */ jsx(RoleCard, {
							label: t(WORKSPACES[1].label),
							icon: WORKSPACES[1].icon,
							tone: WORKSPACES[1].tone,
							to: destination(WORKSPACES[1].key)
						}),
						/* @__PURE__ */ jsx(RoleCard, {
							label: t(WORKSPACES[2].label),
							icon: WORKSPACES[2].icon,
							tone: WORKSPACES[2].tone,
							to: destination(WORKSPACES[2].key),
							className: "col-span-2"
						})
					]
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-10 text-center text-[13px] text-welcome-slate",
					children: t("welcome.secureAccess")
				})
			]
		})
	});
}
//#endregion
export { Welcome as default };
