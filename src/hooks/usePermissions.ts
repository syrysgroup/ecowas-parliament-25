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
      const { data } = await (supabase as any)
        .from("role_permissions")
        .select("module, can_view, can_create, can_edit, can_delete")
        .in("role", roles);
      return data ?? [];
    },
    enabled: !!user && roles.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  const check = (module: string, action: "can_view" | "can_create" | "can_edit" | "can_delete") => {
    if (isSuperAdmin) return true;
    return permissions.some(p => p.module === module && p[action]);
  };

  return {
    canView: (module: string) => check(module, "can_view"),
    canCreate: (module: string) => check(module, "can_create"),
    canEdit: (module: string) => check(module, "can_edit"),
    canDelete: (module: string) => check(module, "can_delete"),
    permissions,
  };
}
