import type { AppRole } from "@/contexts/AuthContext";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  CheckSquare,
  Mail,
  Calendar,
  MessageSquare,
  FolderOpen,
  Users,
  TrendingUp,
  BarChart2,
  DollarSign,
  Megaphone,
  Layout,
  ShieldCheck,
  UserPlus,
} from "lucide-react";

export type ModuleId =
  | "dashboard"
  | "tasks"
  | "inbox"
  | "calendar"
  | "comms"
  | "documents"
  | "team"
  | "people"
  | "parliament-ops"
  | "sponsor-metrics"
  | "analytics"
  | "finance"
  | "marketing"
  | "cms";

export interface CRMModule {
  id:           ModuleId;
  label:        string;
  icon:         LucideIcon;
  section:      string;      // URL ?section= param value (empty = dashboard)
  allowedRoles: AppRole[];
  isStub:       boolean;
}

const ALL_STAFF: AppRole[] = [
  "super_admin", "admin", "moderator", "project_director", "programme_lead",
  "website_editor", "marketing_manager", "communications_officer",
  "finance_coordinator", "logistics_coordinator", "sponsor_manager", "consultant",
];

const TIER_2_AND_SPONSOR: AppRole[] = [...ALL_STAFF, "sponsor"];

export const CRM_MODULES: CRMModule[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    section: "",
    allowedRoles: TIER_2_AND_SPONSOR,
    isStub: false,
  },
  {
    id: "tasks",
    label: "Task Board",
    icon: CheckSquare,
    section: "tasks",
    allowedRoles: ALL_STAFF,
    isStub: false,
  },
  {
    id: "inbox",
    label: "Inbox",
    icon: Mail,
    section: "inbox",
    allowedRoles: ALL_STAFF,
    isStub: false,
  },
  {
    id: "calendar",
    label: "Calendar",
    icon: Calendar,
    section: "calendar",
    allowedRoles: [
      "super_admin", "admin", "project_director", "programme_lead",
      "website_editor", "marketing_manager", "communications_officer",
      "finance_coordinator", "logistics_coordinator", "sponsor_manager", "moderator",
    ],
    isStub: false,
  },
  {
    id: "comms",
    label: "Messaging",
    icon: MessageSquare,
    section: "comms",
    allowedRoles: ALL_STAFF,
    isStub: true,
  },
  {
    id: "documents",
    label: "Documents",
    icon: FolderOpen,
    section: "documents",
    allowedRoles: [
      "super_admin", "admin", "project_director", "programme_lead",
      "website_editor", "communications_officer", "finance_coordinator",
      "logistics_coordinator", "sponsor_manager", "moderator", "consultant",
    ],
    isStub: false,
  },
  {
    id: "team",
    label: "Team Directory",
    icon: Users,
    section: "team",
    allowedRoles: [
      "super_admin", "admin", "project_director", "programme_lead",
      "website_editor", "marketing_manager", "communications_officer",
      "finance_coordinator", "logistics_coordinator", "sponsor_manager", "moderator",
    ],
    isStub: false,
  },
  {
    id: "people",
    label: "People & Access",
    icon: UserPlus,
    section: "people",
    allowedRoles: ["super_admin", "admin"],
    isStub: false,
  },
  {
    id: "parliament-ops",
    label: "Parliament Ops",
    icon: ShieldCheck,
    section: "parliament-ops",
    allowedRoles: ["super_admin", "admin", "moderator"],
    isStub: false,
  },
  {
    id: "sponsor-metrics",
    label: "Sponsor Metrics",
    icon: TrendingUp,
    section: "sponsor-metrics",
    allowedRoles: ["super_admin", "admin", "sponsor_manager", "sponsor"],
    isStub: false,
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart2,
    section: "analytics",
    allowedRoles: ["super_admin", "admin", "project_director", "marketing_manager"],
    isStub: true,
  },
  {
    id: "finance",
    label: "Finance",
    icon: DollarSign,
    section: "finance",
    allowedRoles: ["super_admin", "finance_coordinator"],
    isStub: true,
  },
  {
    id: "marketing",
    label: "Marketing",
    icon: Megaphone,
    section: "marketing",
    allowedRoles: ["super_admin", "marketing_manager"],
    isStub: true,
  },
  {
    id: "cms",
    label: "CMS Editor",
    icon: Layout,
    section: "cms",
    allowedRoles: [
      "super_admin", "admin", "project_director", "programme_lead",
      "website_editor", "marketing_manager", "communications_officer",
    ],
    isStub: true,
  },
];

export function getModulesForRoles(roles: AppRole[]): CRMModule[] {
  return CRM_MODULES.filter(m =>
    m.allowedRoles.some(r => roles.includes(r))
  );
}

export function getModuleBySection(section: string): CRMModule | undefined {
  return CRM_MODULES.find(m => m.section === section);
}
