import type { AppRole } from "@/contexts/AuthContext";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Image,
  CheckSquare,
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
  FileText,
  User,
} from "lucide-react";

export type ModuleGroup =
  | "WORKSPACE"
  | "COMMUNICATION"
  | "PEOPLE"
  | "CONTENT"
  | "ANALYTICS & FINANCE"
  | "MARKETING"
  | "ADMINISTRATION";

export type ModuleId =
  | "dashboard"
  | "tasks"
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
  | "media-kit-mgmt"
  | "invoices"
  | "profile";

export interface CRMModule {
  id:              ModuleId;
  label:           string;
  icon:            LucideIcon;
  section:         string;        // URL ?section= param value (empty = dashboard)
  allowedRoles:    AppRole[];
  isStub:          boolean;
  group:           ModuleGroup;
  hideFromSidebar?: boolean;      // true = only reachable via dropdown (e.g. profile)
}

const ALL_STAFF: AppRole[] = [
  "super_admin", "admin", "moderator", "project_director", "programme_lead",
  "website_editor", "marketing_manager", "communications_officer",
  "finance_coordinator", "logistics_coordinator", "sponsor_manager", "consultant",
];

const TIER_2_AND_SPONSOR: AppRole[] = [...ALL_STAFF, "sponsor"];

export const MODULE_GROUPS: ModuleGroup[] = [
  "WORKSPACE",
  "COMMUNICATION",
  "CONTENT",
  "PEOPLE",
  "ANALYTICS & FINANCE",
  "MARKETING",
  "ADMINISTRATION",
];

