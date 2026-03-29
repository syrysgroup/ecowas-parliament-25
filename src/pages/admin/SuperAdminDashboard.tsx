import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import type { AppRole } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  Crown, ShieldCheck, Eye, Handshake, Users, Mail, Send,
  Loader2, LogOut, RefreshCw, Settings, Activity, Globe,
  Lock, Shield, ChevronRight, Clock, UserPlus, Trash2,
  CheckCircle2, XCircle, AlertTriangle, LayoutDashboard,
  FileText, Star, Calendar, Newspaper,
} from "lucide-react";
import ecowasLogo from "@/assets/ecowas-parliament-logo.png";

// ─── Types ────────────────────────────────────────────────────────────────────
interface UserWithRoles {
  id:        string;
  email:     string;
  full_name: string;
  country:   string;
  created_at:string;
  roles:     AppRole[];
}

interface Invitation {
  id:         string;
  email:      string;
  role:       AppRole;
  invited_by: string;
  created_at: string;
  accepted_at:string | null;
}

interface ActivityLog {
  id:           string;
  action:       string;
  entity_type:  string;
  details:      any;
  created_at:   string;
  actor?: { full_name: string; email: string };
}

// ─── Role config ──────────────────────────────────────────────────────────────
const ROLE_CONFIG: Record<AppRole, {
  label: string; icon: React.ElementType;
  badge: string; border: string; desc: string;
}> = {
  super_admin: {
    label:"Super Admin", icon:Crown,
    badge:"bg-amber-100 text-amber-900 border-amber-300",
    border:"border-l-amber-400",
    desc:"Full system access — manages users, roles, all content, and system configuration.",
  },
  admin: {
    label:"Admin", icon:ShieldCheck,
    badge:"bg-primary/10 text-primary border-primary/20",
    border:"border-l-primary",
    desc:"Manages content, applications, nominations, representatives, and event registrations.",
  },
  moderator: {
    label:"Moderator", icon:Eye,
    badge:"bg-blue-100 text-blue-800 border-blue-200",
    border:"border-l-blue-400",
    desc:"Reviews applications, verifies nominees, publishes delegate profiles.",
  },
  sponsor: {
    label:"Sponsor", icon:Handshake,
    badge:"bg-violet-100 text-violet-800 border-violet-200",
    border:"border-l-violet-400",
    desc:"Access to Sponsor Dashboard — visibility metrics, event placements, impact reports.",
  },
};

// ─── Site route map ───────────────────────────────────────────────────────────
const ROUTES = [
  // Public
  { path:"/",                    label:"Home",                       access:"public",      icon:Globe          },
  { path:"/about",               label:"About the Programme",        access:"public",      icon:FileText       },
  { path:"/timeline",            label:"Timeline",                   access:"public",      icon:Clock          },
  { path:"/news",                label:"News",                       access:"public",      icon:Newspaper      },
  { path:"/documents",           label:"Documents",                  access:"public",      icon:FileText       },
  { path:"/events",              label:"Events & RSVP",              access:"public",      icon:Calendar       },
  { path:"/stakeholders",        label:"Stakeholders",               access:"public",      icon:Users          },
  { path:"/team",                label:"Team",                       access:"public",      icon:Users          },
  { path:"/contact",             label:"Contact",                    access:"public",      icon:Mail           },
  { path:"/media-kit",           label:"Media Kit",                  access:"public",      icon:FileText       },
  { path:"/sponsors",            label:"Sponsor Portal (public)",    access:"public",      icon:Star           },
  // Programmes
  { path:"/programmes/youth",    label:"Youth Innovation",           access:"public",      icon:Globe          },
  { path:"/programmes/trade",    label:"Trade & SME",                access:"public",      icon:Globe          },
  { path:"/programmes/women",    label:"Women's Empowerment",        access:"public",      icon:Globe          },
  { path:"/programmes/civic",    label:"Civic Education",            access:"public",      icon:Globe          },
  { path:"/programmes/culture",  label:"Culture & Creativity",       access:"public",      icon:Globe          },
  { path:"/programmes/awards",   label:"Parliamentary Awards",       access:"public",      icon:Globe          },
  { path:"/programmes/parliament",label:"Youth Parliament",          access:"public",      icon:Globe          },
  // Auth
  { path:"/auth",                label:"Authentication",             access:"public",      icon:Lock           },
  // Protected
  { path:"/admin",               label:"Parliament Operations",      access:"admin+",      icon:LayoutDashboard},
  { path:"/admin/project",       label:"Project Command Centre",     access:"admin+",      icon:LayoutDashboard},
  { path:"/admin/users",         label:"User Management",            access:"admin+",      icon:Users          },
  { path:"/admin/super",         label:"Super Admin Hub",            access:"super_admin", icon:Crown          },
  { path:"/sponsor-dashboard",   label:"Sponsor Dashboard",          access:"sponsor",     icon:Star           },
];

