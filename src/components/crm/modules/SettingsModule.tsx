import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Settings, Mail, Bell, Shield, Save, Eye, EyeOff,
  CheckCircle2, AlertTriangle, Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

type SettingsTab = "email" | "notifications" | "security";

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ title, icon: Icon, children }: {
  title: string; icon: React.ElementType; children: React.ReactNode;
}) {
  return (
    <div className="bg-crm-card border border-crm-border rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-crm-border">
        <Icon size={13} className="text-crm-text-dim" />
        <h3 className="text-[12px] font-semibold text-crm-text-secondary">{title}</h3>
      </div>
      <div className="p-4 space-y-4">{children}</div>
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-[11px] text-crm-text-dim">{label}</Label>
      {children}
      {hint && <p className="text-[10px] text-crm-text-faint">{hint}</p>}
    </div>
  );
}

const inputCls = "bg-crm-surface border-crm-border text-crm-text text-xs h-8 placeholder:text-crm-text-faint";

// ─── Email settings ───────────────────────────────────────────────────────────
function EmailSettings() {
  const { user } = useAuthContext();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({
    smtp_host:     "",
    smtp_port:     "587",
    smtp_user:     "",
    smtp_password: "",
    smtp_from:     "",
    smtp_from_name: "ECOWAS Parliament 25",
    imap_host:     "",
    imap_port:     "993",
    auto_connect:  true,
  });
  const [saved, setSaved] = useState(false);

  // Load existing settings
  const { isLoading } = useQuery({
    queryKey: ["crm-email-settings"],
    queryFn: async () => {
      const res = await (supabase as any)
        .from("system_settings")
        .select("key, value")
        .in("key", [
          "smtp_host", "smtp_port", "smtp_user", "smtp_password",
          "smtp_from", "smtp_from_name", "imap_host", "imap_port", "auto_connect",
        ]);
      const map: Record<string, string> = {};
      (res.data ?? []).forEach((r: any) => { map[r.key] = r.value; });
      if (Object.keys(map).length > 0) {
        setForm(prev => ({
          smtp_host:      map.smtp_host     ?? prev.smtp_host,
          smtp_port:      map.smtp_port     ?? prev.smtp_port,
          smtp_user:      map.smtp_user     ?? prev.smtp_user,
          smtp_password:  map.smtp_password ?? prev.smtp_password,
          smtp_from:      map.smtp_from     ?? prev.smtp_from,
          smtp_from_name: map.smtp_from_name?? prev.smtp_from_name,
          imap_host:      map.imap_host     ?? prev.imap_host,
          imap_port:      map.imap_port     ?? prev.imap_port,
          auto_connect:   map.auto_connect === "true",
        }));
      }
      return map;
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const upsertRows = Object.entries(form).map(([key, value]) => ({
        key,
        value: String(value),
        updated_by: user!.id,
        updated_at: new Date().toISOString(),
      }));
      await (supabase as any)
        .from("system_settings")
        .upsert(upsertRows, { onConflict: "key" });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm-email-settings"] });
      toast({ title: "Email settings saved" });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
    onError: (err: any) => {
      toast({ title: "Failed to save", description: err.message, variant: "destructive" });
    },
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="w-5 h-5 border-2 border-emerald-700 border-t-emerald-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table-not-found note */}
      <div className="flex items-start gap-2 p-3 bg-amber-950/40 border border-amber-800 rounded-lg">
        <AlertTriangle size={12} className="text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-[10px] text-amber-300 leading-relaxed">
          Settings are stored in a <span className="font-mono">system_settings</span> table{" "}
          (<code className="font-mono">key TEXT PRIMARY KEY, value TEXT, updated_by UUID, updated_at TIMESTAMPTZ</code>).
          Create this table in Supabase if it doesn't exist yet.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* SMTP outbound */}
        <Section title="SMTP — Outbound mail" icon={Mail}>
          <Field label="SMTP host" hint="e.g. smtp.gmail.com or smtp.sendgrid.net">
            <Input value={form.smtp_host} onChange={set("smtp_host")} className={inputCls} placeholder="smtp.example.com" />
          </Field>
          <Field label="SMTP port" hint="587 (TLS) or 465 (SSL)">
            <Input value={form.smtp_port} onChange={set("smtp_port")} className={inputCls} placeholder="587" type="number" />
          </Field>
          <Field label="SMTP username">
            <Input value={form.smtp_user} onChange={set("smtp_user")} className={inputCls} placeholder="noreply@ecowas-parliament.org" />
          </Field>
          <Field label="SMTP password">
            <div className="relative">
              <Input
                type={showPass ? "text" : "password"}
                value={form.smtp_password} onChange={set("smtp_password")}
                className={`${inputCls} pr-8`} placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-crm-text-dim hover:text-crm-text-secondary"
              >
                {showPass ? <EyeOff size={12} /> : <Eye size={12} />}
              </button>
            </div>
          </Field>
          <Field label="From address">
            <Input value={form.smtp_from} onChange={set("smtp_from")} className={inputCls} placeholder="noreply@ecowas-parliament.org" />
          </Field>
          <Field label="From name">
            <Input value={form.smtp_from_name} onChange={set("smtp_from_name")} className={inputCls} placeholder="ECOWAS Parliament 25" />
          </Field>
        </Section>

        {/* IMAP inbound */}
        <Section title="IMAP — Inbound mail" icon={Mail}>
          <Field label="IMAP host" hint="Used to pull emails into the CRM Inbox">
            <Input value={form.imap_host} onChange={set("imap_host")} className={inputCls} placeholder="imap.example.com" />
          </Field>
          <Field label="IMAP port" hint="993 (SSL) or 143 (STARTTLS)">
            <Input value={form.imap_port} onChange={set("imap_port")} className={inputCls} placeholder="993" type="number" />
          </Field>
          <div className="space-y-3 mt-2">
            <div className="flex items-center gap-3">
              <Switch
                checked={form.auto_connect}
                onCheckedChange={v => setForm(prev => ({ ...prev, auto_connect: v }))}
              />
              <div>
                <Label className="text-[11px] text-crm-text">Auto-connect on login</Label>
                <p className="text-[10px] text-crm-text-dim">Super admin is automatically connected to the inbox when they log in</p>
              </div>
            </div>
          </div>

          {/* Save button */}
          <div className="pt-2 border-t border-crm-border">
            <Button
              size="sm"
              onClick={() => save.mutate()}
              disabled={save.isPending}
              className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs gap-1.5"
            >
              {save.isPending ? (
                <Loader2 size={12} className="animate-spin" />
              ) : saved ? (
                <CheckCircle2 size={12} />
              ) : (
                <Save size={12} />
              )}
              {saved ? "Saved!" : "Save email settings"}
            </Button>
          </div>
        </Section>
      </div>
    </div>
  );
}

// ─── Notification settings ────────────────────────────────────────────────────
function NotificationSettings() {
  const { user } = useAuthContext();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [prefs, setPrefs] = useState({
    notify_new_message:  true,
    notify_task_assign:  true,
    notify_event_remind: true,
    notify_app_pending:  true,
    notify_invite_accept:true,
  });

  const { isLoading } = useQuery({
    queryKey: ["crm-notif-settings", user?.id],
    queryFn: async () => {
      const res = await (supabase as any)
        .from("user_notification_prefs")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (res.data) {
        setPrefs({
          notify_new_message:  res.data.notify_new_message  ?? true,
          notify_task_assign:  res.data.notify_task_assign  ?? true,
          notify_event_remind: res.data.notify_event_remind ?? true,
          notify_app_pending:  res.data.notify_app_pending  ?? true,
          notify_invite_accept:res.data.notify_invite_accept?? true,
        });
      }
      return res.data;
    },
    enabled: !!user?.id,
  });

  const save = useMutation({
    mutationFn: async () => {
      await (supabase as any)
        .from("user_notification_prefs")
        .upsert({ user_id: user!.id, ...prefs }, { onConflict: "user_id" });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm-notif-settings"] });
      toast({ title: "Notification preferences saved" });
    },
    onError: (err: any) => {
      toast({ title: "Failed to save", description: err.message, variant: "destructive" });
    },
  });

  const toggle = (k: keyof typeof prefs) => setPrefs(prev => ({ ...prev, [k]: !prev[k] }));

  const items = [
    { key:"notify_new_message"  as const, label:"New message received",       desc:"CRM inbox message or reply sent to you" },
    { key:"notify_task_assign"  as const, label:"Task assigned to me",         desc:"When a task is created or reassigned to you" },
    { key:"notify_event_remind" as const, label:"Upcoming event reminder",     desc:"Events starting in the next 24 hours" },
    { key:"notify_app_pending"  as const, label:"New pending application",     desc:"Parliament application submitted for review" },
    { key:"notify_invite_accept"as const, label:"Invitation accepted",         desc:"Team member accepted your invite" },
  ];

  return (
    <Section title="Notification preferences" icon={Bell}>
      {isLoading ? (
        <div className="flex items-center justify-center h-20">
          <div className="w-5 h-5 border-2 border-emerald-700 border-t-emerald-400 rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {items.map(item => (
            <div key={item.key} className="flex items-start gap-3">
              <Switch checked={prefs[item.key]} onCheckedChange={() => toggle(item.key)} />
              <div>
                <p className="text-[12px] font-medium text-crm-text">{item.label}</p>
                <p className="text-[10px] text-crm-text-dim">{item.desc}</p>
              </div>
            </div>
          ))}
          <div className="pt-2 border-t border-crm-border">
            <Button size="sm" onClick={() => save.mutate()} disabled={save.isPending}
              className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs gap-1.5">
              {save.isPending ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
              Save preferences
            </Button>
          </div>
        </>
      )}
    </Section>
  );
}

