import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Settings, Mail, Bell, Shield, Save, Eye, EyeOff,
  CheckCircle2, AlertTriangle, Loader2, User, Lock, Globe,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import ImageUploadOrUrl from "@/components/shared/ImageUploadOrUrl";
import { LOGO_RECOMMENDED, FAVICON_RECOMMENDED } from "@/lib/constants";

type SettingsTab = "email" | "notifications" | "security" | "permissions" | "site_settings";

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
const readOnlyCls = `${inputCls} opacity-60 cursor-not-allowed`;

// ─── Email settings ───────────────────────────────────────────────────────────
function EmailSettings() {
  const { user, roles } = useAuthContext();
  const { toast } = useToast();
  const qc = useQueryClient();
  const isSuperAdmin = roles.includes("super_admin" as any);

  // User's email credentials
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [testing, setTesting] = useState(false);
  // Status: "none" | "connected" | "failed" | "unknown"
  const [connectionStatus, setConnectionStatus] = useState<"none" | "connected" | "failed" | "unknown">("none");

  // Global server config state
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("587");
  const [imapHost, setImapHost] = useState("");
  const [imapPort, setImapPort] = useState("993");
  const [sslEnabled, setSslEnabled] = useState(true);
  const [serverSaving, setServerSaving] = useState(false);

  // Load existing account
  useEffect(() => {
    if (!user?.id) return;
    (supabase as any).from("email_accounts").select("email_address").eq("user_id", user.id).eq("is_active", true).single()
      .then(({ data }: any) => {
        if (data?.email_address) {
          setEmail(data.email_address);
          setConnectionStatus("unknown"); // has account but not tested this session
        }
      });
  }, [user?.id]);

  const { data: smtpConfig } = useQuery({
    queryKey: ["site-settings-smtp"],
    queryFn: async () => {
      const { data } = await (supabase as any).from("site_settings").select("value").eq("key", "smtp").single();
      return (data?.value as Record<string, any>) ?? {};
    },
  });

  useEffect(() => {
    if (!smtpConfig || !Object.keys(smtpConfig).length) return;
    setSmtpHost(smtpConfig.host ?? "");
    setSmtpPort(String(smtpConfig.port ?? 587));
    setImapHost(smtpConfig.imap_host ?? "");
    setImapPort(String(smtpConfig.imap_port ?? 993));
    setSslEnabled(smtpConfig.ssl_enabled !== false);
  }, [smtpConfig]);

  const handleConnect = async () => {
    if (!email.trim() || !password.trim()) {
      toast({ title: "Enter both email and password", variant: "destructive" });
      return;
    }
    setConnecting(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("validate-email-credentials", {
        body: { email: email.trim(), password },
        headers: { Authorization: `Bearer ${session?.session?.access_token}` },
      });
      if (res.error) throw new Error(res.error.message);
      const result = res.data as { valid: boolean; error?: string };
      if (result.valid) {
        setConnectionStatus("connected");
        setPassword("");
        toast({ title: "Email connected successfully" });
      } else {
        setConnectionStatus("failed");
        toast({ title: "Connection failed", description: result.error || "Invalid credentials", variant: "destructive" });
      }
    } catch (err: any) {
      setConnectionStatus("failed");
      toast({ title: "Connection failed", description: err.message, variant: "destructive" });
    } finally { setConnecting(false); }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("validate-email-credentials", {
        body: { checkStored: true },
        headers: { Authorization: `Bearer ${session?.session?.access_token}` },
      });
      if (res.error) throw new Error(res.error.message);
      const result = res.data as { valid: boolean; error?: string };
      if (result.valid) {
        setConnectionStatus("connected");
        toast({ title: "Connection verified" });
      } else {
        setConnectionStatus("failed");
        toast({ title: "Connection failed", description: result.error || "Stored credentials invalid", variant: "destructive" });
      }
    } catch (err: any) {
      setConnectionStatus("failed");
      toast({ title: "Test failed", description: err.message, variant: "destructive" });
    } finally { setTesting(false); }
  };

  const handleServerSave = async () => {
    setServerSaving(true);
    try {
      const value = {
        host: smtpHost, port: Number(smtpPort),
        imap_host: imapHost, imap_port: Number(imapPort),
        ssl_enabled: sslEnabled,
      };
      const { data: existing } = await (supabase as any).from("site_settings").select("id").eq("key", "smtp").single();
      if (existing) {
        await (supabase as any).from("site_settings").update({ value, updated_by: user!.id, updated_at: new Date().toISOString() }).eq("key", "smtp");
      } else {
        await (supabase as any).from("site_settings").insert({ key: "smtp", value, updated_by: user!.id });
      }
      qc.invalidateQueries({ queryKey: ["site-settings-smtp"] });
      toast({ title: "Server configuration saved and applied to all users" });
    } catch (err: any) {
      toast({ title: "Failed to save", description: err.message, variant: "destructive" });
    } finally { setServerSaving(false); }
  };

  const statusDot = connectionStatus === "connected"
    ? "bg-emerald-400" : connectionStatus === "failed"
    ? "bg-red-400" : connectionStatus === "unknown"
    ? "bg-amber-400" : "bg-crm-text-dim";

  const statusLabel = connectionStatus === "connected"
    ? "Connected" : connectionStatus === "failed"
    ? "Not connected" : connectionStatus === "unknown"
    ? "Not verified" : "No account";

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <Section title="Your Email Account" icon={Mail}>
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-2.5 h-2.5 rounded-full ${statusDot}`} />
            <span className="text-[11px] text-crm-text-dim font-medium">{statusLabel}</span>
          </div>
          <Field label="Email address" hint="Your Zoho email address">
            <Input value={email} onChange={e => setEmail(e.target.value)} className={inputCls} placeholder="yourname@domain.org" />
          </Field>
          <Field label="Password" hint="Leave blank if already connected">
            <div className="relative">
              <Input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className={`${inputCls} pr-8`}
                placeholder="Enter password to connect"
              />
              <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-crm-text-dim" onClick={() => setShowPw(!showPw)}>
                {showPw ? <EyeOff size={12} /> : <Eye size={12} />}
              </button>
            </div>
          </Field>
          <div className="pt-2 border-t border-crm-border flex gap-2">
            <Button size="sm" onClick={handleConnect} disabled={connecting || !email.trim() || !password.trim()} className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs gap-1.5">
              {connecting ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
              {connecting ? "Connecting…" : "Connect"}
            </Button>
            {connectionStatus !== "none" && (
              <Button size="sm" variant="outline" onClick={handleTestConnection} disabled={testing} className="text-xs gap-1.5 border-crm-border text-crm-text-secondary">
                {testing ? <Loader2 size={12} className="animate-spin" /> : <AlertTriangle size={12} />}
                Test
              </Button>
            )}
          </div>
        </Section>

        {isSuperAdmin && (
          <Section title="Server Configuration" icon={Settings}>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Field label="SMTP Host">
                  <Input value={smtpHost} onChange={e => setSmtpHost(e.target.value)} className={inputCls} placeholder="smtppro.zoho.eu" />
                </Field>
                <Field label="SMTP Port">
                  <Input type="number" value={smtpPort} onChange={e => setSmtpPort(e.target.value)} className={inputCls} placeholder="465" />
                </Field>
                <Field label="IMAP Host">
                  <Input value={imapHost} onChange={e => setImapHost(e.target.value)} className={inputCls} placeholder="imappro.zoho.eu" />
                </Field>
                <Field label="IMAP Port">
                  <Input type="number" value={imapPort} onChange={e => setImapPort(e.target.value)} className={inputCls} placeholder="993" />
                </Field>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <Switch checked={sslEnabled} onCheckedChange={setSslEnabled} className="data-[state=checked]:bg-emerald-600" />
                <div>
                  <p className="text-[11px] font-medium text-crm-text">Require SSL / TLS</p>
                  <p className="text-[10px] text-crm-text-dim">{sslEnabled ? "SSL enabled (port 465 / STARTTLS on 587)" : "SSL disabled"}</p>
                </div>
              </div>
              <div className="pt-2 border-t border-crm-border flex gap-2">
                <Button size="sm" onClick={handleServerSave} disabled={serverSaving}
                  className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs gap-1.5">
                  {serverSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                  {serverSaving ? "Saving…" : "Save Server Config"}
                </Button>
                <Button size="sm" variant="outline" onClick={handleTestConnection} disabled={testing}
                  className="text-xs gap-1.5 border-crm-border text-crm-text-secondary">
                  {testing ? <Loader2 size={12} className="animate-spin" /> : <AlertTriangle size={12} />}
                  Test Connection
                </Button>
              </div>
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}

// ─── Notification settings ────────────────────────────────────────────────────
function NotificationSettings() {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [notificationEmail, setNotificationEmail] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);
  const [prefs, setPrefs] = useState({
    notify_new_message: true, notify_task_assign: true,
    notify_event_remind: true, notify_app_pending: true, notify_invite_accept: true,
  });

  useEffect(() => {
    if (!user?.id) return;
    (supabase as any).from("profiles").select("notification_email").eq("id", user.id).single()
      .then(({ data }: any) => { if (data?.notification_email) setNotificationEmail(data.notification_email); });
  }, [user?.id]);

  const { isLoading } = useQuery({
    queryKey: ["crm-notif-settings", user?.id],
    queryFn: async () => {
      const res = await (supabase as any).from("user_notification_prefs").select("*").eq("user_id", user!.id).maybeSingle();
      if (res.data) setPrefs({
        notify_new_message: res.data.notify_new_message ?? true,
        notify_task_assign: res.data.notify_task_assign ?? true,
        notify_event_remind: res.data.notify_event_remind ?? true,
        notify_app_pending: res.data.notify_app_pending ?? true,
        notify_invite_accept: res.data.notify_invite_accept ?? true,
      });
      return res.data;
    },
    enabled: !!user?.id,
  });

  const qc = useQueryClient();
  const save = useMutation({
    mutationFn: async () => {
      await (supabase as any).from("user_notification_prefs").upsert({ user_id: user!.id, ...prefs }, { onConflict: "user_id" });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["crm-notif-settings"] }); toast({ title: "Preferences saved" }); },
    onError: (err: any) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
  });

  const saveNotificationEmail = async () => {
    setSavingEmail(true);
    try {
      await (supabase as any).from("profiles").update({ notification_email: notificationEmail.trim() || null }).eq("id", user!.id);
      toast({ title: "Notification email saved" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally { setSavingEmail(false); }
  };

  const toggle = (k: keyof typeof prefs) => setPrefs(prev => ({ ...prev, [k]: !prev[k] }));
  const items = [
    { key: "notify_new_message" as const, label: "New message received", desc: "CRM inbox message or reply" },
    { key: "notify_task_assign" as const, label: "Task assigned to me", desc: "When a task is created or reassigned" },
    { key: "notify_event_remind" as const, label: "Upcoming event reminder", desc: "Events starting in 24 hours" },
    { key: "notify_app_pending" as const, label: "New pending application", desc: "Application submitted for review" },
    { key: "notify_invite_accept" as const, label: "Invitation accepted", desc: "Team member accepted invite" },
  ];

  return (
    <div className="space-y-4">
      <Section title="Personal notification email" icon={User}>
        <Field label="External email for notifications" hint="Receive CRM notifications to this personal email">
          <div className="flex gap-2">
            <Input value={notificationEmail} onChange={e => setNotificationEmail(e.target.value)}
              className={`${inputCls} flex-1`} placeholder="your.personal@gmail.com" type="email" />
            <Button size="sm" onClick={saveNotificationEmail} disabled={savingEmail}
              className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs gap-1.5 h-8">
              {savingEmail ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save
            </Button>
          </div>
        </Field>
      </Section>
      <Section title="Notification preferences" icon={Bell}>
        {isLoading ? (
          <div className="flex justify-center h-20"><div className="w-5 h-5 border-2 border-emerald-700 border-t-emerald-400 rounded-full animate-spin" /></div>
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
                {save.isPending ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save
              </Button>
            </div>
          </>
        )}
      </Section>
    </div>
  );
}

// ─── Security settings ────────────────────────────────────────────────────────
function SecuritySettings() {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [sending, setSending] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [hasEmailAcct, setHasEmailAcct] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailSending, setEmailSending] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    (supabase as any).from("email_accounts").select("id").eq("user_id", user.id).eq("is_active", true).single()
      .then(({ data }: any) => setHasEmailAcct(!!data));
  }, [user?.id]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPw) { toast({ title: "Current password required", variant: "destructive" }); return; }
    if (newPw.length < 8) { toast({ title: "Too short", variant: "destructive" }); return; }
    if (newPw !== confirmPw) { toast({ title: "Passwords do not match", variant: "destructive" }); return; }
    setSending(true);
    try {
      // Re-authenticate with current password to get a fresh session
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email: user!.email!, password: currentPw });
      if (signInErr) throw new Error("Current password is incorrect");

      if (hasEmailAcct) {
        const { data: session } = await supabase.auth.getSession();
        const res = await supabase.functions.invoke("sync-password", {
          body: { newPassword: newPw },
          headers: { Authorization: `Bearer ${session?.session?.access_token}` },
        });
        if (res.error) throw new Error(res.error.message);
        toast({ title: "Password updated & synced" });
      } else {
        const { error } = await supabase.auth.updateUser({ password: newPw });
        if (error) throw error;
        toast({ title: "Password updated" });
      }
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    } finally { setSending(false); }
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newEmail.includes("@")) {
      toast({ title: "Enter a valid email address", variant: "destructive" });
      return;
    }
    setEmailSending(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
      if (error) throw error;
      toast({ title: "Confirmation sent", description: "Check both your old and new inbox to confirm the change." });
      setNewEmail("");
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    } finally { setEmailSending(false); }
  };

  return (
    <Section title="Security" icon={Shield}>
      <div className="space-y-4">
        <div className="flex items-center justify-between py-2 border-b border-crm-border">
          <div>
            <p className="text-[12px] font-medium text-crm-text">Current email address</p>
            <p className="text-[11px] text-crm-text-muted font-mono">{user?.email}</p>
          </div>
        </div>

        {/* Change Email */}
        <form onSubmit={handleChangeEmail} className="space-y-2">
          <p className="text-[12px] font-medium text-crm-text">Change email address</p>
          <Input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)}
            placeholder="New email address" className={inputCls} />
          <p className="text-[10px] text-crm-text-faint">A confirmation link will be sent to the new address.</p>
          <Button type="submit" size="sm" disabled={emailSending || !newEmail.trim()}
            className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs gap-1.5 h-7">
            {emailSending ? <Loader2 size={11} className="animate-spin" /> : <Mail size={11} />}
            {emailSending ? "Sending…" : "Update Email"}
          </Button>
        </form>

        <div className="border-t border-crm-border pt-3" />

        {/* Change Password */}
        <form onSubmit={handleChangePassword} className="space-y-2">
          <p className="text-[12px] font-medium text-crm-text">Change password</p>
          <Input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)}
            placeholder="Current password" className={inputCls} />
          <Input type="password" value={newPw} onChange={e => setNewPw(e.target.value)}
            placeholder="New password (min 8 chars)" minLength={8} className={inputCls} />
          <Input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
            placeholder="Confirm new password" className={inputCls} />
          <Button type="submit" size="sm" disabled={sending || !currentPw || newPw.length < 8 || newPw !== confirmPw}
            className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs gap-1.5 h-7">
            {sending ? <Loader2 size={11} className="animate-spin" /> : <Shield size={11} />}
            {sending ? "Updating…" : "Update Password"}
          </Button>
        </form>
      </div>
    </Section>
  );
}

// ─── Permission Manager ───────────────────────────────────────────────────────
const MODULES = [
  "dashboard", "people", "events", "news", "sponsors",
  "site_content", "media_library", "settings", "analytics", "contacts", "newsletter",
];
const ROLES = ["admin", "moderator", "sponsor"] as const;
const ACTIONS = ["can_view", "can_create", "can_edit", "can_delete"] as const;

function PermissionManager() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [perms, setPerms] = useState<Record<string, Record<string, boolean>>>({});
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["all-role-permissions"],
    queryFn: async () => {
      const { data } = await (supabase as any).from("role_permissions").select("*");
      return data ?? [];
    },
  });

  useEffect(() => {
    if (!data) return;
    const map: Record<string, Record<string, boolean>> = {};
    (data as any[]).forEach(row => {
      const key = `${row.role}:${row.module}`;
      map[key] = {
        can_view: row.can_view, can_create: row.can_create,
        can_edit: row.can_edit, can_delete: row.can_delete,
      };
    });
    setPerms(map);
  }, [data]);

  const toggle = (role: string, module: string, action: string) => {
    const key = `${role}:${module}`;
    setPerms(prev => ({
      ...prev,
      [key]: { ...(prev[key] || { can_view: false, can_create: false, can_edit: false, can_delete: false }), [action]: !(prev[key]?.[action] ?? false) },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const upserts: any[] = [];
      for (const role of ROLES) {
        for (const module of MODULES) {
          const key = `${role}:${module}`;
          const p = perms[key] || { can_view: false, can_create: false, can_edit: false, can_delete: false };
          upserts.push({
            role, module,
            can_view: p.can_view ?? false, can_create: p.can_create ?? false,
            can_edit: p.can_edit ?? false, can_delete: p.can_delete ?? false,
          });
        }
      }
      // Delete existing and re-insert for these roles
      for (const role of ROLES) {
        await (supabase as any).from("role_permissions").delete().eq("role", role);
      }
      await (supabase as any).from("role_permissions").insert(upserts);
      qc.invalidateQueries({ queryKey: ["all-role-permissions"] });
      qc.invalidateQueries({ queryKey: ["role-permissions"] });
      toast({ title: "Permissions saved" });
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  if (isLoading) return <div className="flex justify-center py-8"><div className="w-5 h-5 border-2 border-emerald-700 border-t-emerald-400 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 p-3 bg-amber-950/40 border border-amber-800 rounded-lg">
        <AlertTriangle size={12} className="text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-[10px] text-amber-300 leading-relaxed">
          Super Admin always has full access. Configure permissions for Admin, Moderator, and Sponsor roles below.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[10px]">
          <thead>
            <tr className="border-b border-crm-border">
              <th className="text-left py-2 px-2 text-crm-text-dim font-semibold">Module</th>
              {ROLES.map(role => (
                <th key={role} colSpan={4} className="text-center py-2 px-1 text-crm-text-dim font-semibold capitalize">{role}</th>
              ))}
            </tr>
            <tr className="border-b border-crm-border">
              <th></th>
              {ROLES.map(role => ACTIONS.map(action => (
                <th key={`${role}-${action}`} className="text-center py-1 px-0.5 text-crm-text-faint text-[8px]">
                  {action.replace("can_", "").charAt(0).toUpperCase() + action.replace("can_", "").slice(1)}
                </th>
              )))}
            </tr>
          </thead>
          <tbody>
            {MODULES.map(module => (
              <tr key={module} className="border-b border-crm-border/50 hover:bg-crm-surface/50">
                <td className="py-2 px-2 text-crm-text font-medium capitalize">{module.replace("_", " ")}</td>
                {ROLES.map(role => ACTIONS.map(action => {
                  const key = `${role}:${module}`;
                  const checked = perms[key]?.[action] ?? false;
                  return (
                    <td key={`${role}-${module}-${action}`} className="text-center py-2 px-0.5">
                      <Checkbox checked={checked} onCheckedChange={() => toggle(role, module, action)} className="h-3.5 w-3.5" />
                    </td>
                  );
                }))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Button size="sm" onClick={handleSave} disabled={saving}
        className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs gap-1.5">
        {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save Permissions
      </Button>
    </div>
  );
}

// ─── Site Settings ────────────────────────────────────────────────────────────
function SiteSettingsPanel() {
  const { toast } = useToast();
  const { user } = useAuthContext();
  const qc = useQueryClient();
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["site-settings-admin"],
    queryFn: async () => {
      const { data } = await (supabase as any).from("site_settings").select("*");
      return data ?? [];
    },
  });

  useEffect(() => {
    if (!data) return;
    const map: Record<string, string> = {};
    (data as any[]).forEach(row => {
      const val = row.value;
      map[row.key] = typeof val === "string" ? val : JSON.stringify(val).replace(/^"|"$/g, "");
    });
    setValues(map);
  }, [data]);

  const update = (key: string, val: string) => setValues(prev => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const [key, val] of Object.entries(values)) {
        await (supabase as any).from("site_settings").update({
          value: val,
          updated_at: new Date().toISOString(),
          updated_by: user!.id,
        }).eq("key", key);
      }
      qc.invalidateQueries({ queryKey: ["site-settings"] });
      qc.invalidateQueries({ queryKey: ["site-settings-admin"] });
      toast({ title: "Site settings saved" });
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  if (isLoading) return <div className="flex justify-center py-8"><div className="w-5 h-5 border-2 border-emerald-700 border-t-emerald-400 rounded-full animate-spin" /></div>;

  const groups = [
    {
      title: "General", icon: Globe,
      fields: [
        { key: "site_name", label: "Site Name" },
        { key: "contact_email", label: "Contact Email" },
      ],
    },
    {
      title: "Social Links", icon: Globe,
      fields: [
        { key: "social_facebook", label: "Facebook" },
        { key: "social_twitter", label: "Twitter / X" },
        { key: "social_instagram", label: "Instagram" },
        { key: "social_linkedin", label: "LinkedIn" },
        { key: "social_youtube", label: "YouTube" },
      ],
    },
    {
      title: "Footer", icon: Globe,
      fields: [
        { key: "footer_text", label: "Footer Copyright Text" },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      {/* Logo & Favicon */}
      <Section title="Branding" icon={Globe}>
        <Field label={`Site Logo — recommended ${LOGO_RECOMMENDED.display}`}>
          <ImageUploadOrUrl
            value={values["site_logo_url"] || ""}
            onChange={url => update("site_logo_url", url)}
            bucket="public"
            pathPrefix="branding/logo/"
            previewClassName="h-12 w-auto object-contain rounded border border-crm-border p-1 bg-crm-surface"
          />
        </Field>
        <Field label={`Favicon URL — recommended ${FAVICON_RECOMMENDED.size}×${FAVICON_RECOMMENDED.size}px`}>
          <ImageUploadOrUrl
            value={values["site_favicon_url"] || ""}
            onChange={url => update("site_favicon_url", url)}
            bucket="public"
            pathPrefix="branding/favicon/"
            previewClassName="h-8 w-8 object-contain rounded border border-crm-border p-0.5 bg-crm-surface"
          />
        </Field>
      </Section>

      {groups.map(group => (
        <Section key={group.title} title={group.title} icon={group.icon}>
          {group.fields.map(field => (
            <Field key={field.key} label={field.label}>
              <Input value={values[field.key] || ""} onChange={e => update(field.key, e.target.value)} className={inputCls} />
            </Field>
          ))}
        </Section>
      ))}
      <Button size="sm" onClick={handleSave} disabled={saving}
        className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs gap-1.5">
        {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save Site Settings
      </Button>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function SettingsModule() {
  const { isSuperAdmin } = useAuthContext();
  const [tab, setTab] = useState<SettingsTab>("notifications");

  const tabs: { id: SettingsTab; label: string; icon: React.ElementType; superAdminOnly?: boolean }[] = [
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "email", label: "Email Config", icon: Mail, superAdminOnly: true },
    { id: "permissions", label: "Permissions", icon: Lock, superAdminOnly: true },
    { id: "site_settings", label: "Site Settings", icon: Globe, superAdminOnly: true },
  ];

  const visibleTabs = tabs.filter(t => !t.superAdminOnly || isSuperAdmin);

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h2 className="text-lg font-bold text-crm-text">Settings</h2>
        <p className="text-[12px] text-crm-text-muted mt-0.5">
          Manage notifications, security, permissions, and site configuration
        </p>
      </div>

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
      {tab === "security" && <SecuritySettings />}
      {tab === "email" && isSuperAdmin && <EmailSettings />}
      {tab === "permissions" && isSuperAdmin && <PermissionManager />}
      {tab === "site_settings" && isSuperAdmin && <SiteSettingsPanel />}
    </div>
  );
}
