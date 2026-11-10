import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import { useI18n } from "@/i18n/I18nProvider";

export default function ForgotPassword() {
  const { t, isRTL } = useI18n();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await base44.auth.resetPasswordRequest(email);
    } catch {
      // Always show success regardless
    } finally {
      setLoading(false);
      setSent(true);
    }
  };

  return (
    <AuthLayout
      icon={Mail}
      title={t("auth.resetPasswordTitle")}
      subtitle={t("auth.resetPasswordSubtitle")}
      footer={
        <Link to="/login" className="text-primary font-medium hover:underline">
          <ArrowLeft className={`dir-icon inline w-3 h-3 ${isRTL ? "ms-1" : "me-1"}`} />{t("auth.backToLogIn")}
        </Link>
      }
    >
      {sent ? (
        <p className="text-sm text-foreground text-center">
          {t("auth.resetSent")}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t("auth.emailAddress")}</Label>
            <div className="relative">
              <Mail
                className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground`}
                aria-hidden="true"
              />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                autoFocus
                dir="ltr"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={isRTL ? "pr-10 pl-3 h-12" : "pl-10 pr-3 h-12"}
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 me-2 animate-spin" />
                {t("auth.sending")}
              </>
            ) : (
              t("auth.sendResetLink")
            )}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}