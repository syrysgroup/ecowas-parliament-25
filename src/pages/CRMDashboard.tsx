import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
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

  const navigateSection = (s: string) => {
    s === "" ? setParams({}) : setParams({ section: s });
    window.scrollTo(0, 0);
  };

  // Profile completion gate: redirect to /complete-profile if required fields are missing
  useEffect(() => {
    if (loading || rolesLoading || !user) return;
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
  }, [user, loading, rolesLoading, navigate]);

  // Access guard: bounce to dashboard if section not allowed for user's roles
  useEffect(() => {
    if (loading || rolesLoading || roles.length === 0) return;
    if (section === "") return;
    // Static role-based gate
    const allowed = getModulesForRoles(roles).some(m => m.section === section);
    if (!allowed) { setParams({}); return; }
    // Dynamic DB permission gate (skip for super_admin — always allowed)
    if (!isSuperAdmin && !canView(section)) {
      setParams({});
    }
  }, [section, roles, loading, rolesLoading, isSuperAdmin, canView]);

  if (loading || rolesLoading) {
    return (
      <div className="flex h-screen bg-[#0a0f0d] items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-700 border-t-emerald-400 rounded-full animate-spin" />
      </div>
    );
  }

  const renderModule = () => {
    switch (section) {
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
      case "super-admin":     return <SuperAdminModule />;
      case "settings":        return <SettingsModule onNavigate={navigateSection} />;
      case "geo-analytics":   return <GeoAnalyticsModule />;
      case "events-manager":  return <EventsManagerModule />;
      case "sponsors-partners": return <SponsorsManagerModule />;
      case "news-editor":     return <Suspense fallback={<ModuleLoader />}><NewsEditorModule /></Suspense>;
      case "site-content":    return <Suspense fallback={<ModuleLoader />}><SiteContentModule /></Suspense>;
      case "contact-submissions": return <Suspense fallback={<ModuleLoader />}><ContactSubmissionsModule /></Suspense>;
      case "newsletter":      return <Suspense fallback={<ModuleLoader />}><NewsletterModule /></Suspense>;
      case "media-library":       return <Suspense fallback={<ModuleLoader />}><MediaLibraryModule /></Suspense>;
      case "programme-pillars":   return <ProgrammePillarsModule />;
      case "stakeholders-mgmt":   return <StakeholdersModule />;
      case "media-kit-mgmt":      return <MediaKitModule />;
      case "invoices":             return <InvoiceModule />;
      case "profile":              return <ProfileModule />;
      case "roles":                return <RolesModule />;
      default:                    return <DashboardModule onNavigate={navigateSection} />;
    }
  };

  return (
    <CRMLayout activeSection={section} onNavigate={navigateSection}>
      {renderModule()}
    </CRMLayout>
  );
}
