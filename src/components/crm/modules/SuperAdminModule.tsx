import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import type { AppRole } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Crown, ShieldCheck, Eye, Handshake, Users, Mail, Send, Loader2,
  RefreshCw, Settings, Activity, Globe, Lock, Clock, UserPlus, Download,
  Trash2, CheckCircle2, AlertTriangle, LayoutDashboard,
  FileText, Star, Calendar, Newspaper, ChevronRight, Palette, Upload, Save,
  Link2, Twitter, Facebook, Instagram, Linkedin, Youtube,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface UserWithRoles {
  id: string; email: string; full_name: string;
  country: string; created_at: string; roles: AppRole[];
  show_on_website: boolean; title: string | null; organisation: string | null;
}
interface Invitation {
  id: string; email: string; role: AppRole;
  invited_by: string; created_at: string; accepted_at: string | null;
  expires_at: string | null; resent_at: string | null;
}
interface ActivityLog {
  id: string; action: string; entity_type: string;
  details: any; created_at: string;
  actor?: { full_name: string; email: string };
}

type Tab = "overview" | "users" | "invitations" | "activity" | "routes" | "settings" | "email-config" | "branding";

// ─── Role config ──────────────────────────────────────────────────────────────
const ROLE_CONFIG: Partial<Record<AppRole, {
  label: string; icon: React.ElementType; badge: string; desc: string;
}>> = {
  super_admin:          { label:"Super Admin",          icon:Crown,    badge:"text-amber-400 bg-amber-950 border-amber-800",     desc:"Full system access — manages users, roles, all content, and system configuration." },
  admin:                { label:"Admin",                icon:ShieldCheck, badge:"text-emerald-400 bg-emerald-950 border-emerald-800", desc:"Manages content, applications, nominations, representatives, and event registrations." },
  moderator:            { label:"Moderator",            icon:Eye,      badge:"text-blue-400 bg-blue-950 border-blue-800",         desc:"Reviews applications, verifies nominees, publishes delegate profiles." },
  sponsor:              { label:"Sponsor",              icon:Handshake,badge:"text-violet-400 bg-violet-950 border-violet-800",   desc:"Access to Sponsor Dashboard — visibility metrics, event placements, impact reports." },
  project_director:     { label:"Project Director",     icon:ShieldCheck, badge:"text-sky-400 bg-sky-950 border-sky-800",           desc:"Full programme oversight — all tasks, calendar, sponsor data, and financials (view)." },
  programme_lead:       { label:"Programme Lead",       icon:Users,    badge:"text-teal-400 bg-teal-950 border-teal-800",         desc:"Manages tasks and calendar for their assigned programme pillar." },
  website_editor:       { label:"Website Editor",       icon:Globe,    badge:"text-orange-400 bg-orange-950 border-orange-800",   desc:"Edits website pages via CMS Editor; content goes through review workflow." },
  marketing_manager:    { label:"Marketing Manager",    icon:Send,     badge:"text-rose-400 bg-rose-950 border-rose-800",         desc:"Manages campaigns, email broadcasts, newsletter, and marketing analytics." },
  communications_officer:{ label:"Communications Officer", icon:Mail,  badge:"text-purple-400 bg-purple-950 border-purple-800",  desc:"Handles press releases, translations, and external communications." },
  finance_coordinator:  { label:"Finance Coordinator",  icon:Activity, badge:"text-yellow-400 bg-yellow-950 border-yellow-800",  desc:"Manages budget, invoices, reconciliation reports, and document signing." },
  logistics_coordinator:{ label:"Logistics Coordinator",icon:Settings, badge:"text-cyan-400 bg-cyan-950 border-cyan-800",        desc:"Coordinates 15-country delegation logistics, events, and task assignments." },
  sponsor_manager:      { label:"Sponsor Manager",      icon:Handshake,badge:"text-amber-400 bg-amber-950 border-amber-800",     desc:"Manages all sponsor and partner relationships, metrics, and documents." },
  consultant:           { label:"Consultant",           icon:Clock,    badge:"text-slate-400 bg-slate-900 border-slate-700",      desc:"Time-limited access to assigned tasks and linked documents only. Auto-expires." },
};

// ─── Routes map ───────────────────────────────────────────────────────────────
const ROUTES = [
  { path:"/",                    label:"Home",                       access:"public",      icon:Globe      },
  { path:"/about",               label:"About the Programme",        access:"public",      icon:FileText   },
  { path:"/timeline",            label:"Timeline",                   access:"public",      icon:Clock      },
  { path:"/news",                label:"News",                       access:"public",      icon:Newspaper  },
  { path:"/documents",           label:"Documents",                  access:"public",      icon:FileText   },
  { path:"/events",              label:"Events & RSVP",              access:"public",      icon:Calendar   },
  { path:"/stakeholders",        label:"Stakeholders",               access:"public",      icon:Users      },
  { path:"/team",                label:"Team",                       access:"public",      icon:Users      },
  { path:"/contact",             label:"Contact",                    access:"public",      icon:Mail       },
  { path:"/media-kit",           label:"Media Kit",                  access:"public",      icon:FileText   },
  { path:"/sponsors",            label:"Sponsor Portal (public)",    access:"public",      icon:Star       },
  { path:"/programmes/youth",    label:"Youth Innovation",           access:"public",      icon:Globe      },
  { path:"/programmes/trade",    label:"Trade & SME",                access:"public",      icon:Globe      },
  { path:"/programmes/women",    label:"Women's Empowerment",        access:"public",      icon:Globe      },
  { path:"/programmes/civic",    label:"Civic Education",            access:"public",      icon:Globe      },
  { path:"/programmes/culture",  label:"Culture & Creativity",       access:"public",      icon:Globe      },
  { path:"/programmes/awards",   label:"Parliamentary Awards",       access:"public",      icon:Globe      },
  { path:"/programmes/parliament",label:"Youth Parliament",          access:"public",      icon:Globe      },
  { path:"/auth",                label:"Authentication",             access:"public",      icon:Lock       },
  { path:"/admin/users",         label:"User Management",            access:"admin+",      icon:Users      },
  { path:"/sponsor-dashboard",   label:"Sponsor Dashboard",          access:"sponsor",     icon:Star       },
  { path:"/crm",                 label:"CRM (all staff)",            access:"admin+",      icon:LayoutDashboard },
];

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, accent }: {
  label: string; value: string | number; icon: React.ElementType; accent: string;
}) {
  return (
    <div className="bg-crm-card border border-crm-border rounded-xl p-4 flex items-start gap-3 hover:border-crm-border-hover transition-colors group">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border bg-gradient-to-br shadow-lg ${accent}`}>
        <Icon size={16} />
      </div>
      <div>
        <p className="text-[10px] font-mono uppercase tracking-widest text-crm-text-dim">{label}</p>
        <p className="text-2xl font-bold text-crm-text group-hover:text-primary transition-colors">{value}</p>
      </div>
    </div>
  );
}

// ─── Tab button ───────────────────────────────────────────────────────────────
function TabBtn({ id, label, icon: Icon, badge, active, onClick }: {
  id: Tab; label: string; icon: React.ElementType; badge?: number;
  active: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-[12px] font-medium transition-all whitespace-nowrap ${
        active
          ? "bg-gradient-to-r from-amber-900 to-amber-950 text-amber-300 border border-amber-700 shadow-[0_0_10px_hsl(38,90%,50%,0.15)]"
          : "text-crm-text-muted hover:text-crm-text-secondary hover:bg-crm-surface border border-transparent"
      }`}
    >
      <Icon size={13} />
      <span>{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-400 text-amber-900 ml-0.5">
          {badge}
        </span>
      )}
    </button>
  );
}

