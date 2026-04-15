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

// Existing pages
import Index from "./pages/Index";
import About from "./pages/About";
import Timeline from "./pages/Timeline";
import News from "./pages/News";
import NewsDetail from "./pages/news/NewsDetail";
import Documents from "./pages/Documents";
import Stakeholders from "./pages/Stakeholders";
import Team from "./pages/Team";
import NotFound from "./pages/NotFound";
import Contact from "./pages/Contact";
import MediaKit from "./pages/MediaKit";
import SponsorPortal from "./pages/SponsorPortal";
import Events from "./pages/Events";
import Volunteer from "./pages/Volunteer";
import PartnerPage from "./pages/partners/PartnerPage";
import SponsorPage from "./pages/sponsors/SponsorPage";
import EventDetail from "./pages/events/EventDetail";
import MediaPortal from "./pages/MediaPortal";

// Programme pages
import Youth from "./pages/programmes/Youth";
import Trade from "./pages/programmes/Trade";
import Women from "./pages/programmes/Women";
import Civic from "./pages/programmes/Civic";
import Culture from "./pages/programmes/Culture";
import Awards from "./pages/programmes/Awards";
import Parliament from "./pages/programmes/Parliament";
import InnovatorsChallenge from "./pages/programmes/InnovatorsChallenge";
import SmartChallenge from "./pages/programmes/SmartChallenge";
import ParliamentCountry from "./pages/programmes/ParliamentCountry";

// Auth
import Auth from "./pages/Auth";
import SetPassword from "./pages/SetPassword";
import CompleteProfile from "./pages/CompleteProfile";

// Admin pages
import UserManagement from "./pages/admin/UserManagement";

// Sponsor dashboard
import SponsorDashboard from "./pages/SponsorDashboard";

// CRM
import CRMDashboard from "./pages/CRMDashboard";

// Institutional pages
import EcowasParliament from "./pages/EcowasParliament";

// New feature pages
import DashboardCRM from "./pages/DashboardCRM";
import EmailPage from "./pages/apps/Email";
import CustomerListPage from "./pages/apps/CustomerList";
import AdminSettings from "./pages/admin/Settings";
import Forbidden from "./pages/Forbidden";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,   // 5 minutes — don't re-fetch fresh data on every render
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
              {/* Public pages */}
              <Route path="/"                   element={<Index />}          />
              <Route path="/about"              element={<About />}          />
              <Route path="/timeline"           element={<Timeline />}       />
              <Route path="/news"               element={<News />}           />
              <Route path="/news/:slug"          element={<NewsDetail />}     />
              <Route path="/documents"          element={<Documents />}      />
              <Route path="/stakeholders"       element={<Stakeholders />}   />
              <Route path="/team"               element={<Team />}           />
              <Route path="/contact"            element={<Contact />}        />
              <Route path="/media-kit"          element={<MediaKit />}       />
              <Route path="/sponsors"           element={<SponsorPortal />}  />
              <Route path="/events"             element={<Events />}         />
              <Route path="/events/:id"         element={<EventDetail />}    />
              <Route path="/volunteer"          element={<Volunteer />}      />
              <Route path="/partners/:slug"     element={<PartnerPage />}    />
              <Route path="/sponsors/:slug"     element={<SponsorPage />}    />
              <Route path="/ecowas-parliament"  element={<EcowasParliament />} />

              {/* Programme pillars */}
              <Route path="/programmes/youth"      element={<Youth />}      />
              <Route path="/programmes/trade"      element={<Trade />}      />
              <Route path="/programmes/women"      element={<Women />}      />
              <Route path="/programmes/civic"      element={<Civic />}      />
              <Route path="/programmes/culture"    element={<Culture />}    />
              <Route path="/programmes/awards"     element={<Awards />}     />
              <Route path="/programmes/parliament" element={<Parliament />} />
              <Route path="/programmes/parliament/:country" element={<ParliamentCountry />} />
              <Route path="/programmes/youth/innovators" element={<InnovatorsChallenge />} />
              <Route path="/programmes/youth/smart" element={<SmartChallenge />} />

              {/* Auth */}
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

              {/* Accredited Media Portal */}
              <Route path="/media-portal" element={
                <ProtectedRoute allowedRoles={["super_admin", "admin", "media"]}>
                  <MediaPortal />
                </ProtectedRoute>
              }/>
              {/* Protected admin area */}
              <Route path="/admin/users" element={
                <ProtectedRoute allowedRoles={["super_admin"]}>
                  <UserManagement />
                </ProtectedRoute>
              }/>

              {/* Sponsor dashboard */}
              <Route path="/sponsor-dashboard" element={
                <ProtectedRoute allowedRoles={["super_admin", "admin", "sponsor"]}>
                  <SponsorDashboard />
                </ProtectedRoute>
              }/>

              {/* CRM — all staff + sponsor roles */}
              <Route path="/crm" element={
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

              {/* Super Admin Settings — merged into CRM Super Admin Hub */}
              <Route path="/admin/settings" element={<Navigate to="/crm?section=super-admin" replace />} />

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