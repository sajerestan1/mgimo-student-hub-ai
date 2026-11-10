import { createContext, useContext, useEffect, useState } from "react";
import { createClient, getAccessToken } from "@base44/sdk";
import { jsx } from "react/jsx-runtime";
//#region src/lib/app-params.js
var isNode = typeof window === "undefined";
var isClearAccessTokenRequested = () => !isNode && new URLSearchParams(window.location.search).get("clear_access_token") === "true";
var clearStoredAccessToken = () => {
	window.localStorage.removeItem("base44_access_token");
	window.localStorage.removeItem("token");
};
var getAppParams = () => {
	if (isClearAccessTokenRequested()) clearStoredAccessToken();
	return {
		appId: "6aef2aa9ee2a398c4400224f",
		token: getAccessToken(),
		functionsVersion: !isNode && new URLSearchParams(window.location.search).get("functions_version")?.trim() || "preview",
		appBaseUrl: void 0
	};
};
var appParams = { ...getAppParams() };
//#endregion
//#region src/api/base44Client.js
var { appId, token, functionsVersion, appBaseUrl } = appParams;
var base44 = createClient({
	appId,
	token,
	functionsVersion,
	serverUrl: "",
	appBaseUrl
});
//#endregion
//#region src/lib/offline/store.js
var DB_NAME = "academic-intelligence-offline";
var DB_VERSION = 1;
var STORE = "timetable";
var supported = () => typeof indexedDB !== "undefined";
var openDb = () => new Promise((resolve, reject) => {
	if (!supported()) {
		reject(/* @__PURE__ */ new Error("Offline storage is not available in this browser"));
		return;
	}
	const request = indexedDB.open(DB_NAME, DB_VERSION);
	request.onupgradeneeded = () => {
		const db = request.result;
		if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "key" }).createIndex("account", "account", { unique: false });
	};
	request.onsuccess = () => resolve(request.result);
	request.onerror = () => reject(request.error);
});
async function run(mode, action) {
	const db = await openDb();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE, mode);
		const store = tx.objectStore(STORE);
		let result;
		try {
			result = action(store);
		} catch (error) {
			reject(error);
			return;
		}
		tx.oncomplete = () => {
			db.close();
			resolve(result && result.result !== void 0 ? result.result : result);
		};
		tx.onerror = () => {
			db.close();
			reject(tx.error);
		};
	});
}
async function clearAccount(accountId) {
	if (!accountId || !supported()) return;
	try {
		await run("readwrite", (store) => {
			const request = store.index("account").openCursor(IDBKeyRange.only(accountId));
			request.onsuccess = () => {
				const cursor = request.result;
				if (cursor) {
					store.delete(cursor.primaryKey);
					cursor.continue();
				}
			};
		});
	} catch {}
}
//#endregion
//#region src/lib/AuthContext.jsx
var AuthContext = createContext();
var AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [isLoadingAuth, setIsLoadingAuth] = useState(true);
	const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
	const [authError, setAuthError] = useState(null);
	const [authChecked, setAuthChecked] = useState(false);
	const [appPublicSettings, setAppPublicSettings] = useState(null);
	useEffect(() => {
		checkAppState();
	}, []);
	const checkAppState = async () => {
		try {
			setIsLoadingPublicSettings(true);
			setAuthError(null);
			try {
				const publicSettings = await base44.app.getPublicSettings();
				setAppPublicSettings(publicSettings);
				if (appParams.token) await checkUserAuth();
				else {
					setIsLoadingAuth(false);
					setIsAuthenticated(false);
					setAuthChecked(true);
				}
				setIsLoadingPublicSettings(false);
			} catch (appError) {
				console.error("App state check failed:", appError);
				if (appError.status === 403 && appError.data?.extra_data?.reason) {
					const reason = appError.data.extra_data.reason;
					if (reason === "auth_required") setAuthError({
						type: "auth_required",
						message: "Authentication required"
					});
					else if (reason === "user_not_registered") setAuthError({
						type: "user_not_registered",
						message: "User not registered for this app"
					});
					else setAuthError({
						type: reason,
						message: appError.message
					});
				} else setAuthError({
					type: "unknown",
					message: appError.message || "Failed to load app"
				});
				setIsLoadingPublicSettings(false);
				setIsLoadingAuth(false);
			}
		} catch (error) {
			console.error("Unexpected error:", error);
			setAuthError({
				type: "unknown",
				message: error.message || "An unexpected error occurred"
			});
			setIsLoadingPublicSettings(false);
			setIsLoadingAuth(false);
		}
	};
	const checkUserAuth = async () => {
		try {
			setIsLoadingAuth(true);
			const currentUser = await base44.auth.me();
			setUser(currentUser);
			setIsAuthenticated(true);
			setIsLoadingAuth(false);
			setAuthChecked(true);
		} catch (error) {
			console.error("User auth check failed:", error);
			setIsLoadingAuth(false);
			setIsAuthenticated(false);
			setAuthChecked(true);
			if (error.status === 401 || error.status === 403) setAuthError({
				type: "auth_required",
				message: "Authentication required"
			});
		}
	};
	const logout = (shouldRedirect = true) => {
		if (user?.id) clearAccount(user.id);
		setUser(null);
		setIsAuthenticated(false);
		if (shouldRedirect) base44.auth.logout(window.location.href);
		else base44.auth.logout();
	};
	const navigateToLogin = () => {
		base44.auth.redirectToLogin(window.location.href);
	};
	return /* @__PURE__ */ jsx(AuthContext.Provider, {
		value: {
			user,
			isAuthenticated,
			isLoadingAuth,
			isLoadingPublicSettings,
			authError,
			appPublicSettings,
			authChecked,
			logout,
			navigateToLogin,
			checkUserAuth,
			checkAppState
		},
		children
	});
};
var useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) throw new Error("useAuth must be used within an AuthProvider");
	return context;
};
//#endregion
export { appParams as i, useAuth as n, base44 as r, AuthProvider as t };