// ─── Tab type ─────────────────────────────────────────────────────────────────
type Tab = "overview" | "users" | "invitations" | "activity" | "routes" | "settings";

// ─── Component ────────────────────────────────────────────────────────────────
export default function SuperAdminDashboard() {
  const { user, isSuperAdmin, signOut, refreshRoles } = useAuthContext();
  const { toast }  = useToast();
  const navigate   = useNavigate();

  const [tab,         setTab]         = useState<Tab>("overview");
  const [users,       setUsers]       = useState<UserWithRoles[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole,  setInviteRole]  = useState<AppRole>("admin");
  const [sending,     setSending]     = useState(false);
  const [searchQ,     setSearchQ]     = useState("");

  // ── Load all data ───────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [profilesRes, rolesRes, invRes, actRes] = await Promise.all([
        (supabase as any).from("profiles")
          .select("id, email, full_name, country, created_at")
          .order("created_at", { ascending: false }),
        (supabase as any).from("user_roles").select("user_id, role"),
        (supabase as any).from("invitations")
          .select("id, email, role, invited_by, created_at, accepted_at")
          .order("created_at", { ascending: false }),
        (supabase as any).from("admin_activity_logs")
          .select("id, action, entity_type, details, created_at, profiles!actor_user_id(full_name, email)")
          .order("created_at", { ascending: false })
          .limit(50),
      ]);

      // Build roles map
      const rolesMap = new Map<string, AppRole[]>();
      (rolesRes.data ?? []).forEach((r: any) => {
        const arr = rolesMap.get(r.user_id) || [];
        arr.push(r.role as AppRole);
        rolesMap.set(r.user_id, arr);
      });

      const userList: UserWithRoles[] = (profilesRes.data ?? []).map((p: any) => ({
        id:         p.id,
        email:      p.email ?? "",
        full_name:  p.full_name ?? "",
        country:    p.country ?? "",
        created_at: p.created_at,
        roles:      rolesMap.get(p.id) ?? [],
      }));

      setUsers(userList);
      setInvitations(invRes.data ?? []);

      const logs = (actRes.data ?? []).map((l: any) => ({
        id:          l.id,
        action:      l.action,
        entity_type: l.entity_type,
        details:     l.details,
        created_at:  l.created_at,
        actor:       l.profiles ?? undefined,
      }));
      setActivityLog(logs);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Invite user ────────────────────────────────────────────────────────
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
    } finally {
      setSending(false);
    }
  };

  // ── Change role ────────────────────────────────────────────────────────
  const handleRoleChange = async (
    targetUserId: string,
    role: AppRole,
    action: "add" | "remove",
  ) => {
    if (targetUserId === user?.id && action === "remove" && role === "super_admin") {
      toast({ title: "Cannot remove your own super_admin role", variant: "destructive" });
      return;
    }
    try {
      if (action === "add") {
        await (supabase as any).from("user_roles").insert({ user_id: targetUserId, role });
      } else {
        await (supabase as any).from("user_roles")
          .delete()
          .eq("user_id", targetUserId)
          .eq("role", role);
      }
      toast({ title: `Role ${action === "add" ? "granted" : "revoked"}` });
      loadData();
      if (targetUserId === user?.id) refreshRoles();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  // ── Revoke invitation ──────────────────────────────────────────────────
  const revokeInvitation = async (invId: string) => {
    try {
      await (supabase as any).from("invitations").delete().eq("id", invId);
      toast({ title: "Invitation revoked" });
      loadData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  // ── Stats ──────────────────────────────────────────────────────────────
  const stats = {
    total:      users.length,
    superAdmins:users.filter(u => u.roles.includes("super_admin")).length,
    admins:     users.filter(u => u.roles.includes("admin")).length,
    moderators: users.filter(u => u.roles.includes("moderator")).length,
    sponsors:   users.filter(u => u.roles.includes("sponsor")).length,
    noRole:     users.filter(u => u.roles.length === 0).length,
    pendingInv: invitations.filter(i => !i.accepted_at).length,
  };

  const filteredUsers = users.filter(u =>
    !searchQ ||
    u.full_name.toLowerCase().includes(searchQ.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQ.toLowerCase()) ||
    u.country.toLowerCase().includes(searchQ.toLowerCase())
  );

  // ── Sidebar nav ─────────────────────────────────────────────────────────
  const NAV: { id: Tab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id:"overview",    label:"Overview",     icon:LayoutDashboard              },
    { id:"users",       label:"Users",        icon:Users,   badge:stats.total   },
    { id:"invitations", label:"Invitations",  icon:Mail,    badge:stats.pendingInv },
    { id:"activity",    label:"Activity log", icon:Activity                     },
    { id:"routes",      label:"Site routes",  icon:Globe                        },
    { id:"settings",    label:"Settings",     icon:Settings                     },
  ];

  return (
    <div className="min-h-screen bg-background flex">

      {/* ── Sidebar ── */}
      <aside className="w-60 flex-shrink-0 bg-[#0a1628] flex flex-col sticky top-0 h-screen overflow-y-auto">
        {/* Logo */}
        <div className="p-5 border-b border-white/10">
          <img src={ecowasLogo} alt="ECOWAS" className="h-9 w-auto mb-3 brightness-0 invert opacity-90" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center flex-shrink-0">
              <Crown className="h-3.5 w-3.5 text-amber-900" />
            </div>
            <div>
              <p className="text-xs font-bold text-white leading-none">Super Admin Hub</p>
              <p className="text-[10px] text-white/40 mt-0.5">25th Anniversary Platform</p>
            </div>
          </div>
        </div>

        {/* User info */}
        <div className="px-4 py-3 border-b border-white/10">
          <p className="text-xs font-semibold text-white/80 truncate">{user?.email}</p>
          <div className="flex items-center gap-1 mt-1">
            <Crown className="h-3 w-3 text-amber-400" />
            <p className="text-[10px] text-amber-400 font-bold">Super Administrator</p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 p-3 space-y-0.5">
          {NAV.map(n => {
            const Icon = n.icon;
            const active = tab === n.id;
            return (
              <button
                key={n.id}
                onClick={() => setTab(n.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-amber-400/15 text-amber-300"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1 text-left">{n.label}</span>
                {n.badge !== undefined && n.badge > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-400 text-amber-900">
                    {n.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick links */}
        <div className="p-3 border-t border-white/10 space-y-0.5">
          {[
            { to:"/admin",         label:"Parliament Ops",  icon:LayoutDashboard },
            { to:"/admin/project", label:"Project Board",   icon:Settings        },
          ].map(l => {
            const Icon = l.icon;
            return (
              <Link key={l.to} to={l.to}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-white/50 hover:text-white hover:bg-white/5 transition-all">
                <Icon className="h-3.5 w-3.5" /> {l.label} <ChevronRight className="h-3 w-3 ml-auto" />
              </Link>
            );
          })}
          <button
            onClick={() => signOut().then(() => navigate("/auth"))}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-red-400/70 hover:text-red-400 hover:bg-red-400/5 transition-all"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        {/* Topbar */}
        <div className="sticky top-0 z-10 bg-background/90 backdrop-blur border-b border-border px-6 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-base capitalize">{tab.replace("_"," ")}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs" onClick={loadData} disabled={loading}>
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">

          {/* ═══ OVERVIEW ═══ */}
          {tab === "overview" && (
            <>
              {/* Stat cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label:"Total users",       value:stats.total,      colour:"text-foreground",    icon:Users      },
                  { label:"Super admins",       value:stats.superAdmins,colour:"text-amber-600",     icon:Crown      },
                  { label:"Admins",             value:stats.admins,     colour:"text-primary",       icon:ShieldCheck},
                  { label:"Pending invitations",value:stats.pendingInv, colour:"text-destructive",   icon:Mail       },
                ].map(s => {
                  const Icon = s.icon;
                  return (
                    <div key={s.label} className="rounded-2xl border border-border bg-card p-5">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className={`text-3xl font-black ${s.colour}`}>{s.value}</p>
                    </div>
                  );
                })}
              </div>

              {/* Role breakdown */}
              <div className="rounded-2xl border border-border bg-card p-5">
                <h2 className="text-sm font-bold mb-4">Role definitions & current distribution</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {(Object.entries(ROLE_CONFIG) as [AppRole, typeof ROLE_CONFIG[AppRole]][]).map(([key, cfg]) => {
                    const Icon = cfg.icon;
                    const count = users.filter(u => u.roles.includes(key)).length;
                    return (
                      <div key={key} className={`border-l-4 ${cfg.border} border border-border rounded-xl p-4`}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cfg.badge}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <span className="font-bold text-sm">{cfg.label}</span>
                          </div>
                          <span className="text-2xl font-black text-muted-foreground">{count}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{cfg.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent activity */}
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold">Recent activity</h2>
                  <button onClick={() => setTab("activity")} className="text-xs text-primary hover:underline">
                    View all →
                  </button>
                </div>
                {activityLog.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">No activity logged yet.</p>
                ) : (
                  <div className="space-y-2">
                    {activityLog.slice(0,8).map(log => (
                      <div key={log.id} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Activity className="h-3 w-3 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium">
                            <span className="text-primary">{log.action}</span>
                            {" "}on {log.entity_type}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {log.actor?.full_name || "System"} ·{" "}
                            {new Date(log.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ═══ USERS ═══ */}
          {tab === "users" && (
            <>
              {/* Invite form */}
              <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5">
                <h2 className="text-sm font-bold flex items-center gap-2 mb-4">
                  <UserPlus className="h-4 w-4 text-amber-700" />
                  Invite a new team member
                </h2>
                <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <Label className="sr-only">Email</Label>
                    <Input
                      type="email" required placeholder="colleague@example.com"
                      value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                      maxLength={255}
                    />
                  </div>
                  <div className="sm:w-44">
                    <Select value={inviteRole} onValueChange={v => setInviteRole(v as AppRole)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="moderator">Moderator</SelectItem>
                        <SelectItem value="sponsor">Sponsor</SelectItem>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" disabled={sending} className="gap-2 bg-amber-600 hover:bg-amber-700 border-amber-600">
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Send invite
                  </Button>
                </form>
                <p className="text-xs text-amber-700 mt-2">
                  The invitee will receive an email with a sign-in link. Their role is automatically assigned when they accept.
                </p>
              </div>

              {/* Search + table */}
              <div className="rounded-2xl border border-border bg-card">
                <div className="p-4 border-b border-border flex items-center justify-between gap-3 flex-wrap">
                  <h2 className="text-sm font-bold flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    All users ({filteredUsers.length})
                  </h2>
                  <Input
                    placeholder="Search by name, email, country…"
                    className="w-64 h-8 text-sm"
                    value={searchQ}
                    onChange={e => setSearchQ(e.target.value)}
                  />
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Country</TableHead>
                          <TableHead>Roles</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map(u => (
                          <TableRow key={u.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                                  {(u.full_name || u.email)[0].toUpperCase()}
                                </div>
                                <span className="text-sm font-medium">{u.full_name || "—"}</span>
                                {u.id === user?.id && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">you</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                            <TableCell className="text-sm">{u.country || "—"}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {u.roles.length === 0 && (
                                  <span className="text-xs text-muted-foreground">No roles</span>
                                )}
                                {u.roles.map(role => {
                                  const cfg = ROLE_CONFIG[role];
                                  const Icon = cfg.icon;
                                  return (
                                    <Badge
                                      key={role}
                                      variant="outline"
                                      className={`${cfg.badge} gap-1 text-[11px] pr-1`}
                                    >
                                      <Icon className="h-3 w-3" />
                                      {cfg.label}
                                      {u.id !== user?.id && (
                                        <button
                                          onClick={() => handleRoleChange(u.id, role, "remove")}
                                          className="ml-0.5 hover:text-destructive rounded-sm"
                                          title={`Remove ${cfg.label}`}
                                        >
                                          ×
                                        </button>
                                      )}
                                    </Badge>
                                  );
                                })}
                              </div>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {new Date(u.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {u.id !== user?.id && (
                                <Select onValueChange={v => handleRoleChange(u.id, v as AppRole, "add")}>
                                  <SelectTrigger className="h-7 w-24 text-xs">
                                    <SelectValue placeholder="+ Role" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {(["super_admin","admin","moderator","sponsor"] as AppRole[])
                                      .filter(r => !u.roles.includes(r))
                                      .map(r => (
                                        <SelectItem key={r} value={r} className="text-xs">
                                          {ROLE_CONFIG[r].label}
                                        </SelectItem>
                                      ))
                                    }
                                  </SelectContent>
                                </Select>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                        {filteredUsers.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">
                              No users found.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ═══ INVITATIONS ═══ */}
          {tab === "invitations" && (
            <div className="rounded-2xl border border-border bg-card">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h2 className="text-sm font-bold flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  Invitations ({invitations.length} total · {stats.pendingInv} pending)
                </h2>
                <Button size="sm" variant="outline" className="gap-1 h-7 text-xs" onClick={() => setTab("users")}>
                  <UserPlus className="h-3.5 w-3.5" /> New invite
                </Button>
              </div>

              {invitations.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Mail className="h-8 w-8 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No invitations sent yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {invitations.map(inv => {
                    const cfg = ROLE_CONFIG[inv.role];
                    const Icon = cfg.icon;
                    return (
                      <div key={inv.id} className="flex items-center gap-4 px-5 py-3 hover:bg-muted/30 transition-colors">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.badge}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{inv.email}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Invited {new Date(inv.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="outline" className={`${cfg.badge} text-[11px]`}>
                          {cfg.label}
                        </Badge>
                        {inv.accepted_at ? (
                          <div className="flex items-center gap-1 text-primary text-xs font-medium">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Accepted {new Date(inv.accepted_at).toLocaleDateString()}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-amber-600 text-xs font-medium">
                              <Clock className="h-3.5 w-3.5" />
                              Pending
                            </div>
                            <button
                              onClick={() => revokeInvitation(inv.id)}
                              className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                              title="Revoke invitation"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
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

          {/* ═══ ACTIVITY LOG ═══ */}
          {tab === "activity" && (
            <div className="rounded-2xl border border-border bg-card">
              <div className="p-4 border-b border-border">
                <h2 className="text-sm font-bold flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  Activity log (last 50 actions)
                </h2>
              </div>
              {activityLog.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Activity className="h-8 w-8 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No activity recorded yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {activityLog.map(log => (
                    <div key={log.id} className="flex items-start gap-4 px-5 py-3">
                      <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Activity className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          <span className="font-semibold">{log.actor?.full_name || "System"}</span>
                          {" "}<span className="text-primary font-medium">{log.action}</span>
                          {" "}on <span className="font-medium">{log.entity_type}</span>
                        </p>
                        {log.details && typeof log.details === "object" && Object.keys(log.details).length > 0 && (
                          <p className="text-xs text-muted-foreground mt-0.5 font-mono truncate">
                            {JSON.stringify(log.details)}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(log.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══ ROUTES ═══ */}
          {tab === "routes" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200">
                <Globe className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <p className="text-sm text-blue-800">
                  All {ROUTES.length} routes are registered. Green = public · Amber = authenticated · Red = super_admin only.
                </p>
              </div>

              {/* Group by access type */}
              {(["public","admin+","sponsor","super_admin"] as const).map(access => {
                const group = ROUTES.filter(r => r.access === access);
                if (!group.length) return null;
                const label = access === "public" ? "Public routes" : access === "admin+" ? "Staff routes (admin+)" : access === "sponsor" ? "Sponsor routes" : "Super admin only";
                const colour = access === "public" ? "bg-primary/5 border-primary/20" : access === "admin+" ? "bg-amber-50 border-amber-200" : access === "sponsor" ? "bg-violet-50 border-violet-200" : "bg-red-50 border-red-200";
                const dotColour = access === "public" ? "bg-primary" : access === "admin+" ? "bg-amber-400" : access === "sponsor" ? "bg-violet-400" : "bg-destructive";
                return (
                  <div key={access} className={`rounded-2xl border ${colour} p-4`}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`w-2 h-2 rounded-full ${dotColour}`} />
                      <h3 className="text-sm font-bold">{label}</h3>
                      <Badge variant="outline" className="text-[10px]">{group.length}</Badge>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-1.5">
                      {group.map(r => {
                        const Icon = r.icon;
                        return (
                          <Link
                            key={r.path}
                            to={r.path}
                            target="_blank"
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background border border-border hover:border-primary/30 hover:bg-primary/5 transition-all text-sm"
                          >
                            <Icon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                            <span className="font-medium truncate">{r.label}</span>
                            <code className="text-[10px] text-muted-foreground ml-auto font-mono">{r.path}</code>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ═══ SETTINGS ═══ */}
          {tab === "settings" && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-border bg-card p-5">
                <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
                  <Settings className="h-4 w-4 text-primary" />
                  System information
                </h2>
                <div className="space-y-3">
                  {[
                    { label:"Platform",     value:"ECOWAS Parliament 25th Anniversary" },
                    { label:"Auth provider",value:"Supabase (email + password)"        },
                    { label:"Role system",  value:"PostgreSQL ENUM + RLS policies"     },
                    { label:"Invite method",value:"Supabase Edge Function — invite-user"},
                    { label:"Your user ID", value:user?.id ?? "—"                      },
                    { label:"Your email",   value:user?.email ?? "—"                   },
                  ].map(s => (
                    <div key={s.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <p className="text-sm text-muted-foreground">{s.label}</p>
                      <p className="text-sm font-medium font-mono truncate max-w-xs text-right">{s.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-5">
                <h2 className="text-sm font-bold mb-3 flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  Danger zone
                </h2>
                <p className="text-xs text-muted-foreground mb-3">
                  These actions are irreversible. Proceed with caution.
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  className="gap-2"
                  onClick={() => signOut().then(() => navigate("/auth"))}
                >
                  <LogOut className="h-4 w-4" /> Sign out of super admin session
                </Button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
