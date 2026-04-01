import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { AppRole } from "@/contexts/AuthContext";
import { CRM_ROLE_META } from "../crmRoles";
import { Send, Trash2, CheckCircle2, Clock, UserPlus, RefreshCw, X } from "lucide-react";
import { format, parseISO } from "date-fns";

interface UserWithRoles {
  id: string;
  email: string;
  full_name: string;
  country: string;
  created_at: string;
  roles: AppRole[];
}

interface Invitation {
  id: string;
  email: string;
  role: AppRole;
  created_at: string;
  accepted_at: string | null;
}

// Roles an admin can assign (not super_admin — only super_admin can grant that)
const ADMIN_ASSIGNABLE_ROLES: AppRole[] = [
  "admin", "moderator", "project_director", "programme_lead",
  "website_editor", "marketing_manager", "communications_officer",
  "finance_coordinator", "logistics_coordinator", "sponsor_manager",
  "consultant", "sponsor",
];

const SUPER_ADMIN_ASSIGNABLE_ROLES: AppRole[] = ["super_admin", ...ADMIN_ASSIGNABLE_ROLES];

export default function PeopleModule() {
  const { user, isSuperAdmin, refreshRoles } = useAuthContext();
  const { toast } = useToast();

  const [users,       setUsers]       = useState<UserWithRoles[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [sending,     setSending]     = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole,  setInviteRole]  = useState<AppRole>("admin");
  const [search,      setSearch]      = useState("");
  const [tab,         setTab]         = useState<"users" | "invitations">("users");

  const assignableRoles = isSuperAdmin ? SUPER_ADMIN_ASSIGNABLE_ROLES : ADMIN_ASSIGNABLE_ROLES;

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [profilesRes, rolesRes, invRes] = await Promise.all([
        (supabase as any)
          .from("profiles")
          .select("id, email, full_name, country, created_at")
          .order("created_at", { ascending: false }),
        (supabase as any).from("user_roles").select("user_id, role"),
        (supabase as any)
          .from("invitations")
          .select("id, email, role, created_at, accepted_at")
          .order("created_at", { ascending: false }),
      ]);

      const rolesMap = new Map<string, AppRole[]>();
      (rolesRes.data ?? []).forEach((r: any) => {
        const arr = rolesMap.get(r.user_id) || [];
        arr.push(r.role as AppRole);
        rolesMap.set(r.user_id, arr);
      });

      let userList: UserWithRoles[] = (profilesRes.data ?? []).map((p: any) => ({
        id:         p.id,
        email:      p.email ?? "",
        full_name:  p.full_name ?? "",
        country:    p.country ?? "",
        created_at: p.created_at,
        roles:      rolesMap.get(p.id) ?? [],
      }));

      // Non-super_admins cannot see super_admin users
      if (!isSuperAdmin) {
        userList = userList.filter(u => !u.roles.includes("super_admin"));
      }

      setUsers(userList);
      setInvitations(invRes.data ?? []);
    } finally {
      setLoading(false);
    }
  }, [user, isSuperAdmin]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    // Admin cannot invite super_admin
    if (!isSuperAdmin && inviteRole === "super_admin") {
      toast({ title: "Insufficient permissions", description: "Only a Super Admin can grant the super_admin role.", variant: "destructive" });
      return;
    }
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
      toast({ title: "Invitation sent", description: `${inviteEmail} — ${CRM_ROLE_META[inviteRole]?.label ?? inviteRole}` });
      setInviteEmail("");
      loadData();
    } catch (err: any) {
      toast({ title: "Failed to send invitation", description: err.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const handleRoleChange = async (targetId: string, role: AppRole, action: "add" | "remove") => {
    if (targetId === user?.id && action === "remove" && role === "super_admin") {
      toast({ title: "Cannot remove your own super_admin role", variant: "destructive" });
      return;
    }
    if (!isSuperAdmin && role === "super_admin") {
      toast({ title: "Insufficient permissions", variant: "destructive" });
      return;
    }
    try {
      if (action === "add") {
        await (supabase as any).from("user_roles").insert({ user_id: targetId, role });
      } else {
        await (supabase as any).from("user_roles").delete().eq("user_id", targetId).eq("role", role);
      }
      toast({ title: `Role ${action === "add" ? "granted" : "revoked"}` });
      loadData();
      if (targetId === user?.id) refreshRoles();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const revokeInvitation = async (invId: string) => {
    try {
      await (supabase as any).from("invitations").delete().eq("id", invId);
      toast({ title: "Invitation revoked" });
      loadData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const pending = invitations.filter(i => !i.accepted_at).length;

  const filteredUsers = users.filter(u => {
    if (!search) return true;
    const q = search.toLowerCase();
    return u.full_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.country.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#c8e0cc]">People & Access</h2>
          <p className="text-[12px] text-[#6b8f72] mt-0.5">
            Invite team members, assign roles, manage access
          </p>
        </div>
        <button onClick={loadData} disabled={loading}
          className="flex items-center gap-1.5 text-xs text-[#4a6650] hover:text-[#a0c4a8] transition-colors">
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Invite form */}
      <div className="bg-[#0d1610] border border-[#1e2d22] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <UserPlus size={14} className="text-emerald-500" />
          <h3 className="text-[13px] font-semibold text-[#c8e0cc]">Invite team member</h3>
        </div>
        <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            required
            placeholder="colleague@example.com"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            className="flex-1 bg-[#111a14] border border-[#1e2d22] text-[#a0c4a8] text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-700 placeholder:text-[#3a5040]"
          />
          <select
            value={inviteRole}
            onChange={e => setInviteRole(e.target.value as AppRole)}
            className="bg-[#111a14] border border-[#1e2d22] text-[#a0c4a8] text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-700"
          >
            {assignableRoles.map(r => (
              <option key={r} value={r}>{CRM_ROLE_META[r]?.label ?? r}</option>
            ))}
          </select>
          <button
            type="submit"
            disabled={sending}
            className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors disabled:opacity-50"
          >
            <Send size={13} />
            {sending ? "Sending…" : "Send invite"}
          </button>
        </form>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 border-b border-[#1e2d22]">
        {[
          { id: "users" as const,       label: `Users (${filteredUsers.length})` },
          { id: "invitations" as const, label: `Invitations${pending > 0 ? ` · ${pending} pending` : ""}` },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
              tab === t.id
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-[#6b8f72] hover:text-[#a0c4a8]"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-emerald-700 border-t-emerald-400 rounded-full animate-spin" />
        </div>
      )}

      {/* Users tab */}
      {!loading && tab === "users" && (
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Search by name, email or country…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#0d1610] border border-[#1e2d22] text-[#a0c4a8] text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-700 placeholder:text-[#3a5040]"
          />
          <div className="bg-[#0d1610] border border-[#1e2d22] rounded-xl overflow-hidden">
            {filteredUsers.length === 0 ? (
              <p className="text-center text-xs text-[#3a5040] py-8">No users found.</p>
            ) : (
              <div className="divide-y divide-[#1e2d22]">
                {filteredUsers.map(u => {
                  const initials = u.full_name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase() || "?";
                  const addableRoles = assignableRoles.filter(r => !u.roles.includes(r));
                  return (
                    <div key={u.id} className="flex items-start gap-3 px-4 py-3 hover:bg-[#111a14] transition-colors">
                      <div className="w-9 h-9 rounded-full bg-[#1e2d22] flex items-center justify-center text-xs font-bold text-emerald-400 flex-shrink-0 uppercase">
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-[12.5px] font-semibold text-[#c8e0cc]">{u.full_name || "—"}</p>
                          <p className="text-[11px] text-[#6b8f72]">{u.email}</p>
                        </div>
                        <p className="text-[10px] text-[#4a6650] mt-0.5">{u.country}</p>
                        {/* Role chips */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {u.roles.map(role => {
                            const m = CRM_ROLE_META[role];
                            if (!m) return null;
                            const canRemove = assignableRoles.includes(role) || isSuperAdmin;
                            return (
                              <span key={role}
                                className={`flex items-center gap-1 text-[9px] font-mono border rounded px-1.5 py-0.5 ${m.bgColour} ${m.colour} ${m.borderColour}`}>
                                {m.shortLabel}
                                {canRemove && (
                                  <button onClick={() => handleRoleChange(u.id, role, "remove")}
                                    className="hover:opacity-70 transition-opacity ml-0.5">
                                    <X size={8} />
                                  </button>
                                )}
                              </span>
                            );
                          })}
                          {/* Add role dropdown */}
                          {addableRoles.length > 0 && (
                            <select
                              defaultValue=""
                              onChange={e => { if (e.target.value) { handleRoleChange(u.id, e.target.value as AppRole, "add"); e.target.value = ""; }}}
                              className="text-[9px] font-mono bg-[#111a14] border border-[#1e2d22] text-[#4a6650] rounded px-1 py-0.5 focus:outline-none cursor-pointer"
                            >
                              <option value="">+ role</option>
                              {addableRoles.map(r => (
                                <option key={r} value={r}>{CRM_ROLE_META[r]?.shortLabel ?? r}</option>
                              ))}
                            </select>
                          )}
                        </div>
                      </div>
                      <p className="text-[10px] text-[#3a5040] flex-shrink-0 hidden sm:block">
                        {format(parseISO(u.created_at), "d MMM yyyy")}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Invitations tab */}
      {!loading && tab === "invitations" && (
        <div className="bg-[#0d1610] border border-[#1e2d22] rounded-xl overflow-hidden">
          {invitations.length === 0 ? (
            <p className="text-center text-xs text-[#3a5040] py-8">No invitations sent yet.</p>
          ) : (
            <div className="divide-y divide-[#1e2d22]">
              {invitations.map(inv => {
                const m = CRM_ROLE_META[inv.role];
                const accepted = !!inv.accepted_at;
                return (
                  <div key={inv.id} className="flex items-center gap-3 px-4 py-3 hover:bg-[#111a14] transition-colors">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${accepted ? "bg-emerald-950" : "bg-[#1e2d22]"}`}>
                      {accepted
                        ? <CheckCircle2 size={13} className="text-emerald-400" />
                        : <Clock size={13} className="text-[#4a6650]" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] font-medium text-[#c8e0cc] truncate">{inv.email}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {m && (
                          <span className={`text-[9px] font-mono border rounded px-1.5 py-0.5 ${m.bgColour} ${m.colour} ${m.borderColour}`}>
                            {m.shortLabel}
                          </span>
                        )}
                        <span className={`text-[10px] font-mono ${accepted ? "text-emerald-500" : "text-amber-500"}`}>
                          {accepted ? `Accepted ${format(parseISO(inv.accepted_at!), "d MMM")}` : "Pending"}
                        </span>
                        <span className="text-[10px] text-[#3a5040]">
                          Sent {format(parseISO(inv.created_at), "d MMM yyyy")}
                        </span>
                      </div>
                    </div>
                    {!accepted && (
                      <button onClick={() => revokeInvitation(inv.id)}
                        className="text-[#3a5040] hover:text-red-400 transition-colors p-1" title="Revoke">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
