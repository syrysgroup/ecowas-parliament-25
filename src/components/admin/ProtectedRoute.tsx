import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2, ShieldAlert } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

type AppRole = "super_admin" | "admin" | "moderator" | "sponsor";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: AppRole[];
}

const ProtectedRoute = ({ children, allowedRoles = ["super_admin", "admin", "moderator"] }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [checkingRole, setCheckingRole] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkRole = async () => {
      if (!user) {
        setAuthorized(false);
        setCheckingRole(false);
        return;
      }

      const { data, error } = await (supabase as any)
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (error) {
        setAuthorized(false);
        setCheckingRole(false);
        return;
      }

      const roles = (data ?? []).map((item: { role: string }) => item.role);
      setAuthorized(allowedRoles.some((role) => roles.includes(role)));
      setCheckingRole(false);
    };

    void checkRole();
  }, [allowedRoles, user]);

  if (loading || checkingRole) {
    return (
      <Layout>
        <section className="py-24">
          <div className="container flex min-h-[40vh] items-center justify-center">
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-6 py-4 text-card-foreground shadow-sm">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span>Checking access…</span>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  if (!authorized) {
    return (
      <Layout>
        <section className="py-24">
          <div className="container max-w-xl">
            <div className="rounded-3xl border border-border bg-card p-10 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <ShieldAlert className="h-8 w-8" />
              </div>
              <h1 className="text-3xl font-black text-card-foreground">Restricted Area</h1>
              <p className="mt-3 text-muted-foreground">
                This dashboard is only available to authorised team members.
              </p>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
