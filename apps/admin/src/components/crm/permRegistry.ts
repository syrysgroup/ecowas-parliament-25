/**
 * Single source of truth for the permissions matrix.
 *
 * - PERM_MODULES is derived from CRM_MODULES so every registered CRM module
 *   automatically shows up in the Roles & Permissions UI (no more drift
 *   where new modules silently fall back to allowedRoles).
 * - PERM_ROLES is derived from the AppRole union (minus super_admin, which
 *   gets a permanent, locked all-true row).
 * - ALLOWED_ROLES_BY_MODULE feeds the "Reseed from registry" button so
 *   defaults match crmModules.ts.
 */
import { CRM_MODULES } from "./crmModules";
import type { AppRole } from "@/contexts/AuthContext";

// Modules excluded from the matrix:
//  - "super-admin": super_admin-only by definition, never editable.
//  - "profile":     every signed-in user reaches their own profile.
const HIDDEN_FROM_MATRIX = new Set(["super-admin", "profile"]);

export const PERM_MODULES: string[] = CRM_MODULES
  .filter((m) => !HIDDEN_FROM_MATRIX.has(m.id))
  .map((m) => m.id);

export const ALLOWED_ROLES_BY_MODULE: Record<string, AppRole[]> =
  Object.fromEntries(CRM_MODULES.map((m) => [m.id, m.allowedRoles]));

// All 16 AppRoles minus super_admin (rendered as a locked all-true row).
export const PERM_ROLES: AppRole[] = [
  "admin",
  "moderator",
  "project_director",
  "programme_lead",
  "website_editor",
  "marketing_manager",
  "communications_officer",
  "finance_coordinator",
  "budget_officer",
  "logistics_coordinator",
  "sponsor_manager",
  "consultant",
  "staff",
  "sponsor",
  "media",
];

export const ACTIONS = ["can_view", "can_create", "can_edit", "can_delete"] as const;
export type PermAction = (typeof ACTIONS)[number];
