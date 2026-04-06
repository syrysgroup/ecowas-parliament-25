import type { AppRole } from "@/contexts/AuthContext";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Image,
  CheckSquare,
  Mail,
  Inbox,
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
  Crown,
  Settings,
  Globe2,
  CalendarDays,
  Handshake,
  Newspaper,
  PanelTop,
  Contact,
  MailCheck,
  Layers,
  UserSquare,
  BookOpen,
} from "lucide-react";

export type ModuleId =
  | "dashboard"
  | "tasks"
  | "inbox"
  | "email-inbox"
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
  | "cms"
  | "super-admin"
  | "geo-analytics"
  | "events-manager"
  | "sponsors-partners"
  | "news-editor"
  | "site-content"
  | "contact-submissions"
  | "newsletter"
  | "media-library"
  | "settings"
  | "programme-pillars"
  | "stakeholders-mgmt"
  | "media-kit-mgmt";

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
    id: "email-inbox",
    label: "Email",
    icon: Inbox,
    section: "email-inbox",
    allowedRoles: TIER_2_AND_SPONSOR,
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
    isStub: false,
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
    isStub: false,
  },
  {
    id: "finance",
    label: "Finance",
    icon: DollarSign,
    section: "finance",
    allowedRoles: ["super_admin", "finance_coordinator"],
    isStub: false,
  },
  {
    id: "marketing",
    label: "Marketing",
    icon: Megaphone,
    section: "marketing",
    allowedRoles: ["super_admin", "marketing_manager"],
    isStub: false,
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
    isStub: false,
  },
  {
    id: "super-admin",
    label: "Super Admin Hub",
    icon: Crown,
    section: "super-admin",
    allowedRoles: ["super_admin"],
    isStub: false,
  },
  {
    id: "geo-analytics",
    label: "Geo Analytics",
    icon: Globe2,
    section: "geo-analytics",
    allowedRoles: ["super_admin", "admin"],
    isStub: false,
  },
  {
    id: "events-manager",
    label: "Events Manager",
    icon: CalendarDays,
    section: "events-manager",
    allowedRoles: ["super_admin", "admin"],
    isStub: false,
  },
  {
    id: "sponsors-partners",
    label: "Sponsors & Partners",
    icon: Handshake,
    section: "sponsors-partners",
    allowedRoles: ["super_admin", "admin", "sponsor_manager"],
    isStub: false,
  },
  {
    id: "news-editor",
    label: "News Editor",
    icon: Newspaper,
    section: "news-editor",
    allowedRoles: ["super_admin", "admin", "moderator", "communications_officer"],
    isStub: false,
  },
  {
    id: "site-content",
    label: "Site Content",
    icon: PanelTop,
    section: "site-content",
    allowedRoles: ["super_admin", "admin"],
    isStub: false,
  },
  {
    id: "contact-submissions",
    label: "Contact Forms",
    icon: Contact,
    section: "contact-submissions",
    allowedRoles: ["super_admin", "admin"],
    isStub: false,
  },
  {
    id: "newsletter",
    label: "Newsletter",
    icon: MailCheck,
    section: "newsletter",
    allowedRoles: ["super_admin", "admin", "marketing_manager"],
    isStub: false,
  },
  {
    id: "media-library",
    label: "Media Library",
    icon: Image,
    section: "media-library",
    allowedRoles: ["super_admin", "admin"],
    isStub: false,
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    section: "settings",
    allowedRoles: [
      "super_admin", "admin", "moderator", "project_director", "programme_lead",
      "website_editor", "marketing_manager", "communications_officer",
      "finance_coordinator", "logistics_coordinator", "sponsor_manager", "consultant", "sponsor",
    ],
    isStub: false,
  },
  {
    id: "programme-pillars",
    label: "Programme Pillars",
    icon: Layers,
    section: "programme-pillars",
    allowedRoles: ["super_admin", "admin", "website_editor", "programme_lead"],
    isStub: false,
  },
  {
    id: "stakeholders-mgmt",
    label: "Stakeholders",
    icon: UserSquare,
    section: "stakeholders-mgmt",
    allowedRoles: ["super_admin", "admin", "website_editor", "communications_officer"],
    isStub: false,
  },
  {
    id: "media-kit-mgmt",
    label: "Media Kit",
    icon: BookOpen,
    section: "media-kit-mgmt",
    allowedRoles: ["super_admin", "admin", "communications_officer", "marketing_manager", "website_editor"],
    isStub: false,
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
