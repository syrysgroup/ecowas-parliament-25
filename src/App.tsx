import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/lib/i18n";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/admin/ProtectedRoute";

// Existing pages
import Index from "./pages/Index";
import About from "./pages/About";
import Timeline from "./pages/Timeline";
import News from "./pages/News";
import Documents from "./pages/Documents";
import Stakeholders from "./pages/Stakeholders";
import Team from "./pages/Team";
import NotFound from "./pages/NotFound";
import Contact from "./pages/Contact";
import MediaKit from "./pages/MediaKit";
import SponsorPortal from "./pages/SponsorPortal";
import Events from "./pages/Events";

// Programme pages
import Youth from "./pages/programmes/Youth";
import Trade from "./pages/programmes/Trade";
import Women from "./pages/programmes/Women";
import Civic from "./pages/programmes/Civic";
import Culture from "./pages/programmes/Culture";
import Awards from "./pages/programmes/Awards";
import Parliament from "./pages/programmes/Parliament";

// Auth
import Auth from "./pages/Auth";

// Admin pages
import UserManagement from "./pages/admin/UserManagement";
import SuperAdminDashboard from "./pages/admin/SuperAdminDashboard";

// Sponsor dashboard
import SponsorDashboard from "./pages/SponsorDashboard";

// CRM
import CRMDashboard from "./pages/CRMDashboard";

const queryClient = new QueryClient();

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <I18nProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              {/* Public pages */}
              <Route path="/"                   element={<Index />}          />
              <Route path="/about"              element={<About />}          />
              <Route path="/timeline"           element={<Timeline />}       />
              <Route path="/news"               element={<News />}           />
              <Route path="/documents"          element={<Documents />}      />
              <Route path="/stakeholders"       element={<Stakeholders />}   />
              <Route path="/team"               element={<Team />}           />
              <Route path="/contact"            element={<Contact />}        />
              <Route path="/media-kit"          element={<MediaKit />}       />
              <Route path="/sponsors"           element={<SponsorPortal />}  />
              <Route path="/events"             element={<Events />}         />

              {/* Programme pillars */}
              <Route path="/programmes/youth"      element={<Youth />}      />
              <Route path="/programmes/trade"      element={<Trade />}      />
              <Route path="/programmes/women"      element={<Women />}      />
              <Route path="/programmes/civic"      element={<Civic />}      />
              <Route path="/programmes/culture"    element={<Culture />}    />
              <Route path="/programmes/awards"     element={<Awards />}     />
              <Route path="/programmes/parliament" element={<Parliament />} />

              {/* Auth */}
              <Route path="/auth" element={<Auth />} />

              {/* Protected: Super Admin */}
              <Route path="/admin/super" element={
                <ProtectedRoute allowedRoles={["super_admin"]} bare>
                  <SuperAdminDashboard />
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
                  "super_admin", "admin", "moderator", "sponsor",
                  "project_director", "programme_lead", "website_editor",
                  "marketing_manager", "communications_officer",
                  "finance_coordinator", "logistics_coordinator",
                  "sponsor_manager", "consultant",
                ]} bare>
                  <CRMDashboard />
                </ProtectedRoute>
              }/>

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </I18nProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
