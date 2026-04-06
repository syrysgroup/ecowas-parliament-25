import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useGlobalSettings } from "@/contexts/GlobalSettingsContext";
import { toast } from "sonner";

type Role = "admin" | "user";
type PermKey = "delete_contacts" | "export_data" | "view_reports" | "manage_deals" | "send_invoices";

const ROLES: Role[] = ["admin", "user"];
const PERMS: { key: PermKey; label: string }[] = [
  { key: "delete_contacts", label: "Delete Contacts" },
  { key: "export_data", label: "Export Data" },
  { key: "view_reports", label: "View Reports" },
  { key: "manage_deals", label: "Manage Deals" },
  { key: "send_invoices", label: "Send Invoices" },
];

const PermissionsSettings = () => {
  const { settings, updateSetting } = useGlobalSettings();
  const stored = (settings.permissions as Record<Role, Record<PermKey, boolean>>) ?? {};

  const defaultPerms: Record<Role, Record<PermKey, boolean>> = {
    admin: { delete_contacts: true, export_data: true, view_reports: true, manage_deals: true, send_invoices: true },
    user: { delete_contacts: false, export_data: false, view_reports: true, manage_deals: false, send_invoices: false },
  };

  const [perms, setPerms] = useState<Record<Role, Record<PermKey, boolean>>>({
    admin: { ...defaultPerms.admin, ...(stored.admin ?? {}) },
    user: { ...defaultPerms.user, ...(stored.user ?? {}) },
  });

  const toggle = (role: Role, perm: PermKey, val: boolean) => {
    setPerms((prev) => ({ ...prev, [role]: { ...prev[role], [perm]: val } }));
  };

  const handleSave = async () => {
    await updateSetting("permissions", perms);
    toast.success("Permissions saved");
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Permission</th>
              {ROLES.map((r) => (
                <th key={r} className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wide capitalize">{r}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERMS.map((perm) => (
              <tr key={perm.key} className="border-t border-border hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">{perm.label}</td>
                {ROLES.map((role) => (
                  <td key={role} className="px-4 py-3 text-center">
                    <Switch
                      checked={perms[role][perm.key]}
                      onCheckedChange={(v) => toggle(role, perm.key, v)}
                      className="mx-auto"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button onClick={handleSave} className="w-fit">Save Permissions</Button>
    </div>
  );
};

export default PermissionsSettings;
