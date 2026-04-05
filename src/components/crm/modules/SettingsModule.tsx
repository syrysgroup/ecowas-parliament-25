import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Settings, Mail, Bell, Shield, Save, Eye, EyeOff,
  CheckCircle2, AlertTriangle, Loader2, User,
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
const readOnlyCls = `${inputCls} opacity-60 cursor-not-allowed`;

// ─── Email settings (simplified with presets) ─────────────────────────────────
function EmailSettings() {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Preset values for Zoho ecowasparliamentinitiatives.org
  const PRESETS = {
    smtp_host: "smtp.zoho.eu",
    smtp_port: "587",
    imap_host: "imap.zoho.eu",
    imap_port: "993",
    from_name: "ECOWAS Parliament 25",
    domain: "@ecowasparliamentinitiatives.org",
  };

  // Load existing email account
  useEffect(() => {
    if (!user?.id) return;
    (supabase as any)
      .from("email_accounts")
      .select("email_address")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single()
      .then(({ data }: any) => {
        if (data?.email_address) setEmail(data.email_address);
      });
  }, [user?.id]);

  const handleSave = async () => {
    if (!email.trim()) return;
    setSaving(true);
    try {
      const { data: existing } = await (supabase as any)
        .from("email_accounts")
        .select("id")
        .eq("user_id", user!.id)
        .eq("is_active", true)
        .single();

      if (existing) {
        await (supabase as any).from("email_accounts").update({
          email_address: email.trim(),
        }).eq("id", existing.id);
      }
      toast({ title: "Email account saved" });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      toast({ title: "Failed to save", description: err.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 p-3 bg-emerald-950/40 border border-emerald-800 rounded-lg">
        <CheckCircle2 size={12} className="text-emerald-400 flex-shrink-0 mt-0.5" />
        <p className="text-[10px] text-emerald-300 leading-relaxed">
          SMTP/IMAP settings are pre-configured for <span className="font-mono">ecowasparliamentinitiatives.org</span> (Zoho Mail EU). You only need to enter your email address.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Section title="Your Email Account" icon={Mail}>
          <Field label="Email address" hint="Your @ecowasparliamentinitiatives.org address">
            <Input value={email} onChange={e => setEmail(e.target.value)} className={inputCls} placeholder="yourname@ecowasparliamentinitiatives.org" />
          </Field>
          <div className="pt-2 border-t border-crm-border">
            <Button size="sm" onClick={handleSave} disabled={saving}
              className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs gap-1.5">
              {saving ? <Loader2 size={12} className="animate-spin" /> : saved ? <CheckCircle2 size={12} /> : <Save size={12} />}
              {saved ? "Saved!" : "Save email settings"}
            </Button>
          </div>
        </Section>

        <Section title="Server Configuration (Preset)" icon={Settings}>
          <Field label="SMTP Host">
            <Input value={PRESETS.smtp_host} readOnly className={readOnlyCls} />
          </Field>
          <Field label="SMTP Port">
            <Input value={PRESETS.smtp_port} readOnly className={readOnlyCls} />
          </Field>
          <Field label="IMAP Host">
            <Input value={PRESETS.imap_host} readOnly className={readOnlyCls} />
          </Field>
          <Field label="IMAP Port">
            <Input value={PRESETS.imap_port} readOnly className={readOnlyCls} />
          </Field>
        </Section>
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
    notify_new_message:  true,
    notify_task_assign:  true,
    notify_event_remind: true,
    notify_app_pending:  true,
    notify_invite_accept:true,
  });

  // Load notification email from profile
  useEffect(() => {
    if (!user?.id) return;
    (supabase as any)
      .from("profiles")
      .select("notification_email")
      .eq("id", user.id)
      .single()
      .then(({ data }: any) => {
        if (data?.notification_email) setNotificationEmail(data.notification_email);
      });
  }, [user?.id]);

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

  const qc = useQueryClient();
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
    { key:"notify_new_message"  as const, label:"New message received",       desc:"CRM inbox message or reply sent to you" },
    { key:"notify_task_assign"  as const, label:"Task assigned to me",         desc:"When a task is created or reassigned to you" },
    { key:"notify_event_remind" as const, label:"Upcoming event reminder",     desc:"Events starting in the next 24 hours" },
    { key:"notify_app_pending"  as const, label:"New pending application",     desc:"Parliament application submitted for review" },
    { key:"notify_invite_accept"as const, label:"Invitation accepted",         desc:"Team member accepted your invite" },
  ];

  return (
    <div className="space-y-4">
      {/* Personal notification email */}
      <Section title="Personal notification email" icon={User}>
        <Field label="External email for notifications" hint="Receive a copy of CRM notifications to this personal email address">
          <div className="flex gap-2">
            <Input value={notificationEmail} onChange={e => setNotificationEmail(e.target.value)}
              className={`${inputCls} flex-1`} placeholder="your.personal@gmail.com" type="email" />
            <Button size="sm" onClick={saveNotificationEmail} disabled={savingEmail}
              className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs gap-1.5 h-8">
              {savingEmail ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
              Save
            </Button>
          </div>
        </Field>
      </Section>

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
    </div>
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
      if (hasEmailAcct) {
        // Sync to Zoho + Supabase via edge function
        const { data: session } = await supabase.auth.getSession();
        const token = session?.session?.access_token;
        const res = await supabase.functions.invoke("sync-password", {
          body: { newPassword: newPw },
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.error) throw new Error(res.error.message);
        const data = res.data as { success?: boolean; error?: string };
        if (data?.error) throw new Error(data.error);
        toast({ title: "Password updated", description: "Password synced to your email account." });
      } else {
        // Direct Supabase password change
        const { error } = await supabase.auth.updateUser({ password: newPw });
        if (error) throw error;
        toast({ title: "Password updated" });
      }
      setNewPw(""); setConfirmPw("");
    } catch (err: any) {
      toast({ title: "Failed", description: err.message || "Could not update password.", variant: "destructive" });
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
          <form onSubmit={handleChangePassword} className="space-y-2 mt-2">
            {hasEmailAcct && (
              <p className="text-[10px] text-crm-text-dim">
                Password change will sync automatically to your <span className="font-mono text-emerald-500">@ecowasparliamentinitiatives.org</span> email account.
              </p>
            )}
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
      <div>
        <h2 className="text-lg font-bold text-crm-text">Settings</h2>
        <p className="text-[12px] text-crm-text-muted mt-0.5">
          Manage your notification preferences, security, and system configuration
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
      {tab === "security"      && <SecuritySettings />}
      {tab === "email"         && isSuperAdmin && <EmailSettings />}
    </div>
  );
}