// ─── Email Config Tab ─────────────────────────────────────────────────────────
function EmailConfigTab({ userId }: { userId?: string }) {
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: smtp = {} as Record<string, any>, isLoading } = useQuery({
    queryKey: ["site-settings-smtp"],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("site_settings")
        .select("value")
        .eq("key", "smtp")
        .single();
      return (data?.value as Record<string, any>) ?? {};
    },
  });

  const { data: emailFormatData } = useQuery({
    queryKey: ["site-settings-email-format"],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("site_settings")
        .select("value")
        .eq("key", "email_format")
        .maybeSingle();
      return (data?.value as Record<string, any>) ?? {};
    },
  });

  const [host, setHost] = useState("");
  const [port, setPort] = useState("587");
  const [imapHost, setImapHost] = useState("");
  const [imapPort, setImapPort] = useState("993");
  const [sslEnabled, setSslEnabled] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fromName, setFromName] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);

  // Email format state
  const [emailTemplate, setEmailTemplate] = useState("{firstname}.{lastname}");
  const [emailDomain, setEmailDomain] = useState("ecowasparliamentinitiatives.org");
  const [savingFormat, setSavingFormat] = useState(false);

  useEffect(() => {
    if (smtp && Object.keys(smtp).length > 0) {
      setHost(smtp.host ?? "");
      setPort(String(smtp.port ?? 587));
      setImapHost(smtp.imap_host ?? "");
      setImapPort(String(smtp.imap_port ?? 993));
      setSslEnabled(smtp.ssl_enabled !== false);
      setUsername(smtp.username ?? "");
      setFromName(smtp.from_name ?? "ECOWAS Parliament CRM");
      setFromEmail(smtp.from_email ?? "noreply@ecowas.int");
    }
  }, [smtp]);

  useEffect(() => {
    if (emailFormatData && Object.keys(emailFormatData).length > 0) {
      setEmailTemplate(emailFormatData.template ?? "{firstname}.{lastname}");
      setEmailDomain(emailFormatData.domain ?? "ecowasparliamentinitiatives.org");
    }
  }, [emailFormatData]);

  const generatePreview = (template: string, domain: string) => {
    const preview = template
      .replace(/{firstname}/g, "john")
      .replace(/{lastname}/g, "doe")
      .replace(/{firstinitial}/g, "j")
      .replace(/{lastinitial}/g, "d")
      .replace(/{userid}/g, "u001");
    return `${preview}@${domain}`;
  };

  const handleSaveEmailFormat = async () => {
    setSavingFormat(true);
    try {
      const value = { template: emailTemplate.trim(), domain: emailDomain.trim() };
      const { data: existing } = await (supabase as any).from("site_settings").select("id").eq("key", "email_format").maybeSingle();
      if (existing) {
        await (supabase as any).from("site_settings")
          .update({ value, updated_by: userId, updated_at: new Date().toISOString() })
          .eq("key", "email_format");
      } else {
        await (supabase as any).from("site_settings")
          .insert({ key: "email_format", value, updated_by: userId });
      }
      qc.invalidateQueries({ queryKey: ["site-settings-email-format"] });
      toast({ title: "Email format saved" });
    } catch (err: any) {
      toast({ title: "Error saving format", description: err.message, variant: "destructive" });
    } finally {
      setSavingFormat(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const value: Record<string, any> = {
        host, port: Number(port),
        imap_host: imapHost, imap_port: Number(imapPort),
        ssl_enabled: sslEnabled,
        username, from_name: fromName, from_email: fromEmail,
      };
      if (password) value.password_hint = "***";

      const { data: existing } = await (supabase as any)
        .from("site_settings").select("id").eq("key", "smtp").single();

      if (existing) {
        await (supabase as any).from("site_settings")
          .update({ value, updated_by: userId, updated_at: new Date().toISOString() })
          .eq("key", "smtp");
      } else {
        await (supabase as any).from("site_settings")
          .insert({ key: "smtp", value, updated_by: userId });
      }
      qc.invalidateQueries({ queryKey: ["site-settings-smtp"] });
      toast({ title: "Email configuration saved" });
    } catch (err: any) {
      toast({ title: "Error saving config", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await (supabase as any).from("site_settings").delete().eq("key", "smtp");
      qc.invalidateQueries({ queryKey: ["site-settings-smtp"] });
      setHost(""); setPort("587"); setUsername(""); setPassword("");
      setFromName(""); setFromEmail("");
      toast({ title: "Email configuration deleted" });
    } catch (err: any) {
      toast({ title: "Error deleting config", description: err.message, variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={20} className="animate-spin text-crm-text-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-crm-card border border-crm-border rounded-xl p-5">
        <h3 className="text-[13px] font-semibold text-crm-text flex items-center gap-2 mb-4">
          <Mail size={14} /> Global Email Server Configuration
        </h3>
        <p className="text-[11px] text-crm-text-muted mb-5">
          Configure the SMTP server used for sending emails from the CRM. These settings apply system-wide.
        </p>
        <div className="grid sm:grid-cols-2 gap-4 max-w-lg">
          <div className="space-y-1.5">
            <Label className="text-[11px] text-crm-text-muted">SMTP Host</Label>
            <Input value={host} onChange={e => setHost(e.target.value)} placeholder="smtp.zoho.eu"
              className="bg-crm-surface border-crm-border text-crm-text text-[12px] h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] text-crm-text-muted">SMTP Port</Label>
            <Input value={port} onChange={e => setPort(e.target.value)} placeholder="587" type="number"
              className="bg-crm-surface border-crm-border text-crm-text text-[12px] h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] text-crm-text-muted">IMAP Host</Label>
            <Input value={imapHost} onChange={e => setImapHost(e.target.value)} placeholder="imap.zoho.eu"
              className="bg-crm-surface border-crm-border text-crm-text text-[12px] h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] text-crm-text-muted">IMAP Port</Label>
            <Input value={imapPort} onChange={e => setImapPort(e.target.value)} placeholder="993" type="number"
              className="bg-crm-surface border-crm-border text-crm-text text-[12px] h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] text-crm-text-muted">Username</Label>
            <Input value={username} onChange={e => setUsername(e.target.value)} placeholder="user@domain.com"
              className="bg-crm-surface border-crm-border text-crm-text text-[12px] h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] text-crm-text-muted">Password</Label>
            <div className="relative">
              <Input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Leave blank to keep existing"
                className="bg-crm-surface border-crm-border text-crm-text text-[12px] h-9 pr-9"
              />
              <button type="button"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-crm-text-muted"
                onClick={() => setShowPw(!showPw)}>
                {showPw ? <Lock size={13} /> : <Lock size={13} />}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] text-crm-text-muted">From Name</Label>
            <Input value={fromName} onChange={e => setFromName(e.target.value)}
              className="bg-crm-surface border-crm-border text-crm-text text-[12px] h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] text-crm-text-muted">From Email</Label>
            <Input type="email" value={fromEmail} onChange={e => setFromEmail(e.target.value)}
              className="bg-crm-surface border-crm-border text-crm-text text-[12px] h-9" />
          </div>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <Switch checked={sslEnabled} onCheckedChange={setSslEnabled} className="data-[state=checked]:bg-emerald-600" />
          <div>
            <p className="text-[12px] font-medium text-crm-text">Require SSL / TLS</p>
            <p className="text-[10px] text-crm-text-dim">{sslEnabled ? "SSL enabled — use port 465 or STARTTLS on 587" : "SSL disabled — use plain connection"}</p>
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <Button size="sm" onClick={handleSave} disabled={saving}
            className="text-[11px] gap-1.5">
            {saving ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
            {saving ? "Saving…" : "Save Config"}
          </Button>
          <Button size="sm" variant="outline" onClick={handleDelete}
            className="text-[11px] gap-1.5 border-red-900 text-red-400 hover:bg-red-950 hover:text-red-300">
            <Trash2 size={12} />
            Delete Config
          </Button>
        </div>
      </div>

      {/* Email Address Format */}
      <div className="bg-crm-card border border-crm-border rounded-xl p-5">
        <h3 className="text-[13px] font-semibold text-crm-text flex items-center gap-2 mb-2">
          <Mail size={14} /> Email Address Format
        </h3>
        <p className="text-[11px] text-crm-text-muted mb-4">
          Define the standard format for generating CRM email addresses when creating new accounts.
          Use placeholders: <span className="font-mono text-emerald-400">{"{"}</span><span className="font-mono text-emerald-400">firstname{"}"}</span>, <span className="font-mono text-emerald-400">{"{"}</span><span className="font-mono text-emerald-400">lastname{"}"}</span>, <span className="font-mono text-emerald-400">{"{"}</span><span className="font-mono text-emerald-400">firstinitial{"}"}</span>, <span className="font-mono text-emerald-400">{"{"}</span><span className="font-mono text-emerald-400">lastinitial{"}"}</span>, <span className="font-mono text-emerald-400">{"{"}</span><span className="font-mono text-emerald-400">userid{"}"}</span>
        </p>
        <div className="grid sm:grid-cols-2 gap-4 max-w-lg">
          <div className="space-y-1.5">
            <Label className="text-[11px] text-crm-text-muted">Username Template</Label>
            <Input value={emailTemplate} onChange={e => setEmailTemplate(e.target.value)}
              placeholder="{firstname}.{lastname}"
              className="bg-crm-surface border-crm-border text-crm-text text-[12px] h-9 font-mono" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] text-crm-text-muted">Domain</Label>
            <Input value={emailDomain} onChange={e => setEmailDomain(e.target.value)}
              placeholder="ecowasparliamentinitiatives.org"
              className="bg-crm-surface border-crm-border text-crm-text text-[12px] h-9" />
          </div>
        </div>
        {emailTemplate && emailDomain && (
          <div className="mt-3 px-3 py-2 rounded-lg bg-crm-surface border border-crm-border inline-flex items-center gap-2">
            <span className="text-[10px] text-crm-text-muted">Preview (John Doe):</span>
            <span className="text-[12px] font-mono text-emerald-400">{generatePreview(emailTemplate, emailDomain)}</span>
          </div>
        )}
        <div className="mt-4">
          <Button size="sm" onClick={handleSaveEmailFormat} disabled={savingFormat}
            className="text-[11px] gap-1.5">
            {savingFormat ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
            {savingFormat ? "Saving…" : "Save Format"}
          </Button>
        </div>
      </div>
    </div>
  );
}


// ─── Branding & Site Tab ──────────────────────────────────────────────────────
function BrandingTab({ userId }: { userId?: string }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});

  const { isLoading } = useQuery({
    queryKey: ["site-settings-admin"],
    queryFn: async () => {
      const { data } = await (supabase as any).from("site_settings").select("key, value");
      const map: Record<string, string> = {};
      (data ?? []).forEach((row: any) => {
        const val = row.value;
        map[row.key] = typeof val === "string" ? val : (val ?? "");
      });
      setValues(map);
      return map;
    },
  });

  const set = (key: string, val: string) => setValues(prev => ({ ...prev, [key]: val }));

  const handleLogoUpload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `logos/site-logo-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("branding").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from("branding").getPublicUrl(path);
      set("site_logo_url", publicUrl);
      toast({ title: "Logo uploaded" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally { setUploading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const keys = ["site_name", "site_logo_url", "contact_email", "footer_text",
        "social_facebook", "social_twitter", "social_instagram", "social_linkedin", "social_youtube"];
      for (const key of keys) {
        if (values[key] !== undefined) {
          const { data: existing } = await (supabase as any).from("site_settings").select("id").eq("key", key).single();
          if (existing) {
            await (supabase as any).from("site_settings").update({ value: values[key], updated_by: userId, updated_at: new Date().toISOString() }).eq("key", key);
          } else {
            await (supabase as any).from("site_settings").insert({ key, value: values[key], updated_by: userId });
          }
        }
      }
      qc.invalidateQueries({ queryKey: ["site-settings"] });
      qc.invalidateQueries({ queryKey: ["site-settings-admin"] });
      toast({ title: "Site settings saved" });
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  const inputCls = "bg-crm-surface border-crm-border text-crm-text text-[12px] h-9";

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 size={20} className="animate-spin text-crm-text-muted" /></div>;

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Logo upload */}
      <div className="bg-crm-card border border-crm-border rounded-xl p-5">
        <h3 className="text-[13px] font-semibold text-crm-text flex items-center gap-2 mb-4">
          <Palette size={14} className="text-amber-400" /> Branding
        </h3>
        <div className="flex items-start gap-6">
          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 rounded-xl bg-crm-surface border border-crm-border flex items-center justify-center overflow-hidden">
              {values.site_logo_url
                ? <img src={values.site_logo_url} alt="Logo" className="w-full h-full object-contain p-1" />
                : <Globe size={28} className="text-crm-text-dim" />}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-crm-border text-[11px] text-crm-text-muted hover:text-crm-text transition-colors"
            >
              {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
              {uploading ? "Uploading…" : "Upload Logo"}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={e => e.target.files?.[0] && handleLogoUpload(e.target.files[0])} />
          </div>
          <div className="flex-1 space-y-3">
            <div className="space-y-1.5">
              <Label className="text-[11px] text-crm-text-muted">Site Name</Label>
              <Input value={values.site_name ?? ""} onChange={e => set("site_name", e.target.value)} className={inputCls} placeholder="ECOWAS Parliament 25th Anniversary" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] text-crm-text-muted">Logo URL (or upload above)</Label>
              <Input value={values.site_logo_url ?? ""} onChange={e => set("site_logo_url", e.target.value)} className={inputCls} placeholder="https://..." />
            </div>
          </div>
        </div>
      </div>

      {/* General */}
      <div className="bg-crm-card border border-crm-border rounded-xl p-5">
        <h3 className="text-[13px] font-semibold text-crm-text flex items-center gap-2 mb-4">
          <Globe size={14} className="text-amber-400" /> General
        </h3>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-[11px] text-crm-text-muted">Contact Email</Label>
            <Input type="email" value={values.contact_email ?? ""} onChange={e => set("contact_email", e.target.value)} className={inputCls} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] text-crm-text-muted">Footer Copyright Text</Label>
            <Input value={values.footer_text ?? ""} onChange={e => set("footer_text", e.target.value)} className={inputCls} />
          </div>
        </div>
      </div>

      {/* Social links */}
      <div className="bg-crm-card border border-crm-border rounded-xl p-5">
        <h3 className="text-[13px] font-semibold text-crm-text flex items-center gap-2 mb-4">
          <Link2 size={14} className="text-amber-400" /> Social Links
        </h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { key: "social_facebook", label: "Facebook", icon: Facebook },
            { key: "social_twitter", label: "Twitter / X", icon: Twitter },
            { key: "social_instagram", label: "Instagram", icon: Instagram },
            { key: "social_linkedin", label: "LinkedIn", icon: Linkedin },
            { key: "social_youtube", label: "YouTube", icon: Youtube },
          ].map(({ key, label, icon: Icon }) => (
            <div key={key} className="space-y-1.5">
              <Label className="text-[11px] text-crm-text-muted flex items-center gap-1.5">
                <Icon size={11} /> {label}
              </Label>
              <Input value={values[key] ?? ""} onChange={e => set(key, e.target.value)} className={inputCls} placeholder="https://..." />
            </div>
          ))}
        </div>
      </div>

      <Button size="sm" onClick={handleSave} disabled={saving}
        className="bg-amber-700 hover:bg-amber-600 text-white text-xs gap-1.5">
        {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
        {saving ? "Saving…" : "Save Site Settings"}
      </Button>
    </div>
  );
}

export default function SuperAdminModule() {
  const { user, refreshRoles, signOut } = useAuthContext();
  const { toast } = useToast();

  const [tab,         setTab]         = useState<Tab>("overview");
  const [users,       setUsers]       = useState<UserWithRoles[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [inviteEmail,  setInviteEmail]  = useState("");
  const [inviteRole,   setInviteRole]   = useState<AppRole>("admin");
  const [sending,      setSending]      = useState(false);
  const [searchQ,      setSearchQ]      = useState("");
  const [resendingId,  setResendingId]  = useState<string | null>(null);

  // ── Delete user dialog ────────────────────────────────────────────────────
  const [deleteTarget,      setDeleteTarget]      = useState<UserWithRoles | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting,          setDeleting]          = useState(false);

  // ── Resend cooldown tracking ──────────────────────────────────────────────
  // key: invitation id, value: unix ms when cooldown expires
  const [resendCooldowns, setResendCooldowns] = useState<Record<string, number>>({});
  const [now, setNow] = useState(Date.now());

  // ── Load all data ────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [profilesRes, rolesRes, invRes, actRes] = await Promise.all([
        (supabase as any).from("profiles").select("id, email, full_name, country, created_at, show_on_website, title, organisation").order("created_at", { ascending: false }),
        (supabase as any).from("user_roles").select("user_id, role"),
        (supabase as any).from("invitations").select("id, email, role, invited_by, created_at, accepted_at, expires_at, resent_at").order("created_at", { ascending: false }),
        (supabase as any).from("admin_activity_logs").select("id, action, entity_type, details, created_at, profiles!actor_user_id(full_name, email)").order("created_at", { ascending: false }).limit(50),
      ]);

      const rolesMap = new Map<string, AppRole[]>();
      (rolesRes.data ?? []).forEach((r: any) => {
        const arr = rolesMap.get(r.user_id) || [];
        arr.push(r.role as AppRole);
        rolesMap.set(r.user_id, arr);
      });

      setUsers((profilesRes.data ?? []).map((p: any) => ({
        id: p.id, email: p.email ?? "", full_name: p.full_name ?? "",
        country: p.country ?? "", created_at: p.created_at,
        roles: rolesMap.get(p.id) ?? [],
        show_on_website: p.show_on_website ?? false,
        title: p.title ?? null, organisation: p.organisation ?? null,
      })));

      const invData: Invitation[] = invRes.data ?? [];
      setInvitations(invData);

      // Seed cooldowns from DB — if resent_at (or created_at) is within 60s, lock the button
      const seeded: Record<string, number> = {};
      for (const inv of invData) {
        const lastSent = inv.resent_at ?? inv.created_at;
        const expiresAt = new Date(lastSent).getTime() + 60_000;
        if (expiresAt > Date.now()) seeded[inv.id] = expiresAt;
      }
      setResendCooldowns(seeded);

      setActivityLog((actRes.data ?? []).map((l: any) => ({
        id: l.id, action: l.action, entity_type: l.entity_type,
        details: l.details, created_at: l.created_at,
        actor: l.profiles ?? undefined,
      })));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Countdown ticker — re-renders every second while any cooldown is active ─
  useEffect(() => {
    const hasActive = Object.values(resendCooldowns).some(t => t > Date.now());
    if (!hasActive) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [resendCooldowns]);

  // ── Invite ────────────────────────────────────────────────────────────────
  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setSending(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("invite-user", {
        body: { email: inviteEmail.trim(), role: inviteRole, redirectUrl: `${window.location.origin}/set-password` },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (res.error) throw new Error(res.error.message);
      const body = res.data as any;
      if (body?.error) throw new Error(body.error);
      toast({ title: "Invitation sent", description: `${inviteEmail} — ${inviteRole}` });
      setInviteEmail("");
      loadData();
    } catch (err: any) {
      toast({ title: "Failed to send invitation", description: err.message, variant: "destructive" });
    } finally { setSending(false); }
  };

  // ── Role change ───────────────────────────────────────────────────────────
  const handleRoleChange = async (targetUserId: string, role: AppRole, action: "add" | "remove") => {
    if (targetUserId === user?.id && action === "remove" && role === "super_admin") {
      toast({ title: "Cannot remove your own super_admin role", variant: "destructive" });
      return;
    }
    try {
      if (action === "add") {
        await (supabase as any).from("user_roles").insert({ user_id: targetUserId, role });
      } else {
        await (supabase as any).from("user_roles").delete().eq("user_id", targetUserId).eq("role", role);
      }
      // Log activity
      await (supabase as any).from("admin_activity_logs").insert({
        actor_user_id: user!.id,
        action: action === "add" ? "role_granted" : "role_revoked",
        entity_type: "user_role",
        entity_id: targetUserId,
        details: { role, target_user_id: targetUserId },
      });
      toast({ title: `Role ${action === "add" ? "granted" : "revoked"}` });
      loadData();
      if (targetUserId === user?.id) refreshRoles();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  // ── Toggle show on website ─────────────────────────────────────────────────
  const toggleShowOnWebsite = async (targetUserId: string, newVal: boolean) => {
    try {
      await (supabase as any).from("profiles").update({ show_on_website: newVal }).eq("id", targetUserId);
      toast({ title: newVal ? "Added to Team page" : "Removed from Team page" });
      setUsers(prev => prev.map(u => u.id === targetUserId ? { ...u, show_on_website: newVal } : u));
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  // ── Update profile field inline ──────────────────────────────────────────
  const updateProfileField = async (targetUserId: string, field: string, value: string) => {
    try {
      await (supabase as any).from("profiles").update({ [field]: value }).eq("id", targetUserId);
      setUsers(prev => prev.map(u => u.id === targetUserId ? { ...u, [field]: value } : u));
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  // ── Resend invitation ─────────────────────────────────────────────────────
  const resendInvitation = async (invId: string, email: string) => {
    setResendingId(invId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("resend-invite", {
        body: { invitation_id: invId },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (res.error) throw new Error(res.error.message);
      const body = res.data as any;
      if (body?.error) throw new Error(body.error);
      // Start 60-second client-side cooldown
      setResendCooldowns(prev => ({ ...prev, [invId]: Date.now() + 60_000 }));
      toast({ title: "Invitation resent", description: email });
      loadData();
    } catch (err: any) {
      const body = err as any;
      const retryAfter: number | undefined = body?.retry_after;
      const msg = retryAfter
        ? `Please wait ${retryAfter}s before resending`
        : (err.message ?? "Failed to resend");
      toast({ title: "Failed to resend", description: msg, variant: "destructive" });
    } finally { setResendingId(null); }
  };

  // ── Revoke / delete invitation ────────────────────────────────────────────
  const revokeInvitation = async (invId: string, isAccepted: boolean) => {
    const label = isAccepted ? "Delete this accepted invitation?" : "Revoke this pending invitation?";
    if (!confirm(label)) return;
    try {
      await (supabase as any).from("invitations").delete().eq("id", invId);
      toast({ title: isAccepted ? "Invitation deleted" : "Invitation revoked" });
      loadData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  // ── Delete user — opens confirmation dialog ───────────────────────────────
  const deleteUser = (target: UserWithRoles) => {
    if (target.id === user?.id) {
      toast({ title: "Cannot delete your own account", variant: "destructive" });
      return;
    }
    setDeleteTarget(target);
    setDeleteConfirmText("");
  };

  // ── Confirm delete user (called from dialog) ──────────────────────────────
  const confirmDeleteUser = async () => {
    if (!deleteTarget || deleteConfirmText !== "DELETE") return;
    setDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("delete-user", {
        body: { user_ids: [deleteTarget.id] },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (res.error) throw new Error(res.error.message);
      const results = (res.data?.results ?? []) as { success: boolean; email?: string; error?: string }[];
      const failed = results.filter(r => !r.success);
      if (failed.length > 0) {
        toast({ title: "Deletion failed", description: failed[0]?.error ?? "Unknown error", variant: "destructive" });
      } else {
        const deletedEmail = results[0]?.email ?? deleteTarget.email;
        const firstRole = deleteTarget.roles[0] ?? "admin";
        setDeleteTarget(null);
        setDeleteConfirmText("");
        loadData();
        // Offer re-invite shortcut
        toast({
          title: `${deleteTarget.full_name || deletedEmail} deleted`,
          description: "User and all their data have been removed.",
          action: (
            <button
              className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 underline underline-offset-2 transition-colors whitespace-nowrap"
              onClick={() => {
                setInviteEmail(deletedEmail);
                setInviteRole(firstRole as AppRole);
                setTab("users");
              }}
            >
              Re-invite {deletedEmail}
            </button>
          ) as any,
        });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  const stats = {
    total:       users.length,
    superAdmins: users.filter(u => u.roles.includes("super_admin")).length,
    admins:      users.filter(u => u.roles.includes("admin")).length,
    pendingInv:  invitations.filter(i => !i.accepted_at).length,
  };

  const filteredUsers = users.filter(u =>
    !searchQ ||
    u.full_name.toLowerCase().includes(searchQ.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQ.toLowerCase()) ||
    u.country.toLowerCase().includes(searchQ.toLowerCase())
  );

  const exportUsersCSV = () => {
    const header = "Name,Email,Country,Roles,Joined\n";
    const rows = filteredUsers.map(u =>
      `"${u.full_name}","${u.email}","${u.country}","${u.roles.join('; ')}","${u.created_at}"`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "users-export.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const NAV: { id: Tab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id:"overview",    label:"Overview",     icon:LayoutDashboard },
    { id:"users",       label:"Users",        icon:Users,  badge:stats.total },
    { id:"invitations", label:"Invitations",  icon:Mail,   badge:stats.pendingInv },
    { id:"activity",    label:"Activity Log", icon:Activity },
    { id:"routes",      label:"Site Routes",  icon:Globe },
    { id:"email-config",label:"Email Config", icon:Mail },
    { id:"branding",    label:"Branding & Site", icon:Palette },
    { id:"settings",    label:"Settings",     icon:Settings },
  ];

  return (
    <div className="space-y-5">

      {/* ══ DELETE USER DIALOG ══ */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-crm-card border border-red-900 rounded-2xl w-full max-w-md shadow-2xl">
            {/* Dialog header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-crm-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-950 border border-red-800 flex items-center justify-center">
                  <Trash2 size={15} className="text-red-400" />
                </div>
                <h3 className="text-[14px] font-bold text-crm-text">Delete User</h3>
              </div>
              <button
                onClick={() => { setDeleteTarget(null); setDeleteConfirmText(""); }}
                className="text-crm-text-faint hover:text-crm-text-secondary transition-colors p-1"
              >
                ✕
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">
              {/* User info */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-crm-surface border border-crm-border">
                <div className="w-10 h-10 rounded-full bg-crm-border flex items-center justify-center text-sm font-bold text-emerald-400 flex-shrink-0 uppercase">
                  {(deleteTarget.full_name || deleteTarget.email)[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-crm-text">{deleteTarget.full_name || "—"}</p>
                  <p className="text-[11px] text-crm-text-muted">{deleteTarget.email}</p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {deleteTarget.roles.length === 0
                      ? <span className="text-[10px] text-crm-text-faint">No roles</span>
                      : deleteTarget.roles.map(r => {
                          const cfg = ROLE_CONFIG[r];
                          return cfg ? (
                            <span key={r} className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${cfg.badge}`}>
                              {cfg.label}
                            </span>
                          ) : null;
                        })}
                  </div>
                </div>
              </div>

              {/* Destruction warning */}
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-900">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={13} className="text-red-400 flex-shrink-0" />
                  <p className="text-[11px] font-semibold text-red-400">This will permanently destroy:</p>
                </div>
                <ul className="space-y-1 pl-5">
                  {[
                    "Profile and account credentials",
                    "All channel and direct messages",
                    "Calendar events they created",
                    "Email accounts and synced emails",
                    "Their roles and permission assignments",
                    "Any pending invitation for this email",
                  ].map(item => (
                    <li key={item} className="text-[11px] text-crm-text-muted list-disc">{item}</li>
                  ))}
                </ul>
              </div>

              {/* Confirm input */}
              <div>
                <label className="text-[11px] text-crm-text-muted block mb-1.5">
                  Type <span className="font-mono font-bold text-red-400">DELETE</span> to confirm:
                </label>
                <Input
                  value={deleteConfirmText}
                  onChange={e => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="bg-crm-surface border-crm-border text-crm-text text-xs h-8 font-mono focus:border-red-700"
                  autoFocus
                  onKeyDown={e => e.key === "Enter" && deleteConfirmText === "DELETE" && confirmDeleteUser()}
                />
              </div>
            </div>

            {/* Dialog footer */}
            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-crm-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setDeleteTarget(null); setDeleteConfirmText(""); }}
                className="border-crm-border text-crm-text-muted hover:text-crm-text-secondary text-xs h-8"
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={confirmDeleteUser}
                disabled={deleteConfirmText !== "DELETE" || deleting}
                className="bg-red-700 hover:bg-red-600 text-white text-xs h-8 gap-1.5 disabled:opacity-40"
              >
                {deleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                Delete permanently
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-900 to-amber-950 border border-amber-700 flex items-center justify-center shadow-[0_0_16px_hsl(38,90%,50%,0.2)]">
            <Crown size={18} className="text-amber-300" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-crm-text leading-tight">Super Admin Hub</h2>
            <p className="text-[11px] text-crm-text-muted">
              Full system oversight — users, roles, activity & configuration
            </p>
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={loadData} disabled={loading}
          className="border-crm-border text-crm-text-muted hover:text-crm-text-secondary text-xs gap-1.5 h-8 flex-shrink-0">
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          Refresh
        </Button>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 flex-wrap overflow-x-auto scrollbar-hide pb-1">
        {NAV.map(n => (
          <TabBtn key={n.id} {...n} active={tab === n.id} onClick={() => setTab(n.id)} />
        ))}
      </div>

      {/* ══ OVERVIEW ══ */}
      {tab === "overview" && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Total users"      value={loading ? "…" : stats.total}      icon={Users}    accent="bg-emerald-950 border-emerald-800 text-emerald-400" />
            <StatCard label="Super admins"     value={loading ? "…" : stats.superAdmins} icon={Crown}    accent="bg-amber-950 border-amber-800 text-amber-400"    />
            <StatCard label="Admins"           value={loading ? "…" : stats.admins}     icon={ShieldCheck} accent="bg-sky-950 border-sky-800 text-sky-400"        />
            <StatCard label="Pending invites"  value={loading ? "…" : stats.pendingInv} icon={Mail}     accent="bg-red-950 border-red-800 text-red-400"           />
          </div>

          {/* Quick actions */}
          <div className="flex flex-wrap gap-2">
            {[
              { label: "View Invitations", icon: Mail,     tab: "invitations" as Tab },
              { label: "Manage Users",     icon: Users,    tab: "users" as Tab },
              { label: "Activity Log",     icon: Activity, tab: "activity" as Tab },
              { label: "Email Config",     icon: Settings, tab: "email-config" as Tab },
            ].map(({ label, icon: Icon, tab: t }) => (
              <button key={t} onClick={() => setTab(t)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-crm-surface border border-crm-border hover:border-crm-border-hover text-[11px] text-crm-text-muted hover:text-crm-text-secondary transition-colors">
                <Icon size={12} /> {label}
              </button>
            ))}
          </div>

          {/* Role breakdown */}
          <div className="bg-crm-card border border-crm-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-crm-border">
              <h3 className="text-[12px] font-semibold text-crm-text-secondary">Role definitions & distribution</h3>
            </div>
            <div className="p-4 grid sm:grid-cols-2 gap-2">
              {(Object.entries(ROLE_CONFIG) as [AppRole, typeof ROLE_CONFIG[AppRole]][]).map(([key, cfg]) => {
                if (!cfg) return null;
                const Icon = cfg.icon;
                const count = users.filter(u => u.roles.includes(key)).length;
                return (
                  <div key={key} className="flex items-start gap-3 p-3 rounded-lg border border-crm-border hover:border-crm-border-hover transition-colors">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border text-[11px] font-bold ${cfg.badge}`}>
                      <Icon size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-semibold text-crm-text">{cfg.label}</span>
                        <span className="text-lg font-black text-crm-text-dim">{count}</span>
                      </div>
                      <p className="text-[10px] text-crm-text-dim mt-0.5 leading-relaxed">{cfg.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent activity */}
          <div className="bg-crm-card border border-crm-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-crm-border flex items-center justify-between">
              <h3 className="text-[12px] font-semibold text-crm-text-secondary">Recent activity</h3>
              <button onClick={() => setTab("activity")} className="text-[11px] text-emerald-500 hover:text-emerald-400">View all →</button>
            </div>
            {loading ? (
              <div className="flex items-center justify-center h-24">
                <div className="w-5 h-5 border-2 border-emerald-700 border-t-emerald-400 rounded-full animate-spin" />
              </div>
            ) : activityLog.length === 0 ? (
              <p className="text-[12px] text-crm-text-faint text-center py-8">No activity logged yet.</p>
            ) : (
              <div className="p-4">
                <div className="relative pl-7 ml-2 space-y-0 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-gradient-to-b before:from-primary/30 before:via-primary/10 before:to-transparent">
                  {activityLog.slice(0, 6).map(log => {
                    const ac =
                      log.action.includes("delete") ? "text-red-400 bg-red-950 border-red-800" :
                      log.action.includes("grant")  ? "text-emerald-400 bg-emerald-950 border-emerald-800" :
                                                      "text-blue-400 bg-blue-950 border-blue-800";
                    return (
                      <div key={log.id} className="relative flex items-start gap-3 pb-3">
                        <div className={`absolute -left-[26px] w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${ac}`}>
                          <Activity size={9} />
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <p className="text-[12px] text-crm-text">
                            <span className="font-semibold">{log.actor?.full_name || "System"}</span>
                            {" "}<span className={`font-medium ${ac.split(" ")[0]}`}>{log.action}</span>
                            {" "}on <span className="font-medium text-crm-text-secondary">{log.entity_type}</span>
                          </p>
                          <p className="text-[10px] text-crm-text-faint mt-0.5">{new Date(log.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ USERS ══ */}
      {tab === "users" && (
        <div className="space-y-4">
          {/* Invite form */}
          <div className="bg-crm-card border border-amber-800 rounded-xl p-4">
            <h3 className="text-[12px] font-semibold text-amber-400 flex items-center gap-2 mb-3">
              <UserPlus size={13} /> Invite a new team member
            </h3>
            <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
              <Input
                type="email" required placeholder="colleague@example.com"
                value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                className="bg-crm-surface border-crm-border text-crm-text text-xs h-8 flex-1"
              />
              <Select value={inviteRole} onValueChange={v => setInviteRole(v as AppRole)}>
                <SelectTrigger className="bg-crm-surface border-crm-border text-crm-text text-xs h-8 sm:w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-crm-card border-crm-border">
                  {(Object.keys(ROLE_CONFIG) as AppRole[]).map(r => (
                    <SelectItem key={r} value={r} className="text-crm-text text-xs">{ROLE_CONFIG[r]?.label ?? r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="submit" disabled={sending} size="sm"
                className="bg-amber-700 hover:bg-amber-600 text-white text-xs gap-1.5 h-8">
                {sending ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                Send invite
              </Button>
            </form>
          </div>

          {/* Users table */}
          <div className="bg-crm-card border border-crm-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-crm-border flex items-center justify-between gap-3 flex-wrap">
              <h3 className="text-[12px] font-semibold text-crm-text-secondary">All users ({filteredUsers.length})</h3>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search name, email, country…"
                  value={searchQ} onChange={e => setSearchQ(e.target.value)}
                  className="bg-crm-surface border-crm-border text-crm-text text-xs h-7 w-56"
                />
                <Button size="sm" variant="outline" onClick={exportUsersCSV}
                  className="border-crm-border text-crm-text-muted hover:text-crm-text-secondary text-xs gap-1 h-7">
                  <Download size={11} /> CSV
                </Button>
              </div>
            </div>
            {loading ? (
              <div className="flex items-center justify-center h-24">
                <div className="w-5 h-5 border-2 border-emerald-700 border-t-emerald-400 rounded-full animate-spin" />
              </div>
            ) : (
              <div className="divide-y divide-crm-border">
                {filteredUsers.map(u => (
                  <div key={u.id} className="flex items-start gap-3 px-4 py-3 hover:bg-crm-surface transition-colors">
                    <div className="w-8 h-8 rounded-full bg-crm-border flex items-center justify-center text-xs font-bold text-emerald-400 flex-shrink-0 uppercase">
                      {(u.full_name || u.email)[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[12.5px] font-semibold text-crm-text">{u.full_name || "—"}</p>
                        {u.id === user?.id && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-950 border border-amber-800 text-amber-400">you</span>
                        )}
                      </div>
                      <p className="text-[10px] text-crm-text-muted">{u.email}</p>
                      <p className="text-[10px] text-crm-text-dim">{u.country || "—"}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      {/* Show on Team toggle */}
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-crm-text-dim">Team page</span>
                        <Switch
                          checked={u.show_on_website}
                          onCheckedChange={v => toggleShowOnWebsite(u.id, v)}
                          className="scale-75"
                        />
                      </div>
                      {/* Inline title / org edit when toggled on */}
                      {u.show_on_website && (
                        <div className="flex gap-1.5">
                          <input
                            className="bg-crm-surface border border-crm-border rounded text-[10px] text-crm-text px-1.5 py-0.5 w-24"
                            placeholder="Title"
                            defaultValue={u.title ?? ""}
                            onBlur={e => e.target.value !== (u.title ?? "") && updateProfileField(u.id, "title", e.target.value)}
                          />
                          <input
                            className="bg-crm-surface border border-crm-border rounded text-[10px] text-crm-text px-1.5 py-0.5 w-28"
                            placeholder="Organisation"
                            defaultValue={u.organisation ?? ""}
                            onBlur={e => e.target.value !== (u.organisation ?? "") && updateProfileField(u.id, "organisation", e.target.value)}
                          />
                        </div>
                      )}
                      {/* Role badges */}
                      <div className="flex flex-wrap gap-1 justify-end">
                        {u.roles.length === 0 && (
                          <span className="text-[10px] text-crm-text-faint">No roles</span>
                        )}
                        {u.roles.map(role => {
                          const cfg = ROLE_CONFIG[role];
                          if (!cfg) return null;
                          const Icon = cfg.icon;
                          return (
                            <span key={role} className={`flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded border ${cfg.badge}`}>
                              <Icon size={9} />
                              {cfg.label}
                              {u.id !== user?.id && (
                                <button
                                  onClick={() => handleRoleChange(u.id, role, "remove")}
                                  className="ml-0.5 hover:text-red-400 transition-colors"
                                  title={`Remove ${cfg.label}`}
                                >×</button>
                              )}
                            </span>
                          );
                        })}
                      </div>
                      {/* Add role */}
                      {u.id !== user?.id && (
                        <Select onValueChange={v => handleRoleChange(u.id, v as AppRole, "add")}>
                          <SelectTrigger className="h-6 w-24 text-[10px] bg-crm-surface border-crm-border text-crm-text-muted">
                            <SelectValue placeholder="+ Role" />
                          </SelectTrigger>
                          <SelectContent className="bg-crm-card border-crm-border">
                            {(Object.keys(ROLE_CONFIG) as AppRole[])
                              .filter(r => !u.roles.includes(r))
                              .map(r => (
                                <SelectItem key={r} value={r} className="text-crm-text text-xs">
                                  {ROLE_CONFIG[r]?.label ?? r}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      )}
                      {/* Delete user */}
                      {u.id !== user?.id && (
                        <button
                          onClick={() => deleteUser(u)}
                          className="flex items-center gap-1 text-[10px] text-crm-text-faint hover:text-red-400 hover:bg-red-950 px-2 py-1 rounded border border-transparent hover:border-red-900 transition-colors mt-1"
                          title="Delete user permanently"
                        >
                          <Trash2 size={10} /> Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {filteredUsers.length === 0 && (
                  <p className="text-[12px] text-crm-text-faint text-center py-8">No users found.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ INVITATIONS ══ */}
      {tab === "invitations" && (
        <div className="space-y-4">
          <div className="bg-crm-card border border-crm-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-crm-border flex items-center justify-between">
              <h3 className="text-[12px] font-semibold text-crm-text-secondary">
                Pending Invitations ({invitations.length})
              </h3>
              <button onClick={() => setTab("users")} className="text-[11px] text-emerald-500 hover:text-emerald-400 flex items-center gap-1">
                <UserPlus size={11} /> New invite
              </button>
            </div>
            {invitations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <Mail size={28} className="text-crm-text-faint" />
                <p className="text-[12px] text-crm-text-faint">No pending invitations.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-crm-border">
                      {["Email", "Role", "Invited", "Expires", "Status", "Actions"].map(h => (
                        <th key={h} className="px-4 py-2.5 text-[10px] font-semibold text-crm-text-dim uppercase tracking-wider text-left">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-crm-border">
                    {invitations.map(inv => {
                      const cfg = ROLE_CONFIG[inv.role];
                      const Icon = cfg?.icon ?? Mail;
                      const isExpired = inv.expires_at
                        ? new Date(inv.expires_at) < new Date()
                        : false;
                      return (
                        <tr key={inv.id} className="hover:bg-crm-surface transition-colors">
                          <td className="px-4 py-3 text-[12px] text-crm-text font-medium">{inv.email}</td>
                          <td className="px-4 py-3">
                            <span className={`flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded border w-fit ${cfg?.badge ?? "text-crm-text-muted bg-crm-border border-crm-border"}`}>
                              <Icon size={9} />{cfg?.label ?? inv.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[10px] text-crm-text-muted whitespace-nowrap">
                            {new Date(inv.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-[10px] text-crm-text-muted whitespace-nowrap">
                            {inv.expires_at ? new Date(inv.expires_at).toLocaleDateString() : "—"}
                          </td>
                          <td className="px-4 py-3">
                            {isExpired ? (
                              <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-red-950 border border-red-800 text-red-400 w-fit whitespace-nowrap">
                                <AlertTriangle size={9} /> Token Expired
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-950 border border-amber-800 text-amber-400 w-fit whitespace-nowrap">
                                <Clock size={9} /> Pending
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              {(() => {
                                const cooldownExpiry = resendCooldowns[inv.id];
                                const secondsLeft = cooldownExpiry ? Math.max(0, Math.ceil((cooldownExpiry - now) / 1000)) : 0;
                                const isCooling = secondsLeft > 0;
                                const isLoading = resendingId === inv.id;
                                return (
                                  <button
                                    onClick={() => !isCooling && !isLoading && resendInvitation(inv.id, inv.email)}
                                    disabled={isLoading || isCooling}
                                    title={isCooling ? `Wait ${secondsLeft}s before resending` : "Resend invitation"}
                                    className="flex items-center gap-1 text-[10px] px-2 py-1 rounded bg-emerald-950 border border-emerald-800 text-emerald-400 hover:bg-emerald-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                                  >
                                    {isLoading
                                      ? <Loader2 size={10} className="animate-spin" />
                                      : isCooling
                                      ? <Clock size={10} />
                                      : <RefreshCw size={10} />}
                                    {isCooling ? `${secondsLeft}s` : "Resend"}
                                  </button>
                                );
                              })()}
                              <button
                                onClick={() => revokeInvitation(inv.id, !!inv.accepted_at)}
                                className="text-crm-text-faint hover:text-red-400 p-1 transition-colors"
                                title="Revoke invitation"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ ACTIVITY LOG ══ */}
      {tab === "activity" && (
        <div className="bg-crm-card border border-crm-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-crm-border">
            <h3 className="text-[12px] font-semibold text-crm-text-secondary">Activity log (last 50 actions)</h3>
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-24">
              <div className="w-5 h-5 border-2 border-emerald-700 border-t-emerald-400 rounded-full animate-spin" />
            </div>
          ) : activityLog.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <Activity size={28} className="text-crm-text-faint" />
              <p className="text-[12px] text-crm-text-faint">No activity recorded yet.</p>
            </div>
          ) : (
            <div className="p-4">
              <div className="relative pl-7 ml-2 space-y-0 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-gradient-to-b before:from-primary/30 before:via-primary/10 before:to-transparent">
                {activityLog.map(log => {
                  const actionColor =
                    log.action.includes("delete") ? "text-red-400 bg-red-950 border-red-800" :
                    log.action.includes("grant")  ? "text-emerald-400 bg-emerald-950 border-emerald-800" :
                    log.action.includes("revoke") ? "text-amber-400 bg-amber-950 border-amber-800" :
                                                    "text-blue-400 bg-blue-950 border-blue-800";
                  const actionTextColor = actionColor.split(" ")[0];
                  return (
                    <div key={log.id} className="relative flex items-start gap-3 pb-4">
                      <div className={`absolute -left-[26px] w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${actionColor}`}>
                        <Activity size={9} />
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <p className="text-[12px] text-crm-text">
                          <span className="font-semibold">{log.actor?.full_name || "System"}</span>
                          {" "}<span className={`font-medium ${actionTextColor}`}>{log.action}</span>
                          {" "}on <span className="font-medium text-crm-text-secondary">{log.entity_type}</span>
                        </p>
                        {log.details && typeof log.details === "object" && Object.keys(log.details).length > 0 && (
                          <p className="text-[10px] text-crm-text-dim font-mono truncate mt-0.5">{JSON.stringify(log.details)}</p>
                        )}
                        <p className="text-[10px] text-crm-text-faint mt-0.5">{new Date(log.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══ ROUTES ══ */}
      {tab === "routes" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-crm-card border border-blue-800">
            <Globe size={14} className="text-blue-400 flex-shrink-0" />
            <p className="text-[12px] text-blue-300">
              {ROUTES.length} routes registered — <span className="text-emerald-400">Green</span> = public · <span className="text-amber-400">Amber</span> = staff · <span className="text-red-400">Red</span> = super_admin only
            </p>
          </div>

          {(["public", "admin+", "sponsor", "super_admin"] as const).map(access => {
            const group = ROUTES.filter(r => r.access === access);
            if (!group.length) return null;
            const label =
              access === "public"     ? "Public routes"
            : access === "admin+"     ? "Staff routes (admin+)"
            : access === "sponsor"    ? "Sponsor routes"
            :                           "Super admin only";
            const colour =
              access === "public"     ? "border-emerald-800"
            : access === "admin+"     ? "border-amber-800"
            : access === "sponsor"    ? "border-violet-800"
            :                           "border-red-800";
            const dot =
              access === "public"     ? "bg-emerald-400"
            : access === "admin+"     ? "bg-amber-400"
            : access === "sponsor"    ? "bg-violet-400"
            :                           "bg-red-400";
            return (
              <div key={access} className={`bg-crm-card border ${colour} rounded-xl p-4`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`w-2 h-2 rounded-full ${dot}`} />
                  <h3 className="text-[12px] font-bold text-crm-text">{label}</h3>
                  <span className="text-[10px] font-mono text-crm-text-dim bg-crm-surface border border-crm-border rounded px-1.5">{group.length}</span>
                </div>
                <div className="grid sm:grid-cols-2 gap-1.5">
                  {group.map(r => {
                    const Icon = r.icon;
                    return (
                      <Link
                        key={r.path} to={r.path} target="_blank"
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-crm-card border border-crm-border hover:border-crm-border-hover transition-all text-[11px] group"
                      >
                        <Icon size={12} className="text-crm-text-dim group-hover:text-crm-text-muted flex-shrink-0" />
                        <span className="font-medium text-crm-text truncate">{r.label}</span>
                        <code className="text-[9px] text-crm-text-faint ml-auto font-mono">{r.path}</code>
                        <ChevronRight size={10} className="text-crm-text-faint flex-shrink-0" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══ EMAIL CONFIG ══ */}
      {tab === "email-config" && <EmailConfigTab userId={user?.id} />}
      {tab === "branding" && <BrandingTab userId={user?.id} />}

      {/* ══ SETTINGS ══ */}
      {tab === "settings" && (
        <div className="space-y-4">
          <div className="bg-crm-card border border-crm-border rounded-xl p-4">
            <h3 className="text-[12px] font-semibold text-crm-text-secondary flex items-center gap-2 mb-4">
              <Settings size={13} /> System information
            </h3>
            <div className="space-y-2">
              {[
                { label:"Platform",      value:"ECOWAS Parliament 25th Anniversary" },
                { label:"Auth provider", value:"Supabase (email + password)"        },
                { label:"Role system",   value:"PostgreSQL ENUM + RLS policies"     },
                { label:"Invite method", value:"Supabase Edge Function — invite-user"},
                { label:"Your user ID",  value:user?.id ?? "—"                      },
                { label:"Your email",    value:user?.email ?? "—"                   },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between py-2 border-b border-crm-border last:border-0">
                  <p className="text-[11px] text-crm-text-muted">{s.label}</p>
                  <p className="text-[11px] font-mono text-crm-text truncate max-w-xs text-right">{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-crm-card border border-red-900 rounded-xl p-4">
            <h3 className="text-[12px] font-semibold text-red-400 flex items-center gap-2 mb-3">
              <AlertTriangle size={13} /> Danger zone
            </h3>
            <p className="text-[11px] text-crm-text-muted mb-3">These actions are irreversible. Proceed with caution.</p>
            <Button
              variant="outline"
              size="sm"
              className="border-red-900 text-red-400 hover:bg-red-950 hover:text-red-300 text-xs gap-1.5"
              onClick={() => signOut()}
            >
              Sign out of super admin session
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
