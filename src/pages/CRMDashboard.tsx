import { useSearchParams } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { getModulesForRoles } from "@/components/crm/crmModules";
import CRMLayout from "@/components/crm/CRMLayout";

// Eager — core modules used immediately
import DashboardModule    from "@/components/crm/modules/DashboardModule";
import TaskBoardModule    from "@/components/crm/modules/TaskBoardModule";
import InboxModule        from "@/components/crm/modules/InboxModule";
import CalendarModule     from "@/components/crm/modules/CalendarModule";
import TeamModule         from "@/components/crm/modules/TeamModule";
import PeopleModule       from "@/components/crm/modules/PeopleModule";
import ParliamentOpsModule from "@/components/crm/modules/ParliamentOpsModule";
import SponsorMetricsModule from "@/components/crm/modules/SponsorMetricsModule";
import DocumentsModule    from "@/components/crm/modules/DocumentsModule";
import SuperAdminModule   from "@/components/crm/modules/SuperAdminModule";
import SettingsModule     from "@/components/crm/modules/SettingsModule";

// Lazy — stub modules
const MessagingModule = lazy(() => import("@/components/crm/modules/MessagingModule"));
const AnalyticsModule = lazy(() => import("@/components/crm/modules/AnalyticsModule"));
const FinanceModule   = lazy(() => import("@/components/crm/modules/FinanceModule"));
const MarketingModule = lazy(() => import("@/components/crm/modules/MarketingModule"));
const CMSModule       = lazy(() => import("@/components/crm/modules/CMSModule"));

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
      case "inbox":           return <InboxModule />;
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
      case "super-admin":     return <SuperAdminModule />;
      case "settings":        return <SettingsModule />;
      default:                return <DashboardModule onNavigate={navigateSection} />;
    }
  };

  return (
    <CRMLayout activeSection={section} onNavigate={navigateSection}>
      {renderModule()}
    </CRMLayout>
  );
}
