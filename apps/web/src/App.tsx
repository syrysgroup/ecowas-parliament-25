import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/lib/i18n";
import { AuthProvider } from "@/contexts/AuthContext";
import { GlobalSettingsProvider } from "@/contexts/GlobalSettingsContext";
import ProtectedRoute from "@/components/admin/ProtectedRoute";

// Public website pages
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
import EcowasParliament from "./pages/EcowasParliament";
import SponsorDashboard from "./pages/SponsorDashboard";

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

// Admin
import UserManagement from "./pages/admin/UserManagement";

// Error pages
import Forbidden from "./pages/Forbidden";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior }); }, [pathname]);
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return null;
}

// Redirect /crm to the admin subdomain
function CrmRedirect() {
  useEffect(() => {
    window.location.replace("https://admin.ecowasparliamentinitiatives.org/crm");
  }, []);
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

              {/* CRM — redirect to admin subdomain */}
              <Route path="/crm" element={<CrmRedirect />} />
              <Route path="/crm/*" element={<CrmRedirect />} />

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
