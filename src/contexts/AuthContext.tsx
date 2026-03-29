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
export type AppRole = "super_admin" | "admin" | "moderator" | "sponsor";

export interface AuthContextValue {
  user:          User | null;
  session:       Session | null;
  roles:         AppRole[];
  loading:       boolean;
  rolesLoading:  boolean;
  isSuperAdmin:  boolean;
  isAdmin:       boolean;
  isModerator:   boolean;
  isSponsor:     boolean;
  hasRole:       (role: AppRole) => boolean;
  signOut:       () => Promise<void>;
  refreshRoles:  () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

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

  const hasRole      = (role: AppRole) => roles.includes(role);
  const isSuperAdmin = hasRole("super_admin");
  const isAdmin      = isSuperAdmin || hasRole("admin");
  const isModerator  = isAdmin || hasRole("moderator");
  const isSponsor    = hasRole("sponsor");

  const signOut = async () => {
    await supabase.auth.signOut();
    setRoles([]);
  };

  const value: AuthContextValue = {
    user, session, roles, loading, rolesLoading,
    isSuperAdmin, isAdmin, isModerator, isSponsor,
    hasRole, signOut, refreshRoles,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used inside <AuthProvider>");
  return ctx;
}
