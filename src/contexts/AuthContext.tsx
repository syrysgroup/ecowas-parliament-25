import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────
export type AppRole =
  | "super_admin"
  | "admin"
  | "moderator"
  | "sponsor"
  | "media"
  | "project_director"
  | "programme_lead"
  | "website_editor"
  | "marketing_manager"
  | "communications_officer"
  | "finance_coordinator"
  | "logistics_coordinator"
  | "sponsor_manager"
  | "consultant";

export interface AuthContextValue {
  user:                 User | null;
  session:              Session | null;
  roles:                AppRole[];
  loading:              boolean;
  rolesLoading:         boolean;
  isSuperAdmin:         boolean;
  isAdmin:              boolean;
  isModerator:          boolean;
  isSponsor:            boolean;
  isCRMStaff:           boolean;
  isProjectDirector:    boolean;
  isFinanceCoordinator: boolean;
  isSponsorManager:     boolean;
  hasRole:              (role: AppRole) => boolean;
  signOut:              () => Promise<void>;
  refreshRoles:         () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const CRM_STAFF_ROLES: AppRole[] = [
  "super_admin",
  "admin",
  "moderator",
  "project_director",
  "programme_lead",
  "website_editor",
  "marketing_manager",
  "communications_officer",
  "finance_coordinator",
  "logistics_coordinator",
  "sponsor_manager",
  "consultant",
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,         setUser]         = useState<User | null>(null);
  const [session,      setSession]      = useState<Session | null>(null);
  const [roles,        setRoles]        = useState<AppRole[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [rolesLoading, setRolesLoading] = useState(false);

  const fetchRoles = useCallback(async (userId: string) => {
    setRolesLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (!error && data) {
        setRoles(data.map((r: { role: string }) => r.role as AppRole));
      } else {
        setRoles([]);
      }
    } catch {
      setRoles([]);
    } finally {
      setRolesLoading(false);
    }
  }, []);

  const refreshRoles = useCallback(async () => {
    if (user) await fetchRoles(user.id);
  }, [user, fetchRoles]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) fetchRoles(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        if (session?.user) {
          fetchRoles(session.user.id);
        } else {
          setRoles([]);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchRoles]);

  const hasRole            = (role: AppRole) => roles.includes(role);
  const isSuperAdmin       = hasRole("super_admin");
  const isAdmin            = isSuperAdmin || hasRole("admin");
  const isModerator        = isAdmin || hasRole("moderator");
  const isSponsor          = hasRole("sponsor");
  const isCRMStaff         = roles.some(r => CRM_STAFF_ROLES.includes(r));
  const isProjectDirector  = hasRole("project_director") || isAdmin;
  const isFinanceCoordinator = hasRole("finance_coordinator") || isSuperAdmin;
  const isSponsorManager   = hasRole("sponsor_manager") || isSuperAdmin;

  const signOut = async () => {
    await supabase.auth.signOut();
    setRoles([]);
  };

  const value: AuthContextValue = {
    user, session, roles, loading, rolesLoading,
    isSuperAdmin, isAdmin, isModerator, isSponsor,
    isCRMStaff, isProjectDirector, isFinanceCoordinator, isSponsorManager,
    hasRole, signOut, refreshRoles,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used inside <AuthProvider>");
  return ctx;
}
