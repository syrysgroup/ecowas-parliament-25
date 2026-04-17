import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, EyeOff, CheckCircle2, AlertCircle, Lock } from "lucide-react";
import ecowasLogo from "@/assets/ecowas-parliament-logo.png";
import { useTranslation } from "@/lib/i18n";

type PageState = "loading" | "form" | "success" | "expired";

export default function SetPassword() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [pageState, setPageState] = useState<PageState>("loading");
  const [password, setPassword]   = useState("");
  const [confirm,  setConfirm]    = useState("");
  const [showPw,   setShowPw]     = useState(false);
  const [showCf,   setShowCf]     = useState(false);
  const [saving,   setSaving]     = useState(false);
  const [error,    setError]      = useState<string | null>(null);

  useEffect(() => {
    const hash   = window.location.hash;
    const params = new URLSearchParams(hash.replace("#", "?").replace("?", ""));
    const accessToken  = params.get("access_token");
    const refreshToken = params.get("refresh_token");

    if (accessToken && refreshToken) {
      // ── Invite / password-reset link flow ────────────────────────────────
      supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
        .then(({ error }) => setPageState(error ? "expired" : "form"));
    } else {
      // ── Force-password-change flow (user already authenticated) ──────────
      supabase.auth.getSession().then(({ data: { session } }) => {
        setPageState(session ? "form" : "expired");
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) { setError(t("setPw.errMin")); return; }
    if (password !== confirm) { setError(t("setPw.errMatch")); return; }
    setSaving(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error(t("setPw.errSession"));

      const res = await supabase.functions.invoke("sync-password", {
        body: { newPassword: password },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.error) throw new Error(res.error.message);
      const data = res.data as { success?: boolean; error?: string };
      if (data?.error) throw new Error(data.error);

      // Clear force_password_change flag (safe no-op if it was never set)
      await supabase.auth.updateUser({ data: { force_password_change: false } });

      setPageState("success");
      setTimeout(() => navigate("/complete-profile", { replace: true }), 2500);
    } catch (err: any) {
      setError(err.message || t("setPw.errSession"));
    } finally {
      setSaving(false);
    }
  };

  // ── Password strength ──────────────────────────────────────────────────────
  const strength = password.length === 0 ? null : password.length < 8 ? "weak" : password.length < 12 ? "good" : "strong";
  const strengthColors = { weak: "bg-red-400", good: "bg-amber-400", strong: "bg-emerald-400" };
  const strengthLabel  = { weak: t("setPw.weak"), good: t("setPw.good"), strong: t("setPw.strong") };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[hsl(152,100%,20%)] via-[hsl(150,80%,10%)] to-[hsl(150,60%,6%)]">

      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 gap-8">
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-10 flex flex-col items-center gap-6 border border-white/20">
          <div className="bg-white rounded-full p-4 shadow-2xl">
            <img src={ecowasLogo} alt="ECOWAS Parliament Initiative" className="h-20 w-20 object-contain" width={80} height={80} decoding="async" fetchPriority="high" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-black text-white tracking-tight">ECOWAS Parliament Initiative</h1>
            <p className="text-white/70 mt-2 text-sm font-medium">CRM Portal — Account Setup</p>
          </div>
          <div className="w-16 h-0.5 bg-white/30 rounded" />

          {/* Step indicators */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-white/25 border border-white/50 flex items-center justify-center">
                <Lock size={13} className="text-white" />
              </div>
              <span className="text-white text-xs font-semibold">Set password</span>
            </div>
            <div className="w-8 h-px bg-white/20" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                <span className="text-white/40 text-[11px] font-bold">2</span>
              </div>
              <span className="text-white/40 text-xs">Complete profile</span>
            </div>
          </div>

          <p className="text-white/50 text-xs text-center max-w-xs leading-relaxed">
            Choose a strong password to secure your ECOWAS CRM account. You'll complete your profile in the next step.
          </p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            <div className="bg-white rounded-full p-3 shadow-xl">
              <img src={ecowasLogo} alt="ECOWAS Parliament Initiative" className="h-12 w-12 object-contain" width={48} height={48} decoding="async" fetchPriority="high" />
            </div>
          </div>

          {/* Mobile step indicator */}
          <div className="flex items-center justify-center gap-3 mb-6 lg:hidden">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-white/25 border border-white/50 flex items-center justify-center">
                <Lock size={11} className="text-white" />
              </div>
              <span className="text-white text-xs font-semibold">Set password</span>
            </div>
            <div className="w-6 h-px bg-white/20" />
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                <span className="text-white/40 text-[10px] font-bold">2</span>
              </div>
              <span className="text-white/40 text-xs">Profile</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-2xl">

            {pageState === "loading" && (
              <div className="flex flex-col items-center gap-4 py-8">
                <Loader2 className="animate-spin text-white" size={32} />
                <p className="text-white/70 text-sm">{t("setPw.verifying")}</p>
              </div>
            )}

            {pageState === "expired" && (
              <div className="flex flex-col items-center gap-4 py-6 text-center">
                <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center">
                  <AlertCircle size={28} className="text-red-300" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg">{t("setPw.expired")}</h2>
                  <p className="text-white/60 text-sm mt-2">{t("setPw.expiredDesc")}</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => navigate("/auth")}
                  className="border-white/30 text-white hover:bg-white/10 text-sm mt-2"
                >
                  Back to sign in
                </Button>
              </div>
            )}

            {pageState === "success" && (
              <div className="flex flex-col items-center gap-4 py-6 text-center">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 size={28} className="text-emerald-300" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg">{t("setPw.success")}</h2>
                  <p className="text-white/60 text-sm mt-2">{t("setPw.successDesc")}</p>
                </div>
                <Loader2 size={16} className="animate-spin text-white/50" />
              </div>
            )}

            {pageState === "form" && (
              <>
                <div className="mb-6">
                  <h2 className="text-white font-bold text-xl">{t("setPw.title")}</h2>
                  <p className="text-white/60 text-sm mt-1">{t("setPw.subtitle")}</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-white/70 text-xs font-semibold">{t("setPw.newPassword")}</Label>
                    <div className="relative">
                      <Input
                        type={showPw ? "text" : "password"}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder={t("setPw.minChars")}
                        required
                        minLength={8}
                        className="bg-white/10 border-white/20 text-white placeholder-white/30 pr-10 focus:border-white/50 focus:bg-white/15"
                      />
                      <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors">
                        {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-white/70 text-xs font-semibold">{t("setPw.confirmPassword")}</Label>
                    <div className="relative">
                      <Input
                        type={showCf ? "text" : "password"}
                        value={confirm}
                        onChange={e => setConfirm(e.target.value)}
                        placeholder={t("setPw.repeat")}
                        required
                        className="bg-white/10 border-white/20 text-white placeholder-white/30 pr-10 focus:border-white/50 focus:bg-white/15"
                      />
                      <button type="button" onClick={() => setShowCf(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors">
                        {showCf ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  {/* Strength indicator */}
                  {strength && (
                    <>
                      <div className="flex gap-1.5">
                        {(["weak", "good", "strong"] as const).map((level, i) => {
                          const active =
                            (strength === "weak"   && i === 0) ||
                            (strength === "good"   && i <= 1) ||
                            (strength === "strong");
                          return <div key={level} className={`h-1 flex-1 rounded-full transition-colors ${active ? strengthColors[strength] : "bg-white/15"}`} />;
                        })}
                      </div>
                      <p className="text-white/40 text-[10px]">{strengthLabel[strength]}</p>
                    </>
                  )}

                  {error && (
                    <div className="flex items-start gap-2 bg-red-500/15 border border-red-500/30 rounded-lg px-3 py-2.5">
                      <AlertCircle size={14} className="text-red-300 flex-shrink-0 mt-0.5" />
                      <p className="text-red-300 text-xs">{error}</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={saving || password.length < 8 || password !== confirm}
                    className="w-full bg-white text-[hsl(152,100%,20%)] hover:bg-white/90 font-bold gap-2 mt-2"
                  >
                    {saving ? <Loader2 size={15} className="animate-spin" /> : null}
                    {saving ? t("setPw.setting") : t("setPw.submit")}
                  </Button>
                </form>
              </>
            )}
          </div>

          <p className="text-white/30 text-[10px] text-center mt-6">
            © {new Date().getFullYear()} ECOWAS Parliament Initiative. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
