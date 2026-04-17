import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation, Navigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { ThemeProvider } from "next-themes";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/lib/i18n";
import { AuthProvider, useAuthContext } from "@/contexts/AuthContext";
import { usePresence } from "@/hooks/usePresence";
import { useFavicon } from "@/hooks/useFavicon";
import { GlobalSettingsProvider } from "@/contexts/GlobalSettingsContext";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Auth pages
import Auth from "./pages/Auth";
import SetPassword from "./pages/SetPassword";
import CompleteProfile from "./pages/CompleteProfile";

// Error pages
import Forbidden from "./pages/Forbidden";
import NotFound from "./pages/NotFound";

// CRM pages
import CRMDashboard from "./pages/CRMDashboard";
import DashboardCRM from "./pages/DashboardCRM";
import EmailPage from "./pages/apps/Email";
import CustomerListPage from "./pages/apps/CustomerList";
import UserManagement from "./pages/admin/UserManagement";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,   // 5 minutes
    },
  },
});

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior }); }, [pathname]);
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return null;
}

// ── Global background email watcher ─────────────────────────────────────────
// Runs always — even when the email tab is NOT open.
// Uses Supabase Realtime to detect new rows in the emails table and fires
// both an in-app toast and a browser Push Notification (if permission granted).
function EmailNotificationWatcher() {
  const { user } = useAuthContext();
  const qc = useQueryClient();
  const { toast } = useToast();
  const accountIdRef = useRef<string | null>(null);

  // Step 1 — resolve the user's email account id once
  useEffect(() => {
    if (!user?.id) return;
    (supabase as any)
      .from("email_accounts")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .maybeSingle()
      .then(({ data }: any) => {
        if (data?.id) accountIdRef.current = data.id;
      });
  }, [user?.id]);

  // Step 2 — request browser notification permission once user is logged in
  useEffect(() => {
    if (!user?.id) return;
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, [user?.id]);

  // Step 3 — subscribe to new email inserts globally
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`global-email-watcher-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "emails" },
        (payload) => {
          const email = payload.new as any;
          // Only care about incoming emails (not sent/drafts the user just composed)
          if (email.folder === "sent" || email.folder === "drafts") return;
          // Only notify if it belongs to this user's account
          if (accountIdRef.current && email.account_id !== accountIdRef.current) return;

          const sender = email.from_name || email.from_address || "Someone";
          const subject = email.subject || "(No subject)";

          // In-app toast notification
          toast({
            title: `📩 New email from ${sender}`,
            description: subject,
          });

          // Browser Push Notification — works even when tab is in background
          if ("Notification" in window && Notification.permission === "granted") {
            try {
              new Notification(`New email from ${sender}`, {
                body: subject,
                icon: "/favicon.png",
                tag: `email-${email.id}`,   // deduplicates if same email fires twice
              });
            } catch { /**/ }
          }

          // Refresh email list and unread counts in any mounted query
          qc.invalidateQueries({ queryKey: ["emails"] });
          qc.invalidateQueries({ queryKey: ["email-unread-counts"] });
          qc.invalidateQueries({ queryKey: ["email-inbox-unread"] });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id, qc, toast]);

  return null;
}

function PresenceTracker() {
  const { user } = useAuthContext();
  usePresence(user?.id);
  useFavicon();
  return null;
}

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="ecowas-theme">
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <GlobalSettingsProvider>
      <I18nProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <PresenceTracker />
            <EmailNotificationWatcher />
            <Routes>
              {/* Auth flow */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/set-password" element={<SetPassword />} />
              <Route path="/complete-profile" element={
                <ProtectedRoute allowedRoles={[
                  "super_admin", "admin", "moderator", "sponsor", "media",
                  "project_director", "programme_lead", "website_editor",
                  "marketing_manager", "communications_officer",
                  "finance_coordinator", "logistics_coordinator",
                  "sponsor_manager", "consultant",
                ]}>
                  <CompleteProfile />
                </ProtectedRoute>
              }/>

              {/* CRM — all staff + sponsor roles (served at root) */}
              <Route path="/:section?" element={
                <ProtectedRoute allowedRoles={[
                  "super_admin", "admin", "moderator", "sponsor", "media",
                   "project_director", "programme_lead", "website_editor",
                  "marketing_manager", "communications_officer",
                  "finance_coordinator", "logistics_coordinator",
                  "sponsor_manager", "consultant",
                ]} bare>
                  <CRMDashboard />
                </ProtectedRoute>
              }/>

              {/* CRM Analytics Dashboard */}
              <Route path="/dashboards/crm" element={
                <ProtectedRoute allowedRoles={["super_admin", "admin", "project_director", "programme_lead"]}>
                  <DashboardCRM />
                </ProtectedRoute>
              }/>

              {/* Email App */}
              <Route path="/apps/email" element={
                <ProtectedRoute allowedRoles={["super_admin", "admin", "communications_officer", "marketing_manager", "project_director"]}>
                  <EmailPage />
                </ProtectedRoute>
              }/>
              <Route path="/apps/email/:folder" element={
                <ProtectedRoute allowedRoles={["super_admin", "admin", "communications_officer", "marketing_manager", "project_director"]}>
                  <EmailPage />
                </ProtectedRoute>
              }/>
              <Route path="/apps/email/label/:label" element={
                <ProtectedRoute allowedRoles={["super_admin", "admin", "communications_officer", "marketing_manager", "project_director"]}>
                  <EmailPage />
                </ProtectedRoute>
              }/>

              {/* Customer Management */}
              <Route path="/apps/ecommerce/customers" element={
                <ProtectedRoute allowedRoles={["super_admin", "admin", "sponsor_manager", "project_director"]}>
                  <CustomerListPage />
                </ProtectedRoute>
              }/>

              {/* Admin tools */}
              <Route path="/admin/users" element={
                <ProtectedRoute allowedRoles={["super_admin"]}>
                  <UserManagement />
                </ProtectedRoute>
              }/>

              {/* Super Admin Settings — handled inside CRM Super Admin Hub */}
              <Route path="/admin/settings" element={<Navigate to="/super-admin" replace />} />

              {/* 403 */}
              <Route path="/403" element={<Forbidden />} />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </I18nProvider>
      </GlobalSettingsProvider>
    </AuthProvider>
  </QueryClientProvider>
  </ThemeProvider>
);

export default App;
