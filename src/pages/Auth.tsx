import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Mail, Lock, User, ArrowLeft, Crown, Eye, EyeOff,
  ShieldCheck, KeyRound, CheckCircle2, AlertCircle, RefreshCw, Loader2,
} from "lucide-react";
import { Turnstile } from "@marsidev/react-turnstile";
import ecowasLogo from "@/assets/ecowas-parliament-logo.png";

// ─── Types ────────────────────────────────────────────────────────────────────
type AuthMode = "signin" | "signup" | "forgot" | "reset_sent";

const TURNSTILE_SITE_KEY = "0x4AAAAAAAczus4H6t9WSW6Oy";

const ECOWAS_COUNTRIES = [
  "Benin","Burkina Faso","Cape Verde","Côte d'Ivoire","Gambia",
  "Ghana","Guinea","Guinea-Bissau","Liberia","Mali","Niger",
  "Nigeria","Senegal","Sierra Leone","Togo",
];

// ─── Role-based redirect ──────────────────────────────────────────────────────
async function getRoleBasedRedirect(
  userId: string,
  from: string | null,
): Promise<string> {
  const { data } = await (supabase as any)
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);

  const roles: string[] = (data ?? []).map((r: any) => r.role);

  const isPrivilegedPath =
    from?.startsWith("/admin/users") ||
    from?.startsWith("/crm") ||
    from?.startsWith("/sponsor-dashboard");
  const hasPrivilegedRole = roles.some(r =>
    ["super_admin", "admin", "moderator", "sponsor"].includes(r)
  );
  if (from && from !== "/auth" && (!isPrivilegedPath || hasPrivilegedRole)) return from;

  if (roles.includes("super_admin")) return "/crm?section=super-admin";
  if (roles.includes("admin"))       return "/crm";
  if (roles.includes("moderator"))   return "/crm";
  if (roles.includes("sponsor"))     return "/sponsor-dashboard";
  return "/";
}

// ─── Animated background shapes ───────────────────────────────────────────────
const FloatingShapes = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-primary/20 blur-3xl animate-pulse" />
    <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] rounded-full bg-accent/15 blur-3xl animate-pulse" style={{ animationDelay: "2s", animationDuration: "4s" }} />
    <div className="absolute -bottom-40 left-1/4 w-80 h-80 rounded-full bg-secondary/15 blur-3xl animate-pulse" style={{ animationDelay: "1s", animationDuration: "5s" }} />
    <div className="absolute top-10 left-1/3 w-2 h-2 rounded-full bg-accent/60 animate-bounce" style={{ animationDelay: "0.5s" }} />
    <div className="absolute top-1/2 left-[15%] w-1.5 h-1.5 rounded-full bg-primary-foreground/40 animate-bounce" style={{ animationDelay: "1.5s" }} />
    <div className="absolute bottom-1/4 left-[60%] w-2.5 h-2.5 rounded-full bg-accent/50 animate-bounce" style={{ animationDelay: "2.5s" }} />
  </div>
);

