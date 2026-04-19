import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ShieldCheck, Users, ChevronRight, Lock, Check,
  Loader2, AlertTriangle, Save, X, Plus,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { CRM_ROLE_META } from "../crmRoles";
import type { AppRole } from "@/contexts/AuthContext";
import { PERM_MODULES, PERM_ROLES, ACTIONS } from "./PermissionManagerPanel";

// ─── All 14 roles in display order ───────────────────────────────────────────
const ALL_ROLES: AppRole[] = [
  "super_admin",
  "admin",
  "moderator",
  "project_director",
  "programme_lead",
  "website_editor",
  "marketing_manager",
  "communications_officer",
  "finance_coordinator",
  "budget_officer",
  "logistics_coordinator",
  "sponsor_manager",
  "consultant",
  "staff",
  "sponsor",
  "media",
];

// ─── Avatar helper ────────────────────────────────────────────────────────────
const DEFAULT_AVATAR = "/images/logo/logo.png";

function Avatar({ name, src, size = "sm" }: { name: string; src?: string | null; size?: "sm" | "md" }) {
  const sz = size === "md" ? "w-9 h-9" : "w-7 h-7";
  return (
    <img
      src={src || DEFAULT_AVATAR}
      alt={name}
      className={`${sz} rounded-full object-cover shrink-0`}
      onError={e => { (e.target as HTMLImageElement).src = DEFAULT_AVATAR; }}
    />
  );
}

