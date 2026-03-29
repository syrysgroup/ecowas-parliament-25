import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { getModulesForRoles, getModuleBySection } from "@/components/crm/crmModules";
import CRMLayout from "@/components/crm/CRMLayout";

// Priority modules — eager
import DashboardModule from "@/components/crm/modules/DashboardModule";
import TaskBoardModule from "@/components/crm/modules/TaskBoardModule";
import InboxModule from "@/components/crm/modules/InboxModule";
import CalendarModule from "@/components/crm/modules/CalendarModule";

// Stub modules — lazy (they're tiny, but keeps the pattern right)
const MessagingModule     = lazy(() => import("@/components/crm/modules/MessagingModule"));
const DocumentsModule     = lazy(() => import("@/components/crm/modules/DocumentsModule"));
const TeamModule          = lazy(() => import("@/components/crm/modules/TeamModule"));
const SponsorMetricsModule = lazy(() => import("@/components/crm/modules/SponsorMetricsModule"));
const AnalyticsModule     = lazy(() => import("@/components/crm/modules/AnalyticsModule"));
const FinanceModule       = lazy(() => import("@/components/crm/modules/FinanceModule"));
const MarketingModule     = lazy(() => import("@/components/crm/modules/MarketingModule"));
const CMSModule           = lazy(() => import("@/components/crm/modules/CMSModule"));

function ModuleLoader() {
  return (
    <div className="flex items-center justify-center h-40">
      <div className="w-6 h-6 border-2 border-emerald-700 border-t-emerald-400 rounded-full animate-spin" />
    </div>
  );
}

export default function CRMDashboard() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { roles, loading, rolesLoading } = useAuthContext();

  const section = params.get("section") ?? "";

  const navigate_section = (s: string) => {
    if (s === "") {
      setParams({});
    } else {
      setParams({ section: s });
    }
    // scroll to top on section change
    window.scrollTo(0, 0);
  };

  // Access guard: redirect to dashboard if section isn't in this user's allowed modules
  useEffect(() => {
    if (loading || rolesLoading || roles.length === 0) return;
    if (section === "") return; // dashboard always accessible

    const allowedModules = getModulesForRoles(roles);
    const isAllowed = allowedModules.some(m => m.section === section);
    if (!isAllowed) {
      setParams({});
    }
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
      case "":            return <DashboardModule onNavigate={navigate_section} />;
      case "tasks":       return <TaskBoardModule />;
      case "inbox":       return <InboxModule />;
      case "calendar":    return <CalendarModule />;
      case "comms":       return <Suspense fallback={<ModuleLoader />}><MessagingModule /></Suspense>;
      case "documents":   return <Suspense fallback={<ModuleLoader />}><DocumentsModule /></Suspense>;
      case "team":        return <Suspense fallback={<ModuleLoader />}><TeamModule /></Suspense>;
      case "sponsor-metrics": return <Suspense fallback={<ModuleLoader />}><SponsorMetricsModule /></Suspense>;
      case "analytics":   return <Suspense fallback={<ModuleLoader />}><AnalyticsModule /></Suspense>;
      case "finance":     return <Suspense fallback={<ModuleLoader />}><FinanceModule /></Suspense>;
      case "marketing":   return <Suspense fallback={<ModuleLoader />}><MarketingModule /></Suspense>;
      case "cms":         return <Suspense fallback={<ModuleLoader />}><CMSModule /></Suspense>;
      default:            return <DashboardModule onNavigate={navigate_section} />;
    }
  };

  return (
    <CRMLayout activeSection={section} onNavigate={navigate_section}>
      {renderModule()}
    </CRMLayout>
  );
}