export const CRM_MODULES: CRMModule[] = [
  // ── WORKSPACE ────────────────────────────────────────────────────────────────
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    section: "",
    allowedRoles: TIER_2_AND_SPONSOR,
    isStub: false,
    group: "WORKSPACE",
  },
  {
    id: "tasks",
    label: "Task Board",
    icon: CheckSquare,
    section: "tasks",
    allowedRoles: ALL_STAFF,
    isStub: false,
    group: "WORKSPACE",
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
    group: "WORKSPACE",
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
    group: "WORKSPACE",
  },

  // ── COMMUNICATION ─────────────────────────────────────────────────────────
  {
    id: "email-inbox",
    label: "Email",
    icon: Inbox,
    section: "email-inbox",
    allowedRoles: TIER_2_AND_SPONSOR,
    isStub: false,
    group: "COMMUNICATION",
  },
  {
    id: "comms",
    label: "Chat",
    icon: MessageSquare,
    section: "comms",
    allowedRoles: ALL_STAFF,
    isStub: false,
    group: "COMMUNICATION",
  },

  // ── PEOPLE ────────────────────────────────────────────────────────────────
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
    group: "PEOPLE",
  },
  {
    id: "people",
    label: "People & Access",
    icon: UserPlus,
    section: "people",
    allowedRoles: ["super_admin", "admin"],
    isStub: false,
    group: "PEOPLE",
  },

  // ── CONTENT ───────────────────────────────────────────────────────────────
  {
    id: "news-editor",
    label: "News Editor",
    icon: Newspaper,
    section: "news-editor",
    allowedRoles: ["super_admin", "admin", "moderator", "communications_officer"],
    isStub: false,
    group: "CONTENT",
  },
  {
    id: "events-manager",
    label: "Events Manager",
    icon: CalendarDays,
    section: "events-manager",
    allowedRoles: ["super_admin", "admin"],
    isStub: false,
    group: "CONTENT",
  },
  {
    id: "programme-pillars",
    label: "Programme Pillars",
    icon: Layers,
    section: "programme-pillars",
    allowedRoles: ["super_admin", "admin", "website_editor", "programme_lead"],
    isStub: false,
    group: "CONTENT",
  },
  {
    id: "stakeholders-mgmt",
    label: "Stakeholders",
    icon: UserSquare,
    section: "stakeholders-mgmt",
    allowedRoles: ["super_admin", "admin", "website_editor", "communications_officer"],
    isStub: false,
    group: "CONTENT",
  },
  {
    id: "media-kit-mgmt",
    label: "Media Kit",
    icon: BookOpen,
    section: "media-kit-mgmt",
    allowedRoles: ["super_admin", "admin", "communications_officer", "marketing_manager", "website_editor"],
    isStub: false,
    group: "CONTENT",
  },
  {
    id: "sponsors-partners",
    label: "Sponsors & Partners",
    icon: Handshake,
    section: "sponsors-partners",
    allowedRoles: ["super_admin", "admin", "sponsor_manager"],
    isStub: false,
    group: "CONTENT",
  },
  {
    id: "site-content",
    label: "Site Content",
    icon: PanelTop,
    section: "site-content",
    allowedRoles: ["super_admin", "admin"],
    isStub: false,
    group: "CONTENT",
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
    group: "CONTENT",
  },
  {
    id: "media-library",
    label: "Media Library",
    icon: Image,
    section: "media-library",
    allowedRoles: ["super_admin", "admin"],
    isStub: false,
    group: "CONTENT",
  },

  // ── ANALYTICS & FINANCE ───────────────────────────────────────────────────
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart2,
    section: "analytics",
    allowedRoles: ["super_admin", "admin", "project_director", "marketing_manager"],
    isStub: false,
    group: "ANALYTICS & FINANCE",
  },
  {
    id: "geo-analytics",
    label: "Geo Analytics",
    icon: Globe2,
    section: "geo-analytics",
    allowedRoles: ["super_admin", "admin"],
    isStub: false,
    group: "ANALYTICS & FINANCE",
  },
  {
    id: "sponsor-metrics",
    label: "Sponsor Metrics",
    icon: TrendingUp,
    section: "sponsor-metrics",
    allowedRoles: ["super_admin", "admin", "sponsor_manager", "sponsor"],
    isStub: false,
    group: "ANALYTICS & FINANCE",
  },
  {
    id: "finance",
    label: "Finance",
    icon: DollarSign,
    section: "finance",
    allowedRoles: ["super_admin", "finance_coordinator"],
    isStub: false,
    group: "ANALYTICS & FINANCE",
  },
  {
    id: "invoices",
    label: "Invoices",
    icon: FileText,
    section: "invoices",
    allowedRoles: ["super_admin", "admin", "finance_coordinator"],
    isStub: false,
    group: "ANALYTICS & FINANCE",
  },

  // ── MARKETING ─────────────────────────────────────────────────────────────
  {
    id: "marketing",
    label: "Marketing",
    icon: Megaphone,
    section: "marketing",
    allowedRoles: ["super_admin", "marketing_manager"],
    isStub: false,
    group: "MARKETING",
  },
  {
    id: "newsletter",
    label: "Newsletter",
    icon: MailCheck,
    section: "newsletter",
    allowedRoles: ["super_admin", "admin", "marketing_manager"],
    isStub: false,
    group: "MARKETING",
  },
  {
    id: "contact-submissions",
    label: "Contact Forms",
    icon: Contact,
    section: "contact-submissions",
    allowedRoles: ["super_admin", "admin"],
    isStub: false,
    group: "MARKETING",
  },

  // ── ADMINISTRATION ────────────────────────────────────────────────────────
  {
    id: "parliament-ops",
    label: "Parliament Ops",
    icon: ShieldCheck,
    section: "parliament-ops",
    allowedRoles: ["super_admin", "admin", "moderator"],
    isStub: false,
    group: "ADMINISTRATION",
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
    group: "ADMINISTRATION",
  },

  // ── HIDDEN (dropdown only) ────────────────────────────────────────────────
  {
    id: "profile",
    label: "My Profile",
    icon: User,
    section: "profile",
    allowedRoles: TIER_2_AND_SPONSOR,
    isStub: false,
    group: "ADMINISTRATION",
    hideFromSidebar: true,
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
