import { useState, useEffect, useCallback } from "react";
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
  FileText, Star, Calendar, Newspaper, ChevronRight,
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
}
interface ActivityLog {
  id: string; action: string; entity_type: string;
  details: any; created_at: string;
  actor?: { full_name: string; email: string };
}

type Tab = "overview" | "users" | "invitations" | "activity" | "routes" | "settings";

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
    <div className="bg-crm-card border border-crm-border rounded-xl p-4 flex items-start gap-3">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border ${accent}`}>
        <Icon size={15} />
      </div>
      <div>
        <p className="text-[10px] font-mono uppercase tracking-widest text-crm-text-dim">{label}</p>
        <p className="text-2xl font-bold text-crm-text">{value}</p>
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
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-medium transition-all ${
        active
          ? "bg-amber-950 text-amber-400 border border-amber-800"
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

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function SuperAdminModule() {
  const { user, refreshRoles, signOut } = useAuthContext();
  const { toast } = useToast();

  const [tab,         setTab]         = useState<Tab>("overview");
  const [users,       setUsers]       = useState<UserWithRoles[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole,  setInviteRole]  = useState<AppRole>("admin");
  const [sending,     setSending]     = useState(false);
  const [searchQ,     setSearchQ]     = useState("");

  // ── Load all data ────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [profilesRes, rolesRes, invRes, actRes] = await Promise.all([
        (supabase as any).from("profiles").select("id, email, full_name, country, created_at, show_on_website, title, organisation").order("created_at", { ascending: false }),
        (supabase as any).from("user_roles").select("user_id, role"),
        (supabase as any).from("invitations").select("id, email, role, invited_by, created_at, accepted_at").order("created_at", { ascending: false }),
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

      setInvitations(invRes.data ?? []);
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

  // ── Invite ────────────────────────────────────────────────────────────────
  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setSending(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("invite-user", {
        body: { email: inviteEmail.trim(), role: inviteRole },
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

  // ── Revoke invitation ─────────────────────────────────────────────────────
  const revokeInvitation = async (invId: string) => {
    try {
      await (supabase as any).from("invitations").delete().eq("id", invId);
      toast({ title: "Invitation revoked" });
      loadData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
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
    { id:"settings",    label:"Settings",     icon:Settings },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-amber-950 border border-amber-800 flex items-center justify-center">
              <Crown size={12} className="text-amber-400" />
            </div>
            <h2 className="text-lg font-bold text-crm-text">Super Admin Hub</h2>
          </div>
          <p className="text-[12px] text-crm-text-muted mt-0.5">
            Full system oversight — users, roles, activity, and configuration
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={loadData} disabled={loading}
          className="border-crm-border text-crm-text-muted hover:text-crm-text-secondary text-xs gap-1.5 h-8">
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          Refresh
        </Button>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 flex-wrap">
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
              <div className="divide-y divide-crm-border">
                {activityLog.slice(0, 6).map(log => (
                  <div key={log.id} className="flex items-start gap-3 px-4 py-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-950 border border-emerald-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Activity size={10} className="text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-[12px] text-crm-text">
                        <span className="font-semibold">{log.actor?.full_name || "System"}</span>
                        {" "}<span className="text-emerald-400">{log.action}</span>
                        {" "}on <span className="font-medium">{log.entity_type}</span>
                      </p>
                      <p className="text-[10px] text-crm-text-dim mt-0.5">{new Date(log.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
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
              <Input
                placeholder="Search name, email, country…"
                value={searchQ} onChange={e => setSearchQ(e.target.value)}
                className="bg-crm-surface border-crm-border text-crm-text text-xs h-7 w-56"
              />
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
        <div className="bg-crm-card border border-crm-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-crm-border flex items-center justify-between">
            <h3 className="text-[12px] font-semibold text-crm-text-secondary">
              Invitations ({invitations.length} total · {stats.pendingInv} pending)
            </h3>
            <button onClick={() => setTab("users")} className="text-[11px] text-emerald-500 hover:text-emerald-400 flex items-center gap-1">
              <UserPlus size={11} /> New invite
            </button>
          </div>
          {invitations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <Mail size={28} className="text-crm-text-faint" />
              <p className="text-[12px] text-crm-text-faint">No invitations sent yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-crm-border">
              {invitations.map(inv => {
                const cfg = ROLE_CONFIG[inv.role];
                const Icon = cfg?.icon ?? Mail;
                return (
                  <div key={inv.id} className="flex items-center gap-3 px-4 py-3 hover:bg-crm-surface transition-colors">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border ${cfg?.badge ?? "text-crm-text-muted bg-crm-border border-crm-border-hover"}`}>
                      <Icon size={12} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-crm-text">{inv.email}</p>
                      <p className="text-[10px] text-crm-text-dim">
                        {cfg?.label ?? inv.role} · Invited {new Date(inv.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {inv.accepted_at ? (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                        <CheckCircle2 size={11} /> Accepted
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-amber-400 flex items-center gap-1">
                          <Clock size={10} /> Pending
                        </span>
                        <button
                          onClick={() => revokeInvitation(inv.id)}
                          className="text-crm-text-faint hover:text-red-400 transition-colors"
                          title="Revoke"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
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
            <div className="divide-y divide-crm-border">
              {activityLog.map(log => (
                <div key={log.id} className="flex items-start gap-3 px-4 py-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-950 border border-emerald-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Activity size={10} className="text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-crm-text">
                      <span className="font-semibold">{log.actor?.full_name || "System"}</span>
                      {" "}<span className="text-emerald-400">{log.action}</span>
                      {" "}on <span className="font-medium">{log.entity_type}</span>
                    </p>
                    {log.details && typeof log.details === "object" && Object.keys(log.details).length > 0 && (
                      <p className="text-[10px] text-crm-text-dim font-mono truncate mt-0.5">{JSON.stringify(log.details)}</p>
                    )}
                    <p className="text-[10px] text-crm-text-faint mt-0.5">{new Date(log.created_at).toLocaleString()}</p>
                  </div>
                </div>
              ))}
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
