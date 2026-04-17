import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useCallback, lazy, Suspense, useState, useRef, ReactNode } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { getModulesForRoles } from "@/components/crm/crmModules";
import { usePermissions } from "@/hooks/usePermissions";
import CRMLayout from "@/components/crm/CRMLayout";
import { supabase } from "@/integrations/supabase/client";

// Eager — core modules used immediately
import DashboardModule    from "@/components/crm/modules/DashboardModule";
import TaskBoardModule    from "@/components/crm/modules/TaskBoardModule";

import CalendarModule     from "@/components/crm/modules/CalendarModule";
import TeamModule         from "@/components/crm/modules/TeamModule";
import PeopleModule       from "@/components/crm/modules/PeopleModule";
import ParliamentOpsModule from "@/components/crm/modules/ParliamentOpsModule";
import SponsorMetricsModule from "@/components/crm/modules/SponsorMetricsModule";
import DocumentsModule    from "@/components/crm/modules/DocumentsModule";
import SuperAdminModule   from "@/components/crm/modules/SuperAdminModule";
import SettingsModule     from "@/components/crm/modules/SettingsModule";
import GeoAnalyticsModule from "@/components/crm/modules/GeoAnalyticsModule";
import EmailInboxModule   from "@/components/crm/modules/EmailInboxModule";
import EventsManagerModule from "@/components/crm/modules/EventsManagerModule";
import SponsorsManagerModule from "@/components/crm/modules/SponsorsManagerModule";
import ProgrammePillarsModule from "@/components/crm/modules/ProgrammePillarsModule";
import StakeholdersModule from "@/components/crm/modules/StakeholdersModule";
import MediaKitModule from "@/components/crm/modules/MediaKitModule";
import InvoiceModule from "@/components/crm/modules/InvoiceModule";
import ProfileModule from "@/components/crm/modules/ProfileModule";
import RolesModule from "@/components/crm/modules/RolesModule";

// Lazy — less frequently used modules
const MessagingModule = lazy(() => import("@/components/crm/modules/MessagingModule"));
const AnalyticsModule = lazy(() => import("@/components/crm/modules/AnalyticsModule"));
const FinanceModule   = lazy(() => import("@/components/crm/modules/FinanceModule"));
const MarketingModule = lazy(() => import("@/components/crm/modules/MarketingModule"));
const CMSModule       = lazy(() => import("@/components/crm/modules/CMSModule"));
const NewsEditorModule = lazy(() => import("@/components/crm/modules/NewsEditorModule"));
const SiteContentModule = lazy(() => import("@/components/crm/modules/SiteContentModule"));
const ContactSubmissionsModule = lazy(() => import("@/components/crm/modules/ContactSubmissionsModule"));
const NewsletterModule = lazy(() => import("@/components/crm/modules/NewsletterModule"));
const MediaLibraryModule = lazy(() => import("@/components/crm/modules/MediaLibraryModule"));

function ModuleLoader() {
  return (
    <div className="flex items-center justify-center h-40">
      <div className="w-6 h-6 border-2 border-emerald-700 border-t-emerald-400 rounded-full animate-spin" />
    </div>
  );
}

