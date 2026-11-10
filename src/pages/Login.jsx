import React, { useState } from "react";
import { Link } from "react-router-dom";
import { loginWithMfa } from "@/lib/authMfa";
import { signInWithProvider } from "@/lib/authMfaFlow";
import MfaFlow from "@/components/MfaFlow";
import { MfaScreen } from "@/components/MfaParts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import { safeReturnTo } from "@/lib/authReturnTo";
import { useI18n } from "@/i18n/I18nProvider";

const WORKSPACE_KEYS = {
  student: "welcome.student",
  professor: "welcome.professor",
  administration: "welcome.administration",
};

const ATTEMPT_LIMIT = 5;
const LOCK_MS = 60 * 1000;

export default function Login() {
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
  // The welcome screen's role card names the chosen workspace. Presentation
  // only: the account's real role is resolved server-side after sign-in.
  const workspaceKey = WORKSPACE_KEYS[new URLSearchParams(window.location.search).get("workspace")];
  const workspaceLabel = workspaceKey ? t(workspaceKey) : "";
  // Post-login destination (e.g. the MCP OAuth consent page sends users here
  // with returnTo so the grant flow can resume). Same-origin paths only.
  // Landing visitors sign in to reach their role workspace, not the public site.
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
        // One message for every sign-in failure: a wrong password, an unknown
        // address, a suspended or an unprovisioned account all read the same.
        setError(t("auth.invalidCredentials"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try { await signInWithProvider("google", returnTo); }
    catch (err) { setError(err.message || t("auth.googleError")); }
  };

  // The second sign-in step (authenticator app or text message) replaces the whole page.
  if (mfaChallenge) return <MfaScreen><MfaFlow challenge={mfaChallenge} returnTo={returnTo} /></MfaScreen>;

  const iconSide = rtl ? "right-3" : "left-3";
  const inputPadding = rtl ? "pr-10 pl-3" : "pl-10 pr-3";

  return (
    <AuthLayout
      icon={LogIn}
      title={t("auth.welcomeBack")}
      subtitle={workspaceLabel ? t("auth.workspaceSignIn", { workspace: workspaceLabel }) : t("auth.logInToYourAccount")}
      footer={<span>{t("auth.accountsIssued")}</span>}
    >
      <Button
        variant="outline"
        className="w-full h-12 text-sm font-medium mb-6"
        onClick={handleGoogle}
      >
        <GoogleIcon className="w-5 h-5 me-2" />
        {t("auth.continueWithGoogle")}
      </Button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-3 text-muted-foreground">{t("auth.or")}</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{t("auth.email")}</Label>
          <div className="relative">
            <Mail className={`absolute ${iconSide} top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground`} aria-hidden="true" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
              dir="ltr"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`${inputPadding} h-12`}
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="password">{t("auth.password")}</Label>
            <Link to="/forgot-password" className="text-xs text-primary hover:underline">
              {t("auth.forgotPassword")}
            </Link>
          </div>
          <div className="relative">
            <Lock className={`absolute ${iconSide} top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground`} aria-hidden="true" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              dir="ltr"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${inputPadding} h-12`}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className={`absolute ${rtl ? "left-2" : "right-2"} top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground`}
              aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 me-2 animate-spin" />
              {t("auth.loggingIn")}
            </>
          ) : (
            t("auth.logIn")
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}