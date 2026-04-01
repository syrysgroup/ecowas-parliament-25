import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";
import type { AppRole } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: AppRole[];
  bare?: boolean;
}

function LoadingShell({ bare }: { bare?: boolean }) {
  const inner = (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-6 py-4 shadow-sm">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">Verifying access…</span>
      </div>
    </div>
  );

  if (bare) return inner;

  return (
    <main className="min-h-screen bg-background">
      <div className="container py-8">{inner}</div>
    </main>
  );
}

function AccessDenied() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-sm w-full rounded-3xl border border-border bg-card p-10 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <ShieldAlert className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="text-2xl font-black text-card-foreground">Restricted Area</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          You don't have permission to access this page. Contact your system administrator
          if you believe this is an error.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Button asChild variant="default" size="sm">
            <Link to="/crm">Go to your dashboard</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link to="/">Return to home</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

export default function ProtectedRoute({
  children,
  allowedRoles = ["super_admin", "admin", "moderator"],
  bare,
}: ProtectedRouteProps) {
  const { user, loading, rolesLoading, hasRole } = useAuthContext();
  const location = useLocation();

  if (loading || rolesLoading) {
    return <LoadingShell bare={bare} />;
  }

  if (!user) {
    return (
      <Navigate
        to="/auth"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  if (!allowedRoles.some(r => hasRole(r))) {
    return <AccessDenied />;
  }

  return <>{children}</>;
}