export default function CRMDashboard() {
  const [params, setParams] = useSearchParams();
  const { user, roles, loading, rolesLoading, isSuperAdmin } = useAuthContext();
  const navigate = useNavigate();
  const { canView } = usePermissions();

  const section = params.get("section") ?? "";

  // ── Keep-alive: track which sections have been mounted so they stay in the DOM ──
  const [mountedSections, setMountedSections] = useState<Set<string>>(() => new Set([section]));

  // ── Prevent spinner flash on token refresh — only block on true initial load ──
  const hasLoadedOnceRef = useRef(false);

  // Stable reference so useCRMTour's startTour callback doesn't recreate on every render,
  // which was causing the tour autoStart effect to fire in a loop.
  const navigateSection = useCallback((s: string) => {
    s === "" ? setParams({}) : setParams({ section: s });
    window.scrollTo(0, 0);
  }, [setParams]);

  // Add newly-visited sections to the mounted set
  useEffect(() => {
    setMountedSections(prev => {
      if (prev.has(section)) return prev;
      const next = new Set(prev);
      next.add(section);
      return next;
    });
  }, [section]);

  // Profile completion gate: only re-run when user ID changes, not on every token refresh
  useEffect(() => {
    if (loading || rolesLoading || !user?.id) return;
    (supabase as any)
      .from("profiles")
      .select("full_name, title, country, organisation")
      .eq("id", user.id)
      .single()
      .then(({ data }: any) => {
        if (!data?.full_name || !data?.title || !data?.country || !data?.organisation) {
          navigate("/complete-profile", { replace: true });
        }
      });
  }, [user?.id, loading, rolesLoading, navigate]);

  // Access guard: bounce to dashboard if section not allowed for user's roles
  useEffect(() => {
    if (loading || rolesLoading || roles.length === 0) return;
    if (section === "") return;
    const allowed = getModulesForRoles(roles).some(m => m.section === section);
    if (!allowed) { setParams({}); return; }
    if (!isSuperAdmin && !canView(section)) {
      setParams({});
    }
  }, [section, roles, loading, rolesLoading, isSuperAdmin, canView]);

  // Show full-screen spinner ONLY during initial load — never again after that
  if (!hasLoadedOnceRef.current && (loading || rolesLoading)) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  // Mark initial load complete — subsequent role refreshes won't trigger the spinner
  hasLoadedOnceRef.current = true;

  // Map section key → component (keep-alive: components are mounted once and hidden, not unmounted)
  const getModuleForSection = (sec: string): ReactNode => {
    switch (sec) {
      case "":                return <DashboardModule onNavigate={navigateSection} />;
      case "tasks":           return <TaskBoardModule />;
      case "calendar":        return <CalendarModule />;
      case "team":            return <TeamModule />;
      case "people":          return <PeopleModule />;
      case "parliament-ops":  return <ParliamentOpsModule />;
      case "sponsor-metrics": return <SponsorMetricsModule />;
      case "documents":       return <DocumentsModule />;
      case "comms":           return <Suspense fallback={<ModuleLoader />}><MessagingModule /></Suspense>;
      case "analytics":       return <Suspense fallback={<ModuleLoader />}><AnalyticsModule /></Suspense>;
      case "finance":         return <Suspense fallback={<ModuleLoader />}><FinanceModule /></Suspense>;
      case "marketing":       return <Suspense fallback={<ModuleLoader />}><MarketingModule /></Suspense>;
      case "cms":             return <Suspense fallback={<ModuleLoader />}><CMSModule /></Suspense>;
      case "email-inbox":     return <EmailInboxModule />;
      case "super-admin":     return <SuperAdminModule onNavigate={navigateSection} />;
      case "settings":        return <SettingsModule onNavigate={navigateSection} />;
      case "geo-analytics":   return <GeoAnalyticsModule />;
      case "events-manager":  return <EventsManagerModule />;
      case "sponsors-partners": return <SponsorsManagerModule />;
      case "news-editor":     return <Suspense fallback={<ModuleLoader />}><NewsEditorModule /></Suspense>;
      case "site-content":    return <Suspense fallback={<ModuleLoader />}><SiteContentModule /></Suspense>;
      case "contact-submissions": return <Suspense fallback={<ModuleLoader />}><ContactSubmissionsModule /></Suspense>;
      case "newsletter":      return <Suspense fallback={<ModuleLoader />}><NewsletterModule /></Suspense>;
      case "media-library":   return <Suspense fallback={<ModuleLoader />}><MediaLibraryModule /></Suspense>;
      case "programme-pillars":  return <ProgrammePillarsModule />;
      case "stakeholders-mgmt":  return <StakeholdersModule />;
      case "media-kit-mgmt":     return <MediaKitModule />;
      case "invoices":           return <InvoiceModule />;
      case "profile":            return <ProfileModule />;
      case "roles":              return <RolesModule />;
      default:                   return <DashboardModule onNavigate={navigateSection} />;
    }
  };

  return (
    <CRMLayout activeSection={section} onNavigate={navigateSection}>
      {Array.from(mountedSections).map(sec => (
        <div key={sec} style={sec === section ? undefined : { display: "none" }}>
          {getModuleForSection(sec)}
        </div>
      ))}
    </CRMLayout>
  );
}
