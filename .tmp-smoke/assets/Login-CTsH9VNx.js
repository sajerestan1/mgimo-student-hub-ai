import { i as appParams, r as base44 } from "./AuthContext-CccTkmRb.js";
import { r as useI18n } from "./I18nProvider-Daxyjg61.js";
import { n as cn, t as UNIVERSITY } from "./demoUniversity-D66gyDl8.js";
import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { Check, ChevronsUpDown, Copy, Eye, EyeOff, Loader2, Lock, LogIn, Mail, Minus, Search, ShieldCheck, X } from "lucide-react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { Command } from "cmdk";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { OTPInput, OTPInputContext } from "input-otp";
import * as PopoverPrimitive from "@radix-ui/react-popover";
//#region src/lib/authMfa.js
function authPath$1(suffix) {
	if (!/^[a-f0-9]{24}$/i.test(appParams.appId)) throw new Error("Invalid app ID");
	return `/api/apps/${appParams.appId}/auth/${suffix}`;
}
async function post(suffix, body, token) {
	const response = await fetch(authPath$1(suffix), {
		method: "POST",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
			...token ? { Authorization: `Bearer ${token}` } : {}
		},
		body: JSON.stringify(body)
	});
	const result = await response.json();
	if (!response.ok) throw new Error(result.error?.message || result.detail || "Unable to sign in");
	return result;
}
async function loginWithMfa(email, password) {
	const result = await post("login", {
		email,
		password
	});
	if (result.access_token) base44.auth.setToken(result.access_token);
	return result;
}
//#endregion
//#region src/lib/authMfaFlow.js
var PKCE_KEY = () => `app-mfa-pkce:${appParams.appId}`;
var encode = (bytes) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
var MfaError = class extends Error {
	constructor(message, status, retryAfter) {
		super(message);
		this.status = status;
		this.retryAfter = retryAfter;
	}
	get mustSignInAgain() {
		return this.status === 401;
	}
};
function authPath(suffix) {
	if (!/^[a-f0-9]{24}$/i.test(appParams.appId)) throw new Error("Invalid app ID");
	return `/api/apps/${appParams.appId}/auth/${suffix}`;
}
async function request(suffix, { method = "POST", body, token, headers } = {}) {
	const response = await fetch(authPath(suffix), {
		method,
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
			...token ? { Authorization: `Bearer ${token}` } : {},
			...headers
		},
		body: body === void 0 ? void 0 : JSON.stringify(body)
	});
	const result = await response.json().catch(() => ({}));
	if (!response.ok) throw new MfaError(result.error?.message || result.detail || "Something went wrong. Try again.", response.status, Number(response.headers.get("Retry-After")) || null);
	return result;
}
function mfaSession(challenge) {
	let credential = challenge.mfa_session_token;
	const call = async (suffix, body, method) => {
		const result = await request(`mfa/${suffix}`, {
			method,
			body,
			token: credential
		});
		if (result.mfa_management_token) credential = result.mfa_management_token;
		if (result.access_token) base44.auth.setToken(result.access_token);
		return result;
	};
	return {
		verify: (code, method, rememberDevice) => call("verify", {
			code,
			method,
			remember_device: rememberDevice
		}),
		sendSignInCode: () => call("resend"),
		setupAuthenticator: () => call("totp/setup", {}),
		confirmAuthenticator: (code, rememberDevice = false) => call("totp/verify", {
			code,
			remember_device: rememberDevice
		}),
		sendPhoneCode: (phoneNumber) => call("sms/send-code", { phone_number: phoneNumber }),
		confirmPhone: (code, rememberDevice = false) => call("sms/verify", {
			code,
			remember_device: rememberDevice
		}),
		status: () => call("status", void 0, "GET"),
		sendProofCode: () => call("sms/send-code", { phone_number: "" }),
		removeMethod: (method, code, proofMethod) => call("disable", {
			method,
			code,
			verification_method: proofMethod
		}),
		forgetDevices: (code, proofMethod) => call("trusted-devices/clear", {
			code,
			method: proofMethod
		})
	};
}
var isInAppBrowser = () => /LinkedIn|Twitter/i.test(navigator.userAgent);
async function loadSignInOptions() {
	const response = await fetch(`/api/apps/public/login-info/by-id/${appParams.appId}`);
	if (!response.ok) throw new Error("Unable to load sign-in options");
	return response.json();
}
async function signInWithProvider(provider, returnTo, { manage = false } = {}) {
	const info = await loadSignInOptions();
	if (!manage && (info.auth_config?.mfa_policy !== "required" || provider === "sso")) return base44.auth.loginWithProvider(provider, returnTo);
	if (isInAppBrowser()) {
		const url = new URL("/auth/mfa", window.location.origin);
		url.search = new URLSearchParams({
			app_id: appParams.appId,
			oauth_start: provider,
			from_url: returnTo,
			...manage ? { security: "1" } : {}
		});
		window.location.assign(url.href);
		return;
	}
	const verifier = encode(crypto.getRandomValues(/* @__PURE__ */ new Uint8Array(32)));
	const challenge = encode(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier))));
	sessionStorage.setItem(PKCE_KEY(), verifier);
	const workspaceSso = provider === "sso" && info.auth_config?.use_workspace_sso && info.organization_id;
	const path = provider === "sso" ? workspaceSso ? `/api/apps/${info.organization_id}/${appParams.appId}/auth/sso/login` : `/api/apps/${appParams.appId}/auth/sso/login` : `/api/apps/auth${provider === "google" ? "" : `/${provider}`}/login`;
	const url = new URL(path, window.location.origin);
	url.search = new URLSearchParams({
		from_url: new URL(returnTo, window.location.origin).href,
		...workspaceSso ? {} : { app_id: appParams.appId },
		...manage ? { app_mfa_action: "manage" } : {},
		app_mfa_code_challenge: challenge,
		app_mfa_return: "/mfa"
	});
	window.location.assign(url.href);
}
function finishSignIn(accessToken, returnTo) {
	if (new URLSearchParams(window.location.search).get("popup") === "1" && window.opener) {
		window.opener.postMessage({ access_token: accessToken }, window.location.origin);
		window.close();
		return;
	}
	window.location.href = returnTo;
}
//#endregion
//#region src/components/ui/button.jsx
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
			destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
			outline: "border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground",
			secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
			ghost: "hover:bg-accent hover:text-accent-foreground",
			link: "text-primary underline-offset-4 hover:underline"
		},
		size: {
			default: "h-9 px-4 py-2",
			sm: "h-8 rounded-md px-3 text-xs",
			lg: "h-10 rounded-md px-8",
			icon: "h-9 w-9"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ jsx(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
//#endregion
//#region src/components/ui/label.jsx
var labelVariants = cva("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70");
var Label = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(LabelPrimitive.Root, {
	ref,
	className: cn(labelVariants(), className),
	...props
}));
Label.displayName = LabelPrimitive.Root.displayName;
//#endregion
//#region src/components/ui/dialog.jsx
var DialogPortal = DialogPrimitive.Portal;
var DialogOverlay = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(DialogPrimitive.Overlay, {
	ref,
	className: cn("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props
}));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;
var DialogContent = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(DialogPortal, { children: [/* @__PURE__ */ jsx(DialogOverlay, {}), /* @__PURE__ */ jsxs(DialogPrimitive.Content, {
	ref,
	className: cn("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg", className),
	...props,
	children: [children, /* @__PURE__ */ jsxs(DialogPrimitive.Close, {
		className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
		children: [/* @__PURE__ */ jsx(X, { className: "h-4 w-4" }), /* @__PURE__ */ jsx("span", {
			className: "sr-only",
			children: "Close"
		})]
	})]
})] }));
DialogContent.displayName = DialogPrimitive.Content.displayName;
var DialogHeader = ({ className, ...props }) => /* @__PURE__ */ jsx("div", {
	className: cn("flex flex-col space-y-1.5 text-center sm:text-left", className),
	...props
});
DialogHeader.displayName = "DialogHeader";
var DialogFooter = ({ className, ...props }) => /* @__PURE__ */ jsx("div", {
	className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
	...props
});
DialogFooter.displayName = "DialogFooter";
var DialogTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(DialogPrimitive.Title, {
	ref,
	className: cn("text-lg font-semibold leading-none tracking-tight", className),
	...props
}));
DialogTitle.displayName = DialogPrimitive.Title.displayName;
var DialogDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(DialogPrimitive.Description, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
DialogDescription.displayName = DialogPrimitive.Description.displayName;
//#endregion
//#region src/components/ui/command.jsx
var Command$1 = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(Command, {
	ref,
	className: cn("flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground", className),
	...props
}));
Command$1.displayName = Command.displayName;
var CommandInput = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxs("div", {
	className: "flex items-center border-b px-3",
	"cmdk-input-wrapper": "",
	children: [/* @__PURE__ */ jsx(Search, { className: "mr-2 h-4 w-4 shrink-0 opacity-50" }), /* @__PURE__ */ jsx(Command.Input, {
		ref,
		className: cn("flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50", className),
		...props
	})]
}));
CommandInput.displayName = Command.Input.displayName;
var CommandList = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(Command.List, {
	ref,
	className: cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className),
	...props
}));
CommandList.displayName = Command.List.displayName;
var CommandEmpty = React.forwardRef((props, ref) => /* @__PURE__ */ jsx(Command.Empty, {
	ref,
	className: "py-6 text-center text-sm",
	...props
}));
CommandEmpty.displayName = Command.Empty.displayName;
var CommandGroup = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(Command.Group, {
	ref,
	className: cn("overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground", className),
	...props
}));
CommandGroup.displayName = Command.Group.displayName;
var CommandSeparator = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(Command.Separator, {
	ref,
	className: cn("-mx-1 h-px bg-border", className),
	...props
}));
CommandSeparator.displayName = Command.Separator.displayName;
var CommandItem = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(Command.Item, {
	ref,
	className: cn("relative flex cursor-default gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", className),
	...props
}));
CommandItem.displayName = Command.Item.displayName;
var CommandShortcut = ({ className, ...props }) => {
	return /* @__PURE__ */ jsx("span", {
		className: cn("ml-auto text-xs tracking-widest text-muted-foreground", className),
		...props
	});
};
CommandShortcut.displayName = "CommandShortcut";
//#endregion
//#region src/components/ui/input.jsx
var Input = React.forwardRef(({ className, type, ...props }, ref) => {
	return /* @__PURE__ */ jsx("input", {
		type,
		className: cn("flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-base", className),
		ref,
		...props
	});
});
Input.displayName = "Input";
//#endregion
//#region src/components/ui/input-otp.jsx
var InputOTP = React.forwardRef(({ className, containerClassName, ...props }, ref) => /* @__PURE__ */ jsx(OTPInput, {
	ref,
	containerClassName: cn("flex items-center gap-2 has-[:disabled]:opacity-50", containerClassName),
	className: cn("disabled:cursor-not-allowed", className),
	...props
}));
InputOTP.displayName = "InputOTP";
var InputOTPGroup = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx("div", {
	ref,
	className: cn("flex items-center", className),
	...props
}));
InputOTPGroup.displayName = "InputOTPGroup";
var InputOTPSlot = React.forwardRef(({ index, className, ...props }, ref) => {
	const { char, hasFakeCaret, isActive } = React.useContext(OTPInputContext).slots[index];
	return /* @__PURE__ */ jsxs("div", {
		ref,
		className: cn("relative flex h-9 w-9 items-center justify-center border-y border-r border-input text-sm shadow-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md", isActive && "z-10 ring-1 ring-ring", className),
		...props,
		children: [char, hasFakeCaret && /* @__PURE__ */ jsx("div", {
			className: "pointer-events-none absolute inset-0 flex items-center justify-center",
			children: /* @__PURE__ */ jsx("div", { className: "h-4 w-px animate-caret-blink bg-foreground duration-1000" })
		})]
	});
});
InputOTPSlot.displayName = "InputOTPSlot";
var InputOTPSeparator = React.forwardRef(({ ...props }, ref) => /* @__PURE__ */ jsx("div", {
	ref,
	role: "separator",
	...props,
	children: /* @__PURE__ */ jsx(Minus, {})
}));
InputOTPSeparator.displayName = "InputOTPSeparator";
//#endregion
//#region src/components/ui/popover.jsx
var Popover = PopoverPrimitive.Root;
var PopoverTrigger = PopoverPrimitive.Trigger;
var PopoverContent = React.forwardRef(({ className, align = "center", sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsx(PopoverPrimitive.Portal, { children: /* @__PURE__ */ jsx(PopoverPrimitive.Content, {
	ref,
	align,
	sideOffset,
	className: cn("z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", className),
	...props
}) }));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;
//#endregion
//#region src/lib/authReturnTo.js
function safeReturnTo() {
	const raw = new URLSearchParams(window.location.search).get("returnTo");
	if (!raw) return "/";
	try {
		const url = new URL(raw, window.location.origin);
		if (url.origin !== window.location.origin) return "/";
		for (const p of [
			"access_token",
			"clear_access_token",
			"app_id",
			"app_base_url",
			"functions_version",
			"from_url"
		]) url.searchParams.delete(p);
		const path = url.pathname + url.search;
		if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return "/";
		return path;
	} catch {
		return "/";
	}
}
//#endregion
//#region src/components/MfaParts.jsx
var appInfo;
function useAppInfo() {
	const [info, setInfo] = useState(null);
	useEffect(() => {
		appInfo ||= loadSignInOptions().catch(() => ({}));
		appInfo.then((value) => setInfo(value || {}));
	}, []);
	return info;
}
function MfaScreen({ children }) {
	return /* @__PURE__ */ jsx("div", {
		className: "min-h-screen flex items-center justify-center bg-background px-4 py-8",
		children: /* @__PURE__ */ jsx("div", {
			className: "w-full max-w-md bg-card rounded-2xl shadow-sm border border-border p-8",
			children
		})
	});
}
function MfaHeader({ title, description }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col items-center text-center mb-6",
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary mb-4",
				children: /* @__PURE__ */ jsx(ShieldCheck, {
					className: "w-7 h-7 text-primary-foreground",
					"aria-hidden": "true"
				})
			}),
			/* @__PURE__ */ jsx("h1", {
				className: "text-2xl font-bold tracking-tight text-foreground min-h-[2rem]",
				children: title
			}),
			description && /* @__PURE__ */ jsx("p", {
				className: "text-muted-foreground mt-2",
				children: description
			})
		]
	});
}
function CodeField({ id, label = "Enter the 6-digit code", value, onChange, onComplete, hasError = false }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-2",
		children: [/* @__PURE__ */ jsx(Label, {
			htmlFor: id,
			className: "block text-center font-normal text-muted-foreground",
			children: label
		}), /* @__PURE__ */ jsx(InputOTP, {
			id,
			maxLength: 6,
			value,
			autoFocus: true,
			autoComplete: "one-time-code",
			containerClassName: "justify-center",
			onChange: (next) => {
				onChange(next);
				if (next.length === 6) onComplete?.(next);
			},
			onKeyDown: (e) => {
				if (e.key === "Enter" && onComplete) {
					e.preventDefault();
					onComplete(value);
				}
			},
			children: /* @__PURE__ */ jsx(InputOTPGroup, { children: [
				0,
				1,
				2,
				3,
				4,
				5
			].map((index) => /* @__PURE__ */ jsx(InputOTPSlot, {
				index,
				className: hasError ? "border-destructive" : void 0
			}, index)) })
		})]
	});
}
function ResendLine({ cooldown, disabled, onResend, error }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-1 text-center",
		children: [/* @__PURE__ */ jsxs("p", {
			className: "text-sm text-muted-foreground",
			children: [
				"Didn't receive a code?",
				" ",
				cooldown > 0 ? /* @__PURE__ */ jsxs("span", { children: [
					"Resend in ",
					cooldown,
					"s"
				] }) : /* @__PURE__ */ jsx("button", {
					type: "button",
					disabled,
					onClick: onResend,
					className: "font-semibold text-foreground hover:underline disabled:opacity-50",
					children: "Resend"
				})
			]
		}), error && /* @__PURE__ */ jsx("p", {
			className: "text-sm text-destructive",
			children: error
		})]
	});
}
var INVALID_PHONE = "Invalid phone number. Please check the number and try again.";
var COUNTRY_DIAL_CODES = new Map("af93 ax358 al355 dz213 as1684 ad376 ao244 ai1264 aq672 ag1268 ar54 am374 aw297 au61 at43 az994 bs1242 bh973 bd880 bb1246 by375 be32 bz501 bj229 bm1441 bt975 bo591 ba387 bw267 bv47 br55 io246 vg1284 bn673 bg359 bf226 bi257 kh855 cm237 ca1 cv238 bq599 ky1345 cf236 td235 cl56 cn86 cx61 cc61 co57 km269 cd243 cg242 ck682 cr506 ci225 hr385 cu53 cw599 cy357 cz420 dk45 dj253 dm1767 do1 ec593 eg20 sv503 gq240 er291 ee372 et251 fk500 fo298 fj679 fi358 fr33 gf594 pf689 tf262 ga241 gm220 ge995 de49 gh233 gi350 gr30 gl299 gd1473 gp590 gu1671 gt502 gg44 gn224 gw245 gy592 ht509 hm672 hn504 hk852 hu36 is354 in91 id62 ir98 iq964 ie353 im44 il972 it39 jm1876 jp81 je44 jo962 kz7 ke254 ki686 xk383 kw965 kg996 la856 lv371 lb961 ls266 lr231 ly218 li423 lt370 lu352 mo853 mk389 mg261 mw265 my60 mv960 ml223 mt356 mh692 mq596 mr222 mu230 yt262 mx52 fm691 md373 mc377 mn976 me382 ms1664 ma212 mz258 mm95 na264 nr674 np977 nl31 nc687 nz64 ni505 ne227 ng234 nu683 nf672 kp850 mp1670 no47 om968 pk92 pw680 ps970 pa507 pg675 py595 pe51 ph63 pn64 pl48 pt351 pr1 qa974 re262 ro40 ru7 rw250 bl590 sh290 kn1869 lc1758 mf590 pm508 vc1784 ws685 sm378 st239 sa966 sn221 rs381 sc248 sl232 sg65 sx1721 sk421 si386 sb677 so252 za27 gs500 kr82 ss211 es34 lk94 sd249 sr597 sj47 sz268 se46 ch41 sy963 tw886 tj992 tz255 th66 tl670 tg228 tk690 to676 tt1868 tn216 tr90 tm993 tc1649 tv688 vi1340 ug256 ua380 ae971 gb44 us1 um1 uy598 uz998 vu678 va39 ve58 vn84 wf681 eh212 ye967 zm260 zw263".split(" ").map((entry) => [entry.slice(0, 2), entry.slice(2)]));
var DIAL_CODES = [...new Set(COUNTRY_DIAL_CODES.values())].sort((a, b) => Number(a) - Number(b));
function defaultDialCode() {
	const region = typeof navigator === "undefined" ? void 0 : navigator.language.split("-")[1]?.toLowerCase();
	const dialCode = region && COUNTRY_DIAL_CODES.get(region);
	return dialCode ? `+${dialCode}` : "+1";
}
function isPlausiblePhone(fullPhone) {
	const digits = fullPhone.replace(/\D/g, "");
	return digits.length >= 7 && digits.length <= 15;
}
var matchesSearch = (code, search) => {
	const normalized = search.replace(/\+/g, "");
	return normalized === "" || code.startsWith(normalized);
};
function DialCodePicker({ value, onChange }) {
	const [open, setOpen] = useState(false);
	const search = useRef("");
	const handleOpenChange = (next) => {
		if (!next && search.current) {
			const matches = DIAL_CODES.filter((code) => matchesSearch(code, search.current));
			if (matches.length === 1) onChange(`+${matches[0]}`);
			search.current = "";
		}
		setOpen(next);
	};
	return /* @__PURE__ */ jsxs(Popover, {
		open,
		onOpenChange: handleOpenChange,
		modal: true,
		children: [/* @__PURE__ */ jsx(PopoverTrigger, {
			asChild: true,
			children: /* @__PURE__ */ jsxs(Button, {
				type: "button",
				variant: "outline",
				role: "combobox",
				"aria-expanded": open,
				"aria-label": "Country code",
				className: "h-10 w-[100px] justify-between px-2.5 font-normal shadow-none",
				children: [value, /* @__PURE__ */ jsx(ChevronsUpDown, {
					className: "ml-1 h-3.5 w-3.5 shrink-0 opacity-50",
					"aria-hidden": "true"
				})]
			})
		}), /* @__PURE__ */ jsx(PopoverContent, {
			className: "w-[140px] p-0",
			align: "start",
			side: "bottom",
			avoidCollisions: false,
			children: /* @__PURE__ */ jsxs(Command$1, {
				filter: (item, text) => matchesSearch(item, text) ? 1 : 0,
				children: [/* @__PURE__ */ jsx(CommandInput, {
					placeholder: "Search...",
					className: "h-9",
					onValueChange: (text) => {
						search.current = text;
					}
				}), /* @__PURE__ */ jsxs(CommandList, { children: [/* @__PURE__ */ jsx(CommandEmpty, { children: "No match" }), /* @__PURE__ */ jsx(CommandGroup, { children: DIAL_CODES.map((code) => /* @__PURE__ */ jsxs(CommandItem, {
					value: code,
					onSelect: () => {
						onChange(`+${code}`);
						search.current = "";
						setOpen(false);
					},
					children: [
						"+",
						code,
						/* @__PURE__ */ jsx(Check, {
							className: cn("ml-auto h-3.5 w-3.5", value === `+${code}` ? "opacity-100" : "opacity-0"),
							"aria-hidden": "true"
						})
					]
				}, code)) })] })]
			})
		})]
	});
}
function PhoneField({ countryCode, onCountryCodeChange, phoneNumber, onPhoneNumberChange, error, onSubmit }) {
	const [touched, setTouched] = useState(false);
	const invalid = touched && phoneNumber.length >= 4 && !isPlausiblePhone(`${countryCode}${phoneNumber}`);
	const message = error ?? (invalid ? "Invalid phone number. Please check the number and try again." : null);
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-1.5",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex gap-2",
			children: [/* @__PURE__ */ jsx(DialCodePicker, {
				value: countryCode,
				onChange: onCountryCodeChange
			}), /* @__PURE__ */ jsx(Input, {
				id: "mfa-phone",
				type: "tel",
				autoComplete: "tel-national",
				autoFocus: true,
				value: phoneNumber,
				maxLength: 15,
				placeholder: "5551234567",
				"aria-invalid": Boolean(message),
				onChange: (e) => {
					onPhoneNumberChange(e.target.value.replace(/\D/g, ""));
					setTouched(true);
				},
				onKeyDown: (e) => {
					if (e.key === "Enter" && onSubmit) {
						e.preventDefault();
						onSubmit();
					}
				},
				className: cn("h-10 flex-1", message && "border-destructive focus-visible:ring-destructive")
			})]
		}), message ? /* @__PURE__ */ jsx("p", {
			className: "text-sm text-destructive",
			children: message
		}) : /* @__PURE__ */ jsx("p", {
			className: "text-sm text-muted-foreground",
			children: "Standard message and data rates may apply."
		})]
	});
}
function CopyKeyButton({ text, wide = false }) {
	const [copied, setCopied] = useState(false);
	const copy = async () => {
		await navigator.clipboard.writeText(text.replace(/\s/g, ""));
		setCopied(true);
		setTimeout(() => setCopied(false), 2e3);
	};
	if (wide) return /* @__PURE__ */ jsx(Button, {
		type: "button",
		variant: "outline",
		className: "w-full h-11",
		onClick: copy,
		children: copied ? "Copied" : "Copy key"
	});
	return /* @__PURE__ */ jsx("button", {
		type: "button",
		onClick: copy,
		title: "Copy to clipboard",
		"aria-label": "Copy to clipboard",
		className: "inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-muted",
		children: copied ? /* @__PURE__ */ jsx(Check, {
			className: "w-4 h-4",
			"aria-hidden": "true"
		}) : /* @__PURE__ */ jsx(Copy, {
			className: "w-4 h-4",
			"aria-hidden": "true"
		})
	});
}
function MfaNotice({ error, signInPath = "/login" }) {
	if (!error) return null;
	const returnTo = safeReturnTo();
	return /* @__PURE__ */ jsx("div", {
		role: "alert",
		className: "mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center",
		children: error.mustSignInAgain ? /* @__PURE__ */ jsxs(Fragment, { children: [
			"Your sign-in expired.",
			" ",
			/* @__PURE__ */ jsx("a", {
				href: signInPath + (returnTo !== "/" ? "?returnTo=" + encodeURIComponent(returnTo) : ""),
				className: "font-medium underline",
				children: "Sign in again"
			})
		] }) : error.message || "Verification failed. Please try again."
	});
}
function RememberDevice({ checked, onChange }) {
	return /* @__PURE__ */ jsxs("label", {
		className: "flex items-center justify-center gap-2 text-sm text-muted-foreground",
		children: [/* @__PURE__ */ jsx("input", {
			type: "checkbox",
			className: "h-4 w-4 accent-primary",
			checked,
			onChange: (e) => onChange(e.target.checked)
		}), "Remember this device for 30 days"]
	});
}
function useCooldown() {
	const [left, setLeft] = useState(0);
	useEffect(() => {
		if (left <= 0) return void 0;
		const timer = setTimeout(() => setLeft(left - 1), 1e3);
		return () => clearTimeout(timer);
	}, [left]);
	return [left, setLeft];
}
function isTouchDevice() {
	return typeof window !== "undefined" && window.matchMedia?.("(pointer: coarse)").matches;
}
//#endregion
//#region src/components/MfaMethodSetup.jsx
var SMS_RESEND_SECONDS$1 = 30;
var FULL_CODE = "Enter the full 6-digit code";
function MfaMethodSetup({ session, method, onDone, onBack, signInPath }) {
	const [setup, setSetup] = useState(null);
	const [step, setStep] = useState("start");
	const [countryCode, setCountryCode] = useState(defaultDialCode);
	const [phoneNumber, setPhoneNumber] = useState("");
	const [code, setCode] = useState("");
	const [fieldError, setFieldError] = useState(null);
	const [error, setError] = useState(null);
	const [resendError, setResendError] = useState(null);
	const [busy, setBusy] = useState(false);
	const [cooldown, setCooldown] = useCooldown();
	const started = useRef(false);
	const fullPhone = `${countryCode}${phoneNumber}`;
	const run = async (action, onError) => {
		setBusy(true);
		try {
			return await action();
		} catch (err) {
			onError(err);
			return null;
		} finally {
			setBusy(false);
		}
	};
	useEffect(() => {
		if (method !== "totp" || started.current) return;
		started.current = true;
		run(() => session.setupAuthenticator(), setError).then((result) => result && setSetup(result));
	}, [method, session]);
	const sendCode = async () => {
		setFieldError(null);
		setError(null);
		setResendError(null);
		if (!isPlausiblePhone(fullPhone)) {
			setFieldError(INVALID_PHONE);
			return;
		}
		if (await run(() => session.sendPhoneCode(fullPhone), (err) => {
			if (err.message?.toLowerCase().includes("phone")) setFieldError("Invalid phone number. Please check the number and try again.");
			else setError(err);
		})) {
			setStep("code");
			setCode("");
			setCooldown(SMS_RESEND_SECONDS$1);
		}
	};
	const resend = async () => {
		if (cooldown > 0) return;
		setResendError(null);
		try {
			await session.sendPhoneCode(fullPhone);
			setCooldown(SMS_RESEND_SECONDS$1);
		} catch (err) {
			setResendError(err.message || "Failed to resend");
		}
	};
	const confirm = async (value = code) => {
		if (busy) return;
		if (value.length !== 6) {
			setFieldError(FULL_CODE);
			return;
		}
		setFieldError(null);
		setError(null);
		const result = await run(() => method === "totp" ? session.confirmAuthenticator(value) : session.confirmPhone(value), (err) => err.mustSignInAgain ? setError(err) : setFieldError(err.message || "Invalid code"));
		if (result) onDone(result);
	};
	const backToStart = () => {
		setStep("start");
		setCode("");
		setFieldError(null);
		setError(null);
		setResendError(null);
	};
	const actions = (secondary, onSecondary, primary, onPrimary, disabled = false) => /* @__PURE__ */ jsxs("div", {
		className: "grid grid-cols-2 gap-3 pt-2",
		children: [/* @__PURE__ */ jsx(Button, {
			variant: "outline",
			className: "h-11",
			disabled: busy,
			onClick: onSecondary,
			children: secondary
		}), /* @__PURE__ */ jsxs(Button, {
			className: "h-11",
			disabled: busy || disabled,
			onClick: onPrimary,
			children: [busy && /* @__PURE__ */ jsx(Loader2, { className: "w-4 h-4 mr-2 animate-spin" }), primary]
		})]
	});
	if (method === "totp" && step === "start") return /* @__PURE__ */ jsxs("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ jsx("h2", {
				className: "text-lg font-semibold text-center",
				children: "Set up your authenticator app"
			}),
			/* @__PURE__ */ jsx(MfaNotice, {
				error,
				signInPath
			}),
			!setup && !error && /* @__PURE__ */ jsx(Loader2, { className: "mx-auto w-6 h-6 animate-spin text-muted-foreground" }),
			setup && (isTouchDevice() ? /* @__PURE__ */ jsxs("div", {
				className: "space-y-3 text-sm",
				children: [
					/* @__PURE__ */ jsxs("ol", {
						className: "list-decimal pl-5 space-y-1 text-muted-foreground",
						children: [
							/* @__PURE__ */ jsx("li", { children: "Copy the key below." }),
							/* @__PURE__ */ jsx("li", { children: "In your authenticator app, add an account and paste the key." }),
							/* @__PURE__ */ jsx("li", { children: "Come back here and enter the code the app shows." })
						]
					}),
					/* @__PURE__ */ jsx("code", {
						className: "block rounded-lg border border-border px-3 py-3 text-center font-mono font-medium tracking-wider break-all",
						children: setup.secret_formatted
					}),
					/* @__PURE__ */ jsx(CopyKeyButton, {
						text: setup.secret_formatted,
						wide: true
					})
				]
			}) : /* @__PURE__ */ jsxs("div", {
				className: "flex flex-col items-center gap-2 text-sm",
				children: [
					/* @__PURE__ */ jsx("p", {
						className: "font-medium",
						children: "Scan the QR code with your authenticator app"
					}),
					/* @__PURE__ */ jsx("img", {
						src: setup.qr_code,
						alt: "QR code for authenticator app setup",
						className: "w-36 h-36 rounded-lg border border-border bg-white p-1"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "text-muted-foreground mt-3",
						children: "Can't scan the code? Enter it manually:"
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "flex flex-wrap items-center justify-center gap-1",
						children: [/* @__PURE__ */ jsx("code", {
							className: "font-mono font-medium tracking-wider break-all",
							children: setup.secret_formatted
						}), /* @__PURE__ */ jsx(CopyKeyButton, { text: setup.secret_formatted })]
					})
				]
			})),
			actions("Cancel", onBack, "Continue", () => setStep("code"), !setup)
		]
	});
	if (method === "sms" && step === "start") {
		const phoneError = fieldError ?? (error && !error.mustSignInAgain ? error.message : null);
		return /* @__PURE__ */ jsxs("div", {
			className: "space-y-4",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "text-lg font-semibold text-center",
					children: "Enter your phone number"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "text-sm text-muted-foreground text-center",
					children: "A verification code will be sent to this number to confirm it's yours."
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ jsx(Label, {
						htmlFor: "mfa-phone",
						children: "Phone number"
					}), /* @__PURE__ */ jsx(PhoneField, {
						countryCode,
						onCountryCodeChange: setCountryCode,
						phoneNumber,
						onPhoneNumberChange: (value) => {
							setPhoneNumber(value);
							setFieldError(null);
						},
						error: phoneError,
						onSubmit: !busy && phoneNumber.length >= 4 ? sendCode : void 0
					})]
				}),
				error?.mustSignInAgain && /* @__PURE__ */ jsx(MfaNotice, {
					error,
					signInPath
				}),
				actions("Cancel", onBack, "Send Code", sendCode, phoneNumber.length < 4)
			]
		});
	}
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ jsx("h2", {
				className: "text-lg font-semibold text-center",
				children: method === "totp" ? "Enter a code from your authenticator app" : "Verify your phone number"
			}),
			method === "sms" && /* @__PURE__ */ jsxs("p", {
				className: "text-sm text-muted-foreground text-center",
				children: [
					"A 6-digit code sent to ",
					countryCode,
					" ",
					phoneNumber
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-col items-center gap-2",
				children: [
					/* @__PURE__ */ jsx(CodeField, {
						id: "mfa-setup-code",
						value: code,
						onChange: (value) => {
							setCode(value);
							setFieldError(null);
						},
						onComplete: confirm,
						hasError: Boolean(fieldError)
					}),
					fieldError && /* @__PURE__ */ jsx("p", {
						className: "text-sm text-destructive",
						children: fieldError
					}),
					method === "totp" ? /* @__PURE__ */ jsx("p", {
						className: "text-xs text-muted-foreground",
						children: "Codes refresh every 30 seconds."
					}) : /* @__PURE__ */ jsx(ResendLine, {
						cooldown,
						onResend: resend,
						error: resendError
					})
				]
			}),
			/* @__PURE__ */ jsx(MfaNotice, {
				error,
				signInPath
			}),
			actions("Back", backToStart, "Verify", () => confirm())
		]
	});
}
//#endregion
//#region src/components/MfaFlow.jsx
var SMS_RESEND_SECONDS = 60;
function MfaFlow({ challenge, returnTo, onManage }) {
	const session = useMemo(() => mfaSession(challenge), [challenge]);
	const finish = (result) => result.mfa_management_token && onManage ? onManage(session) : finishSignIn(result.access_token, returnTo);
	return /* @__PURE__ */ jsx("div", {
		className: "session-record-block",
		children: challenge.next_step === "enroll" ? /* @__PURE__ */ jsx(Enroll, {
			session,
			onDone: finish
		}) : /* @__PURE__ */ jsx(Verify, {
			session,
			challenge,
			returnTo,
			onDone: finish
		})
	});
}
function Enroll({ session, onDone }) {
	const [method, setMethod] = useState(null);
	const info = useAppInfo();
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(MfaHeader, {
		title: info && `${info.name || "This app"} requires multi-factor authentication`,
		description: method ? null : "Add a second sign-in step to keep your account secure. Choose how you want to get your codes."
	}), method ? /* @__PURE__ */ jsx(MfaMethodSetup, {
		session,
		method,
		onDone,
		onBack: () => setMethod(null)
	}) : /* @__PURE__ */ jsxs("div", {
		className: "space-y-3",
		children: [/* @__PURE__ */ jsx(Button, {
			className: "w-full h-12 font-medium",
			onClick: () => setMethod("totp"),
			children: "Set up your authenticator app"
		}), /* @__PURE__ */ jsx(Button, {
			variant: "outline",
			className: "w-full h-12 font-medium",
			onClick: () => setMethod("sms"),
			children: "Enter your phone number"
		})]
	})] });
}
function Verify({ session, challenge, returnTo, onDone }) {
	const methods = challenge.mfa_methods;
	const [method, setMethod] = useState(methods.includes("totp") ? "totp" : "sms");
	const [code, setCode] = useState("");
	const [remember, setRemember] = useState(true);
	const [error, setError] = useState(null);
	const [busy, setBusy] = useState(false);
	const [sending, setSending] = useState(false);
	const [cooldown, setCooldown] = useCooldown();
	const sent = useRef(false);
	const phone = challenge.phone_hint || "your phone";
	const sendCode = async () => {
		setError(null);
		setSending(true);
		try {
			await session.sendSignInCode();
			setCooldown(SMS_RESEND_SECONDS);
		} catch (err) {
			setError(err);
		} finally {
			setSending(false);
		}
	};
	useEffect(() => {
		if (method !== "sms" || sent.current) return;
		sent.current = true;
		sendCode();
	}, [method]);
	const verify = async (value = code) => {
		if (busy || value.length < 6) return;
		setError(null);
		setBusy(true);
		try {
			onDone(await session.verify(value, method, remember));
		} catch (err) {
			setError(err);
			setCode("");
			setBusy(false);
		}
	};
	const other = methods.find((value) => value !== method);
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(MfaHeader, { title: "Verify your identity" }), /* @__PURE__ */ jsxs("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ jsx(MfaNotice, { error }),
			/* @__PURE__ */ jsx("p", {
				className: "text-sm text-muted-foreground text-center",
				children: method === "totp" ? "Enter the code from your authenticator app" : sending && !cooldown ? `Sending code to ${phone}…` : `Enter the code sent to ${phone}`
			}),
			/* @__PURE__ */ jsx(CodeField, {
				id: "mfa-code",
				value: code,
				onChange: setCode,
				onComplete: verify
			}),
			/* @__PURE__ */ jsx(RememberDevice, {
				checked: remember,
				onChange: setRemember
			}),
			/* @__PURE__ */ jsxs(Button, {
				className: "w-full h-12 font-medium",
				disabled: busy || code.length < 6,
				onClick: () => verify(),
				children: [busy && /* @__PURE__ */ jsx(Loader2, { className: "w-4 h-4 mr-2 animate-spin" }), busy ? "Verifying..." : "Verify"]
			}),
			method === "sms" && /* @__PURE__ */ jsx(ResendLine, {
				cooldown,
				disabled: sending,
				onResend: sendCode
			}),
			other && /* @__PURE__ */ jsx(Button, {
				variant: "outline",
				className: "w-full",
				onClick: () => {
					setMethod(other);
					setCode("");
					setError(null);
				},
				children: other === "sms" ? "Verify via Text Message" : "Verify via Authenticator App"
			}),
			/* @__PURE__ */ jsx("div", {
				className: "text-center",
				children: /* @__PURE__ */ jsx("a", {
					href: returnTo && returnTo !== "/" ? "/login?returnTo=" + encodeURIComponent(returnTo) : "/login",
					className: "text-sm text-muted-foreground hover:underline",
					children: "Back to Login"
				})
			})
		]
	})] });
}
//#endregion
//#region src/components/shell/BrandMark.jsx
function BrandMark({ className = "h-8 w-8" }) {
	return /* @__PURE__ */ jsxs("svg", {
		viewBox: "0 0 32 32",
		className,
		role: "img",
		"aria-label": "Academic Intelligence",
		children: [
			/* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", {
				id: "aiMark",
				x1: "0",
				y1: "0",
				x2: "1",
				y2: "1",
				children: [/* @__PURE__ */ jsx("stop", {
					offset: "0%",
					stopColor: "#4F75FF"
				}), /* @__PURE__ */ jsx("stop", {
					offset: "100%",
					stopColor: "#7666F5"
				})]
			}) }),
			/* @__PURE__ */ jsx("rect", {
				width: "32",
				height: "32",
				rx: "9",
				fill: "url(#aiMark)"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M9.5 22.5 16 9l6.5 13.5",
				fill: "none",
				stroke: "#fff",
				strokeWidth: "2.1",
				strokeLinecap: "round",
				strokeLinejoin: "round"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M12.6 18.4h6.8",
				fill: "none",
				stroke: "#fff",
				strokeWidth: "1.9",
				strokeLinecap: "round",
				opacity: "0.85"
			}),
			/* @__PURE__ */ jsx("circle", {
				cx: "16",
				cy: "6.6",
				r: "1.5",
				fill: "#fff",
				opacity: "0.9"
			})
		]
	});
}
//#endregion
//#region src/components/AuthLayout.jsx
function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
	const { t } = useI18n();
	const points = [
		t("auth.points.experiences"),
		t("auth.points.record"),
		t("auth.points.roles")
	];
	return /* @__PURE__ */ jsxs("div", {
		className: "flex min-h-dvh bg-white",
		children: [/* @__PURE__ */ jsxs("aside", {
			className: "relative hidden w-[46%] flex-col justify-between overflow-hidden bg-navy px-10 py-12 lg:flex xl:px-14",
			children: [
				/* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-brand/20 blur-3xl" }),
				/* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-violet/20 blur-3xl" }),
				/* @__PURE__ */ jsxs("div", {
					className: "relative flex items-center gap-2.5",
					children: [/* @__PURE__ */ jsx(BrandMark, { className: "h-9 w-9" }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
						className: "text-[13px] font-semibold tracking-tight text-white",
						children: t("common.appName")
					}), /* @__PURE__ */ jsx("p", {
						className: "text-[10.5px] text-white/45",
						children: UNIVERSITY.name
					})] })]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "relative",
					children: [
						/* @__PURE__ */ jsx("h2", {
							className: "max-w-sm text-[28px] font-semibold leading-[1.18] tracking-[-0.02em] text-white xl:text-[32px]",
							children: t("auth.headline")
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-3 max-w-sm text-[12.5px] leading-relaxed text-white/55",
							children: t("auth.headlineBody")
						}),
						/* @__PURE__ */ jsx("ul", {
							className: "mt-6 space-y-2.5",
							children: points.map((point) => /* @__PURE__ */ jsxs("li", {
								className: "flex items-center gap-2 text-[12px] text-white/70",
								children: [
									/* @__PURE__ */ jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-brand" }),
									" ",
									point
								]
							}, point))
						})
					]
				}),
				/* @__PURE__ */ jsx("p", {
					className: "relative max-w-sm text-[10px] leading-relaxed text-white/35",
					children: UNIVERSITY.disclaimer
				})
			]
		}), /* @__PURE__ */ jsx("main", {
			className: "flex flex-1 items-center justify-center px-4 py-10 sm:px-8",
			children: /* @__PURE__ */ jsxs("div", {
				className: "w-full max-w-[400px]",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "mb-6 flex items-center gap-2.5 lg:hidden",
						children: [/* @__PURE__ */ jsx(BrandMark, { className: "h-8 w-8" }), /* @__PURE__ */ jsx("p", {
							className: "text-[13px] font-semibold tracking-tight text-ink",
							children: t("common.appName")
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "mb-5 flex items-start gap-3",
						children: [Icon && /* @__PURE__ */ jsx("span", {
							className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand",
							children: /* @__PURE__ */ jsx(Icon, {
								className: "h-5 w-5",
								"aria-hidden": "true"
							})
						}), /* @__PURE__ */ jsxs("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ jsx("h1", {
								className: "text-[21px] font-semibold leading-tight tracking-[-0.02em] text-ink",
								children: title
							}), subtitle && /* @__PURE__ */ jsx("p", {
								className: "mt-1 text-[12.5px] text-mutedink",
								children: subtitle
							})]
						})]
					}),
					/* @__PURE__ */ jsx("div", {
						className: "card-surface p-5 sm:p-6",
						children
					}),
					footer && /* @__PURE__ */ jsx("p", {
						className: "mt-5 text-center text-[12px] text-mutedink",
						children: footer
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-5 text-center text-[10px] leading-relaxed text-mutedink/80",
						children: UNIVERSITY.disclaimer
					})
				]
			})
		})]
	});
}
//#endregion
//#region src/components/GoogleIcon.jsx
function GoogleIcon({ className = "w-5 h-5" }) {
	return /* @__PURE__ */ jsxs("svg", {
		className,
		viewBox: "0 0 24 24",
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ jsx("path", {
				d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z",
				fill: "#4285F4"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z",
				fill: "#34A853"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z",
				fill: "#FBBC05"
			}),
			/* @__PURE__ */ jsx("path", {
				d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z",
				fill: "#EA4335"
			})
		]
	});
}
//#endregion
//#region src/pages/Login.jsx
var WORKSPACE_KEYS = {
	student: "welcome.student",
	professor: "welcome.professor",
	administration: "welcome.administration"
};
var ATTEMPT_LIMIT = 5;
var LOCK_MS = 6e4;
function Login() {
	const { t, dir } = useI18n();
	const rtl = dir === "rtl";
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [mfaChallenge, setMfaChallenge] = useState(null);
	const [failures, setFailures] = useState(0);
	const [lockedUntil, setLockedUntil] = useState(0);
	const workspaceKey = WORKSPACE_KEYS[new URLSearchParams(window.location.search).get("workspace")];
	const workspaceLabel = workspaceKey ? t(workspaceKey) : "";
	const requested = safeReturnTo();
	const returnTo = requested === "/" ? "/dashboard" : requested;
	const handleSubmit = async (e) => {
		e.preventDefault();
		if (Date.now() < lockedUntil) return;
		setError("");
		setLoading(true);
		try {
			const result = await loginWithMfa(email, password);
			if (result.mfa_required) {
				setMfaChallenge(result);
				return;
			}
			window.location.href = returnTo;
		} catch {
			const next = failures + 1;
			if (next >= ATTEMPT_LIMIT) {
				setFailures(0);
				setLockedUntil(Date.now() + LOCK_MS);
				setError(t("auth.tooManyAttempts"));
			} else {
				setFailures(next);
				setError(t("auth.invalidCredentials"));
			}
		} finally {
			setLoading(false);
		}
	};
	const handleGoogle = async () => {
		try {
			await signInWithProvider("google", returnTo);
		} catch (err) {
			setError(err.message || t("auth.googleError"));
		}
	};
	if (mfaChallenge) return /* @__PURE__ */ jsx(MfaScreen, { children: /* @__PURE__ */ jsx(MfaFlow, {
		challenge: mfaChallenge,
		returnTo
	}) });
	const iconSide = rtl ? "right-3" : "left-3";
	const inputPadding = rtl ? "pr-10 pl-3" : "pl-10 pr-3";
	return /* @__PURE__ */ jsxs(AuthLayout, {
		icon: LogIn,
		title: t("auth.welcomeBack"),
		subtitle: workspaceLabel ? t("auth.workspaceSignIn", { workspace: workspaceLabel }) : t("auth.logInToYourAccount"),
		footer: /* @__PURE__ */ jsx("span", { children: t("auth.accountsIssued") }),
		children: [
			/* @__PURE__ */ jsxs(Button, {
				variant: "outline",
				className: "w-full h-12 text-sm font-medium mb-6",
				onClick: handleGoogle,
				children: [/* @__PURE__ */ jsx(GoogleIcon, { className: "w-5 h-5 me-2" }), t("auth.continueWithGoogle")]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "relative mb-6",
				children: [/* @__PURE__ */ jsx("div", {
					className: "absolute inset-0 flex items-center",
					children: /* @__PURE__ */ jsx("div", { className: "w-full border-t border-border" })
				}), /* @__PURE__ */ jsx("div", {
					className: "relative flex justify-center text-xs uppercase",
					children: /* @__PURE__ */ jsx("span", {
						className: "bg-card px-3 text-muted-foreground",
						children: t("auth.or")
					})
				})]
			}),
			error && /* @__PURE__ */ jsx("div", {
				className: "mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm",
				children: error
			}),
			/* @__PURE__ */ jsxs("form", {
				onSubmit: handleSubmit,
				className: "space-y-4",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ jsx(Label, {
							htmlFor: "email",
							children: t("auth.email")
						}), /* @__PURE__ */ jsxs("div", {
							className: "relative",
							children: [/* @__PURE__ */ jsx(Mail, {
								className: `absolute ${iconSide} top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground`,
								"aria-hidden": "true"
							}), /* @__PURE__ */ jsx(Input, {
								id: "email",
								type: "email",
								autoComplete: "email",
								autoFocus: true,
								dir: "ltr",
								placeholder: "you@example.com",
								value: email,
								onChange: (e) => setEmail(e.target.value),
								className: `${inputPadding} h-12`,
								required: true
							})]
						})]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between gap-2",
							children: [/* @__PURE__ */ jsx(Label, {
								htmlFor: "password",
								children: t("auth.password")
							}), /* @__PURE__ */ jsx(Link, {
								to: "/forgot-password",
								className: "text-xs text-primary hover:underline",
								children: t("auth.forgotPassword")
							})]
						}), /* @__PURE__ */ jsxs("div", {
							className: "relative",
							children: [
								/* @__PURE__ */ jsx(Lock, {
									className: `absolute ${iconSide} top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground`,
									"aria-hidden": "true"
								}),
								/* @__PURE__ */ jsx(Input, {
									id: "password",
									type: showPassword ? "text" : "password",
									autoComplete: "current-password",
									dir: "ltr",
									placeholder: "••••••••",
									value: password,
									onChange: (e) => setPassword(e.target.value),
									className: `${inputPadding} h-12`,
									required: true
								}),
								/* @__PURE__ */ jsx("button", {
									type: "button",
									onClick: () => setShowPassword((value) => !value),
									className: `absolute ${rtl ? "left-2" : "right-2"} top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground`,
									"aria-label": showPassword ? t("auth.hidePassword") : t("auth.showPassword"),
									children: showPassword ? /* @__PURE__ */ jsx(EyeOff, { className: "w-4 h-4" }) : /* @__PURE__ */ jsx(Eye, { className: "w-4 h-4" })
								})
							]
						})]
					}),
					/* @__PURE__ */ jsx(Button, {
						type: "submit",
						className: "w-full h-12 font-medium",
						disabled: loading,
						children: loading ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Loader2, { className: "w-4 h-4 me-2 animate-spin" }), t("auth.loggingIn")] }) : t("auth.logIn")
					})
				]
			})
		]
	});
}
//#endregion
export { Login as default };
