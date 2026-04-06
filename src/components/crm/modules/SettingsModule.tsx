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
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const PRESETS = {
    smtp_host: "smtp.zoho.eu", smtp_port: "587",
    imap_host: "imap.zoho.eu", imap_port: "993",
    domain: "@ecowasparliamentinitiatives.org",
  };

  useEffect(() => {
    if (!user?.id) return;
    (supabase as any).from("email_accounts").select("email_address").eq("user_id", user.id).eq("is_active", true).single()
      .then(({ data }: any) => { if (data?.email_address) setEmail(data.email_address); });
  }, [user?.id]);

  const handleSave = async () => {
    if (!email.trim()) return;
    setSaving(true);
    try {
      const { data: existing } = await (supabase as any).from("email_accounts").select("id").eq("user_id", user!.id).eq("is_active", true).single();
      if (existing) await (supabase as any).from("email_accounts").update({ email_address: email.trim() }).eq("id", existing.id);
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
          SMTP/IMAP settings are pre-configured for <span className="font-mono">ecowasparliamentinitiatives.org</span> (Zoho Mail EU).
        </p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Section title="Your Email Account" icon={Mail}>
          <Field label="Email address" hint="Your @ecowasparliamentinitiatives.org address">
            <Input value={email} onChange={e => setEmail(e.target.value)} className={inputCls} placeholder="yourname@ecowasparliamentinitiatives.org" />
          </Field>
          <div className="pt-2 border-t border-crm-border">
            <Button size="sm" onClick={handleSave} disabled={saving} className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs gap-1.5">
              {saving ? <Loader2 size={12} className="animate-spin" /> : saved ? <CheckCircle2 size={12} /> : <Save size={12} />}
              {saved ? "Saved!" : "Save"}
            </Button>
          </div>
        </Section>
        <Section title="Server Configuration (Preset)" icon={Settings}>
          <Field label="SMTP Host"><Input value={PRESETS.smtp_host} readOnly className={readOnlyCls} /></Field>
          <Field label="SMTP Port"><Input value={PRESETS.smtp_port} readOnly className={readOnlyCls} /></Field>
          <Field label="IMAP Host"><Input value={PRESETS.imap_host} readOnly className={readOnlyCls} /></Field>
          <Field label="IMAP Port"><Input value={PRESETS.imap_port} readOnly className={readOnlyCls} /></Field>
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
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [hasEmailAcct, setHasEmailAcct] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    (supabase as any).from("email_accounts").select("id").eq("user_id", user.id).eq("is_active", true).single()
      .then(({ data }: any) => setHasEmailAcct(!!data));
  }, [user?.id]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw.length < 8) { toast({ title: "Too short", variant: "destructive" }); return; }
    if (newPw !== confirmPw) { toast({ title: "Mismatch", variant: "destructive" }); return; }
    setSending(true);
    try {
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
      setNewPw(""); setConfirmPw("");
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
        <form onSubmit={handleChangePassword} className="space-y-2">
          <p className="text-[12px] font-medium text-crm-text">Change password</p>
          <Input type="password" value={newPw} onChange={e => setNewPw(e.target.value)}
            placeholder="New password (min 8 chars)" minLength={8} className={inputCls} />
          <Input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
            placeholder="Confirm new password" className={inputCls} />
          <Button type="submit" size="sm" disabled={sending || newPw.length < 8 || newPw !== confirmPw}
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
          value: JSON.stringify(val),
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
        { key: "site_logo_url", label: "Site Logo URL" },
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