// ─── Role card ────────────────────────────────────────────────────────────────
function RoleCard({
  role,
  userCount,
  selected,
  onClick,
}: {
  role: AppRole;
  userCount: number;
  selected: boolean;
  onClick: () => void;
}) {
  const meta = CRM_ROLE_META[role];
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2.5 rounded-xl border transition-all flex items-center gap-3 group ${
        selected
          ? "border-emerald-700 bg-emerald-950/60 ring-1 ring-emerald-700/50"
          : "border-crm-border bg-crm-surface/30 hover:bg-crm-surface/60 hover:border-crm-border/80"
      }`}
    >
      {/* Color swatch */}
      <div className={`w-2 h-6 rounded-full ${meta.bgColour} border ${meta.borderColour} shrink-0`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-[12px] font-semibold ${selected ? meta.colour : "text-crm-text"}`}>
            {meta.label}
          </span>
          <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded border ${meta.bgColour} ${meta.colour} ${meta.borderColour}`}>
            {meta.shortLabel}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-crm-text-faint">Tier {meta.tier}</span>
          <span className="text-crm-text-faint">·</span>
          <span className="text-[10px] text-crm-text-faint flex items-center gap-1">
            <Users size={9} /> {userCount} {userCount === 1 ? "user" : "users"}
          </span>
        </div>
      </div>
      <ChevronRight size={13} className={`text-crm-text-faint shrink-0 transition-transform ${selected ? "rotate-90 text-emerald-400" : ""}`} />
    </button>
  );
}

// ─── Permissions matrix for a single role ────────────────────────────────────
function RolePermissionsPanel({
  role,
  perms,
  onChange,
  onSave,
  saving,
  isSuperAdmin: viewerIsSuperAdmin,
  isAdmin,
}: {
  role: AppRole;
  perms: Record<string, Record<string, boolean>>;
  onChange: (module: string, action: string) => void;
  onSave: () => void;
  saving: boolean;
  isSuperAdmin: boolean;
  isAdmin: boolean;
}) {
  const meta = CRM_ROLE_META[role];
  const isLocked = role === "super_admin";
  const canEdit = viewerIsSuperAdmin || isAdmin;

  return (
    <div className="space-y-4">
      {/* Role header */}
      <div className="flex items-center gap-3 pb-3 border-b border-crm-border">
        <div className={`px-3 py-1 rounded-full text-[11px] font-semibold border ${meta.bgColour} ${meta.colour} ${meta.borderColour}`}>
          {meta.label}
        </div>
        <span className="text-[11px] text-crm-text-faint">Tier {meta.tier}</span>
        {isLocked && (
          <div className="flex items-center gap-1 ml-auto text-[10px] text-amber-400">
            <Lock size={10} /> Full access — cannot be restricted
          </div>
        )}
      </div>

      {isLocked ? (
        <div className="flex items-center gap-3 p-4 bg-emerald-950/40 border border-emerald-800 rounded-xl">
          <Check size={16} className="text-emerald-400 shrink-0" />
          <p className="text-[12px] text-emerald-300">
            Super Admin has unrestricted access to every module in the system.
            This cannot be changed.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto border border-crm-border rounded-lg">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-crm-border bg-crm-surface/50">
                  <th className="text-left py-2 px-3 text-crm-text-dim font-semibold sticky left-0 bg-crm-surface/90 z-10 min-w-[160px]">
                    Module
                  </th>
                  {ACTIONS.map(action => (
                    <th key={action} className="text-center py-2 px-3 text-crm-text-dim font-semibold min-w-[64px]">
                      {action.replace("can_", "").charAt(0).toUpperCase() + action.replace("can_", "").slice(1)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERM_MODULES.map(module => {
                  const key = `${role}:${module}`;
                  return (
                    <tr key={module} className="border-b border-crm-border/50 hover:bg-crm-surface/30">
                      <td className="py-2 px-3 text-crm-text font-medium capitalize sticky left-0 bg-crm-card z-10">
                        {module.replace(/-/g, " ")}
                      </td>
                      {ACTIONS.map(action => {
                        const checked = perms[key]?.[action] ?? false;
                        return (
                          <td key={`${module}-${action}`} className="text-center py-2 px-3">
                            <Checkbox
                              checked={checked}
                              onCheckedChange={() => canEdit && onChange(module, action)}
                              disabled={!canEdit}
                              className="h-3.5 w-3.5"
                            />
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {canEdit && (
            <Button
              size="sm"
              onClick={onSave}
              disabled={saving}
              className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs gap-1.5"
            >
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
              Save Changes for {meta.label}
            </Button>
          )}

          {!canEdit && (
            <div className="flex items-center gap-2 text-[11px] text-crm-text-faint">
              <Lock size={11} /> View-only — admin or super admin can edit permissions
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Users with role section ──────────────────────────────────────────────────
function UsersWithRole({
  role,
  canManage,
}: {
  role: AppRole;
  canManage: boolean;
}) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [adding, setAdding] = useState(false);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users-with-role", role],
    queryFn: async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("user_id, profiles(full_name, avatar_url, title)")
        .eq("role", role);
      return (data ?? []).map((r: any) => ({
        user_id: r.user_id,
        full_name: r.profiles?.full_name ?? "Unknown",
        title: r.profiles?.title ?? "",
        avatar_url: r.profiles?.avatar_url ?? null,
      }));
    },
  });

  const handleRemove = async (userId: string, name: string) => {
    try {
      await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role);
      qc.invalidateQueries({ queryKey: ["users-with-role", role] });
      qc.invalidateQueries({ queryKey: ["user-role-counts"] });
      toast({ title: `Removed ${CRM_ROLE_META[role].label} from ${name}` });
    } catch (err: any) {
      toast({ title: "Failed to remove role", description: err.message, variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <div className="w-4 h-4 border-2 border-emerald-700 border-t-emerald-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold text-crm-text-dim uppercase tracking-wider">
          Users with this role ({users.length})
        </p>
        {canManage && !adding && (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300"
          >
            <Plus size={10} /> Add user
          </button>
        )}
      </div>

      {users.length === 0 ? (
        <p className="text-[11px] text-crm-text-faint py-2">
          No users currently have this role.
        </p>
      ) : (
        <div className="space-y-1.5">
          {users.map((u: any) => (
            <div
              key={u.user_id}
              className="flex items-center gap-2.5 p-2 rounded-lg bg-crm-surface/40 border border-crm-border/50 group"
            >
              <Avatar name={u.full_name} src={u.avatar_url} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-crm-text truncate">{u.full_name}</p>
                {u.title && <p className="text-[10px] text-crm-text-faint truncate">{u.title}</p>}
              </div>
              {canManage && (
                <button
                  onClick={() => handleRemove(u.user_id, u.full_name)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-950 text-crm-text-faint hover:text-red-400 transition-all"
                  title="Remove role"
                >
                  <X size={11} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function RolesModule() {
  const { isSuperAdmin, isAdmin } = useAuthContext();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [selectedRole, setSelectedRole] = useState<AppRole>("admin");
  const [perms, setPerms] = useState<Record<string, Record<string, boolean>>>({});
  const [saving, setSaving] = useState(false);

  // Load all permissions
  const { data: allPerms, isLoading: permsLoading } = useQuery({
    queryKey: ["all-role-permissions"],
    queryFn: async () => {
      const { data } = await supabase.from("role_permissions").select("*");
      return data ?? [];
    },
  });

  // Load user counts per role
  const { data: roleCounts = {} } = useQuery<Record<string, number>>({
    queryKey: ["user-role-counts"],
    queryFn: async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role");
      const counts: Record<string, number> = {};
      (data ?? []).forEach((r: any) => {
        counts[r.role] = (counts[r.role] ?? 0) + 1;
      });
      return counts;
    },
  });

  // Build perms map when data loads
  useState(() => {
    if (!allPerms) return;
    const map: Record<string, Record<string, boolean>> = {};
    (allPerms as any[]).forEach(row => {
      map[`${row.role}:${row.module}`] = {
        can_view: row.can_view,
        can_create: row.can_create,
        can_edit: row.can_edit,
        can_delete: row.can_delete,
      };
    });
    setPerms(map);
  });

  // Keep perms map in sync
  const [initialised, setInitialised] = useState(false);
  if (allPerms && !initialised && allPerms.length > 0) {
    const map: Record<string, Record<string, boolean>> = {};
    (allPerms as any[]).forEach((row: any) => {
      map[`${row.role}:${row.module}`] = {
        can_view: row.can_view,
        can_create: row.can_create,
        can_edit: row.can_edit,
        can_delete: row.can_delete,
      };
    });
    setPerms(map);
    setInitialised(true);
  }

  const handleChange = (module: string, action: string) => {
    const key = `${selectedRole}:${module}`;
    const current = perms[key] || { can_view: false, can_create: false, can_edit: false, can_delete: false };
    const newVal = !current[action as keyof typeof current];
    let next = { ...current, [action]: newVal };
    if (action === "can_view" && !newVal) {
      next = { can_view: false, can_create: false, can_edit: false, can_delete: false };
    }
    if (action !== "can_view" && newVal) {
      next.can_view = true;
    }
    setPerms(prev => ({ ...prev, [key]: next }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const upserts = PERM_MODULES.map(module => {
        const key = `${selectedRole}:${module}`;
        const p = perms[key] || { can_view: false, can_create: false, can_edit: false, can_delete: false };
        return {
          role: selectedRole, module,
          can_view: p.can_view ?? false, can_create: p.can_create ?? false,
          can_edit: p.can_edit ?? false, can_delete: p.can_delete ?? false,
        };
      });
      await supabase.from("role_permissions").delete().eq("role", selectedRole);
      await supabase.from("role_permissions").insert(upserts);
      qc.invalidateQueries({ queryKey: ["all-role-permissions"] });
      qc.invalidateQueries({ queryKey: ["role-permissions"] });
      toast({ title: `Permissions saved for ${CRM_ROLE_META[selectedRole].label}` });
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center">
          <ShieldCheck size={16} className="text-emerald-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-crm-text">Roles & Permissions</h2>
          <p className="text-[12px] text-crm-text-muted">
            Manage what each role can access and do across the CRM
          </p>
        </div>
      </div>

      {(!isSuperAdmin && !isAdmin) && (
        <div className="flex items-start gap-2 p-3 bg-amber-950/40 border border-amber-800 rounded-lg">
          <AlertTriangle size={12} className="text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-300">
            You have view-only access. Admin or Super Admin can edit permissions.
          </p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-5 min-h-0">
        {/* ── Left: Role cards ── */}
        <div className="w-full lg:w-[280px] lg:shrink-0 space-y-1.5">
          <p className="text-[10px] font-semibold text-crm-text-dim uppercase tracking-wider px-1 mb-2">
            Select a role
          </p>

          {/* Tier 1 */}
          <p className="text-[9px] text-crm-text-faint uppercase tracking-widest px-1 pt-1">Tier 1</p>
          {ALL_ROLES.filter(r => CRM_ROLE_META[r].tier === 1).map(role => (
            <RoleCard
              key={role}
              role={role}
              userCount={roleCounts[role] ?? 0}
              selected={selectedRole === role}
              onClick={() => { setSelectedRole(role); setInitialised(false); }}
            />
          ))}

          <p className="text-[9px] text-crm-text-faint uppercase tracking-widest px-1 pt-2">Tier 2 — Staff</p>
          {ALL_ROLES.filter(r => CRM_ROLE_META[r].tier === 2).map(role => (
            <RoleCard
              key={role}
              role={role}
              userCount={roleCounts[role] ?? 0}
              selected={selectedRole === role}
              onClick={() => { setSelectedRole(role); setInitialised(false); }}
            />
          ))}

          <p className="text-[9px] text-crm-text-faint uppercase tracking-widest px-1 pt-2">Tier 3 — External</p>
          {ALL_ROLES.filter(r => CRM_ROLE_META[r].tier === 3).map(role => (
            <RoleCard
              key={role}
              role={role}
              userCount={roleCounts[role] ?? 0}
              selected={selectedRole === role}
              onClick={() => { setSelectedRole(role); setInitialised(false); }}
            />
          ))}
        </div>

        {/* ── Right: Permissions + Users ── */}
        <div className="flex-1 min-w-0 space-y-6">
          {permsLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-emerald-700 border-t-emerald-400 rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <div className="bg-crm-card border border-crm-border rounded-xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-crm-border">
                  <ShieldCheck size={13} className="text-crm-text-dim" />
                  <h3 className="text-[12px] font-semibold text-crm-text-secondary">Module Permissions</h3>
                </div>
                <div className="p-4">
                  <RolePermissionsPanel
                    role={selectedRole}
                    perms={perms}
                    onChange={handleChange}
                    onSave={handleSave}
                    saving={saving}
                    isSuperAdmin={isSuperAdmin}
                    isAdmin={isAdmin}
                  />
                </div>
              </div>

              <div className="bg-crm-card border border-crm-border rounded-xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-crm-border">
                  <Users size={13} className="text-crm-text-dim" />
                  <h3 className="text-[12px] font-semibold text-crm-text-secondary">
                    Users — {CRM_ROLE_META[selectedRole].label}
                  </h3>
                </div>
                <div className="p-4">
                  <UsersWithRole
                    role={selectedRole}
                    canManage={isSuperAdmin}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
