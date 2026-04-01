import { useState, useEffect } from "react";
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
  ShieldCheck, KeyRound, CheckCircle2, AlertCircle,
} from "lucide-react";
import ecowasLogo from "@/assets/ecowas-parliament-logo.png";
import anniversary25Logo from "@/assets/parliament-25-logo.png";

// ─── Types ────────────────────────────────────────────────────────────────────
type AuthMode = "signin" | "signup" | "forgot" | "reset_sent";

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

  // Honour the "from" redirect only if it's a non-privileged path,
  // or the user actually has a role that grants access to privileged paths.
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
  const [teamMode,    setTeamMode]    = useState(false);    // switches to staff login styling

  // ── If already signed in, redirect ────────────────────────────────────────
  useEffect(() => {
    if (!loading && user) {
      getRoleBasedRedirect(user.id, from ?? null).then(path => navigate(path, { replace: true }));
    }
  }, [user, loading, from, navigate]);

  // ── Detect team-mode from query param ─────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("team") === "1") setTeamMode(true);
  }, [location.search]);

  if (loading) return null;

  // ── Submit handlers ────────────────────────────────────────────────────────
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.user) {
        const path = await getRoleBasedRedirect(data.user.id, from ?? null);
        navigate(path, { replace: true });
      }
    } catch (err: any) {
      toast({
        title:       "Sign-in failed",
        description: err.message === "Invalid login credentials"
          ? "Email or password is incorrect."
          : err.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !country) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
          data: { full_name: fullName.trim(), country },
        },
      });
      if (error) throw error;
      toast({
        title: "Check your email",
        description: "We've sent a verification link. Click it to activate your account.",
      });
      setMode("signin");
    } catch (err: any) {
      toast({ title: "Sign-up failed", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({ title: "Enter your email address first", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?mode=reset`,
      });
      if (error) throw error;
      setMode("reset_sent");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Shared field ──────────────────────────────────────────────────────────
  const EmailField = (
    <div>
      <Label htmlFor="email" className="text-sm font-semibold mb-1.5 block">Email address</Label>
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          id="email" type="email" required autoComplete="email"
          placeholder="you@example.com"
          className="pl-10"
          value={email} onChange={e => setEmail(e.target.value)}
          maxLength={255}
        />
      </div>
    </div>
  );

  const PasswordField = (
    <div>
      <Label htmlFor="password" className="text-sm font-semibold mb-1.5 block">Password</Label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          id="password" type={showPwd ? "text" : "password"} required autoComplete="current-password"
          placeholder="••••••••"
          className="pl-10 pr-10"
          value={password} onChange={e => setPassword(e.target.value)}
          minLength={6}
        />
        <button
          type="button"
          onClick={() => setShowPwd(v => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          tabIndex={-1}
        >
          {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background flex flex-col">

      {/* Top nav */}
      <header className="border-b border-border bg-background/80 backdrop-blur px-6 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src={ecowasLogo}        alt="ECOWAS Parliament"  className="h-9 w-auto" />
          <img src={anniversary25Logo} alt="25th Anniversary"  className="h-9 w-auto hidden sm:block" />
        </Link>
        <Button asChild variant="ghost" size="sm" className="gap-2 text-muted-foreground">
          <Link to="/"><ArrowLeft className="h-4 w-4" /> Back to site</Link>
        </Button>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md space-y-4">

          {/* ── Team login toggle ── */}
          {!teamMode ? (
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black">
                  {mode === "signin"     ? "Welcome back"
                  : mode === "signup"    ? "Create account"
                  : mode === "forgot"    ? "Reset password"
                  :                        "Check your email"}
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {mode === "signin"  ? "Sign in to your account" :
                   mode === "signup"  ? "Register to apply as a Youth Representative" :
                   mode === "forgot"  ? "We'll email you a reset link" :
                                        "Password reset email sent"}
                </p>
              </div>
            </div>
          ) : (
            <div className={`rounded-2xl border-2 p-4 ${
              teamMode ? "border-amber-300 bg-amber-50/60" : "border-border"
            }`}>
              <div className="flex items-center gap-2 mb-1">
                <Crown className="h-5 w-5 text-amber-600" />
                <h2 className="font-bold text-amber-900">Team / Staff Login</h2>
              </div>
              <p className="text-xs text-amber-700">
                This portal is for authorised team members and administrators only.
                Unauthorised access attempts are logged.
              </p>
            </div>
          )}

          {/* ── Main card ── */}
          <div className={`rounded-2xl border bg-card shadow-sm p-8 ${
            teamMode ? "border-amber-300" : "border-border"
          }`}>

            {/* ── Sign in ── */}
            {mode === "signin" && (
              <form onSubmit={handleSignIn} className="space-y-4">
                {teamMode && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 mb-4">
                    <ShieldCheck className="h-4 w-4 text-amber-700 flex-shrink-0" />
                    <p className="text-xs text-amber-800 font-medium">
                      Staff credential check — all access is recorded.
                    </p>
                  </div>
                )}
                {EmailField}
                {PasswordField}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                    <input type="checkbox" className="rounded" />
                    Remember me
                  </label>
                  <button
                    type="button"
                    onClick={() => setMode("forgot")}
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <Button
                  type="submit"
                  className={`w-full gap-2 ${teamMode ? "bg-amber-600 hover:bg-amber-700 border-amber-600" : ""}`}
                  disabled={submitting}
                >
                  {submitting ? (
                    <><span className="animate-spin inline-block">⟳</span> Signing in…</>
                  ) : (
                    <>{teamMode ? <Crown className="h-4 w-4" /> : <Lock className="h-4 w-4" />} Sign in</>
                  )}
                </Button>
                {!teamMode && (
                  <p className="text-sm text-center text-muted-foreground">
                    Don't have an account?{" "}
                    <button type="button" onClick={() => setMode("signup")}
                      className="text-primary font-medium hover:underline">
                      Sign up
                    </button>
                  </p>
                )}
              </form>
            )}

            {/* ── Sign up ── */}
            {mode === "signup" && (
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <Label htmlFor="fullName" className="text-sm font-semibold mb-1.5 block">Full name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fullName" required placeholder="Your full name"
                      className="pl-10"
                      value={fullName} onChange={e => setFullName(e.target.value)}
                      maxLength={100}
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-semibold mb-1.5 block">Country</Label>
                  <Select value={country} onValueChange={setCountry} required>
                    <SelectTrigger><SelectValue placeholder="Select your country" /></SelectTrigger>
                    <SelectContent>
                      {ECOWAS_COUNTRIES.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {EmailField}
                {PasswordField}
                <p className="text-xs text-muted-foreground">
                  Password must be at least 6 characters. By registering you agree to our privacy policy.
                </p>
                <Button type="submit" className="w-full gap-2" disabled={submitting}>
                  {submitting ? "Creating account…" : "Create account"}
                </Button>
                <p className="text-sm text-center text-muted-foreground">
                  Already have an account?{" "}
                  <button type="button" onClick={() => setMode("signin")}
                    className="text-primary font-medium hover:underline">
                    Sign in
                  </button>
                </p>
              </form>
            )}

            {/* ── Forgot password ── */}
            {mode === "forgot" && (
              <form onSubmit={handleForgot} className="space-y-4">
                <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-50 border border-blue-200">
                  <KeyRound className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <p className="text-xs text-blue-800">
                    Enter your email address and we'll send a password reset link.
                  </p>
                </div>
                {EmailField}
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Sending…" : "Send reset link"}
                </Button>
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className="text-sm text-muted-foreground hover:text-foreground w-full text-center"
                >
                  ← Back to sign in
                </button>
              </form>
            )}

            {/* ── Reset email sent ── */}
            {mode === "reset_sent" && (
              <div className="text-center py-4 space-y-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Reset link sent</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Check <strong>{email}</strong> for a password reset link.
                    The link expires in 1 hour.
                  </p>
                </div>
                <Button variant="outline" onClick={() => setMode("signin")} className="w-full">
                  Back to sign in
                </Button>
              </div>
            )}
          </div>

          {/* ── Team / staff switcher ── */}
          <div className="text-center">
            {!teamMode ? (
              <button
                onClick={() => { setTeamMode(true); setMode("signin"); }}
                className="text-xs text-muted-foreground hover:text-amber-700 flex items-center gap-1.5 mx-auto transition-colors"
              >
                <Crown className="h-3.5 w-3.5" />
                Team / staff portal
              </button>
            ) : (
              <button
                onClick={() => { setTeamMode(false); setMode("signin"); }}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 mx-auto"
              >
                <User className="h-3.5 w-3.5" />
                Switch to public sign-in
              </button>
            )}
          </div>

          {/* ── Security note for team mode ── */}
          {teamMode && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-muted/50 border border-border">
              <AlertCircle className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                Team members are invited by the Super Administrator. If you haven't received
                an invitation email, contact{" "}
                <a href="mailto:admin@ecowasparliament25.org" className="text-primary underline">
                  admin@ecowasparliament25.org
                </a>.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
