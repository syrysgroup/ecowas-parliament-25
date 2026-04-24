import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";

interface Permission {
  module: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

export function usePermissions() {
  const { user, isSuperAdmin, roles } = useAuthContext();

  const { data: permissions = [] } = useQuery<Permission[]>({
    queryKey: ["role-permissions", roles],
    queryFn: async () => {
      if (!roles.length) return [];
      const { data } = await supabase
        .from("role_permissions")
        .select("module, can_view, can_create, can_edit, can_delete")
        .in("role", roles);
      return data ?? [];
    },
    enabled: !!user && roles.length > 0,
    // staleTime: 0 so permissions always refetch immediately when invalidated
    // after a save in RolesModule or PermissionManagerPanel.
    staleTime: 0,
  });

  const check = useCallback(
    (module: string, action: "can_view" | "can_create" | "can_edit" | "can_delete") => {
      if (isSuperAdmin) return true;
      return permissions.some(p => p.module === module && p[action]);
    },
    [isSuperAdmin, permissions]
  );

  const canView   = useCallback((module: string) => check(module, "can_view"),   [check]);
  const canCreate = useCallback((module: string) => check(module, "can_create"), [check]);
  const canEdit   = useCallback((module: string) => check(module, "can_edit"),   [check]);
  const canDelete = useCallback((module: string) => check(module, "can_delete"), [check]);

  return { canView, canCreate, canEdit, canDelete, permissions };
}