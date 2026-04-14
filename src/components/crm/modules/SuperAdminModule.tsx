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
  Link2,
  Filter, X, Plus, Shield, Timer, Sun, Moon, Monitor,
  UserX, UserCheck, Zap, Image, BarChart2, Info, BanIcon,
  Flag, Target, Building2, PenLine, Phone,
  AtSign, BookUser, MapPin, Layers, KeyRound, Copy, CheckCheck,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface UserWithRoles {
  id: string; email: string; full_name: string;
  country: string; created_at: string; roles: AppRole[];
  show_on_website: boolean; title: string | null; organisation: string | null;
  is_active: boolean;
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
interface AuditEntry {
  id: string; action: string; created_at: string;
  performed_by?: string; target_user?: string; details: any;
  source: "activity" | "audit";
  actor_name?: string;
}
interface Country {
  id: string; name: string; code: string; flag: string;
  seats: number; nomination_target: number; sort_order: number;
  created_at: string;
}
interface TeamMemberRecord {
  id: string; full_name: string; title: string | null;
  organisation: string | null; avatar_url: string | null;
  bio: string | null; display_order: number; is_active: boolean;
  created_at: string;
}
interface EmailSig {
  id: string; user_id: string; full_name: string | null;
  title: string | null; email: string | null; department: string | null;
  mobile: string | null; website: string | null; tagline: string | null;
  is_active: boolean; created_at: string; updated_at: string;
  profile_name?: string; profile_email?: string;
}

type Tab = "overview" | "users" | "invitations" | "website" | "activity" | "routes"
         | "countries" | "team-members" | "signatures"
         | "settings" | "email-config" | "branding";

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
function TabBtn({ label, icon: Icon, badge, active, onClick }: {
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
  const [testing, setTesting] = useState(false);

  const handleTest = async () => {
    setTesting(true);
    try {
      // Save current config first so test uses latest values
      await handleSave();
      // functions.invoke() uses getSession() internally (not the setAuth() path used by
      // DB calls), so we must pass the token explicitly to guarantee a fresh JWT is sent.
      const { data: { session: liveSession } } = await supabase.auth.getSession();
      const smtpToken = liveSession?.access_token;
      if (!smtpToken) { toast({ title: "Session expired", description: "Please reload and log in again.", variant: "destructive" }); return; }
      const res = await supabase.functions.invoke("test-smtp", {
        headers: { Authorization: `Bearer ${smtpToken}` },
      });
      const body = res.data as any;
      if (body?.success) {
        toast({ title: "SMTP connection verified", description: "Server responded correctly." });
      } else {
        toast({ title: "SMTP test failed", description: body?.error ?? "Connection refused", variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Test failed", description: err.message, variant: "destructive" });
    } finally { setTesting(false); }
  };

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
        <div className="flex gap-2 mt-5 flex-wrap">
          <Button size="sm" onClick={handleSave} disabled={saving || testing}
            className="text-[11px] gap-1.5">
            {saving ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
            {saving ? "Saving…" : "Save Config"}
          </Button>
          <Button size="sm" variant="outline" onClick={handleTest} disabled={saving || testing}
            className="text-[11px] gap-1.5 border-blue-900 text-blue-400 hover:bg-blue-950 hover:text-blue-300">
            {testing ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
            {testing ? "Testing…" : "Test Connection"}
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
  const faviconRef = useRef<HTMLInputElement>(null);
  const ogImageRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [uploadingOg, setUploadingOg] = useState(false);
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});

  const ALL_KEYS = [
    "site_name", "site_logo_url", "contact_email", "footer_text",
    "social_facebook", "social_twitter", "social_instagram", "social_linkedin", "social_youtube",
    "favicon_url", "brand_primary_color", "brand_accent_color",
    "ga_tracking_id", "gtm_id", "og_image_url", "og_description",
  ];

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

  const uploadFile = async (file: File, folder: string, onUrl: (url: string) => void, setFlag: (v: boolean) => void) => {
    setFlag(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${folder}/file-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("branding").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from("branding").getPublicUrl(path);
      onUrl(publicUrl);
      toast({ title: "Uploaded successfully" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally { setFlag(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const key of ALL_KEYS) {
        if (values[key] !== undefined) {
          const { data: existing } = await (supabase as any).from("site_settings").select("id").eq("key", key).maybeSingle();
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
  const ogDescLen = (values.og_description ?? "").length;

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 size={20} className="animate-spin text-crm-text-muted" /></div>;

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Logo upload */}
      <div className="bg-crm-card border border-crm-border rounded-xl p-5">
        <h3 className="text-[13px] font-semibold text-crm-text flex items-center gap-2 mb-4">
          <Palette size={14} className="text-amber-400" /> Logo & Site Name
        </h3>
        <div className="flex items-start gap-6">
          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 rounded-xl bg-crm-surface border border-crm-border flex items-center justify-center overflow-hidden">
              {values.site_logo_url
                ? <img src={values.site_logo_url} alt="Logo" className="w-full h-full object-contain p-1" />
                : <Globe size={28} className="text-crm-text-dim" />}
            </div>
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-crm-border text-[11px] text-crm-text-muted hover:text-crm-text transition-colors">
              {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
              {uploading ? "Uploading…" : "Upload Logo"}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={e => e.target.files?.[0] && uploadFile(e.target.files[0], "logos", url => set("site_logo_url", url), setUploading)} />
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

      {/* Favicon */}
      <div className="bg-crm-card border border-crm-border rounded-xl p-5">
        <h3 className="text-[13px] font-semibold text-crm-text flex items-center gap-2 mb-4">
          <Image size={14} className="text-amber-400" /> Favicon
        </h3>
        <div className="flex items-center gap-5">
          <div className="w-8 h-8 rounded bg-crm-surface border border-crm-border flex items-center justify-center overflow-hidden flex-shrink-0">
            {values.favicon_url
              ? <img src={values.favicon_url} alt="Favicon" className="w-full h-full object-contain" />
              : <Globe size={14} className="text-crm-text-dim" />}
          </div>
          <div className="flex-1 space-y-2">
            <Input value={values.favicon_url ?? ""} onChange={e => set("favicon_url", e.target.value)}
              className={inputCls} placeholder="https://... or upload a .png/.ico" />
            <button onClick={() => faviconRef.current?.click()} disabled={uploadingFavicon}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-crm-border text-[11px] text-crm-text-muted hover:text-crm-text transition-colors">
              {uploadingFavicon ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
              {uploadingFavicon ? "Uploading…" : "Upload Favicon"}
            </button>
            <input ref={faviconRef} type="file" accept="image/*,.ico" className="hidden"
              onChange={e => e.target.files?.[0] && uploadFile(e.target.files[0], "favicons", url => set("favicon_url", url), setUploadingFavicon)} />
          </div>
        </div>
      </div>

      {/* Brand Colors */}
      <div className="bg-crm-card border border-crm-border rounded-xl p-5">
        <h3 className="text-[13px] font-semibold text-crm-text flex items-center gap-2 mb-4">
          <Palette size={14} className="text-amber-400" /> Brand Colors
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { key: "brand_primary_color", label: "Primary Color", placeholder: "#007A3D" },
            { key: "brand_accent_color", label: "Accent Color", placeholder: "#FFC72C" },
          ].map(({ key, label, placeholder }) => (
            <div key={key} className="space-y-1.5">
              <Label className="text-[11px] text-crm-text-muted">{label}</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={values[key] || placeholder}
                  onChange={e => set(key, e.target.value)}
                  className="w-9 h-9 rounded-lg border border-crm-border bg-crm-surface cursor-pointer p-0.5"
                />
                <Input value={values[key] ?? ""} onChange={e => set(key, e.target.value)}
                  className={`${inputCls} font-mono`} placeholder={placeholder} />
                {values[key] && (
                  <div className="w-6 h-6 rounded border border-crm-border flex-shrink-0" style={{ backgroundColor: values[key] }} />
                )}
              </div>
            </div>
          ))}
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
            { key: "social_facebook",  label: "Facebook" },
            { key: "social_twitter",   label: "Twitter / X" },
            { key: "social_instagram", label: "Instagram" },
            { key: "social_linkedin",  label: "LinkedIn" },
            { key: "social_youtube",   label: "YouTube" },
          ].map(({ key, label }) => (
            <div key={key} className="space-y-1.5">
              <Label className="text-[11px] text-crm-text-muted flex items-center gap-1.5">
                <Link2 size={11} /> {label}
              </Label>
              <Input value={values[key] ?? ""} onChange={e => set(key, e.target.value)} className={inputCls} placeholder="https://..." />
            </div>
          ))}
        </div>
      </div>

      {/* Analytics */}
      <div className="bg-crm-card border border-crm-border rounded-xl p-5">
        <h3 className="text-[13px] font-semibold text-crm-text flex items-center gap-2 mb-2">
          <BarChart2 size={14} className="text-amber-400" /> Analytics & Tracking
        </h3>
        <p className="text-[11px] text-crm-text-muted mb-4">Paste your tracking IDs — the site will inject the relevant scripts automatically.</p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-[11px] text-crm-text-muted">Google Analytics ID</Label>
            <Input value={values.ga_tracking_id ?? ""} onChange={e => set("ga_tracking_id", e.target.value)}
              className={`${inputCls} font-mono`} placeholder="G-XXXXXXXXXX" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] text-crm-text-muted">Google Tag Manager ID</Label>
            <Input value={values.gtm_id ?? ""} onChange={e => set("gtm_id", e.target.value)}
              className={`${inputCls} font-mono`} placeholder="GTM-XXXXXXX" />
          </div>
        </div>
      </div>

      {/* OG / Social Sharing */}
      <div className="bg-crm-card border border-crm-border rounded-xl p-5">
        <h3 className="text-[13px] font-semibold text-crm-text flex items-center gap-2 mb-2">
          <Globe size={14} className="text-amber-400" /> Social Sharing (Open Graph)
        </h3>
        <p className="text-[11px] text-crm-text-muted mb-4">Controls how the site looks when shared on social media or in chat apps.</p>
        <div className="space-y-4">
          {/* OG Image */}
          <div className="space-y-2">
            <Label className="text-[11px] text-crm-text-muted">OG Share Image (1200×630px recommended)</Label>
            <Input value={values.og_image_url ?? ""} onChange={e => set("og_image_url", e.target.value)}
              className={inputCls} placeholder="https://... or upload below" />
            <button onClick={() => ogImageRef.current?.click()} disabled={uploadingOg}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-crm-border text-[11px] text-crm-text-muted hover:text-crm-text transition-colors">
              {uploadingOg ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
              {uploadingOg ? "Uploading…" : "Upload OG Image"}
            </button>
            <input ref={ogImageRef} type="file" accept="image/*" className="hidden"
              onChange={e => e.target.files?.[0] && uploadFile(e.target.files[0], "og", url => set("og_image_url", url), setUploadingOg)} />
          </div>
          {/* OG Description */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] text-crm-text-muted">Meta Description</Label>
              <span className={`text-[10px] font-mono ${ogDescLen > 160 ? "text-red-400" : "text-crm-text-dim"}`}>{ogDescLen}/160</span>
            </div>
            <textarea
              value={values.og_description ?? ""}
              onChange={e => set("og_description", e.target.value)}
              maxLength={200}
              rows={3}
              placeholder="Brief description for search engines and social sharing…"
              className="w-full bg-crm-surface border border-crm-border rounded-lg text-crm-text text-[12px] px-3 py-2 resize-none focus:outline-none focus:border-primary/50"
            />
          </div>
          {/* Preview card */}
          {(values.og_image_url || values.og_description || values.site_name) && (
            <div className="rounded-xl overflow-hidden border border-crm-border max-w-sm">
              {values.og_image_url && (
                <div className="h-40 bg-crm-surface overflow-hidden">
                  <img src={values.og_image_url} alt="OG Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-3 bg-crm-surface">
                <p className="text-[10px] text-crm-text-dim uppercase tracking-wider mb-0.5">ecowasparliamentinitiatives.org</p>
                <p className="text-[12px] font-semibold text-crm-text truncate">{values.site_name || "ECOWAS Parliament"}</p>
                <p className="text-[11px] text-crm-text-muted mt-0.5 line-clamp-2">{values.og_description || "No description set."}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <Button size="sm" onClick={handleSave} disabled={saving}
        className="bg-amber-700 hover:bg-amber-600 text-white text-xs gap-1.5">
        {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
        {saving ? "Saving…" : "Save All Settings"}
      </Button>
    </div>
  );
}

// ─── Countries CRUD Tab ───────────────────────────────────────────────────────
function CountriesTab() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Country>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const { data: countries = [], isLoading } = useQuery<Country[]>({
    queryKey: ["admin-countries"],
    queryFn: async () => {
      const { data } = await (supabase as any).from("countries").select("*").order("sort_order");
      return data ?? [];
    },
  });

  const openEdit = (c?: Partial<Country>) => {
    setForm(c ?? { code: "", name: "", flag: "", seats: 1, nomination_target: 200, sort_order: 0 });
    setEditId(c?.id ?? "new");
  };

  const handleSave = async () => {
    if (!form.name?.trim() || !form.code?.trim()) {
      toast({ title: "Name and code are required", variant: "destructive" }); return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name!.trim(), code: form.code!.trim().toUpperCase(),
        flag: form.flag ?? "", seats: Number(form.seats ?? 1),
        nomination_target: Number(form.nomination_target ?? 200),
        sort_order: Number(form.sort_order ?? 0),
      };
      if (editId === "new") {
        await (supabase as any).from("countries").insert(payload);
      } else {
        await (supabase as any).from("countries").update(payload).eq("id", editId);
      }
      qc.invalidateQueries({ queryKey: ["admin-countries"] });
      toast({ title: editId === "new" ? "Country added" : "Country updated" });
      setEditId(null);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this country? This may break existing data references.")) return;
    setDeleting(id);
    try {
      await (supabase as any).from("countries").delete().eq("id", id);
      qc.invalidateQueries({ queryKey: ["admin-countries"] });
      toast({ title: "Country deleted" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally { setDeleting(null); }
  };

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 size={20} className="animate-spin text-crm-text-muted" /></div>;

  return (
    <div className="space-y-4">
      <div className="bg-crm-card border border-crm-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-crm-border flex items-center justify-between">
          <h3 className="text-[12px] font-semibold text-crm-text-secondary">ECOWAS Member Countries ({countries.length})</h3>
          <Button size="sm" onClick={() => openEdit()} className="bg-amber-700 hover:bg-amber-600 text-white text-xs gap-1.5 h-7">
            <Plus size={11} /> Add country
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-crm-border">
              {["Flag","Name","Code","Seats","Nomination Target","Order","Actions"].map(h => (
                <th key={h} className="px-4 py-2.5 text-[10px] font-semibold text-crm-text-dim uppercase tracking-wider text-left">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-crm-border">
              {countries.map(c => (
                <tr key={c.id} className="hover:bg-crm-surface transition-colors">
                  <td className="px-4 py-3 text-xl">{c.flag}</td>
                  <td className="px-4 py-3 text-[12px] font-medium text-crm-text">{c.name}</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-crm-text-muted">{c.code}</td>
                  <td className="px-4 py-3 text-[12px] text-crm-text">{c.seats}</td>
                  <td className="px-4 py-3 text-[12px] text-crm-text">{c.nomination_target}</td>
                  <td className="px-4 py-3 text-[12px] text-crm-text-muted">{c.sort_order}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => openEdit(c)} className="text-[10px] text-crm-text-muted hover:text-crm-text px-2 py-1 rounded border border-transparent hover:border-crm-border transition-colors">
                        <PenLine size={11} />
                      </button>
                      <button onClick={() => handleDelete(c.id)} disabled={deleting === c.id}
                        className="text-[10px] text-crm-text-faint hover:text-red-400 px-2 py-1 rounded border border-transparent hover:border-red-900 transition-colors">
                        {deleting === c.id ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit modal */}
      {editId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-crm-card border border-crm-border rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-crm-border">
              <h3 className="text-[14px] font-bold text-crm-text flex items-center gap-2">
                <Flag size={15} className="text-amber-400" /> {editId === "new" ? "Add Country" : "Edit Country"}
              </h3>
              <button onClick={() => setEditId(null)} className="text-crm-text-faint hover:text-crm-text-secondary p-1"><X size={15} /></button>
            </div>
            <div className="px-5 py-4 grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label className="text-[11px] text-crm-text-muted">Country Name</Label>
                <Input value={form.name ?? ""} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="bg-crm-surface border-crm-border text-crm-text text-[12px] h-9" placeholder="Nigeria" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] text-crm-text-muted">ISO Code</Label>
                <Input value={form.code ?? ""} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                  className="bg-crm-surface border-crm-border text-crm-text text-[12px] h-9 font-mono uppercase" placeholder="NG" maxLength={3} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] text-crm-text-muted">Flag emoji</Label>
                <Input value={form.flag ?? ""} onChange={e => setForm(p => ({ ...p, flag: e.target.value }))}
                  className="bg-crm-surface border-crm-border text-crm-text text-[12px] h-9 text-xl" placeholder="🇳🇬" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] text-crm-text-muted flex items-center gap-1"><Target size={10} /> Parliament Seats</Label>
                <Input type="number" min={1} value={form.seats ?? 1} onChange={e => setForm(p => ({ ...p, seats: +e.target.value }))}
                  className="bg-crm-surface border-crm-border text-crm-text text-[12px] h-9" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] text-crm-text-muted flex items-center gap-1"><Target size={10} /> Nomination Target</Label>
                <Input type="number" min={1} value={form.nomination_target ?? 200} onChange={e => setForm(p => ({ ...p, nomination_target: +e.target.value }))}
                  className="bg-crm-surface border-crm-border text-crm-text text-[12px] h-9" />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label className="text-[11px] text-crm-text-muted">Display order (ascending)</Label>
                <Input type="number" min={0} value={form.sort_order ?? 0} onChange={e => setForm(p => ({ ...p, sort_order: +e.target.value }))}
                  className="bg-crm-surface border-crm-border text-crm-text text-[12px] h-9" />
              </div>
            </div>
            <div className="flex justify-end gap-2 px-5 py-4 border-t border-crm-border">
              <Button size="sm" variant="outline" onClick={() => setEditId(null)} className="border-crm-border text-crm-text-muted text-xs h-8">Cancel</Button>
              <Button size="sm" onClick={handleSave} disabled={saving} className="bg-amber-700 hover:bg-amber-600 text-white text-xs h-8 gap-1.5">
                {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                {editId === "new" ? "Add Country" : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Team Members CRUD Tab ────────────────────────────────────────────────────
function TeamMembersTab() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const avatarRef = useRef<HTMLInputElement>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<TeamMemberRecord>>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const { data: members = [], isLoading } = useQuery<TeamMemberRecord[]>({
    queryKey: ["admin-team-members"],
    queryFn: async () => {
      const { data } = await (supabase as any).from("team_members").select("*").order("display_order");
      return data ?? [];
    },
  });

  const openEdit = (m?: Partial<TeamMemberRecord>) => {
    setForm(m ?? { full_name: "", title: "", organisation: "", bio: "", display_order: 0, is_active: true });
    setEditId(m?.id ?? "new");
  };

  const handleAvatarUpload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `team/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("team-avatars").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from("team-avatars").getPublicUrl(path);
      setForm(p => ({ ...p, avatar_url: publicUrl }));
      toast({ title: "Avatar uploaded" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally { setUploading(false); }
  };

  const handleSave = async () => {
    if (!form.full_name?.trim()) { toast({ title: "Name required", variant: "destructive" }); return; }
    setSaving(true);
    try {
      const payload = {
        full_name: form.full_name!.trim(),
        title: form.title?.trim() ?? null,
        organisation: form.organisation?.trim() ?? null,
        avatar_url: form.avatar_url ?? null,
        bio: form.bio?.trim() ?? null,
        display_order: Number(form.display_order ?? 0),
        is_active: form.is_active !== false,
      };
      if (editId === "new") {
        await (supabase as any).from("team_members").insert(payload);
      } else {
        await (supabase as any).from("team_members").update(payload).eq("id", editId);
      }
      qc.invalidateQueries({ queryKey: ["admin-team-members"] });
      toast({ title: editId === "new" ? "Member added" : "Member updated" });
      setEditId(null);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this team member from the public page?")) return;
    setDeleting(id);
    try {
      await (supabase as any).from("team_members").delete().eq("id", id);
      qc.invalidateQueries({ queryKey: ["admin-team-members"] });
      toast({ title: "Member removed" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally { setDeleting(null); }
  };

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 size={20} className="animate-spin text-crm-text-muted" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-crm-card border border-emerald-900">
        <Info size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
        <p className="text-[12px] text-crm-text-secondary">
          These are <strong className="text-crm-text">non-auth team members</strong> shown on the public <code className="text-[10px] bg-crm-surface border border-crm-border rounded px-1">/team</code> page.
          CRM users who are shown on the website are managed via the <strong className="text-crm-text">Website Members</strong> tab.
        </p>
      </div>

      <div className="bg-crm-card border border-crm-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-crm-border flex items-center justify-between">
          <h3 className="text-[12px] font-semibold text-crm-text-secondary">Team Members ({members.length})</h3>
          <Button size="sm" onClick={() => openEdit()} className="bg-amber-700 hover:bg-amber-600 text-white text-xs gap-1.5 h-7">
            <Plus size={11} /> Add member
          </Button>
        </div>
        {members.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <Users size={28} className="text-crm-text-faint" />
            <p className="text-[12px] text-crm-text-faint">No team members added yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-crm-border">
            {members.map(m => (
              <div key={m.id} className={`flex items-center gap-3 px-4 py-3 hover:bg-crm-surface transition-colors ${!m.is_active ? "opacity-50" : ""}`}>
                <div className="w-9 h-9 rounded-full overflow-hidden bg-crm-border flex items-center justify-center flex-shrink-0">
                  {m.avatar_url
                    ? <img src={m.avatar_url} alt="" className="w-full h-full object-cover" />
                    : <span className="text-sm font-bold text-emerald-400 uppercase">{m.full_name[0]}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12.5px] font-semibold text-crm-text">{m.full_name}</p>
                  <p className="text-[10px] text-crm-text-muted">{[m.title, m.organisation].filter(Boolean).join(" · ") || "—"}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="text-[9px] px-1.5 py-0.5 rounded border font-mono text-crm-text-dim border-crm-border">#{m.display_order}</span>
                  {!m.is_active && <span className="text-[9px] px-1.5 py-0.5 rounded border bg-amber-950 border-amber-800 text-amber-400">hidden</span>}
                  <button onClick={() => openEdit(m)} className="text-crm-text-muted hover:text-crm-text p-1.5 rounded border border-transparent hover:border-crm-border transition-colors">
                    <PenLine size={12} />
                  </button>
                  <button onClick={() => handleDelete(m.id)} disabled={deleting === m.id}
                    className="text-crm-text-faint hover:text-red-400 p-1.5 rounded border border-transparent hover:border-red-900 transition-colors">
                    {deleting === m.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit modal */}
      {editId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-crm-card border border-crm-border rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-crm-border sticky top-0 bg-crm-card z-10">
              <h3 className="text-[14px] font-bold text-crm-text flex items-center gap-2">
                <Users size={15} className="text-amber-400" /> {editId === "new" ? "Add Team Member" : "Edit Member"}
              </h3>
              <button onClick={() => setEditId(null)} className="text-crm-text-faint hover:text-crm-text-secondary p-1"><X size={15} /></button>
            </div>
            <div className="px-5 py-4 space-y-3">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-crm-surface border border-crm-border flex items-center justify-center flex-shrink-0">
                  {form.avatar_url
                    ? <img src={form.avatar_url} alt="" className="w-full h-full object-cover" />
                    : <Users size={20} className="text-crm-text-dim" />}
                </div>
                <div>
                  <button onClick={() => avatarRef.current?.click()} disabled={uploading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-crm-border text-[11px] text-crm-text-muted hover:text-crm-text transition-colors">
                    {uploading ? <Loader2 size={11} className="animate-spin" /> : <Upload size={11} />}
                    {uploading ? "Uploading…" : "Upload photo"}
                  </button>
                  <input ref={avatarRef} type="file" accept="image/*" className="hidden"
                    onChange={e => e.target.files?.[0] && handleAvatarUpload(e.target.files[0])} />
                  {form.avatar_url && (
                    <button onClick={() => setForm(p => ({ ...p, avatar_url: null }))}
                      className="mt-1 text-[10px] text-red-400 hover:text-red-300">Remove photo</button>
                  )}
                </div>
              </div>
              {[
                { key: "full_name", label: "Full Name *", placeholder: "Dr. Amina Ibrahim" },
                { key: "title", label: "Title / Role", placeholder: "Secretary General" },
                { key: "organisation", label: "Organisation", placeholder: "ECOWAS Parliament" },
              ].map(({ key, label, placeholder }) => (
                <div key={key} className="space-y-1.5">
                  <Label className="text-[11px] text-crm-text-muted">{label}</Label>
                  <Input value={(form as any)[key] ?? ""} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                    className="bg-crm-surface border-crm-border text-crm-text text-[12px] h-9" placeholder={placeholder} />
                </div>
              ))}
              <div className="space-y-1.5">
                <Label className="text-[11px] text-crm-text-muted">Bio</Label>
                <textarea value={form.bio ?? ""} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} rows={3}
                  className="w-full bg-crm-surface border border-crm-border rounded-lg text-crm-text text-[12px] px-3 py-2 resize-none focus:outline-none focus:border-primary/50" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-crm-text-muted">Display order</Label>
                  <Input type="number" min={0} value={form.display_order ?? 0} onChange={e => setForm(p => ({ ...p, display_order: +e.target.value }))}
                    className="bg-crm-surface border-crm-border text-crm-text text-[12px] h-9" />
                </div>
                <div className="flex items-end gap-2 pb-0.5">
                  <Switch checked={form.is_active !== false} onCheckedChange={v => setForm(p => ({ ...p, is_active: v }))}
                    className="data-[state=checked]:bg-emerald-600" />
                  <Label className="text-[11px] text-crm-text-muted">Active (visible on site)</Label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-5 py-4 border-t border-crm-border">
              <Button size="sm" variant="outline" onClick={() => setEditId(null)} className="border-crm-border text-crm-text-muted text-xs h-8">Cancel</Button>
              <Button size="sm" onClick={handleSave} disabled={saving} className="bg-amber-700 hover:bg-amber-600 text-white text-xs h-8 gap-1.5">
                {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                {editId === "new" ? "Add Member" : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Email Signatures Tab ─────────────────────────────────────────────────────
function SignaturesTab() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const { data: sigs = [], isLoading } = useQuery<EmailSig[]>({
    queryKey: ["admin-signatures"],
    queryFn: async () => {
      const [sigsRes, profilesRes] = await Promise.all([
        (supabase as any).from("email_signatures").select("*").order("created_at", { ascending: false }),
        (supabase as any).from("profiles").select("id, full_name, email"),
      ]);
      const profileMap: Record<string, any> = {};
      (profilesRes.data ?? []).forEach((p: any) => { profileMap[p.id] = p; });
      return (sigsRes.data ?? []).map((s: any) => ({
        ...s,
        profile_name: profileMap[s.user_id]?.full_name ?? "Unknown",
        profile_email: profileMap[s.user_id]?.email ?? "",
      }));
    },
  });

  const filtered = sigs.filter(s =>
    !search ||
    (s.full_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (s.profile_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (s.email ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this email signature?")) return;
    setDeleting(id);
    try {
      await (supabase as any).from("email_signatures").delete().eq("id", id);
      qc.invalidateQueries({ queryKey: ["admin-signatures"] });
      toast({ title: "Signature deleted" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally { setDeleting(null); }
  };

  const exportCSV = () => {
    const header = "User,Signature Name,Title,Email,Department,Mobile,Active\n";
    const rows = filtered.map(s =>
      `"${s.profile_name}","${s.full_name ?? ""}","${s.title ?? ""}","${s.email ?? ""}","${s.department ?? ""}","${s.mobile ?? ""}","${s.is_active}"`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "email-signatures.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 size={20} className="animate-spin text-crm-text-muted" /></div>;

  return (
    <div className="space-y-4">
      <div className="bg-crm-card border border-crm-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-crm-border flex items-center justify-between gap-3 flex-wrap">
          <h3 className="text-[12px] font-semibold text-crm-text-secondary">Email Signatures ({filtered.length})</h3>
          <div className="flex items-center gap-2">
            <Input placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)}
              className="bg-crm-surface border-crm-border text-crm-text text-xs h-7 w-48" />
            <Button size="sm" variant="outline" onClick={exportCSV}
              className="border-crm-border text-crm-text-muted text-xs gap-1 h-7">
              <Download size={11} /> CSV
            </Button>
          </div>
        </div>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <PenLine size={28} className="text-crm-text-faint" />
            <p className="text-[12px] text-crm-text-faint">No signatures found.</p>
          </div>
        ) : (
          <div className="divide-y divide-crm-border">
            {filtered.map(s => (
              <div key={s.id} className="px-4 py-3 hover:bg-crm-surface transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[12.5px] font-semibold text-crm-text">{s.full_name || "Unnamed Signature"}</p>
                      {!s.is_active && <span className="text-[9px] px-1.5 py-0.5 rounded border bg-crm-surface border-crm-border text-crm-text-dim">inactive</span>}
                    </div>
                    <p className="text-[10px] text-crm-text-muted mt-0.5">
                      Owner: <span className="text-crm-text-secondary">{s.profile_name}</span>
                      {s.profile_email && <span className="text-crm-text-dim"> · {s.profile_email}</span>}
                    </p>
                    <div className="flex flex-wrap gap-3 mt-1.5 text-[10px] text-crm-text-dim">
                      {s.title && <span className="flex items-center gap-1"><BookUser size={9} />{s.title}</span>}
                      {s.email && <span className="flex items-center gap-1"><AtSign size={9} />{s.email}</span>}
                      {s.department && <span className="flex items-center gap-1"><Building2 size={9} />{s.department}</span>}
                      {s.mobile && <span className="flex items-center gap-1"><Phone size={9} />{s.mobile}</span>}
                      {s.tagline && <span className="flex items-center gap-1 italic">{s.tagline}</span>}
                    </div>
                  </div>
                  <button onClick={() => handleDelete(s.id)} disabled={deleting === s.id}
                    className="text-crm-text-faint hover:text-red-400 p-1.5 rounded border border-transparent hover:border-red-900 transition-colors flex-shrink-0">
                    {deleting === s.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SuperAdminModule() {
  const { user, session, refreshRoles, signOut } = useAuthContext();
  const { toast } = useToast();

  const [tab,         setTab]         = useState<Tab>("overview");
  const [users,       setUsers]       = useState<UserWithRoles[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [auditLog,    setAuditLog]    = useState<AuditEntry[]>([]);
  const [globalSettings, setGlobalSettings] = useState<Record<string, any>>({});
  const [loading,     setLoading]     = useState(true);
  const [inviteEmail,  setInviteEmail]  = useState("");
  const [inviteRole,   setInviteRole]   = useState<AppRole>("admin");
  const [sending,      setSending]      = useState(false);
  const [searchQ,      setSearchQ]      = useState("");
  const [resendingId,  setResendingId]  = useState<string | null>(null);

  // ── User active filter ────────────────────────────────────────────────────
  const [userActiveFilter, setUserActiveFilter] = useState<"all" | "active" | "suspended">("all");

  // ── Activity filters ──────────────────────────────────────────────────────
  const [activityAction, setActivityAction] = useState("");
  const [activityFrom,   setActivityFrom]   = useState("");
  const [activityTo,     setActivityTo]     = useState("");
  const [activitySource, setActivitySource] = useState<"activity" | "audit" | "both">("activity");

  // ── Bulk invite dialog ────────────────────────────────────────────────────
  const [bulkOpen,     setBulkOpen]     = useState(false);
  const [bulkText,     setBulkText]     = useState("");
  const [bulkRole,     setBulkRole]     = useState<AppRole>("admin");
  const [bulkParsed,   setBulkParsed]   = useState<{email:string;role:AppRole;valid:boolean}[]>([]);
  const [bulkSending,  setBulkSending]  = useState(false);
  const [bulkProgress, setBulkProgress] = useState<{done:number;total:number;errors:string[]}>({done:0,total:0,errors:[]});

  // ── Settings save state ───────────────────────────────────────────────────
  const [savingSettings, setSavingSettings] = useState(false);

  // ── User profile viewer ───────────────────────────────────────────────────
  const [profileUser, setProfileUser] = useState<UserWithRoles | null>(null);

  // ── Delete user dialog ────────────────────────────────────────────────────
  const [deleteTarget,      setDeleteTarget]      = useState<UserWithRoles | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting,          setDeleting]          = useState(false);

  // ── Resend cooldown tracking ──────────────────────────────────────────────
  // key: invitation id, value: unix ms when cooldown expires
  const [resendCooldowns, setResendCooldowns] = useState<Record<string, number>>({});
  const [now, setNow] = useState(Date.now());

  // ── Create User (direct, with password) ──────────────────────────────────
  const [inviteMode,      setInviteMode]      = useState<"invite" | "create">("invite");
  const [createEmail,     setCreateEmail]     = useState("");
  const [createName,      setCreateName]      = useState("");
  const [createRole,      setCreateRole]      = useState<AppRole>("admin");
  const [createPassword,  setCreatePassword]  = useState("");
  const [createForceChange, setCreateForceChange] = useState(true);
  const [createResult,    setCreateResult]    = useState<string | null>(null);
  const [creating,        setCreating]        = useState(false);
  const [showCreatePw,    setShowCreatePw]    = useState(false);
  const [copiedCreate,    setCopiedCreate]    = useState(false);

  // ── Reset Password per user ───────────────────────────────────────────────
  const [resetTarget,   setResetTarget]   = useState<UserWithRoles | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const [resetForce,    setResetForce]    = useState(true);
  const [resettingPw,   setResettingPw]   = useState(false);
  const [showResetPw,   setShowResetPw]   = useState(false);
  const [copiedReset,   setCopiedReset]   = useState(false);

  // ── Load all data ────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [profilesRes, rolesRes, invRes, actRes, auditRes, gsRes] = await Promise.all([
        (supabase as any).from("profiles").select("id, email, full_name, country, created_at, show_on_website, title, organisation, is_active").order("created_at", { ascending: false }),
        (supabase as any).from("user_roles").select("user_id, role"),
        (supabase as any).from("invitations").select("id, email, role, invited_by, created_at, accepted_at, expires_at, resent_at").is("accepted_at", null).order("created_at", { ascending: false }),
        (supabase as any).from("admin_activity_logs").select("id, action, entity_type, details, created_at, profiles!actor_user_id(full_name, email)").order("created_at", { ascending: false }).limit(200),
        (supabase as any).from("admin_audit_log").select("id, action, performed_by, target_user, details, created_at").order("created_at", { ascending: false }).limit(200),
        (supabase as any).from("global_settings").select("key, value"),
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
        is_active: p.is_active !== false,
      })));

      const invData: Invitation[] = invRes.data ?? [];
      setInvitations(invData);

      // Seed cooldowns from DB
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

      setAuditLog((auditRes.data ?? []).map((l: any) => ({
        id: l.id, action: l.action, created_at: l.created_at,
        performed_by: l.performed_by, target_user: l.target_user,
        details: l.details, source: "audit" as const,
      })));

      const gs: Record<string, any> = {};
      (gsRes.data ?? []).forEach((r: any) => { gs[r.key] = r.value; });
      setGlobalSettings(gs);

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
      // refreshSession() makes a server round-trip to obtain a guaranteed-fresh JWT.
      // getSession() alone returns the cached token which may be expired in v2.99.x,
      // causing the edge function to reject with 401 even when the user is still logged in.
      const { data: refreshData, error: refreshErr } = await supabase.auth.refreshSession();
      const inviteToken = refreshData?.session?.access_token;
      if (refreshErr || !inviteToken) {
        toast({ title: "Session expired", description: "Please reload the page and log in again.", variant: "destructive" });
        setSending(false);
        return;
      }
      const res = await supabase.functions.invoke("invite-user", {
        headers: { Authorization: `Bearer ${inviteToken}` },
        body: { email: inviteEmail.trim(), role: inviteRole, redirectUrl: `${window.location.origin}/set-password` },
      });
      if (res.error) {
        // Try to surface the actual error message from the edge function body
        let msg = "Edge Function error";
        try { msg = (await (res.error as any).context?.json?.())?.error ?? res.error.message; } catch { msg = res.error.message; }
        throw new Error(msg);
      }
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
      const { data: refreshData, error: refreshErr } = await supabase.auth.refreshSession();
      const resendToken = refreshData?.session?.access_token;
      if (refreshErr || !resendToken) {
        toast({ title: "Session expired", description: "Please reload and log in again.", variant: "destructive" });
        setResendingId(null);
        return;
      }
      const res = await supabase.functions.invoke("resend-invite", {
        headers: { Authorization: `Bearer ${resendToken}` },
        body: { invitation_id: invId },
      });
      if (res.error) {
        let msg = "Edge Function error";
        try { msg = (await (res.error as any).context?.json?.())?.error ?? res.error.message; } catch { msg = res.error.message; }
        throw new Error(msg);
      }
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

  // ── Toggle user active/suspended ─────────────────────────────────────────
  const toggleUserActive = async (targetId: string, active: boolean) => {
    try {
      await (supabase as any).from("profiles").update({ is_active: active }).eq("id", targetId);
      setUsers(prev => prev.map(u => u.id === targetId ? { ...u, is_active: active } : u));
      toast({ title: active ? "User reactivated" : "User suspended" });
      await (supabase as any).from("admin_activity_logs").insert({
        actor_user_id: user!.id,
        action: active ? "user_reactivated" : "user_suspended",
        entity_type: "user", entity_id: targetId,
        details: { email: users.find(u => u.id === targetId)?.email },
      });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  // ── Save global_setting ───────────────────────────────────────────────────
  const saveGlobalSetting = async (key: string, value: any) => {
    await (supabase as any).from("global_settings")
      .upsert({ key, value, updated_by: user?.id }, { onConflict: "key" });
    setGlobalSettings(prev => ({ ...prev, [key]: value }));
  };

  // ── Export activity log CSV ───────────────────────────────────────────────
  const exportActivityLog = (entries: AuditEntry[]) => {
    const header = "Time,Source,Action,Actor,Details\n";
    const rows = entries.map(e =>
      `"${new Date(e.created_at).toLocaleString()}","${e.source}","${e.action}","${e.actor_name ?? e.performed_by ?? "system"}","${JSON.stringify(e.details ?? {}).replace(/"/g, '""')}"`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "activity-log.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  // ── Bulk invite parse + send ──────────────────────────────────────────────
  const parseBulkCSV = (text: string, defaultRole: AppRole) => {
    return text.split("\n").map(l => l.trim()).filter(Boolean).map(line => {
      const [emailRaw, roleRaw] = line.split(",").map(s => s.trim());
      const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailRaw);
      const validRole = roleRaw && Object.keys(ROLE_CONFIG).includes(roleRaw);
      return { email: emailRaw, role: (validRole ? roleRaw : defaultRole) as AppRole, valid: validEmail };
    });
  };

  const sendBulkInvites = async () => {
    if (!session) {
      toast({ title: "Session expired", description: "Please reload the page and log in again.", variant: "destructive" });
      return;
    }
    const valid = bulkParsed.filter(r => r.valid);
    setBulkProgress({ done: 0, total: valid.length, errors: [] });
    setBulkSending(true);
    // Fetch token once before the loop — avoids repeated async overhead per row
    // and ensures all rows use the same fresh JWT rather than relying on
    // functions.invoke()'s internal getSession() which may return stale tokens.
    const { data: refreshDataB, error: refreshErrB } = await supabase.auth.refreshSession();
    const bulkToken = refreshDataB?.session?.access_token;
    if (refreshErrB || !bulkToken) {
      toast({ title: "Session expired", description: "Please reload the page and log in again.", variant: "destructive" });
      setBulkSending(false);
      return;
    }
    for (const row of valid) {
      try {
        const res = await supabase.functions.invoke("invite-user", {
          headers: { Authorization: `Bearer ${bulkToken}` },
          body: { email: row.email, role: row.role, redirectUrl: `${window.location.origin}/set-password` },
        });
        if (res.error) {
          let msg = "Edge Function error";
          try { msg = (await (res.error as any).context?.json?.())?.error ?? res.error.message; } catch { msg = res.error.message; }
          throw new Error(msg);
        }
        const body = res.data as any;
        if (body?.error) throw new Error(body.error);
      } catch (e: any) {
        setBulkProgress(prev => ({ ...prev, errors: [...prev.errors, `${row.email}: ${e.message}`] }));
      } finally {
        setBulkProgress(prev => ({ ...prev, done: prev.done + 1 }));
      }
    }
    setBulkSending(false);
    loadData();
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
    if (!session) {
      toast({ title: "Session expired", description: "Please reload the page and log in again.", variant: "destructive" });
      return;
    }
    setDeleting(true);
    try {
      const { data: refreshDataD, error: refreshErrD } = await supabase.auth.refreshSession();
      const deleteToken = refreshDataD?.session?.access_token;
      if (refreshErrD || !deleteToken) {
        toast({ title: "Session expired", description: "Please reload and log in again.", variant: "destructive" });
        setDeleting(false);
        return;
      }
      const res = await supabase.functions.invoke("delete-user", {
        headers: { Authorization: `Bearer ${deleteToken}` },
        body: { user_ids: [deleteTarget.id] },
      });
      if (res.error) {
        let msg = "Edge Function error";
        try { msg = (await (res.error as any).context?.json?.())?.error ?? res.error.message; } catch { msg = res.error.message; }
        throw new Error(msg);
      }
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

  // ── Generate a random password ────────────────────────────────────────────
  const generatePassword = () => {
    const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
    return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  };

  // ── Create User (direct, no invite email) ────────────────────────────────
  const handleCreateUser = async () => {
    if (!createEmail.trim() || !createPassword) return;
    const { data: refreshData, error: refreshErr } = await supabase.auth.refreshSession();
    const token = refreshData?.session?.access_token;
    if (refreshErr || !token) {
      toast({ title: "Session expired", description: "Please reload and log in again.", variant: "destructive" });
      return;
    }
    setCreating(true);
    setCreateResult(null);
    try {
      const res = await supabase.functions.invoke("create-user", {
        headers: { Authorization: `Bearer ${token}` },
        body: {
          email: createEmail.trim(),
          password: createPassword,
          role: createRole,
          full_name: createName.trim() || undefined,
          force_password_change: createForceChange,
        },
      });
      if (res.error) {
        let msg = "Edge Function error";
        try { msg = (await (res.error as any).context?.json?.())?.error ?? res.error.message; } catch { msg = res.error.message; }
        throw new Error(msg);
      }
      const body = res.data as any;
      if (body?.error) throw new Error(body.error);
      setCreateResult(createPassword);
      toast({ title: "User created", description: `Account created for ${createEmail.trim()}` });
      setCreateEmail("");
      setCreateName("");
      setCreatePassword("");
      loadData();
    } catch (err: any) {
      toast({ title: "Error creating user", description: err.message, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  // ── Admin reset password ──────────────────────────────────────────────────
  const handleAdminResetPassword = async () => {
    if (!resetTarget || !resetPassword) return;
    const { data: refreshData, error: refreshErr } = await supabase.auth.refreshSession();
    const token = refreshData?.session?.access_token;
    if (refreshErr || !token) {
      toast({ title: "Session expired", description: "Please reload and log in again.", variant: "destructive" });
      return;
    }
    setResettingPw(true);
    try {
      const res = await supabase.functions.invoke("admin-reset-password", {
        headers: { Authorization: `Bearer ${token}` },
        body: { target_user_id: resetTarget.id, new_password: resetPassword, force_password_change: resetForce },
      });
      if (res.error) {
        let msg = "Edge Function error";
        try { msg = (await (res.error as any).context?.json?.())?.error ?? res.error.message; } catch { msg = res.error.message; }
        throw new Error(msg);
      }
      const body = res.data as any;
      if (body?.error) throw new Error(body.error);
      toast({ title: "Password reset", description: `Password updated for ${resetTarget.full_name || resetTarget.email}` });
      setResetTarget(null);
      setResetPassword("");
    } catch (err: any) {
      toast({ title: "Error resetting password", description: err.message, variant: "destructive" });
    } finally {
      setResettingPw(false);
    }
  };

  const stats = {
    total:       users.length,
    superAdmins: users.filter(u => u.roles.includes("super_admin")).length,
    admins:      users.filter(u => u.roles.includes("admin")).length,
    pendingInv:  invitations.filter(i => !i.accepted_at).length,
  };

  const websiteUsers = users.filter(u => u.show_on_website);

  const filteredUsers = users.filter(u => {
    if (userActiveFilter === "active" && !u.is_active) return false;
    if (userActiveFilter === "suspended" && u.is_active) return false;
    return !searchQ ||
      u.full_name.toLowerCase().includes(searchQ.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQ.toLowerCase()) ||
      u.country.toLowerCase().includes(searchQ.toLowerCase());
  });

  // ── Merged activity for the Activity tab ──────────────────────────────────
  const mergedActivity: AuditEntry[] = (() => {
    const fromActivity: AuditEntry[] = activityLog.map(l => ({
      id: l.id, action: l.action, created_at: l.created_at,
      details: l.details, source: "activity" as const,
      actor_name: l.actor?.full_name ?? l.actor?.email,
    }));
    const all = activitySource === "activity" ? fromActivity
      : activitySource === "audit" ? auditLog
      : [...fromActivity, ...auditLog].sort((a, b) => b.created_at.localeCompare(a.created_at));
    return all.filter(e => {
      if (activityAction && !e.action.toLowerCase().includes(activityAction.toLowerCase())) return false;
      if (activityFrom && e.created_at < activityFrom) return false;
      if (activityTo && e.created_at > activityTo + "T23:59:59") return false;
      return true;
    });
  })();

  const exportUsersCSV = () => {
    const header = "Name,Email,Country,Roles,Status,Joined\n";
    const rows = filteredUsers.map(u =>
      `"${u.full_name}","${u.email}","${u.country}","${u.roles.join('; ')}","${u.is_active ? "active" : "suspended"}","${u.created_at}"`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "users-export.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const NAV: { id: Tab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id:"overview",     label:"Overview",        icon:LayoutDashboard },
    { id:"users",        label:"Users",           icon:Users,    badge:stats.total },
    { id:"invitations",  label:"Invitations",     icon:Mail,     badge:stats.pendingInv },
    { id:"website",      label:"Website Members", icon:Globe,    badge:websiteUsers.length },
    { id:"team-members", label:"Team Members",    icon:Users },
    { id:"countries",    label:"Countries",       icon:Flag },
    { id:"signatures",   label:"Signatures",      icon:PenLine },
    { id:"activity",     label:"Activity Log",    icon:Activity },
    { id:"routes",       label:"Site Routes",     icon:Globe },
    { id:"email-config", label:"Email Config",    icon:Mail },
    { id:"branding",     label:"Branding & Site", icon:Palette },
    { id:"settings",     label:"Settings",        icon:Settings },
  ];

  return (
    <div className="space-y-5">

      {/* ══ RESET PASSWORD DIALOG ══ */}
      {resetTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-crm-card border border-amber-900 rounded-2xl w-full max-w-md shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-crm-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-950 border border-amber-800 flex items-center justify-center">
                  <KeyRound size={15} className="text-amber-400" />
                </div>
                <h3 className="text-[14px] font-bold text-crm-text">Reset Password</h3>
              </div>
              <button
                onClick={() => { setResetTarget(null); setResetPassword(""); }}
                className="text-crm-text-faint hover:text-crm-text-secondary transition-colors p-1"
              >
                ✕
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">
              {/* User info */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-crm-surface border border-crm-border">
                <div className="w-9 h-9 rounded-full bg-crm-border flex items-center justify-center text-sm font-bold text-emerald-400 flex-shrink-0 uppercase">
                  {(resetTarget.full_name || resetTarget.email)[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-crm-text">{resetTarget.full_name || "—"}</p>
                  <p className="text-[11px] text-crm-text-muted">{resetTarget.email}</p>
                </div>
              </div>

              {/* New password field */}
              <div>
                <label className="text-[11px] text-crm-text-muted block mb-1.5">New password</label>
                <div className="relative">
                  <Input
                    type={showResetPw ? "text" : "password"}
                    value={resetPassword}
                    onChange={e => setResetPassword(e.target.value)}
                    className="bg-crm-surface border-crm-border text-crm-text text-xs h-8 font-mono pr-20"
                  />
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                    <button type="button" onClick={() => setShowResetPw(v => !v)}
                      className="text-crm-text-muted hover:text-crm-text-secondary p-1 transition-colors">
                      <Eye size={12} />
                    </button>
                    <button type="button"
                      onClick={() => { const p = generatePassword(); setResetPassword(p); }}
                      className="text-[9px] font-bold text-amber-500 hover:text-amber-400 px-1.5 py-0.5 rounded border border-amber-800 hover:bg-amber-950 transition-colors">
                      Gen
                    </button>
                    <button type="button"
                      onClick={() => { navigator.clipboard.writeText(resetPassword); setCopiedReset(true); setTimeout(() => setCopiedReset(false), 2000); }}
                      className="text-crm-text-muted hover:text-crm-text-secondary p-1 transition-colors"
                      title="Copy password"
                    >
                      {copiedReset ? <CheckCheck size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Force change checkbox */}
              <label className="flex items-center gap-2 text-[11px] text-crm-text-muted cursor-pointer">
                <input type="checkbox" checked={resetForce} onChange={e => setResetForce(e.target.checked)}
                  className="accent-amber-500 w-3 h-3" />
                Force password change on next login
              </label>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-crm-border">
              <Button
                variant="outline" size="sm"
                onClick={() => { setResetTarget(null); setResetPassword(""); }}
                className="border-crm-border text-crm-text-muted hover:text-crm-text-secondary text-xs h-8"
                disabled={resettingPw}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleAdminResetPassword}
                disabled={!resetPassword || resetPassword.length < 8 || resettingPw}
                className="bg-amber-700 hover:bg-amber-600 text-white text-xs h-8 gap-1.5 disabled:opacity-40"
              >
                {resettingPw ? <Loader2 size={12} className="animate-spin" /> : <KeyRound size={12} />}
                Reset password
              </Button>
            </div>
          </div>
        </div>
      )}

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

      {/* ══ USER PROFILE VIEWER ══ */}
      {profileUser && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:justify-end p-0 sm:p-4 bg-black/60 backdrop-blur-sm" onClick={() => setProfileUser(null)}>
          <div className="bg-crm-card border-l border-crm-border w-full sm:w-[420px] h-full sm:h-auto sm:max-h-[90vh] sm:rounded-2xl overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="relative">
              <div className="h-24 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 sm:rounded-t-2xl" />
              <button onClick={() => setProfileUser(null)}
                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-colors">
                <X size={14} />
              </button>
              <div className="px-5 pb-4 -mt-10 flex items-end gap-4">
                <div className="w-20 h-20 rounded-xl bg-crm-card border-4 border-crm-card shadow-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <span className="text-2xl font-black text-emerald-400 uppercase">
                    {(profileUser.full_name || profileUser.email)[0]}
                  </span>
                </div>
                <div className="pb-1 min-w-0">
                  <h3 className="text-[15px] font-bold text-crm-text truncate">{profileUser.full_name || "—"}</h3>
                  <p className="text-[11px] text-crm-text-muted truncate">{profileUser.email}</p>
                </div>
              </div>
            </div>
            {/* Details */}
            <div className="px-5 pb-5 space-y-4">
              {/* Status + suspend */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${profileUser.is_active ? "bg-emerald-950 border-emerald-800 text-emerald-400" : "bg-amber-950 border-amber-800 text-amber-400"}`}>
                  {profileUser.is_active ? "Active" : "Suspended"}
                </span>
                {profileUser.show_on_website && (
                  <span className="text-[10px] px-2 py-1 rounded-full border bg-blue-950 border-blue-800 text-blue-400">On website</span>
                )}
                {profileUser.id === user?.id && (
                  <span className="text-[10px] px-2 py-1 rounded-full border bg-amber-950 border-amber-800 text-amber-400">You</span>
                )}
              </div>
              {/* Info rows */}
              <div className="bg-crm-surface border border-crm-border rounded-xl divide-y divide-crm-border">
                {[
                  { icon: AtSign,    label: "Email",        value: profileUser.email },
                  { icon: MapPin,    label: "Country",      value: profileUser.country || "—" },
                  { icon: Building2, label: "Organisation", value: profileUser.organisation || "—" },
                  { icon: BookUser,  label: "Title",        value: profileUser.title || "—" },
                  { icon: Calendar,  label: "Joined",       value: new Date(profileUser.created_at).toLocaleDateString("en-GB", { day:"numeric",month:"long",year:"numeric" }) },
                  { icon: Shield,    label: "User ID",      value: profileUser.id.substring(0,8)+"…" },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3 px-3 py-2.5">
                    <Icon size={12} className="text-crm-text-dim flex-shrink-0" />
                    <span className="text-[11px] text-crm-text-muted w-24 flex-shrink-0">{label}</span>
                    <span className="text-[12px] text-crm-text font-medium truncate">{value}</span>
                  </div>
                ))}
              </div>
              {/* Roles */}
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-crm-text-dim mb-2">Assigned Roles</p>
                {profileUser.roles.length === 0
                  ? <p className="text-[12px] text-crm-text-faint">No roles assigned</p>
                  : <div className="flex flex-wrap gap-1.5">
                    {profileUser.roles.map(r => {
                      const cfg = ROLE_CONFIG[r];
                      if (!cfg) return null;
                      const Icon = cfg.icon;
                      return (
                        <span key={r} className={`flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded border ${cfg.badge}`}>
                          <Icon size={10} /> {cfg.label}
                        </span>
                      );
                    })}
                  </div>}
              </div>
              {/* Actions */}
              {profileUser.id !== user?.id && (
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline"
                    onClick={() => { toggleUserActive(profileUser.id, !profileUser.is_active); setProfileUser(prev => prev ? { ...prev, is_active: !prev.is_active } : null); }}
                    className={`text-xs gap-1.5 h-8 flex-1 ${profileUser.is_active ? "border-amber-900 text-amber-400 hover:bg-amber-950" : "border-emerald-900 text-emerald-400 hover:bg-emerald-950"}`}>
                    {profileUser.is_active ? <UserX size={12} /> : <UserCheck size={12} />}
                    {profileUser.is_active ? "Suspend user" : "Reactivate user"}
                  </Button>
                  <Button size="sm" variant="outline"
                    onClick={() => { setProfileUser(null); deleteUser(profileUser); }}
                    className="text-xs gap-1.5 h-8 border-red-900 text-red-400 hover:bg-red-950">
                    <Trash2 size={12} /> Delete
                  </Button>
                </div>
              )}
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
              { label: "Manage Users",     icon: Users,    tab: "users" as Tab },
              { label: "View Invitations", icon: Mail,     tab: "invitations" as Tab },
              { label: "Website Members",  icon: Globe,    tab: "website" as Tab },
              { label: "Team Members",     icon: Users,    tab: "team-members" as Tab },
              { label: "Countries",        icon: Flag,     tab: "countries" as Tab },
              { label: "Signatures",       icon: PenLine,  tab: "signatures" as Tab },
              { label: "Activity Log",     icon: Activity, tab: "activity" as Tab },
              { label: "Email Config",     icon: Settings, tab: "email-config" as Tab },
              { label: "Branding",         icon: Palette,  tab: "branding" as Tab },
              { label: "Settings",         icon: Settings, tab: "settings" as Tab },
            ].map(({ label, icon: Icon, tab: t }) => (
              <button key={t} onClick={() => setTab(t)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-crm-surface border border-crm-border hover:border-crm-border-hover text-[11px] text-crm-text-muted hover:text-crm-text-secondary transition-colors">
                <Icon size={12} /> {label}
              </button>
            ))}
          </div>

          {/* External module quick-links */}
          <div className="bg-crm-card border border-crm-border rounded-xl p-4">
            <h3 className="text-[12px] font-semibold text-crm-text-secondary mb-3">Dedicated Management Modules</h3>
            <div className="grid sm:grid-cols-2 gap-2">
              {[
                { label: "Programme Pillars", desc: "Manage 7 programme pillars, progress & leads", icon: Layers, section: "programme-pillars" },
                { label: "Sponsors & Partners", desc: "Full CRUD for sponsors, tiers, logos", icon: Star, section: "sponsors-partners" },
                { label: "Newsletter", desc: "Subscribers list, export, unsubscribe tracking", icon: Mail, section: "newsletter" },
                { label: "Contact Submissions", desc: "Review & manage contact form submissions", icon: FileText, section: "contact-submissions" },
              ].map(({ label, desc, icon: Icon, section }) => (
                <div key={section} className="flex items-start gap-3 p-3 rounded-lg border border-crm-border hover:border-crm-border-hover transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-crm-surface border border-crm-border flex items-center justify-center flex-shrink-0">
                    <Icon size={14} className="text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-crm-text">{label}</p>
                    <p className="text-[10px] text-crm-text-dim mt-0.5">{desc}</p>
                  </div>
                  <ChevronRight size={12} className="text-crm-text-faint flex-shrink-0 mt-1" />
                </div>
              ))}
            </div>
            <p className="text-[10px] text-crm-text-faint mt-3">Access via the CRM sidebar navigation.</p>
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

      {/* ══ BULK INVITE DIALOG ══ */}
      {bulkOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-crm-card border border-crm-border rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-crm-border">
              <div className="flex items-center gap-2">
                <Users size={15} className="text-amber-400" />
                <h3 className="text-[14px] font-bold text-crm-text">Bulk Invite</h3>
              </div>
              <button onClick={() => { setBulkOpen(false); setBulkParsed([]); setBulkText(""); }} className="text-crm-text-faint hover:text-crm-text-secondary p-1">
                <X size={15} />
              </button>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div className="flex items-center gap-3">
                <Label className="text-[11px] text-crm-text-muted whitespace-nowrap">Default role:</Label>
                <Select value={bulkRole} onValueChange={v => setBulkRole(v as AppRole)}>
                  <SelectTrigger className="bg-crm-surface border-crm-border text-crm-text text-xs h-8 w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-crm-card border-crm-border">
                    {(Object.keys(ROLE_CONFIG) as AppRole[]).map(r => (
                      <SelectItem key={r} value={r} className="text-crm-text text-xs">{ROLE_CONFIG[r]?.label ?? r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] text-crm-text-muted">Paste emails — one per line, or <span className="font-mono">email,role</span> per line</Label>
                <textarea
                  value={bulkText} onChange={e => setBulkText(e.target.value)}
                  rows={6} placeholder={"alice@example.com\nbob@example.com,admin\ncarol@example.com,moderator"}
                  className="w-full bg-crm-surface border border-crm-border rounded-lg text-crm-text text-[12px] font-mono px-3 py-2 resize-none focus:outline-none focus:border-primary/50"
                />
              </div>
              <Button size="sm" variant="outline" onClick={() => setBulkParsed(parseBulkCSV(bulkText, bulkRole))}
                className="border-crm-border text-crm-text-muted text-xs gap-1.5 h-7">
                <Filter size={11} /> Parse &amp; Preview
              </Button>
              {bulkParsed.length > 0 && (
                <div className="max-h-40 overflow-y-auto space-y-1 rounded-lg bg-crm-surface border border-crm-border p-2">
                  {bulkParsed.map((row, i) => (
                    <div key={i} className={`flex items-center justify-between text-[11px] px-2 py-1 rounded ${row.valid ? "text-crm-text" : "text-red-400"}`}>
                      <span className="font-mono">{row.email}</span>
                      {row.valid
                        ? <span className="text-[9px] px-1.5 py-0.5 rounded border border-emerald-800 bg-emerald-950 text-emerald-400">{row.role}</span>
                        : <span className="text-[9px] text-red-400">invalid email</span>}
                    </div>
                  ))}
                </div>
              )}
              {bulkSending && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-crm-text-muted">
                    <span>Sending…</span>
                    <span>{bulkProgress.done} / {bulkProgress.total}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-crm-border overflow-hidden">
                    <div className="h-full bg-amber-500 transition-all" style={{ width: `${bulkProgress.total ? (bulkProgress.done/bulkProgress.total)*100 : 0}%` }} />
                  </div>
                  {bulkProgress.errors.length > 0 && (
                    <div className="text-[10px] text-red-400 space-y-0.5 mt-1">
                      {bulkProgress.errors.map((e, i) => <p key={i}>{e}</p>)}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-crm-border">
              <Button size="sm" variant="outline" onClick={() => { setBulkOpen(false); setBulkParsed([]); setBulkText(""); }}
                className="border-crm-border text-crm-text-muted text-xs h-8">Cancel</Button>
              <Button size="sm"
                disabled={bulkSending || bulkParsed.filter(r => r.valid).length === 0}
                onClick={sendBulkInvites}
                className="bg-amber-700 hover:bg-amber-600 text-white text-xs h-8 gap-1.5">
                {bulkSending ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                Send {bulkParsed.filter(r => r.valid).length} Invite{bulkParsed.filter(r => r.valid).length !== 1 ? "s" : ""}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ══ USERS ══ */}
      {tab === "users" && (
        <div className="space-y-4">
          {/* Invite / Create User form */}
          <div className="bg-crm-card border border-amber-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              {/* Mode toggle */}
              <div className="flex rounded-lg border border-amber-800 overflow-hidden text-[11px]">
                <button
                  onClick={() => { setInviteMode("invite"); setCreateResult(null); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors ${inviteMode === "invite" ? "bg-amber-900 text-amber-300 font-semibold" : "text-amber-600 hover:text-amber-400"}`}
                >
                  <Send size={11} /> Invite by email
                </button>
                <button
                  onClick={() => { setInviteMode("create"); setCreateResult(null); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors ${inviteMode === "create" ? "bg-amber-900 text-amber-300 font-semibold" : "text-amber-600 hover:text-amber-400"}`}
                >
                  <KeyRound size={11} /> Create with password
                </button>
              </div>
              <button onClick={() => setBulkOpen(true)}
                className="flex items-center gap-1.5 text-[11px] text-amber-400 hover:text-amber-300 border border-amber-800 rounded-lg px-2.5 py-1 hover:bg-amber-950 transition-colors">
                <Plus size={11} /> Bulk invite
              </button>
            </div>

            {inviteMode === "invite" && (
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
            )}

            {inviteMode === "create" && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    type="email" required placeholder="Email address"
                    value={createEmail} onChange={e => setCreateEmail(e.target.value)}
                    className="bg-crm-surface border-crm-border text-crm-text text-xs h-8"
                  />
                  <Input
                    placeholder="Full name (optional)"
                    value={createName} onChange={e => setCreateName(e.target.value)}
                    className="bg-crm-surface border-crm-border text-crm-text text-xs h-8"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Select value={createRole} onValueChange={v => setCreateRole(v as AppRole)}>
                    <SelectTrigger className="bg-crm-surface border-crm-border text-crm-text text-xs h-8 sm:w-44">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-crm-card border-crm-border">
                      {(Object.keys(ROLE_CONFIG) as AppRole[]).map(r => (
                        <SelectItem key={r} value={r} className="text-crm-text text-xs">{ROLE_CONFIG[r]?.label ?? r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="relative flex-1">
                    <Input
                      type={showCreatePw ? "text" : "password"}
                      placeholder="Password (min 8 chars)"
                      value={createPassword} onChange={e => setCreatePassword(e.target.value)}
                      className="bg-crm-surface border-crm-border text-crm-text text-xs h-8 pr-16"
                    />
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                      <button type="button" onClick={() => setShowCreatePw(v => !v)}
                        className="text-crm-text-muted hover:text-crm-text-secondary p-1 transition-colors">
                        {showCreatePw ? <Eye size={12} /> : <Eye size={12} />}
                      </button>
                      <button type="button"
                        onClick={() => setCreatePassword(generatePassword())}
                        className="text-[9px] font-bold text-amber-500 hover:text-amber-400 px-1.5 py-0.5 rounded border border-amber-800 hover:bg-amber-950 transition-colors">
                        Gen
                      </button>
                    </div>
                  </div>
                  <Button
                    type="button"
                    disabled={creating || !createEmail.trim() || createPassword.length < 8}
                    onClick={handleCreateUser}
                    size="sm"
                    className="bg-amber-700 hover:bg-amber-600 text-white text-xs gap-1.5 h-8"
                  >
                    {creating ? <Loader2 size={12} className="animate-spin" /> : <UserPlus size={12} />}
                    Create user
                  </Button>
                </div>
                <label className="flex items-center gap-2 text-[11px] text-crm-text-muted cursor-pointer">
                  <input type="checkbox" checked={createForceChange} onChange={e => setCreateForceChange(e.target.checked)}
                    className="accent-amber-500 w-3 h-3" />
                  Force password change on first login
                </label>
                {createResult && (
                  <div className="flex items-center gap-2 bg-emerald-950 border border-emerald-800 rounded-lg px-3 py-2">
                    <CheckCircle2 size={13} className="text-emerald-400 flex-shrink-0" />
                    <span className="text-[11px] text-emerald-400 flex-1">User created. Temporary password:</span>
                    <code className="text-[11px] font-mono text-emerald-300 bg-emerald-900/40 px-2 py-0.5 rounded">{createResult}</code>
                    <button
                      onClick={() => { navigator.clipboard.writeText(createResult); setCopiedCreate(true); setTimeout(() => setCopiedCreate(false), 2000); }}
                      className="text-emerald-500 hover:text-emerald-300 transition-colors"
                      title="Copy password"
                    >
                      {copiedCreate ? <CheckCheck size={13} /> : <Copy size={13} />}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Users table */}
          <div className="bg-crm-card border border-crm-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-crm-border flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <h3 className="text-[12px] font-semibold text-crm-text-secondary">Users ({filteredUsers.length})</h3>
                <div className="flex rounded-lg border border-crm-border overflow-hidden text-[10px]">
                  {(["all","active","suspended"] as const).map(f => (
                    <button key={f} onClick={() => setUserActiveFilter(f)}
                      className={`px-2.5 py-1 transition-colors capitalize ${userActiveFilter === f ? "bg-crm-surface text-crm-text font-semibold" : "text-crm-text-muted hover:text-crm-text-secondary"}`}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>
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
                  <div key={u.id} className={`flex items-start gap-3 px-4 py-3 hover:bg-crm-surface transition-colors cursor-pointer ${!u.is_active ? "opacity-60" : ""}`}
                    onClick={() => setProfileUser(u)}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 uppercase ${u.is_active ? "bg-crm-border text-emerald-400" : "bg-amber-950 border border-amber-800 text-amber-400"}`}>
                      {(u.full_name || u.email)[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[12.5px] font-semibold text-crm-text">{u.full_name || "—"}</p>
                        {u.id === user?.id && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-950 border border-amber-800 text-amber-400">you</span>
                        )}
                        {!u.is_active && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-950 border border-amber-800 text-amber-400 flex items-center gap-1">
                            <BanIcon size={8} /> Suspended
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-crm-text-muted">{u.email}</p>
                      <p className="text-[10px] text-crm-text-dim">{u.country || "—"}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
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
                      {/* Suspend / Reactivate */}
                      {u.id !== user?.id && (
                        <button
                          onClick={() => toggleUserActive(u.id, !u.is_active)}
                          className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded border transition-colors mt-0.5 ${
                            u.is_active
                              ? "text-crm-text-faint hover:text-amber-400 hover:bg-amber-950 border-transparent hover:border-amber-900"
                              : "text-amber-400 bg-amber-950 border-amber-800 hover:bg-amber-900"
                          }`}
                          title={u.is_active ? "Suspend user (blocks login)" : "Reactivate user"}
                        >
                          {u.is_active ? <UserX size={10} /> : <UserCheck size={10} />}
                          {u.is_active ? "Suspend" : "Reactivate"}
                        </button>
                      )}
                      {/* Reset password */}
                      {u.id !== user?.id && (
                        <button
                          onClick={() => { setResetTarget(u); setResetPassword(generatePassword()); setResetForce(true); setShowResetPw(false); setCopiedReset(false); }}
                          className="flex items-center gap-1 text-[10px] text-crm-text-faint hover:text-amber-400 hover:bg-amber-950 px-2 py-1 rounded border border-transparent hover:border-amber-900 transition-colors"
                          title="Reset user password"
                        >
                          <KeyRound size={10} /> Reset pw
                        </button>
                      )}
                      {/* Delete user */}
                      {u.id !== user?.id && (
                        <button
                          onClick={() => deleteUser(u)}
                          className="flex items-center gap-1 text-[10px] text-crm-text-faint hover:text-red-400 hover:bg-red-950 px-2 py-1 rounded border border-transparent hover:border-red-900 transition-colors"
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
        <div className="space-y-4">
          {/* Filter bar */}
          <div className="bg-crm-card border border-crm-border rounded-xl p-4 flex flex-wrap items-end gap-3">
            {/* Source toggle */}
            <div className="flex flex-col gap-1">
              <Label className="text-[10px] text-crm-text-dim uppercase tracking-wider">Source</Label>
              <div className="flex rounded-lg border border-crm-border overflow-hidden text-[10px]">
                {(["activity","audit","both"] as const).map(s => (
                  <button key={s} onClick={() => setActivitySource(s)}
                    className={`px-2.5 py-1.5 capitalize transition-colors ${activitySource === s ? "bg-crm-surface text-crm-text font-semibold" : "text-crm-text-muted hover:text-crm-text-secondary"}`}>
                    {s === "activity" ? "Action Log" : s === "audit" ? "Audit Log" : "Both"}
                  </button>
                ))}
              </div>
            </div>
            {/* Action filter */}
            <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
              <Label className="text-[10px] text-crm-text-dim uppercase tracking-wider">Action keyword</Label>
              <Input value={activityAction} onChange={e => setActivityAction(e.target.value)}
                placeholder="delete, grant, invite…"
                className="bg-crm-surface border-crm-border text-crm-text text-[11px] h-8" />
            </div>
            {/* Date range */}
            <div className="flex flex-col gap-1">
              <Label className="text-[10px] text-crm-text-dim uppercase tracking-wider">From</Label>
              <Input type="date" value={activityFrom} onChange={e => setActivityFrom(e.target.value)}
                className="bg-crm-surface border-crm-border text-crm-text text-[11px] h-8 w-36" />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-[10px] text-crm-text-dim uppercase tracking-wider">To</Label>
              <Input type="date" value={activityTo} onChange={e => setActivityTo(e.target.value)}
                className="bg-crm-surface border-crm-border text-crm-text text-[11px] h-8 w-36" />
            </div>
            <Button size="sm" variant="outline" onClick={() => exportActivityLog(mergedActivity)}
              className="border-crm-border text-crm-text-muted text-xs gap-1.5 h-8 self-end">
              <Download size={11} /> Export CSV
            </Button>
            {(activityAction || activityFrom || activityTo) && (
              <button onClick={() => { setActivityAction(""); setActivityFrom(""); setActivityTo(""); }}
                className="text-[11px] text-crm-text-muted hover:text-crm-text-secondary flex items-center gap-1 self-end pb-1.5">
                <X size={11} /> Clear
              </button>
            )}
          </div>

          <div className="bg-crm-card border border-crm-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-crm-border flex items-center justify-between">
              <h3 className="text-[12px] font-semibold text-crm-text-secondary">
                {mergedActivity.length} event{mergedActivity.length !== 1 ? "s" : ""}
                {(activityAction || activityFrom || activityTo) && " (filtered)"}
              </h3>
            </div>
            {loading ? (
              <div className="flex items-center justify-center h-24">
                <div className="w-5 h-5 border-2 border-emerald-700 border-t-emerald-400 rounded-full animate-spin" />
              </div>
            ) : mergedActivity.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <Activity size={28} className="text-crm-text-faint" />
                <p className="text-[12px] text-crm-text-faint">No events match the current filters.</p>
              </div>
            ) : (
              <div className="p-4">
                <div className="relative pl-7 ml-2 space-y-0 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-gradient-to-b before:from-primary/30 before:via-primary/10 before:to-transparent">
                  {mergedActivity.map(log => {
                    const actionColor =
                      log.action.includes("delete") || log.action.includes("suspend") ? "text-red-400 bg-red-950 border-red-800" :
                      log.action.includes("grant")  || log.action.includes("reactivat") ? "text-emerald-400 bg-emerald-950 border-emerald-800" :
                      log.action.includes("revoke") || log.action.includes("remove")   ? "text-amber-400 bg-amber-950 border-amber-800" :
                                                                                          "text-blue-400 bg-blue-950 border-blue-800";
                    const actionTextColor = actionColor.split(" ")[0];
                    return (
                      <div key={`${log.source}-${log.id}`} className="relative flex items-start gap-3 pb-4">
                        <div className={`absolute -left-[26px] w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${actionColor}`}>
                          {log.source === "audit" ? <Shield size={9} /> : <Activity size={9} />}
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-[12px] text-crm-text">
                              <span className="font-semibold">{log.actor_name ?? log.performed_by ?? "System"}</span>
                              {" "}<span className={`font-medium ${actionTextColor}`}>{log.action}</span>
                            </p>
                            <span className={`text-[8px] font-mono px-1 py-0.5 rounded border ${log.source === "audit" ? "text-purple-400 border-purple-800 bg-purple-950" : "text-crm-text-dim border-crm-border bg-crm-surface"}`}>
                              {log.source}
                            </span>
                          </div>
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
        </div>
      )}

      {/* ══ WEBSITE MEMBERS ══ */}
      {tab === "website" && (
        <div className="space-y-4">
          {/* Info banner */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-crm-card border border-emerald-900">
            <Globe size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[12px] text-crm-text-secondary">
                Users listed here have <strong className="text-crm-text">Show on Team Page</strong> enabled.
                They appear on the public <code className="text-[10px] bg-crm-surface border border-crm-border rounded px-1">/team</code> website section.
                A CRM user with this toggle on is the same person as their public-facing profile — they appear in both this tab and the Users tab.
              </p>
            </div>
          </div>

          <div className="bg-crm-card border border-crm-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-crm-border flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-[12px] font-semibold text-crm-text-secondary">
                Published on website ({websiteUsers.length} member{websiteUsers.length !== 1 ? "s" : ""})
              </h3>
              <a
                href="/team"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-emerald-500 hover:text-emerald-400 flex items-center gap-1"
              >
                <Globe size={11} /> View /team →
              </a>
            </div>

            {websiteUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <Globe size={28} className="text-crm-text-faint" />
                <p className="text-[12px] text-crm-text-faint">No users are currently published on the website.</p>
                <button
                  onClick={() => setTab("users")}
                  className="text-[11px] text-emerald-500 hover:text-emerald-400 transition-colors"
                >
                  Go to Users tab to toggle visibility →
                </button>
              </div>
            ) : (
              <div className="divide-y divide-crm-border">
                {websiteUsers.map(u => (
                  <div key={u.id} className="flex items-center gap-3 px-4 py-3 hover:bg-crm-surface transition-colors">
                    <div className="w-9 h-9 rounded-full bg-emerald-950 border border-emerald-800 flex items-center justify-center text-sm font-bold text-emerald-400 flex-shrink-0 uppercase">
                      {(u.full_name || u.email)[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[12.5px] font-semibold text-crm-text">{u.full_name || "—"}</p>
                        <span className="text-[9px] px-1.5 py-0.5 rounded border bg-emerald-950 border-emerald-800 text-emerald-400">
                          on website
                        </span>
                      </div>
                      <p className="text-[10px] text-crm-text-muted">{u.email}</p>
                      {(u.title || u.organisation) && (
                        <p className="text-[10px] text-crm-text-dim mt-0.5">
                          {[u.title, u.organisation].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      {/* CRM roles */}
                      <div className="flex flex-wrap gap-1 justify-end max-w-[160px]">
                        {u.roles.map(role => {
                          const cfg = ROLE_CONFIG[role];
                          if (!cfg) return null;
                          const RoleIcon = cfg.icon;
                          return (
                            <span key={role} className={`flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded border ${cfg.badge}`}>
                              <RoleIcon size={9} />{cfg.label}
                            </span>
                          );
                        })}
                      </div>
                      {/* Remove from website */}
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-crm-text-dim">Team page</span>
                        <Switch
                          checked={u.show_on_website}
                          onCheckedChange={v => toggleShowOnWebsite(u.id, v)}
                          className="scale-75"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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

      {/* ══ COUNTRIES ══ */}
      {tab === "countries" && <CountriesTab />}

      {/* ══ TEAM MEMBERS ══ */}
      {tab === "team-members" && <TeamMembersTab />}

      {/* ══ SIGNATURES ══ */}
      {tab === "signatures" && <SignaturesTab />}

      {/* ══ EMAIL CONFIG ══ */}
      {tab === "email-config" && <EmailConfigTab userId={user?.id} />}
      {tab === "branding" && <BrandingTab userId={user?.id} />}

      {/* ══ SETTINGS ══ */}
      {tab === "settings" && (
        <div className="space-y-4 max-w-2xl">

          {/* Platform Configuration */}
          <div className="bg-crm-card border border-crm-border rounded-xl p-5">
            <h3 className="text-[13px] font-semibold text-crm-text flex items-center gap-2 mb-4">
              <Settings size={14} className="text-amber-400" /> Platform Configuration
            </h3>
            <div className="space-y-4">
              {/* Maintenance Mode */}
              <div className="flex items-start justify-between gap-4 p-3 rounded-xl bg-crm-surface border border-crm-border">
                <div className="flex-1">
                  <p className="text-[12px] font-semibold text-crm-text">Maintenance Mode</p>
                  <p className="text-[11px] text-crm-text-muted mt-0.5">When enabled, all non-super-admin users see a maintenance page and cannot access the CRM.</p>
                  {globalSettings.maintenance_mode && (
                    <div className="flex items-center gap-1.5 mt-2 text-[10px] text-amber-400">
                      <AlertTriangle size={10} /> Platform is currently in maintenance mode
                    </div>
                  )}
                </div>
                <Switch
                  checked={!!globalSettings.maintenance_mode}
                  onCheckedChange={async v => {
                    await saveGlobalSetting("maintenance_mode", v);
                    toast({ title: v ? "Maintenance mode ON" : "Maintenance mode OFF" });
                  }}
                  className="data-[state=checked]:bg-red-600 flex-shrink-0 mt-1"
                />
              </div>
              {/* App Name */}
              <div className="space-y-1.5">
                <Label className="text-[11px] text-crm-text-muted">Platform Name</Label>
                <div className="flex gap-2">
                  <Input
                    value={globalSettings.app_name ?? ""}
                    onChange={e => setGlobalSettings(prev => ({ ...prev, app_name: e.target.value }))}
                    className="bg-crm-surface border-crm-border text-crm-text text-[12px] h-9 flex-1"
                    placeholder="ECOWAS Parliament CRM"
                  />
                  <Button size="sm" onClick={() => saveGlobalSetting("app_name", globalSettings.app_name ?? "")}
                    className="text-[11px] h-9 gap-1.5">
                    <Save size={12} /> Save
                  </Button>
                </div>
              </div>
              {/* Default theme */}
              <div className="space-y-1.5">
                <Label className="text-[11px] text-crm-text-muted">Default Theme</Label>
                <div className="flex gap-2">
                  {([["light","Light",Sun],["dark","Dark",Moon],["system","System",Monitor]] as const).map(([val, label, Icon]) => (
                    <button key={val} onClick={() => saveGlobalSetting("default_theme", val)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-[11px] transition-colors ${globalSettings.default_theme === val ? "border-amber-700 bg-amber-950 text-amber-400" : "border-crm-border text-crm-text-muted hover:border-crm-border-hover"}`}>
                      <Icon size={12} /> {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Security & Sessions */}
          <div className="bg-crm-card border border-crm-border rounded-xl p-5">
            <h3 className="text-[13px] font-semibold text-crm-text flex items-center gap-2 mb-4">
              <Shield size={14} className="text-amber-400" /> Security &amp; Sessions
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[11px] text-crm-text-muted">Session Timeout (hours)</Label>
                <Input
                  type="number" min={1} max={720}
                  value={globalSettings.session_config?.session_timeout_hours ?? 24}
                  onChange={e => setGlobalSettings(prev => ({ ...prev, session_config: { ...(prev.session_config ?? {}), session_timeout_hours: Number(e.target.value) }}))}
                  className="bg-crm-surface border-crm-border text-crm-text text-[12px] h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] text-crm-text-muted">Max Login Attempts</Label>
                <Input
                  type="number" min={1} max={20}
                  value={globalSettings.session_config?.max_login_attempts ?? 5}
                  onChange={e => setGlobalSettings(prev => ({ ...prev, session_config: { ...(prev.session_config ?? {}), max_login_attempts: Number(e.target.value) }}))}
                  className="bg-crm-surface border-crm-border text-crm-text text-[12px] h-9"
                />
              </div>
            </div>
            <div className="flex items-center justify-between mt-4 p-3 rounded-xl bg-crm-surface border border-crm-border">
              <div>
                <p className="text-[12px] font-medium text-crm-text">Require 2FA for Admins</p>
                <p className="text-[11px] text-crm-text-muted">Records policy intent — enforcement is handled via Auth provider</p>
              </div>
              <Switch
                checked={!!globalSettings.session_config?.require_2fa_for_admins}
                onCheckedChange={v => setGlobalSettings(prev => ({ ...prev, session_config: { ...(prev.session_config ?? {}), require_2fa_for_admins: v }}))}
                className="data-[state=checked]:bg-emerald-600"
              />
            </div>
            <Button size="sm" onClick={() => { saveGlobalSetting("session_config", globalSettings.session_config); setSavingSettings(true); setTimeout(() => setSavingSettings(false), 800); }}
              disabled={savingSettings}
              className="mt-4 text-[11px] gap-1.5">
              {savingSettings ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
              Save Session Settings
            </Button>
          </div>

          {/* Data Retention */}
          <div className="bg-crm-card border border-crm-border rounded-xl p-5">
            <h3 className="text-[13px] font-semibold text-crm-text flex items-center gap-2 mb-4">
              <Timer size={14} className="text-amber-400" /> Data Retention
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[11px] text-crm-text-muted">Activity Log Retention (days)</Label>
                <Input
                  type="number" min={7} max={3650}
                  value={globalSettings.data_retention?.activity_log_days ?? 90}
                  onChange={e => setGlobalSettings(prev => ({ ...prev, data_retention: { ...(prev.data_retention ?? {}), activity_log_days: Number(e.target.value) }}))}
                  className="bg-crm-surface border-crm-border text-crm-text text-[12px] h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] text-crm-text-muted">Deleted User Data Retention (days)</Label>
                <Input
                  type="number" min={1} max={365}
                  value={globalSettings.data_retention?.deleted_user_data_days ?? 30}
                  onChange={e => setGlobalSettings(prev => ({ ...prev, data_retention: { ...(prev.data_retention ?? {}), deleted_user_data_days: Number(e.target.value) }}))}
                  className="bg-crm-surface border-crm-border text-crm-text text-[12px] h-9"
                />
              </div>
            </div>
            <Button size="sm" onClick={() => saveGlobalSetting("data_retention", globalSettings.data_retention)}
              className="mt-4 text-[11px] gap-1.5">
              <Save size={12} /> Save Retention Settings
            </Button>
          </div>

          {/* System info */}
          <div className="bg-crm-card border border-crm-border rounded-xl p-4">
            <h3 className="text-[12px] font-semibold text-crm-text-secondary flex items-center gap-2 mb-4">
              <Info size={13} /> System Information
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
            <Button variant="outline" size="sm"
              className="border-red-900 text-red-400 hover:bg-red-950 hover:text-red-300 text-xs gap-1.5"
              onClick={() => signOut()}>
              Sign out of super admin session
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}