// ─── Security settings ────────────────────────────────────────────────────────
function SecuritySettings() {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [sending, setSending]   = useState(false);
  const [newPw, setNewPw]       = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [hasEmailAcct, setHasEmailAcct] = useState(false);

  // Check if user has an email account (Zoho)
  useEffect(() => {
    if (!user?.id) return;
    (supabase as any)
      .from("email_accounts")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single()
      .then(({ data }: any) => setHasEmailAcct(!!data));
  }, [user?.id]);

  // For users with Zoho email: inline change form calling sync-password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw.length < 8) {
      toast({ title: "Too short", description: "Password must be at least 8 characters.", variant: "destructive" });
      return;
    }
    if (newPw !== confirmPw) {
      toast({ title: "Mismatch", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;
      const res = await supabase.functions.invoke("sync-password", {
        body: { newPassword: newPw },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.error) throw new Error(res.error.message);
      const data = res.data as { success?: boolean; error?: string };
      if (data?.error) throw new Error(data.error);
      toast({ title: "Password updated", description: hasEmailAcct ? "Password synced to your email account." : undefined });
      setNewPw(""); setConfirmPw("");
    } catch (err: any) {
      toast({ title: "Failed", description: err.message || "Could not update password.", variant: "destructive" });
    } finally { setSending(false); }
  };

  // For users without Zoho email: send reset link (existing behaviour)
  const sendPasswordReset = async () => {
    if (!user?.email) return;
    setSending(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email);
      if (error) throw error;
      toast({ title: "Password reset email sent", description: `Check ${user.email}` });
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    } finally { setSending(false); }
  };

  return (
    <Section title="Security" icon={Shield}>
      <div className="space-y-3">
        <div className="flex items-center justify-between py-2 border-b border-crm-border">
          <div>
            <p className="text-[12px] font-medium text-crm-text">Email address</p>
            <p className="text-[11px] text-crm-text-muted font-mono">{user?.email}</p>
          </div>
        </div>

        <div className="py-2">
          <p className="text-[12px] font-medium text-crm-text mb-1">Change password</p>
          {hasEmailAcct ? (
            // Inline form — syncs to Zoho
            <form onSubmit={handleChangePassword} className="space-y-2 mt-2">
              <p className="text-[10px] text-crm-text-dim">
                Password change will sync automatically to your <span className="font-mono text-emerald-500">@ecowasparliamentinitiatives.org</span> email account.
              </p>
              <Input
                type="password"
                value={newPw}
                onChange={e => setNewPw(e.target.value)}
                placeholder="New password (min 8 chars)"
                minLength={8}
                className="bg-crm-surface border-crm-border text-crm-text text-xs h-8"
              />
              <Input
                type="password"
                value={confirmPw}
                onChange={e => setConfirmPw(e.target.value)}
                placeholder="Confirm new password"
                className="bg-crm-surface border-crm-border text-crm-text text-xs h-8"
              />
              <Button
                type="submit"
                size="sm"
                disabled={sending || newPw.length < 8 || newPw !== confirmPw}
                className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs gap-1.5 h-7"
              >
                {sending ? <Loader2 size={11} className="animate-spin" /> : <Shield size={11} />}
                {sending ? "Updating…" : "Update Password"}
              </Button>
            </form>
          ) : (
            // No Zoho account — send reset link
            <div className="flex items-center justify-between mt-1">
              <p className="text-[10px] text-crm-text-dim">Send a password reset link to your email</p>
              <Button
                size="sm" variant="outline" onClick={sendPasswordReset} disabled={sending}
                className="border-crm-border text-crm-text-muted hover:text-crm-text-secondary text-xs gap-1.5 h-7"
              >
                {sending ? <Loader2 size={11} className="animate-spin" /> : <Mail size={11} />}
                Send reset link
              </Button>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function SettingsModule() {
  const { isSuperAdmin } = useAuthContext();
  const [tab, setTab] = useState<SettingsTab>("notifications");

  const tabs: { id: SettingsTab; label: string; icon: React.ElementType; superAdminOnly?: boolean }[] = [
    { id:"notifications", label:"Notifications", icon:Bell    },
    { id:"security",      label:"Security",      icon:Shield  },
    { id:"email",         label:"Email Config",  icon:Mail,   superAdminOnly: true },
  ];

  const visibleTabs = tabs.filter(t => !t.superAdminOnly || isSuperAdmin);

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-crm-text">Settings</h2>
        <p className="text-[12px] text-crm-text-muted mt-0.5">
          Manage your notification preferences, security, and system configuration
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 flex-wrap">
        {visibleTabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-medium transition-all ${
              tab === t.id
                ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                : "text-crm-text-muted hover:text-crm-text-secondary hover:bg-crm-surface border border-transparent"
            }`}
          >
            <t.icon size={13} />
            {t.label}
            {t.superAdminOnly && (
              <span className="text-[8px] font-mono text-amber-400 bg-amber-950 border border-amber-800 rounded px-1">SA</span>
            )}
          </button>
        ))}
      </div>

      {tab === "notifications" && <NotificationSettings />}
      {tab === "security"      && <SecuritySettings />}
      {tab === "email"         && isSuperAdmin && <EmailSettings />}
    </div>
  );
}
