import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { KeyRound, ShieldOff } from "lucide-react";
import { toast } from "sonner";
import { useAuthContext as useAuth } from "@/contexts/AuthContext";

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string;
  is_active: boolean;
};

const ROLES = [
  "admin", "website_editor", "communications_officer",
  "marketing_manager", "programme_lead", "project_director",
  "sponsor_manager", "finance_coordinator", "logistics_coordinator",
  "consultant", "sponsor", "public",
];

const UserManagementSettings = () => {
  const { user: currentUser } = useAuth();
  const qc = useQueryClient();

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["admin-all-profiles"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("profiles")
        .select("id, full_name, email, role, is_active")
        .order("full_name");
      if (error) throw error;
      return data as Profile[];
    },
  });

  const updateRole = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      const { error } = await (supabase as any)
        .from("profiles")
        .update({ role })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-all-profiles"] }); toast.success("Role updated"); },
    onError: (e: any) => toast.error(e.message),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await (supabase as any)
        .from("profiles")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-all-profiles"] }); toast.success("Status updated"); },
  });

  const sendReset = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) toast.error(error.message);
    else toast.success(`Reset email sent to ${email}`);
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/40">
          <tr>
            {["User", "Role", "Active", "Actions"].map((h) => (
              <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-t border-border">
                {Array.from({ length: 4 }).map((_, j) => (
                  <td key={j} className="px-4 py-3"><Skeleton className="h-5 w-24" /></td>
                ))}
              </tr>
            ))
          ) : (
            profiles.map((p) => {
              const isSelf = p.id === currentUser?.id;
              const isSuperAdmin = p.role === "super_admin";
              return (
                <tr key={p.id} className="border-t border-border hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-foreground">{p.full_name ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">{p.email ?? "—"}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {isSuperAdmin ? (
                      <Badge variant="secondary" className="text-primary bg-primary/10">super_admin</Badge>
                    ) : (
                      <Select
                        value={p.role}
                        onValueChange={(v) => updateRole.mutate({ id: p.id, role: v })}
                        disabled={isSelf}
                      >
                        <SelectTrigger className="h-7 w-44 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLES.map((r) => (
                            <SelectItem key={r} value={r} className="text-xs">{r}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Switch
                      checked={p.is_active !== false}
                      onCheckedChange={(v) => toggleActive.mutate({ id: p.id, is_active: v })}
                      disabled={isSelf || isSuperAdmin}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1.5 text-xs"
                      onClick={() => p.email && sendReset(p.email)}
                      disabled={!p.email}
                    >
                      <KeyRound size={12} />
                      Reset PW
                    </Button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagementSettings;