// ─── Component ────────────────────────────────────────────────────────────────
export default function Auth() {
  const { user, loading } = useAuthContext();
  const navigate          = useNavigate();
  const location          = useLocation();
  const { toast }         = useToast();

  const from = (location.state as any)?.from as string | undefined;

  const [mode,        setMode]        = useState<AuthMode>("signin");
  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [showPwd,     setShowPwd]     = useState(false);
  const [fullName,    setFullName]    = useState("");
  const [country,     setCountry]     = useState("");
  const [submitting,  setSubmitting]  = useState(false);
  const [teamMode,    setTeamMode]    = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaError, setCaptchaError] = useState(false);
  const [captchaLoading, setCaptchaLoading] = useState(true);
  const turnstileRef = useRef<any>(null);
  const captchaTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!loading && user) {
      getRoleBasedRedirect(user.id, from ?? null).then(path => navigate(path, { replace: true }));
    }
  }, [user, loading, from, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("team") === "1") setTeamMode(true);
  }, [location.search]);

  // Clear captcha timeout on unmount
  useEffect(() => {
    return () => {
      if (captchaTimeoutRef.current) clearTimeout(captchaTimeoutRef.current);
    };
  }, []);

  if (loading) return null;

  const resetTurnstile = () => {
    setCaptchaToken(null);
    setCaptchaError(false);
    setCaptchaLoading(true);
    turnstileRef.current?.reset();
  };

  const handleAuthError = (err: any) => {
    let message = err.message;
    if (message?.toLowerCase().includes("captcha")) {
      message = "CAPTCHA verification failed. Please wait a moment and try again.";
    } else if (message === "Invalid login credentials") {
      message = "Email or password is incorrect.";
    }
    return message;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaToken) {
      toast({ title: "Please wait for CAPTCHA verification", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: { captchaToken },
      });
      if (error) throw error;
      if (data.user) {
        const path = await getRoleBasedRedirect(data.user.id, from ?? null);
        navigate(path, { replace: true });
      }
    } catch (err: any) {
      toast({ title: "Sign-in failed", description: handleAuthError(err), variant: "destructive" });
    } finally {
      setSubmitting(false);
      resetTurnstile();
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !country) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    if (!captchaToken) {
      toast({ title: "Please wait for CAPTCHA verification", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          captchaToken,
          emailRedirectTo: `${window.location.origin}/auth`,
          data: { full_name: fullName.trim(), country },
        },
      });
      if (error) throw error;
      toast({ title: "Check your email", description: "We've sent a verification link." });
      setMode("signin");
    } catch (err: any) {
      toast({ title: "Sign-up failed", description: handleAuthError(err), variant: "destructive" });
    } finally {
      setSubmitting(false);
      resetTurnstile();
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast({ title: "Enter your email address first", variant: "destructive" }); return; }
    if (!captchaToken) {
      toast({ title: "Please wait for CAPTCHA verification", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?mode=reset`,
        captchaToken,
      });
      if (error) throw error;
      setMode("reset_sent");
    } catch (err: any) {
      toast({ title: "Error", description: handleAuthError(err), variant: "destructive" });
    } finally {
      setSubmitting(false);
      resetTurnstile();
    }
  };

  // ── Shared fields ─────────────────────────────────────────────────────────
  const EmailField = (
    <div className="space-y-1.5">
      <Label htmlFor="email" className="text-sm font-semibold">Email address</Label>
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input id="email" type="email" required autoComplete="email" placeholder="you@example.com"
          className="pl-10 bg-background/50 border-border/60 focus:bg-background transition-colors" value={email} onChange={e => setEmail(e.target.value)} maxLength={255} />
      </div>
    </div>
  );

  const PasswordField = (
    <div className="space-y-1.5">
      <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input id="password" type={showPwd ? "text" : "password"} required autoComplete="current-password"
          placeholder="••••••••" className="pl-10 pr-10 bg-background/50 border-border/60 focus:bg-background transition-colors"
          value={password} onChange={e => setPassword(e.target.value)} minLength={6} />
        <button type="button" onClick={() => setShowPwd(v => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1}>
          {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );

  const TurnstileWidget = (
    <div className="flex justify-center">
      <Turnstile
        ref={turnstileRef}
        siteKey={TURNSTILE_SITE_KEY}
        onSuccess={(token) => setCaptchaToken(token)}
        onError={() => setCaptchaToken(null)}
        onExpire={() => setCaptchaToken(null)}
        options={{ size: "normal", theme: "auto" }}
      />
    </div>
  );

  const modeTitle = mode === "signin" ? "Welcome back" : mode === "signup" ? "Create account" : mode === "forgot" ? "Reset password" : "Check your email";
  const modeSubtitle = mode === "signin" ? "Sign in to your account" : mode === "signup" ? "Register to apply as a Youth Representative" : mode === "forgot" ? "We'll email you a reset link" : "Password reset email sent";

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* ── Left panel: Bold branding ── */}
      <div className="relative lg:w-[45%] xl:w-[50%] bg-gradient-to-br from-primary via-primary/90 to-secondary flex flex-col items-center justify-center p-8 lg:p-16 min-h-[280px] lg:min-h-screen overflow-hidden">
        <FloatingShapes />

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="bg-white backdrop-blur-sm rounded-3xl p-6 lg:p-10 border border-primary-foreground/10">
            <img
              src={ecowasLogo}
              alt="ECOWAS Parliament"
              className="h-24 sm:h-32 lg:h-44 xl:h-52 w-auto drop-shadow-2xl"
            />
          </div>
          <h1 className="mt-6 text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-black text-primary-foreground tracking-tight">
            ECOWAS PARLIAMENT Initiative
          </h1>
          <p className="mt-2 text-sm lg:text-base text-primary-foreground/70 max-w-xs lg:max-w-sm">
            ECOWAS of the Peoples: Peace and Prosperity for All
          </p>

          {/* Decorative line */}
          <div className="mt-6 flex items-center gap-3">
            <div className="h-px w-12 bg-accent/60" />
            <div className="h-2 w-2 rounded-full bg-accent" />
            <div className="h-px w-12 bg-accent/60" />
          </div>
        </div>

        {/* Back link */}
        <Link to="/"
          className="absolute top-4 left-4 lg:top-6 lg:left-6 flex items-center gap-2 text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors z-20">
          <ArrowLeft className="h-4 w-4" /> Back to site
        </Link>
      </div>

      {/* ── Right panel: Auth form ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-16 bg-background relative">
        <div className="w-full max-w-md space-y-6">

          {/* Team mode banner */}
          {teamMode && (
            <div className="rounded-2xl border-2 border-accent/60 bg-accent/5 p-4">
              <div className="flex items-center gap-2 mb-1">
                <Crown className="h-5 w-5 text-accent-foreground" />
                <h2 className="font-bold text-accent-foreground">Team / Staff Login</h2>
              </div>
              <p className="text-xs text-muted-foreground">
                This portal is for authorised team members and administrators only.
                Unauthorised access attempts are logged.
              </p>
            </div>
          )}

          {/* Header */}
          {!teamMode && (
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-foreground">{modeTitle}</h2>
              <p className="text-sm text-muted-foreground mt-1">{modeSubtitle}</p>
            </div>
          )}

          {/* ── Card ── */}
          <div className={`rounded-2xl border p-6 sm:p-8 shadow-lg backdrop-blur-sm ${
            teamMode ? "border-accent/40 bg-card/95" : "border-border bg-card/80"
          }`}>

            {/* Sign in */}
            {mode === "signin" && (
              <form onSubmit={handleSignIn} className="space-y-4">
                {teamMode && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-accent/10 border border-accent/20 mb-2">
                    <ShieldCheck className="h-4 w-4 text-accent-foreground flex-shrink-0" />
                    <p className="text-xs text-muted-foreground font-medium">Staff credential check — all access is recorded.</p>
                  </div>
                )}
                {EmailField}
                {PasswordField}
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-muted-foreground cursor-pointer">
                    <input type="checkbox" className="rounded" /> Remember me
                  </label>
                  <button type="button" onClick={() => setMode("forgot")} className="text-primary hover:underline font-medium">Forgot password?</button>
                </div>
                {TurnstileWidget}
                <Button type="submit" className={`w-full gap-2 h-11 text-sm font-bold ${teamMode ? "bg-accent text-accent-foreground hover:bg-accent/90" : ""}`} disabled={submitting || !captchaToken}>
                  {submitting ? <><span className="animate-spin inline-block">⟳</span> Signing in…</> :
                    <>{teamMode ? <Crown className="h-4 w-4" /> : <Lock className="h-4 w-4" />} Sign in</>}
                </Button>
                {!teamMode && (
                  <p className="text-sm text-center text-muted-foreground">
                    Don't have an account?{" "}
                    <button type="button" onClick={() => setMode("signup")} className="text-primary font-semibold hover:underline">Sign up</button>
                  </p>
                )}
              </form>
            )}

            {/* Sign up */}
            {mode === "signup" && (
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className="text-sm font-semibold">Full name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="fullName" required placeholder="Your full name" className="pl-10 bg-background/50 border-border/60"
                      value={fullName} onChange={e => setFullName(e.target.value)} maxLength={100} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">Country</Label>
                  <Select value={country} onValueChange={setCountry} required>
                    <SelectTrigger className="bg-background/50 border-border/60"><SelectValue placeholder="Select your country" /></SelectTrigger>
                    <SelectContent>
                      {ECOWAS_COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {EmailField}
                {PasswordField}
                <p className="text-xs text-muted-foreground">Password must be at least 6 characters. By registering you agree to our privacy policy.</p>
                {TurnstileWidget}
                <Button type="submit" className="w-full gap-2 h-11 font-bold" disabled={submitting || !captchaToken}>
                  {submitting ? "Creating account…" : "Create account"}
                </Button>
                <p className="text-sm text-center text-muted-foreground">
                  Already have an account?{" "}
                  <button type="button" onClick={() => setMode("signin")} className="text-primary font-semibold hover:underline">Sign in</button>
                </p>
              </form>
            )}

            {/* Forgot password */}
            {mode === "forgot" && (
              <form onSubmit={handleForgot} className="space-y-4">
                <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/20">
                  <KeyRound className="h-4 w-4 text-primary flex-shrink-0" />
                  <p className="text-xs text-muted-foreground">Enter your email address and we'll send a password reset link.</p>
                </div>
                {EmailField}
                {TurnstileWidget}
                <Button type="submit" className="w-full h-11 font-bold" disabled={submitting || !captchaToken}>
                  {submitting ? "Sending…" : "Send reset link"}
                </Button>
                <button type="button" onClick={() => setMode("signin")}
                  className="text-sm text-muted-foreground hover:text-foreground w-full text-center">← Back to sign in</button>
              </form>
            )}

            {/* Reset sent */}
            {mode === "reset_sent" && (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Reset link sent</h3>
                  <p className="text-sm text-muted-foreground mt-1">Check <strong>{email}</strong> for a password reset link. The link expires in 1 hour.</p>
                </div>
                <Button variant="outline" onClick={() => setMode("signin")} className="w-full">Back to sign in</Button>
              </div>
            )}
          </div>

          {/* Team switcher */}
          <div className="text-center">
            {!teamMode ? (
              <button onClick={() => { setTeamMode(true); setMode("signin"); }}
                className="text-xs text-muted-foreground hover:text-accent-foreground flex items-center gap-1.5 mx-auto transition-colors">
                <Crown className="h-3.5 w-3.5" /> Team / staff portal
              </button>
            ) : (
              <button onClick={() => { setTeamMode(false); setMode("signin"); }}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 mx-auto">
                <User className="h-3.5 w-3.5" /> Switch to public sign-in
              </button>
            )}
          </div>

          {/* Team mode security note */}
          {teamMode && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-muted/50 border border-border">
              <AlertCircle className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                Team members are invited by the Super Administrator. If you haven't received
                an invitation email, contact{" "}
                <a href="mailto:admin@ecowasparliament25.org" className="text-primary underline">admin@ecowasparliament25.org</a>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
