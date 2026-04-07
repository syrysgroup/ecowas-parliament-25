import { useSearchParams } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { getModulesForRoles } from "@/components/crm/crmModules";
import CRMLayout from "@/components/crm/CRMLayout";

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
  const { roles, loading, rolesLoading } = useAuthContext();

  const section = params.get("section") ?? "";

  const navigateSection = (s: string) => {
    s === "" ? setParams({}) : setParams({ section: s });
    window.scrollTo(0, 0);
  };

  // Access guard: bounce to dashboard if section not allowed for user's roles
  useEffect(() => {
    if (loading || rolesLoading || roles.length === 0) return;
    if (section === "") return;
    const allowed = getModulesForRoles(roles).some(m => m.section === section);
    if (!allowed) setParams({});
  }, [section, roles, loading, rolesLoading]);

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
      case "settings":        return <SettingsModule />;
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
      default:                    return <DashboardModule onNavigate={navigateSection} />;
    }
  };

  return (
    <CRMLayout activeSection={section} onNavigate={navigateSection}>
      {renderModule()}
    </CRMLayout>
  );
}
