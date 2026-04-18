import type { AppRole } from "@/contexts/AuthContext";

export interface RoleMeta {
  label:       string;
  shortLabel:  string;
  colour:      string;      // tailwind text colour class
  bgColour:    string;      // tailwind bg colour class
  borderColour: string;     // tailwind border colour class
  tier:        1 | 2 | 3;
}

export const CRM_ROLE_META: Record<AppRole, RoleMeta> = {
  super_admin: {
    label: "Super Admin", shortLabel: "SA",
    colour: "text-emerald-400", bgColour: "bg-emerald-950", borderColour: "border-emerald-700",
    tier: 1,
  },
  admin: {
    label: "Admin", shortLabel: "ADM",
    colour: "text-blue-400", bgColour: "bg-blue-950", borderColour: "border-blue-700",
    tier: 2,
  },
  project_director: {
    label: "Project Director", shortLabel: "PD",
    colour: "text-blue-400", bgColour: "bg-blue-950", borderColour: "border-blue-700",
    tier: 2,
  },
  programme_lead: {
    label: "Programme Lead", shortLabel: "PL",
    colour: "text-teal-400", bgColour: "bg-teal-950", borderColour: "border-teal-700",
    tier: 2,
  },
  website_editor: {
    label: "Website Editor", shortLabel: "WE",
    colour: "text-amber-400", bgColour: "bg-amber-950", borderColour: "border-amber-700",
    tier: 2,
  },
  marketing_manager: {
    label: "Marketing Manager", shortLabel: "MM",
    colour: "text-rose-400", bgColour: "bg-rose-950", borderColour: "border-rose-700",
    tier: 2,
  },
  communications_officer: {
    label: "Communications Officer", shortLabel: "CO",
    colour: "text-violet-400", bgColour: "bg-violet-950", borderColour: "border-violet-700",
    tier: 2,
  },
  finance_coordinator: {
    label: "Finance Coordinator", shortLabel: "FC",
    colour: "text-yellow-400", bgColour: "bg-yellow-950", borderColour: "border-yellow-700",
    tier: 2,
  },
  logistics_coordinator: {
    label: "Logistics Coordinator", shortLabel: "LC",
    colour: "text-blue-400", bgColour: "bg-blue-950", borderColour: "border-blue-700",
    tier: 2,
  },
  sponsor_manager: {
    label: "Sponsor Manager", shortLabel: "SM",
    colour: "text-amber-400", bgColour: "bg-amber-950", borderColour: "border-amber-700",
    tier: 2,
  },
  moderator: {
    label: "Moderator", shortLabel: "MOD",
    colour: "text-rose-400", bgColour: "bg-rose-950", borderColour: "border-rose-700",
    tier: 2,
  },
  sponsor: {
    label: "Sponsor", shortLabel: "SP",
    colour: "text-violet-400", bgColour: "bg-violet-950", borderColour: "border-violet-700",
    tier: 3,
  },
  consultant: {
    label: "Consultant", shortLabel: "CT",
    colour: "text-teal-400", bgColour: "bg-teal-950", borderColour: "border-teal-700",
    tier: 3,
  },
  media: {
    label: "Media", shortLabel: "MD",
    colour: "text-cyan-400", bgColour: "bg-cyan-950", borderColour: "border-cyan-700",
    tier: 3,
  },
  budget_officer: {
    label: "Budget Officer", shortLabel: "BO",
    colour: "text-lime-400", bgColour: "bg-lime-950", borderColour: "border-lime-700",
    tier: 2,
  },
  staff: {
    label: "Staff", shortLabel: "ST",
    colour: "text-slate-400", bgColour: "bg-slate-950", borderColour: "border-slate-700",
    tier: 3,
  },
};

// All roles that get full CRM staff access (not sponsor-only)
export const CRM_STAFF_ROLES: AppRole[] = [
  "super_admin", "admin", "moderator", "project_director", "programme_lead",
  "website_editor", "marketing_manager", "communications_officer",
  "finance_coordinator", "logistics_coordinator", "sponsor_manager", "consultant",
  "budget_officer", "staff",
];

// Roles that can create/manage tasks
export const TASK_CREATE_ROLES: AppRole[] = [
  "super_admin", "admin", "project_director", "programme_lead", "logistics_coordinator",
  "budget_officer",
];

// Roles that can create calendar events
export const CALENDAR_CREATE_ROLES: AppRole[] = [
  "super_admin", "admin", "project_director", "programme_lead", "logistics_coordinator",
  "budget_officer",
];
