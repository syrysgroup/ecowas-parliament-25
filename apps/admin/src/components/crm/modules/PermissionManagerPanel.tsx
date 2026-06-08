import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Loader2, Save, ExternalLink, Lock, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/contexts/AuthContext";
import {
  PERM_MODULES,
  PERM_ROLES,
  ACTIONS,
  ALLOWED_ROLES_BY_MODULE,
} from "../permRegistry";

// Re-export so existing imports (RolesModule, etc.) keep working
export { PERM_MODULES, PERM_ROLES, ACTIONS } from "../permRegistry";

interface Props {
  /** When provided, renders a link to navigate to the full Roles page */
  onNavigateToRoles?: () => void;
}

export default function PermissionManagerPanel({ onNavigateToRoles }: Props) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { isSuperAdmin } = useAuthContext();
  const [perms, setPerms] = useState<Record<string, Record<string, boolean>>>({});
  const [saving, setSaving] = useState(false);
  const [reseeding, setReseeding] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["all-role-permissions"],
    queryFn: async () => {
      const { data } = await supabase.from("role_permissions").select("*");
      return data ?? [];
    },
  });

  useEffect(() => {
    if (!data) return;
    const map: Record<string, Record<string, boolean>> = {};
    (data as any[]).forEach((row) => {
      map[`${row.role}:${row.module}`] = {
        can_view: row.can_view,
        can_create: row.can_create,
        can_edit: row.can_edit,
        can_delete: row.can_delete,
      };
    });
    setPerms(map);
  }, [data]);

  const toggle = (role: string, module: string, action: string) => {
    if (!isSuperAdmin) return;
    const key = `${role}:${module}`;
    const current = perms[key] || { can_view: false, can_create: false, can_edit: false, can_delete: false };
    const newVal = !current[action as keyof typeof current];
    let next = { ...current, [action]: newVal };
    if (action === "can_view" && !newVal) {
      next = { can_view: false, can_create: false, can_edit: false, can_delete: false };
    }
    if (action !== "can_view" && newVal) {
      next.can_view = true;
    }
    setPerms((prev) => ({ ...prev, [key]: next }));
  };

  const toggleAllForRole = (role: string) => {
    if (!isSuperAdmin) return;
    const allChecked = PERM_MODULES.every((mod) =>
      ACTIONS.every((action) => perms[`${role}:${mod}`]?.[action]),
    );
    setPerms((prev) => {
      const next = { ...prev };
      PERM_MODULES.forEach((mod) => {
        next[`${role}:${mod}`] = {
          can_view: !allChecked,
          can_create: !allChecked,
          can_edit: !allChecked,
          can_delete: !allChecked,
        };
      });
      return next;
    });
  };

  const handleSave = async () => {
    if (!isSuperAdmin) return;
    setSaving(true);
    try {
      const rows: any[] = [];
      for (const role of PERM_ROLES) {
        for (const mod of PERM_MODULES) {
          const p = perms[`${role}:${mod}`] || { can_view: false, can_create: false, can_edit: false, can_delete: false };
          rows.push({
            role,
            module: mod,
            can_view: !!p.can_view,
            can_create: !!p.can_create,
            can_edit: !!p.can_edit,
            can_delete: !!p.can_delete,
          });
        }
      }

      // Chunked upsert (atomic per chunk) — safer than DELETE+INSERT
      const CHUNK = 500;
      for (let i = 0; i < rows.length; i += CHUNK) {
        const slice = rows.slice(i, i + CHUNK);
        const { error } = await supabase
          .from("role_permissions")
          .upsert(slice, { onConflict: "role,module" });
        if (error) throw new Error(error.message);
      }

      await qc.invalidateQueries({ queryKey: ["all-role-permissions"], exact: false });
      await qc.invalidateQueries({ queryKey: ["role-permissions"], exact: false });
      toast({ title: "Permissions saved" });
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleReseed = async () => {
    if (!isSuperAdmin) return;
    setReseeding(true);
    try {
      // Add any missing (role, module) rows using defaults from crmModules.ts
      const toInsert: any[] = [];
      for (const role of PERM_ROLES) {
        for (const mod of PERM_MODULES) {
          if (perms[`${role}:${mod}`]) continue;
          const allowed = (ALLOWED_ROLES_BY_MODULE[mod] || []).includes(role as any);
          toInsert.push({
            role,
            module: mod,
            can_view: allowed,
            can_create: false,
            can_edit: false,
            can_delete: false,
          });
        }
      }
      if (toInsert.length === 0) {
        toast({ title: "All modules already seeded" });
        return;
      }
      const { error } = await supabase
        .from("role_permissions")
        .upsert(toInsert, { onConflict: "role,module", ignoreDuplicates: true });
      if (error) throw new Error(error.message);
      await qc.invalidateQueries({ queryKey: ["all-role-permissions"], exact: false });
      await qc.invalidateQueries({ queryKey: ["role-permissions"], exact: false });
      toast({ title: `Reseeded ${toInsert.length} missing entries` });
    } catch (err: any) {
      toast({ title: "Reseed failed", description: err.message, variant: "destructive" });
    } finally {
      setReseeding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-5 h-5 border-2 border-emerald-700 border-t-emerald-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-start gap-2 p-3 bg-amber-950/40 border border-amber-800 rounded-lg flex-1 min-w-0">
          <AlertTriangle size={12} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-amber-300 leading-relaxed">
            {isSuperAdmin
              ? "Super Admin has full access to every module (locked row at the top). Toggle any other role/module combination below. Unchecking View removes Create/Edit/Delete."
              : "View-only. Only Super Admin can modify the permissions matrix."}
          </p>
        </div>
        <div className="flex gap-2">
          {isSuperAdmin && (
            <button
              onClick={handleReseed}
              disabled={reseeding}
              className="flex items-center gap-1.5 text-[11px] text-emerald-400 hover:text-emerald-300 border border-emerald-800 rounded-lg px-3 py-2 hover:bg-emerald-950/40 transition-colors whitespace-nowrap disabled:opacity-50"
              title="Insert missing (role × module) rows using defaults from crmModules.ts"
            >
              {reseeding ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
              Reseed from registry
            </button>
          )}
          {onNavigateToRoles && (
            <button
              onClick={onNavigateToRoles}
              className="flex items-center gap-1.5 text-[11px] text-emerald-400 hover:text-emerald-300 border border-emerald-800 rounded-lg px-3 py-2 hover:bg-emerald-950/40 transition-colors whitespace-nowrap"
            >
              <ExternalLink size={11} /> Full Roles Page
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto border border-[hsl(var(--border-subtle))] rounded-lg">
        <table className="w-full text-[10px]">
          <thead>
            <tr className="border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-3))]/50">
              <th className="text-left py-2 px-3 text-[hsl(var(--text-3))] font-semibold sticky left-0 bg-[hsl(var(--surface-3))]/90 z-10 min-w-[140px]">
                Module
              </th>
              <th
                colSpan={4}
                className="text-center py-2 px-1 text-amber-300 font-semibold border-l border-amber-800/60 bg-amber-950/30"
                title="Super Admin always has full access — locked"
              >
                <span className="inline-flex items-center gap-1 capitalize text-[9px]">
                  <Lock size={9} /> super admin
                </span>
              </th>
              {PERM_ROLES.map((role) => (
                <th key={role} colSpan={4} className="text-center py-2 px-1 text-[hsl(var(--text-3))] font-semibold">
                  <button
                    onClick={() => toggleAllForRole(role)}
                    disabled={!isSuperAdmin}
                    className="hover:text-[hsl(var(--text-1))] transition-colors capitalize text-[9px] disabled:cursor-not-allowed"
                  >
                    {role.replace(/_/g, " ")}
                  </button>
                </th>
              ))}
            </tr>
            <tr className="border-b border-[hsl(var(--border-subtle))]">
              <th className="sticky left-0 bg-[hsl(var(--surface-3))]/90 z-10" />
              {ACTIONS.map((action) => (
                <th
                  key={`super-${action}`}
                  className="text-center py-1 px-0.5 text-amber-400/70 text-[7px] border-l border-amber-800/60 bg-amber-950/20"
                >
                  {action.replace("can_", "").charAt(0).toUpperCase() + action.replace("can_", "").slice(1)}
                </th>
              ))}
              {PERM_ROLES.map((role) =>
                ACTIONS.map((action) => (
                  <th
                    key={`${role}-${action}`}
                    className="text-center py-1 px-0.5 text-[hsl(var(--text-3))] text-[7px]"
                  >
                    {action.replace("can_", "").charAt(0).toUpperCase() + action.replace("can_", "").slice(1)}
                  </th>
                )),
              )}
            </tr>
          </thead>
          <tbody>
            {PERM_MODULES.map((module) => (
              <tr key={module} className="border-b border-[hsl(var(--border-subtle))]/50 hover:bg-[hsl(var(--surface-3))]/30">
                <td className="py-1.5 px-3 text-[hsl(var(--text-1))] font-medium capitalize sticky left-0 bg-[hsl(var(--surface-1))] z-10 text-[10px]">
                  {module.replace(/-/g, " ")}
                </td>
                {ACTIONS.map((action) => (
                  <td
                    key={`super-${module}-${action}`}
                    className="text-center py-1.5 px-0.5 border-l border-amber-800/60 bg-amber-950/10"
                  >
                    <Checkbox checked={true} disabled className="h-3 w-3 opacity-80" />
                  </td>
                ))}
                {PERM_ROLES.map((role) =>
                  ACTIONS.map((action) => {
                    const key = `${role}:${module}`;
                    const checked = perms[key]?.[action] ?? false;
                    return (
                      <td key={`${role}-${module}-${action}`} className="text-center py-1.5 px-0.5">
                        <Checkbox
                          checked={checked}
                          disabled={!isSuperAdmin}
                          onCheckedChange={() => toggle(role, module, action)}
                          className="h-3 w-3"
                        />
                      </td>
                    );
                  }),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isSuperAdmin && (
        <Button
          size="sm"
          onClick={handleSave}
          disabled={saving}
          className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs gap-1.5"
        >
          {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
          Save Permissions
        </Button>
      )}
    </div>
  );
}
