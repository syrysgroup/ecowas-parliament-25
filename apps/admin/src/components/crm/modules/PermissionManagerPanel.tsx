import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Loader2, Save, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

// ─── Shared constants ─────────────────────────────────────────────────────────
export const PERM_MODULES = [
  "dashboard", "tasks", "email-inbox", "calendar", "documents",
  "team", "people", "news-editor", "events-manager", "programme-pillars",
  "stakeholders-mgmt", "media-kit-mgmt", "sponsors-partners", "site-content",
  "cms", "media-library", "analytics", "geo-analytics", "sponsor-metrics",
  "finance", "invoices", "marketing", "newsletter", "contact-submissions",
  "parliament-ops", "settings",
];

export const PERM_ROLES = [
  "admin", "moderator", "project_director", "programme_lead",
  "website_editor", "marketing_manager", "communications_officer",
  "finance_coordinator", "budget_officer", "logistics_coordinator", "sponsor_manager",
  "consultant", "staff", "sponsor", "media",
] as const;

export const ACTIONS = ["can_view", "can_create", "can_edit", "can_delete"] as const;

// ─── PermissionManagerPanel ───────────────────────────────────────────────────
interface Props {
  /** When provided, renders a link to navigate to the full Roles page */
  onNavigateToRoles?: () => void;
}

export default function PermissionManagerPanel({ onNavigateToRoles }: Props) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [perms, setPerms] = useState<Record<string, Record<string, boolean>>>({});
  const [saving, setSaving] = useState(false);

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
    const current = perms[key] || { can_view: false, can_create: false, can_edit: false, can_delete: false };
    const newVal = !current[action as keyof typeof current];
    let next = { ...current, [action]: newVal };
    // If unsetting can_view, also unset the other three
    if (action === "can_view" && !newVal) {
      next = { can_view: false, can_create: false, can_edit: false, can_delete: false };
    }
    // If setting create/edit/delete, also ensure can_view is on
    if (action !== "can_view" && newVal) {
      next.can_view = true;
    }
    setPerms(prev => ({ ...prev, [key]: next }));
  };

  const toggleAllForRole = (role: string) => {
    const allChecked = PERM_MODULES.every(mod =>
      ACTIONS.every(action => perms[`${role}:${mod}`]?.[action])
    );
    setPerms(prev => {
      const next = { ...prev };
      PERM_MODULES.forEach(mod => {
        next[`${role}:${mod}`] = {
          can_view: !allChecked, can_create: !allChecked,
          can_edit: !allChecked, can_delete: !allChecked,
        };
      });
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const upserts: any[] = [];
      for (const role of PERM_ROLES) {
        for (const module of PERM_MODULES) {
          const key = `${role}:${module}`;
          const p = perms[key] || { can_view: false, can_create: false, can_edit: false, can_delete: false };
          upserts.push({
            role, module,
            can_view: p.can_view ?? false, can_create: p.can_create ?? false,
            can_edit: p.can_edit ?? false, can_delete: p.can_delete ?? false,
          });
        }
      }
      for (const role of PERM_ROLES) {
        await supabase.from("role_permissions").delete().eq("role", role);
      }
      await supabase.from("role_permissions").insert(upserts);
      qc.invalidateQueries({ queryKey: ["all-role-permissions"] });
      qc.invalidateQueries({ queryKey: ["role-permissions"] });
      toast({ title: "Permissions saved" });
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    } finally { setSaving(false); }
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
            Super Admin always has full access to all modules. Configure permissions for all other roles below.
            Toggling view off will also remove create/edit/delete access.
          </p>
        </div>
        {onNavigateToRoles && (
          <button
            onClick={onNavigateToRoles}
            className="flex items-center gap-1.5 text-[11px] text-emerald-400 hover:text-emerald-300 border border-emerald-800 rounded-lg px-3 py-2 hover:bg-emerald-950/40 transition-colors whitespace-nowrap"
          >
            <ExternalLink size={11} /> Full Roles Page
          </button>
        )}
      </div>

      <div className="overflow-x-auto border border-crm-border rounded-lg">
        <table className="w-full text-[10px]">
          <thead>
            <tr className="border-b border-crm-border bg-crm-surface/50">
              <th className="text-left py-2 px-3 text-crm-text-dim font-semibold sticky left-0 bg-crm-surface/90 z-10 min-w-[130px]">
                Module
              </th>
              {PERM_ROLES.map(role => (
                <th key={role} colSpan={4} className="text-center py-2 px-1 text-crm-text-dim font-semibold">
                  <button
                    onClick={() => toggleAllForRole(role)}
                    className="hover:text-crm-text transition-colors capitalize text-[9px]"
                  >
                    {role.replace(/_/g, " ")}
                  </button>
                </th>
              ))}
            </tr>
            <tr className="border-b border-crm-border">
              <th className="sticky left-0 bg-crm-surface/90 z-10" />
              {PERM_ROLES.map(role =>
                ACTIONS.map(action => (
                  <th key={`${role}-${action}`} className="text-center py-1 px-0.5 text-crm-text-faint text-[7px]">
                    {action.replace("can_", "").charAt(0).toUpperCase() + action.replace("can_", "").slice(1)}
                  </th>
                ))
              )}
            </tr>
          </thead>
          <tbody>
            {PERM_MODULES.map(module => (
              <tr key={module} className="border-b border-crm-border/50 hover:bg-crm-surface/50">
                <td className="py-1.5 px-3 text-crm-text font-medium capitalize sticky left-0 bg-crm-card z-10 text-[10px]">
                  {module.replace(/-/g, " ")}
                </td>
                {PERM_ROLES.map(role =>
                  ACTIONS.map(action => {
                    const key = `${role}:${module}`;
                    const checked = perms[key]?.[action] ?? false;
                    return (
                      <td key={`${role}-${module}-${action}`} className="text-center py-1.5 px-0.5">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggle(role, module, action)}
                          className="h-3 w-3"
                        />
                      </td>
                    );
                  })
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Button
        size="sm"
        onClick={handleSave}
        disabled={saving}
        className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs gap-1.5"
      >
        {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
        Save Permissions
      </Button>
    </div>
  );
}
